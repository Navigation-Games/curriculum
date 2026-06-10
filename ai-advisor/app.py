"""
Navigation Games AI Lesson Plan Advisor - Backend

A Flask app that wraps the Anthropic Claude API to provide
curriculum recommendations to teachers and camp directors.

Deployed on Google Cloud Run.
"""

import os
import json
import time
import uuid
from datetime import datetime, timezone
from functools import wraps
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

app = Flask(__name__)

# CORS: allow the curriculum site and localhost for development
ALLOWED_ORIGINS = [
    "https://navigation-games.github.io",
    "http://localhost:3000",
    "http://localhost:3001",
]
CORS(app, origins=ALLOWED_ORIGINS)

# Load the system prompt from the markdown file
SYSTEM_PROMPT_PATH = Path(__file__).parent / "system-prompt.md"
SYSTEM_PROMPT = SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")

# Anthropic client - uses ANTHROPIC_API_KEY env var automatically
client = anthropic.Anthropic()

# Model configuration
MODEL = os.environ.get("ADVISOR_MODEL", "claude-sonnet-4-20250514")
MAX_TOKENS = 1024

# Google Sheets logging
SPREADSHEET_ID = os.environ.get("ADVISOR_SHEET_ID", "")
_sheets_client = None

# Conversation review (Navigation Games staff)
REVIEW_OAUTH_CLIENT_ID = os.environ.get("REVIEW_OAUTH_CLIENT_ID", "")
REVIEW_ALLOWED_DOMAIN = "navigationgames.org"
FEEDBACK_SHEET_TITLE = "Feedback"
FEEDBACK_HEADER = ["timestamp", "conversation_id", "reviewer_email", "status", "feedback"]
FEEDBACK_MAX_CHARS = 5000

# Per-page feedback from site visitors ("Was this page helpful?")
PAGE_FEEDBACK_SHEET_TITLE = "PageFeedback"
PAGE_FEEDBACK_HEADER = ["timestamp", "page", "title", "rating", "comment", "submitter"]
PAGE_FEEDBACK_COMMENT_MAX_CHARS = 5000
PAGE_FEEDBACK_SUBMITTER_MAX_CHARS = 200
PAGE_FEEDBACK_PAGE_MAX_CHARS = 500

# Reusable transport for verifying Google ID tokens (caches Google's certs)
_google_token_request = google_requests.Request()


def get_sheets_client():
    """Lazy-init the Google Sheets client. Returns None if not configured."""
    global _sheets_client
    if _sheets_client is not None:
        return _sheets_client
    if not SPREADSHEET_ID:
        return None
    try:
        import gspread
        from google.auth import default as google_auth_default

        credentials, _ = google_auth_default(
            scopes=["https://www.googleapis.com/auth/spreadsheets"]
        )
        _sheets_client = gspread.authorize(credentials)
        return _sheets_client
    except Exception as e:
        app.logger.warning(f"Google Sheets init failed (logging to stdout only): {e}")
        return None


# Rate limiting: simple in-memory stores (reset on deploy)
# For production, use Redis or similar
rate_limit_store: dict[str, list[float]] = {}
RATE_LIMIT_MAX = 20  # conversations per day per IP
RATE_LIMIT_WINDOW = 86400  # 24 hours in seconds

# Separate bucket for page feedback so it never eats chat quota
page_feedback_rate_store: dict[str, list[float]] = {}
PAGE_FEEDBACK_RATE_MAX = 10  # submissions per day per IP


def _check_rate_limit(store: dict[str, list[float]], ip: str, max_per_window: int) -> bool:
    """Return True if the request is within rate limits for the given store."""
    now = time.time()
    if ip not in store:
        store[ip] = []

    # Remove old entries outside the window
    store[ip] = [t for t in store[ip] if now - t < RATE_LIMIT_WINDOW]

    if len(store[ip]) >= max_per_window:
        return False

    store[ip].append(now)
    return True


def check_rate_limit(ip: str) -> bool:
    """Return True if the chat request is within rate limits."""
    return _check_rate_limit(rate_limit_store, ip, RATE_LIMIT_MAX)


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint for Cloud Run."""
    return jsonify({"status": "ok"})


@app.route("/chat", methods=["POST"])
def chat():
    """
    Chat endpoint. Accepts a conversation and returns the advisor's response.

    Request body:
    {
        "conversation_id": "optional-uuid",
        "messages": [
            {"role": "user", "content": "I'm a 4th grade teacher..."},
            {"role": "assistant", "content": "Great! Let me help..."},
            {"role": "user", "content": "I have 4 class periods."}
        ]
    }

    Response:
    {
        "conversation_id": "uuid",
        "response": "Here's what I recommend..."
    }
    """
    # Rate limiting
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    if not check_rate_limit(client_ip):
        return jsonify({"error": "Rate limit exceeded. Try again tomorrow."}), 429

    # Parse request
    data = request.get_json()
    if not data or "messages" not in data:
        return jsonify({"error": "Request must include 'messages' array."}), 400

    messages = data["messages"]
    conversation_id = data.get("conversation_id", str(uuid.uuid4()))
    user_info = data.get("user_info", {})

    # Validate messages format
    if not isinstance(messages, list) or len(messages) == 0:
        return jsonify({"error": "'messages' must be a non-empty array."}), 400

    for msg in messages:
        if msg.get("role") not in ("user", "assistant"):
            return jsonify({"error": "Each message must have role 'user' or 'assistant'."}), 400
        if not msg.get("content"):
            return jsonify({"error": "Each message must have non-empty 'content'."}), 400

    # The last message must be from the user
    if messages[-1]["role"] != "user":
        return jsonify({"error": "Last message must be from the user."}), 400

    try:
        # Call Claude API with prompt caching on the system prompt
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=[
                {
                    "type": "text",
                    "text": SYSTEM_PROMPT,
                    "cache_control": {"type": "ephemeral"},
                }
            ],
            messages=messages,
        )

        assistant_message = response.content[0].text

        # Log conversation
        _log_exchange(conversation_id, messages, assistant_message, response, user_info)

        return jsonify(
            {
                "conversation_id": conversation_id,
                "response": assistant_message,
            }
        )

    except anthropic.RateLimitError:
        return jsonify({"error": "Service is busy. Please try again in a moment."}), 503
    except anthropic.APIError as e:
        app.logger.error(f"Anthropic API error: {e}")
        return jsonify({"error": "Something went wrong. Please try again."}), 500


def _log_exchange(
    conversation_id: str,
    messages: list[dict],
    assistant_response: str,
    api_response,
    user_info: dict | None = None,
):
    """
    Log a conversation exchange to Google Sheets and stdout.

    Each exchange appends rows for the new user message and assistant response.
    The full conversation history is sent to Claude each time, but we only log
    the new messages (the last user message and the assistant response) to
    avoid duplicating earlier messages in the sheet.

    Columns: timestamp, conversation_id, msg_number, role, content, model,
             input_tokens, output_tokens, user_name, user_email, user_org
    """
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    model = api_response.model
    input_tokens = api_response.usage.input_tokens
    output_tokens = api_response.usage.output_tokens

    # Message number: how many messages deep we are in this conversation
    msg_number = len(messages)

    # User info (only populated on first message, but included on all rows
    # so each row is self-contained when filtering the sheet)
    user_name = (user_info or {}).get("name", "")
    user_email = (user_info or {}).get("email", "")
    user_org = (user_info or {}).get("organization", "")

    # Rows to append: the latest user message + the assistant response
    rows = [
        [now, conversation_id, msg_number, "user", messages[-1]["content"], "", "", "", user_name, user_email, user_org],
        [now, conversation_id, msg_number + 1, "assistant", assistant_response, model, str(input_tokens), str(output_tokens), user_name, user_email, user_org],
    ]

    # Log to Google Sheets
    gc = get_sheets_client()
    if gc:
        try:
            sheet = gc.open_by_key(SPREADSHEET_ID).sheet1
            sheet.append_rows(rows, value_input_option="RAW")
        except Exception as e:
            app.logger.error(f"Google Sheets logging failed: {e}")

    # Always also log to stdout (visible in Cloud Run logs)
    log_entry = {
        "timestamp": now,
        "conversation_id": conversation_id,
        "message_count": msg_number,
        "latest_user_message": messages[-1]["content"][:200],
        "assistant_response_preview": assistant_response[:200],
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "user_name": user_name,
        "user_email": user_email,
        "user_org": user_org,
    }
    if hasattr(api_response.usage, "cache_creation_input_tokens"):
        log_entry["cache_creation_tokens"] = api_response.usage.cache_creation_input_tokens
    if hasattr(api_response.usage, "cache_read_input_tokens"):
        log_entry["cache_read_tokens"] = api_response.usage.cache_read_input_tokens

    app.logger.info(f"ADVISOR_LOG: {json.dumps(log_entry)}")


# ---------------------------------------------------------------------------
# Conversation review endpoints (Navigation Games staff only)
#
# Staff sign in with their @navigationgames.org Google account on the site's
# review page. The frontend sends the Google ID token on every request; we
# verify it here. The Cloud Run service allows unauthenticated requests, so
# this verification is the only gate protecting conversation contents.
# ---------------------------------------------------------------------------


def require_reviewer(f):
    """Require a valid Google ID token from a navigationgames.org account."""

    @wraps(f)
    def wrapper(*args, **kwargs):
        if not REVIEW_OAUTH_CLIENT_ID:
            return jsonify({"error": "Review is not configured on this server."}), 503

        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return jsonify({"error": "Missing bearer token."}), 401

        try:
            # Verifies signature, expiry, issuer, and audience (our client ID).
            claims = google_id_token.verify_oauth2_token(
                auth[len("Bearer "):],
                _google_token_request,
                REVIEW_OAUTH_CLIENT_ID,
                clock_skew_in_seconds=10,
            )
        except ValueError:
            return jsonify({"error": "Invalid or expired token."}), 401

        # The hd claim is the only spoof-proof Workspace-domain signal.
        # It is absent for consumer accounts, so absence means reject.
        # Never use email.endswith() as the domain check.
        if claims.get("hd") != REVIEW_ALLOWED_DOMAIN:
            return jsonify({"error": "Access restricted to Navigation Games staff."}), 403
        if not claims.get("email_verified"):
            return jsonify({"error": "Email not verified."}), 403

        request.reviewer_email = claims["email"]
        return f(*args, **kwargs)

    return wrapper


def _open_spreadsheet():
    """Return the logging spreadsheet, or None if Sheets is not configured."""
    gc = get_sheets_client()
    if not gc:
        return None
    return gc.open_by_key(SPREADSHEET_ID)


def _get_or_create_worksheet(spreadsheet, title: str, header: list[str]):
    """Return the named tab, creating it with a header row if missing."""
    import gspread

    try:
        return spreadsheet.worksheet(title)
    except gspread.WorksheetNotFound:
        ws = spreadsheet.add_worksheet(title, rows=1000, cols=len(header))
        ws.append_row(header)
        return ws


def get_feedback_worksheet(spreadsheet):
    """Return the Feedback tab, creating it with a header row if missing."""
    return _get_or_create_worksheet(spreadsheet, FEEDBACK_SHEET_TITLE, FEEDBACK_HEADER)


def load_conversations(spreadsheet):
    """
    Read the conversation log (sheet1) and group rows by conversation_id.

    Returns a dict: conversation_id -> {
        "started_at", "user_name", "user_org",
        "messages": [{"msg_number", "role", "content", "timestamp"}],
        "model",
    }

    Reads the whole sheet on every request. Fine at current volume; if it
    ever gets slow, wrap this in a module-level cache with a 30-60s TTL.
    """
    rows = spreadsheet.sheet1.get_all_values()
    conversations: dict[str, dict] = {}

    for i, row in enumerate(rows):
        if len(row) < 5:
            continue
        # _log_exchange never wrote a header row, so row 1 may be data or a
        # hand-added header. Skip any row whose msg_number isn't numeric.
        try:
            msg_number = int(row[2])
        except ValueError:
            continue

        conv_id = row[1]
        if not conv_id:
            continue

        conv = conversations.setdefault(
            conv_id,
            {"started_at": row[0], "user_name": "", "user_org": "", "messages": [], "model": ""},
        )
        conv["messages"].append(
            {
                "msg_number": msg_number,
                "role": row[3],
                "content": row[4],
                "timestamp": row[0],
            }
        )
        if len(row) >= 6 and row[5] and not conv["model"]:
            conv["model"] = row[5]
        if len(row) >= 9 and row[8] and not conv["user_name"]:
            conv["user_name"] = row[8]
        if len(row) >= 11 and row[10] and not conv["user_org"]:
            conv["user_org"] = row[10]

    for conv in conversations.values():
        conv["messages"].sort(key=lambda m: m["msg_number"])

    return conversations


def load_feedback(spreadsheet):
    """
    Read the Feedback tab.

    Returns a dict: conversation_id -> list of
    {"timestamp", "reviewer_email", "status", "feedback"}.
    """
    ws = get_feedback_worksheet(spreadsheet)
    rows = ws.get_all_values()
    feedback: dict[str, list[dict]] = {}

    for row in rows[1:]:  # skip header
        if len(row) < 4 or not row[1]:
            continue
        feedback.setdefault(row[1], []).append(
            {
                "timestamp": row[0],
                "reviewer_email": row[2],
                "status": row[3],
                "feedback": row[4] if len(row) >= 5 else "",
            }
        )

    return feedback


def _my_status(feedback_entries: list[dict], reviewer_email: str):
    """The reviewer's own status for a conversation: 'commented', 'dismissed', or None."""
    statuses = {e["status"] for e in feedback_entries if e["reviewer_email"] == reviewer_email}
    if "commented" in statuses:
        return "commented"
    if "dismissed" in statuses:
        return "dismissed"
    return None


@app.route("/review/conversations", methods=["GET"])
@require_reviewer
def review_list_conversations():
    """
    List conversations for review, newest first.

    By default only conversations the signed-in reviewer has not commented on
    or dismissed. Pass ?all=true to include everything.
    """
    spreadsheet = _open_spreadsheet()
    if not spreadsheet:
        return jsonify({"error": "Conversation log is not available."}), 503

    show_all = request.args.get("all", "false").lower() == "true"
    conversations = load_conversations(spreadsheet)
    feedback = load_feedback(spreadsheet)
    reviewer_email = request.reviewer_email

    items = []
    for conv_id, conv in conversations.items():
        entries = feedback.get(conv_id, [])
        my_status = _my_status(entries, reviewer_email)
        if not show_all and my_status is not None:
            continue

        first_user_message = next(
            (m["content"] for m in conv["messages"] if m["role"] == "user"), ""
        )
        items.append(
            {
                "conversation_id": conv_id,
                "started_at": conv["started_at"],
                "user_name": conv["user_name"],
                "user_org": conv["user_org"],
                "first_user_message": first_user_message[:200],
                "message_count": len(conv["messages"]),
                "comment_count": sum(1 for e in entries if e["status"] == "commented"),
                "my_status": my_status,
            }
        )

    items.sort(key=lambda c: c["started_at"], reverse=True)
    return jsonify({"reviewer_email": reviewer_email, "conversations": items})


@app.route("/review/conversations/<conversation_id>", methods=["GET"])
@require_reviewer
def review_get_conversation(conversation_id):
    """Full conversation thread plus all reviewers' feedback."""
    spreadsheet = _open_spreadsheet()
    if not spreadsheet:
        return jsonify({"error": "Conversation log is not available."}), 503

    conversations = load_conversations(spreadsheet)
    conv = conversations.get(conversation_id)
    if not conv:
        return jsonify({"error": "Conversation not found."}), 404

    entries = load_feedback(spreadsheet).get(conversation_id, [])
    return jsonify(
        {
            "conversation_id": conversation_id,
            "started_at": conv["started_at"],
            "user_name": conv["user_name"],
            "user_org": conv["user_org"],
            "model": conv["model"],
            "messages": conv["messages"],
            "feedback": entries,
            "my_status": _my_status(entries, request.reviewer_email),
        }
    )


def _append_feedback_row(spreadsheet, conversation_id: str, status: str, text: str):
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    ws = get_feedback_worksheet(spreadsheet)
    ws.append_row(
        [now, conversation_id, request.reviewer_email, status, text],
        value_input_option="RAW",
    )


@app.route("/review/conversations/<conversation_id>/feedback", methods=["POST"])
@require_reviewer
def review_submit_feedback(conversation_id):
    """Add a feedback comment to a conversation."""
    spreadsheet = _open_spreadsheet()
    if not spreadsheet:
        return jsonify({"error": "Conversation log is not available."}), 503

    data = request.get_json(silent=True) or {}
    text = (data.get("feedback") or "").strip()
    if not text:
        return jsonify({"error": "Feedback text is required."}), 400
    if len(text) > FEEDBACK_MAX_CHARS:
        return jsonify({"error": f"Feedback must be under {FEEDBACK_MAX_CHARS} characters."}), 400

    if conversation_id not in load_conversations(spreadsheet):
        return jsonify({"error": "Conversation not found."}), 404

    _append_feedback_row(spreadsheet, conversation_id, "commented", text)
    return jsonify({"ok": True}), 201


@app.route("/review/conversations/<conversation_id>/dismiss", methods=["POST"])
@require_reviewer
def review_dismiss_conversation(conversation_id):
    """Dismiss a conversation (hide it from the reviewer's default list)."""
    spreadsheet = _open_spreadsheet()
    if not spreadsheet:
        return jsonify({"error": "Conversation log is not available."}), 503

    if conversation_id not in load_conversations(spreadsheet):
        return jsonify({"error": "Conversation not found."}), 404

    _append_feedback_row(spreadsheet, conversation_id, "dismissed", "")
    return jsonify({"ok": True})


# ---------------------------------------------------------------------------
# Page feedback ("Was this page helpful?" on every docs page)
#
# No auth: anyone can submit, anonymously or with an optional free-text
# name/email. Rows are unverified public input; treat the sheet tab
# accordingly. RAW value input prevents formula injection.
# ---------------------------------------------------------------------------


@app.route("/page-feedback", methods=["POST"])
def page_feedback():
    """
    Accept thumbs up/down and/or a comment about a specific site page.

    Request body:
    {
        "page": "/curriculum/activities/core/animal-o/",
        "title": "Animal-O",
        "rating": "up" | "down" | null,
        "comment": "optional text",
        "submitter": "optional name or email"
    }
    """
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    if not _check_rate_limit(page_feedback_rate_store, client_ip, PAGE_FEEDBACK_RATE_MAX):
        return jsonify({"error": "Feedback limit reached for today."}), 429

    data = request.get_json(silent=True) or {}
    page = (data.get("page") or "").strip()
    title = (data.get("title") or "").strip()
    rating = data.get("rating")
    comment = (data.get("comment") or "").strip()
    submitter = (data.get("submitter") or "").strip()

    if not page or len(page) > PAGE_FEEDBACK_PAGE_MAX_CHARS:
        return jsonify({"error": "Request must include 'page'."}), 400
    if rating not in ("up", "down", None):
        return jsonify({"error": "'rating' must be 'up' or 'down'."}), 400
    if rating is None and not comment:
        return jsonify({"error": "Provide a rating or a comment."}), 400
    if len(comment) > PAGE_FEEDBACK_COMMENT_MAX_CHARS:
        return jsonify({"error": f"Comment must be under {PAGE_FEEDBACK_COMMENT_MAX_CHARS} characters."}), 400
    if len(submitter) > PAGE_FEEDBACK_SUBMITTER_MAX_CHARS:
        return jsonify({"error": f"Name must be under {PAGE_FEEDBACK_SUBMITTER_MAX_CHARS} characters."}), 400
    title = title[:PAGE_FEEDBACK_PAGE_MAX_CHARS]

    spreadsheet = _open_spreadsheet()
    if not spreadsheet:
        return jsonify({"error": "Feedback storage is not available."}), 503

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    ws = _get_or_create_worksheet(
        spreadsheet, PAGE_FEEDBACK_SHEET_TITLE, PAGE_FEEDBACK_HEADER
    )
    ws.append_row(
        [now, page, title, rating or "", comment, submitter],
        value_input_option="RAW",
    )
    return jsonify({"ok": True}), 201


if __name__ == "__main__":
    # Local development
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)

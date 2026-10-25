"""
Navigation Games AI Lesson Plan Advisor - Backend

A Flask app that wraps the Anthropic Claude API to provide
curriculum recommendations to teachers and camp directors.

Deployed on Google Cloud Run.
"""

import base64
import hashlib
import hmac
import os
import re
import json
import re
import time
import uuid
from email.message import EmailMessage
from urllib.parse import quote, urlparse
from datetime import datetime, timezone
from functools import wraps
from pathlib import Path

from flask import Flask, Response, request, jsonify
from flask_cors import CORS
import anthropic
import requests
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

app = Flask(__name__)

# CORS: allow the curriculum site and localhost for development
ALLOWED_ORIGINS = [
    "https://curriculum.navigationgames.org",
    "https://navigation-games.github.io",
    "http://localhost:3000",
    "http://localhost:3001",
]
CORS(app, origins=ALLOWED_ORIGINS)

# Load the system prompt from the markdown file
SYSTEM_PROMPT_PATH = Path(__file__).parent / "system-prompt.md"
SYSTEM_PROMPT = SYSTEM_PROMPT_PATH.read_text(encoding="utf-8")

# Append the generated site map (written by scripts/build-content.js) so the
# advisor knows every page on the site and can route people to real URLs.
SITE_MAP_PATH = Path(__file__).parent / "site-map.md"
if SITE_MAP_PATH.exists():
    SYSTEM_PROMPT += "\n\n" + SITE_MAP_PATH.read_text(encoding="utf-8")

# Anthropic client - uses ANTHROPIC_API_KEY env var automatically
client = anthropic.Anthropic()

# Model configuration
# The advisor is tuned for Sonnet. ADVISOR_MODEL pins a specific model; if it is
# ever retired, the app auto-selects a current one instead of returning errors.
_CONFIGURED_MODEL = os.environ.get("ADVISOR_MODEL", "claude-sonnet-4-6")
_MODEL_FAMILY_PREFERENCE = ("sonnet", "opus", "haiku")
MAX_TOKENS = 1024
# The course tutor writes whole deliverables (a six-session unit plan runs well
# past 1024 tokens), so it gets more room
TUTOR_MAX_TOKENS = 4096


def resolve_model(preferred=_CONFIGURED_MODEL):
    """Choose a usable Claude model.

    Returns `preferred` if the Anthropic API still serves it. If it has been
    retired (or the model list can't be fetched), fall back to the newest
    available model, preferring Sonnet, then Opus, then Haiku. This lets the
    advisor self-heal when a pinned model ID is retired instead of returning
    500s on every request.
    """
    try:
        models = list(client.models.list())
    except Exception as e:  # network/auth hiccup - trust the configured value
        app.logger.warning(f"Could not list models ({e}); using '{preferred}'")
        return preferred

    if preferred in {m.id for m in models}:
        return preferred

    app.logger.error(
        f"Configured model '{preferred}' is unavailable (likely retired); "
        "auto-selecting a fallback"
    )
    newest_first = sorted(
        models, key=lambda m: getattr(m, "created_at", ""), reverse=True
    )
    for family in _MODEL_FAMILY_PREFERENCE:
        for m in newest_first:
            if family in m.id:
                app.logger.warning(f"Falling back to model '{m.id}'")
                return m.id
    if newest_first:
        app.logger.warning(f"Falling back to model '{newest_first[0].id}'")
        return newest_first[0].id
    return preferred


# Resolved once at startup; re-resolved on the fly if the model retires mid-run.
MODEL = resolve_model()


def _with_history_cache(messages):
    """Mark the end of the conversation for prompt caching.

    The whole history is resent on every turn. With a cache breakpoint on the
    newest message, the next turn reads everything before it from the cache
    at a tenth of the input price instead of paying full price again. Returns
    a copy; the caller's messages (which get logged) are left alone.
    """
    if not messages or not isinstance(messages[-1].get("content"), str):
        return messages
    last = messages[-1]
    return messages[:-1] + [
        {
            "role": last["role"],
            "content": [
                {
                    "type": "text",
                    "text": last["content"],
                    "cache_control": {"type": "ephemeral"},
                }
            ],
        }
    ]


def _create_message(messages, system_prompt=None, max_tokens=MAX_TOKENS):
    """Call the Claude API, self-healing if the active model was retired.

    Uses the advisor's system prompt unless another one is given (the course
    tutor passes its own).
    """
    global MODEL
    kwargs = dict(
        max_tokens=max_tokens,
        system=[
            {
                "type": "text",
                "text": system_prompt or SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=_with_history_cache(messages),
    )
    try:
        return client.messages.create(model=MODEL, **kwargs)
    except anthropic.NotFoundError:
        new_model = resolve_model()
        if new_model == MODEL:
            raise
        app.logger.warning(f"Model '{MODEL}' not found; switching to '{new_model}'")
        MODEL = new_model
        return client.messages.create(model=MODEL, **kwargs)

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
RATE_LIMIT_MAX = 20  # chat messages per day per IP (anonymous)
SIGNED_IN_RATE_LIMIT_MAX = 100  # chat messages per day per signed-in Google account
RATE_LIMIT_WINDOW = 86400  # 24 hours in seconds

# The course tutor has its own limit, separate from the advisor's. Teachers
# signed in to the course aren't limited (the Anthropic monthly spend limit
# is the backstop); anonymous visitors get a generous per-IP allowance.
tutor_rate_store: dict[str, list[float]] = {}
TUTOR_ANONYMOUS_LIMIT = 200  # tutor messages per day per IP

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


# ---------------------------------------------------------------------------
# Optional sign-in for public endpoints
#
# Visitors can sign in with any Google account on the site (the same OAuth
# client the review tool uses). Signing in raises the chat limit, lifts the
# page-feedback limit, and tags submissions with a verified identity.
# Accounts on the Navigation Games Workspace domain count as staff.
# ---------------------------------------------------------------------------


class InvalidTokenError(Exception):
    """An Authorization header was present but the token failed verification."""


def get_optional_user():
    """
    Read an optional sign-in token from the Authorization header: either a
    Google ID token or one of our email-link session tokens (see "Email
    sign-in links" below).

    Returns {"email", "name", "is_staff"} for a valid token, or None when no
    token was sent (anonymous request). Raises InvalidTokenError when a token
    was sent but is invalid or expired, so endpoints can return 401 and the
    frontend can prompt the visitor to sign in again instead of silently
    falling back to anonymous limits.
    """
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    if auth[len("Bearer "):].startswith(SESSION_TOKEN_PREFIX):
        email = read_session_token(auth[len("Bearer "):])
        if not email:
            raise InvalidTokenError()
        # Email-link users are always viewers. Staff status comes only from
        # a Google token's hd claim.
        return {"email": email, "name": "", "is_staff": False}
    if not REVIEW_OAUTH_CLIENT_ID:
        # Sign-in not configured on this server; treat everyone as anonymous
        return None

    try:
        # Verifies signature, expiry, issuer, and audience (our client ID).
        claims = google_id_token.verify_oauth2_token(
            auth[len("Bearer "):],
            _google_token_request,
            REVIEW_OAUTH_CLIENT_ID,
            clock_skew_in_seconds=10,
        )
    except ValueError:
        raise InvalidTokenError()

    if not claims.get("email_verified"):
        raise InvalidTokenError()

    return {
        "email": claims.get("email", ""),
        "name": claims.get("name", ""),
        # hd is the only spoof-proof Workspace-domain signal (see require_reviewer)
        "is_staff": claims.get("hd") == REVIEW_ALLOWED_DOMAIN,
    }


# ---------------------------------------------------------------------------
# Email sign-in links ("Email me a sign-in link")
#
# For teachers without a Google account. They type their email address, we
# send a link that is good for 15 minutes, and opening it gives the browser a
# session token good for 30 days. Both tokens are signed with SIGN_IN_SECRET,
# so no user store is needed. Email-link users are viewers, never staff.
#
# Email goes out through the Navigation Games Google Workspace (Gmail API,
# service account with domain-wide delegation; setup in README.md). With
# EMAIL_LINK_LOG_ONLY=true the link is only logged, for local development.
# With neither configured, email sign-in is off and the endpoint says so.
# ---------------------------------------------------------------------------

SIGN_IN_SECRET = os.environ.get("SIGN_IN_SECRET", "")
EMAIL_LINK_SENDER = os.environ.get("EMAIL_LINK_SENDER", "")  # e.g. course@navigationgames.org
GMAIL_SERVICE_ACCOUNT_JSON = os.environ.get("GMAIL_SERVICE_ACCOUNT_JSON", "")
EMAIL_LINK_LOG_ONLY = os.environ.get("EMAIL_LINK_LOG_ONLY", "").lower() == "true"

LINK_TOKEN_MAX_AGE = 15 * 60  # seconds
SESSION_TOKEN_MAX_AGE = 30 * 24 * 3600  # seconds
SESSION_TOKEN_PREFIX = "ngs."

email_link_rate_store: dict[str, list[float]] = {}
EMAIL_LINKS_PER_IP = 10  # per day
EMAIL_LINKS_PER_ADDRESS = 5  # per day

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
EMAIL_MAX_CHARS = 254


def _serializer(purpose: str) -> URLSafeTimedSerializer:
    # A different salt per purpose, so a link token can't be used as a session token
    return URLSafeTimedSerializer(SIGN_IN_SECRET, salt=f"ng-email-{purpose}")


def make_link_token(email: str) -> str:
    return _serializer("link").dumps(email)


def make_session_token(email: str) -> str:
    return SESSION_TOKEN_PREFIX + _serializer("session").dumps(email)


def read_link_token(token: str) -> str | None:
    """The email address in a valid, unexpired link token, else None."""
    if not SIGN_IN_SECRET:
        return None
    try:
        return _serializer("link").loads(token, max_age=LINK_TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return None


def read_session_token(token: str) -> str | None:
    """The email address in a valid, unexpired session token, else None."""
    if not SIGN_IN_SECRET or not token.startswith(SESSION_TOKEN_PREFIX):
        return None
    try:
        return _serializer("session").loads(token[len(SESSION_TOKEN_PREFIX):], max_age=SESSION_TOKEN_MAX_AGE)
    except (BadSignature, SignatureExpired):
        return None


def email_sign_in_enabled() -> bool:
    return bool(SIGN_IN_SECRET) and (
        EMAIL_LINK_LOG_ONLY or bool(EMAIL_LINK_SENDER and GMAIL_SERVICE_ACCOUNT_JSON)
    )


def safe_return_to(return_to: str) -> tuple[str, str] | None:
    """
    Split a return_to URL into (site origin, path) if it points at our site.

    Only the curriculum site and local development are allowed, so a sign-in
    email can never send someone to another site.
    """
    parsed = urlparse(return_to or "")
    origin = f"{parsed.scheme}://{parsed.netloc}"
    if origin not in ALLOWED_ORIGINS:
        return None
    path = parsed.path or "/"
    if parsed.query:
        path += "?" + parsed.query
    return origin, path


def send_email(to_address: str, subject: str, body: str, reply_to: str = "") -> None:
    """
    Send a plain-text email as EMAIL_LINK_SENDER through the Gmail API, or
    just log it in EMAIL_LINK_LOG_ONLY mode. Used for sign-in links and
    course submissions.
    """
    if EMAIL_LINK_LOG_ONLY:
        app.logger.warning(f"[EMAIL_LINK_LOG_ONLY] email to {to_address}: {subject}\n{body}")
        return

    from google.auth.transport.requests import AuthorizedSession
    from google.oauth2 import service_account

    credentials = service_account.Credentials.from_service_account_info(
        json.loads(GMAIL_SERVICE_ACCOUNT_JSON),
        scopes=["https://www.googleapis.com/auth/gmail.send"],
        subject=EMAIL_LINK_SENDER,  # domain-wide delegation: send as this address
    )
    message = EmailMessage()
    message["To"] = to_address
    message["From"] = f"Navigation Games <{EMAIL_LINK_SENDER}>"
    message["Subject"] = subject
    if reply_to:
        message["Reply-To"] = reply_to
    message.set_content(body)
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    response = AuthorizedSession(credentials).post(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        json={"raw": raw},
        timeout=20,
    )
    response.raise_for_status()


def send_sign_in_email(to_address: str, link: str) -> None:
    """Send the sign-in link."""
    send_email(
        to_address,
        "Your sign-in link for the Navigation Games course",
        "Here's your link to sign in to the Navigation Games teacher course:\n\n"
        f"{link}\n\n"
        "It works for 15 minutes. Once you're signed in, that browser stays "
        "signed in for 30 days.\n\n"
        "If you didn't ask for this, you can ignore this email.\n\n"
        "Navigation Games",
    )


@app.route("/auth/email-link", methods=["POST"])
def request_email_link():
    """
    Email a sign-in link.

    Request body: {"email": "teacher@school.org", "return_to": "https://curriculum.navigationgames.org/training/unit-0/"}
    Response: {"ok": true} whenever the request is well formed, so the
    response never reveals anything about the address.
    """
    if not email_sign_in_enabled():
        return jsonify({"error": "Email sign-in isn't set up yet. Please sign in with Google."}), 503

    data = request.get_json(silent=True) or {}
    email = str(data.get("email") or "").strip().lower()
    if len(email) > EMAIL_MAX_CHARS or not EMAIL_PATTERN.match(email):
        return jsonify({"error": "Please enter a valid email address."}), 400

    destination = safe_return_to(str(data.get("return_to") or ""))
    if not destination:
        return jsonify({"error": "That page can't be used for sign-in."}), 400
    origin, path = destination

    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    if not _check_rate_limit(email_link_rate_store, "ip:" + client_ip, EMAIL_LINKS_PER_IP) or \
            not _check_rate_limit(email_link_rate_store, "email:" + email, EMAIL_LINKS_PER_ADDRESS):
        return jsonify({"error": "Too many sign-in emails. Please try again tomorrow."}), 429

    link = f"{origin}/sign-in/?token={quote(make_link_token(email))}&next={quote(path)}"
    try:
        send_sign_in_email(email, link)
    except Exception as e:
        app.logger.error(f"Sign-in email failed: {e}")
        return jsonify({"error": "We couldn't send the email. Please try again later."}), 502

    return jsonify({"ok": True})


@app.route("/auth/google-session", methods=["POST"])
def google_session():
    """
    Exchange a Google ID token (good for about an hour) for one of our 30-day
    session tokens, so teachers signed in with Google aren't signed out in the
    middle of a course unit. Like email-link sessions, these are never staff:
    staff features (the review tool) keep using the Google token itself.

    Request: Authorization: Bearer <Google ID token>
    Response: {"session_token": "ngs....", "email": "...", "exp": unix_seconds}
    """
    if not SIGN_IN_SECRET:
        return jsonify({"error": "Long sign-in sessions aren't set up on this server."}), 503
    auth = request.headers.get("Authorization", "")
    if auth[len("Bearer "):].startswith(SESSION_TOKEN_PREFIX):
        return jsonify({"error": "Send a Google sign-in token."}), 400
    try:
        user = get_optional_user()
    except InvalidTokenError:
        return jsonify({"error": "Your sign-in expired. Please sign in again."}), 401
    if user is None:
        return jsonify({"error": "Please sign in with Google first."}), 401
    return jsonify({
        "session_token": make_session_token(user["email"]),
        "email": user["email"],
        "exp": int(time.time()) + SESSION_TOKEN_MAX_AGE,
    })


@app.route("/auth/email-link/verify", methods=["POST"])
def verify_email_link():
    """
    Exchange the token from a sign-in link for a 30-day session token.

    Request body: {"token": "..."}
    Response: {"session_token": "ngs....", "email": "...", "exp": unix_seconds}
    """
    data = request.get_json(silent=True) or {}
    email = read_link_token(str(data.get("token") or ""))
    if not email:
        return jsonify({"error": "This sign-in link has expired or isn't valid. Please ask for a new one."}), 401
    return jsonify({
        "session_token": make_session_token(email),
        "email": email,
        "exp": int(time.time()) + SESSION_TOKEN_MAX_AGE,
    })


def _chat_limit_error(user):
    """Return a 429 response if this chat message is over the daily limit, else None.

    Anonymous visitors are limited per IP, signed-in visitors per verified
    email, and staff not at all. Shared by /chat and /tutor.
    """
    if user is None:
        client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
        if not check_rate_limit(client_ip):
            return jsonify({
                "error": "Daily message limit reached. Sign in with Google for a higher limit, or come back tomorrow."
            }), 429
    elif not user["is_staff"]:
        if not _check_rate_limit(rate_limit_store, "email:" + user["email"], SIGNED_IN_RATE_LIMIT_MAX):
            return jsonify({"error": "Daily message limit reached. Come back tomorrow."}), 429
    return None


def _tutor_limit_error(user):
    """Return a 429 response if an anonymous visitor is over the tutor's daily limit, else None."""
    if user is not None:
        return None
    client_ip = request.headers.get("X-Forwarded-For", request.remote_addr)
    if not _check_rate_limit(tutor_rate_store, client_ip, TUTOR_ANONYMOUS_LIMIT):
        return jsonify({"error": "Daily message limit reached. Sign in for unlimited use of the course tutor."}), 429
    return None


def _messages_error(messages):
    """Return an error message if the conversation is malformed, else None."""
    if not isinstance(messages, list) or len(messages) == 0:
        return "'messages' must be a non-empty array."
    for msg in messages:
        if msg.get("role") not in ("user", "assistant"):
            return "Each message must have role 'user' or 'assistant'."
        if not msg.get("content"):
            return "Each message must have non-empty 'content'."
    # The last message must be from the user
    if messages[-1]["role"] != "user":
        return "Last message must be from the user."
    return None


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

    An optional Google ID token in the Authorization header raises the daily
    limit (per verified email instead of per IP); staff accounts have no limit.
    """
    try:
        user = get_optional_user()
    except InvalidTokenError:
        return jsonify({"error": "Your sign-in expired. Please sign in again."}), 401

    limit_error = _chat_limit_error(user)
    if limit_error:
        return limit_error

    # Parse request
    data = request.get_json()
    if not data or "messages" not in data:
        return jsonify({"error": "Request must include 'messages' array."}), 400

    messages = data["messages"]
    conversation_id = data.get("conversation_id", str(uuid.uuid4()))
    user_info = data.get("user_info", {})

    # A verified identity beats the self-reported one in the log
    if user:
        user_info = dict(user_info or {})
        user_info["email"] = user["email"]
        if not user_info.get("name"):
            user_info["name"] = user["name"]

    messages_error = _messages_error(messages)
    if messages_error:
        return jsonify({"error": messages_error}), 400

    try:
        # Call Claude API with prompt caching on the system prompt
        response = _create_message(messages)

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


# ---------------------------------------------------------------------------
# Course tutor (Kickstart Orienteering Teacher Course, prototype)
#
# Each course unit page has a tutor chat. The unit material comes from
# training-units.json, generated by scripts/build-training.js from the
# content files in content/training/. The tutor's general instructions are
# in tutor-prompt.md. Both need a Cloud Run redeploy to reach the live tutor.
# ---------------------------------------------------------------------------

TUTOR_PROMPT = (Path(__file__).parent / "tutor-prompt.md").read_text(encoding="utf-8")
# A short style checklist, put at the very end of the system prompt because
# models follow what they read last most closely
TUTOR_STYLE = (Path(__file__).parent / "tutor-style.md").read_text(encoding="utf-8")
TRAINING_UNITS_PATH = Path(__file__).parent / "training-units.json"
TRAINING_UNITS = (
    json.loads(TRAINING_UNITS_PATH.read_text(encoding="utf-8"))
    if TRAINING_UNITS_PATH.exists()
    else {}
)
TUTOR_PROFILE_MAX_CHARS = 3000
TUTOR_PLAN_MAX_CHARS = 6000
PLAN_UNIT = "unit-4"  # the unit whose deliverable is the teacher's unit plan


def tutor_system_prompt(unit: dict, profile: str = "", plan: str = "") -> str:
    """The tutor's system prompt: general instructions, this unit, the site map, then the style checklist."""
    parts = [
        TUTOR_PROMPT,
        f"# This unit: {unit['title']}\n\nAbout {unit['minutes']} minutes. "
        f"The teacher makes: {unit['deliverable']}.",
        "## What the teacher reads on the page\n\n" + unit["page"],
        "## What the teacher makes\n\n" + unit["make"],
        "## What we look for\n\n" + unit["look_for"],
        "## Your instructions for this unit\n\n" + unit["instructions"],
        "## You have already greeted the teacher with\n\n" + unit["opening"],
    ]
    if profile:
        parts.append(
            "## The teacher's learner profile (from Unit 0, written by the tutor and checked by the teacher)\n\n"
            + profile[:TUTOR_PROFILE_MAX_CHARS]
        )
    if plan:
        parts.append(
            "## The teacher's unit plan (from Unit 4, as they last saved it; their actual teaching may differ)\n\n"
            + plan[:TUTOR_PLAN_MAX_CHARS]
        )
    if SITE_MAP_PATH.exists():
        parts.append(SITE_MAP_PATH.read_text(encoding="utf-8"))
    parts.append(TUTOR_STYLE)
    return "\n\n".join(parts)


def remove_em_dashes(text: str) -> str:
    """
    Replace em-dashes with commas. Navigation Games writing never uses them,
    and the AI doesn't always follow that rule, so the tutor's replies are
    cleaned in code. En dashes in number ranges ("grades 3–5") stay.
    """
    text = re.sub(r"\s*\u2014\s*", ", ", text)
    # A spaced en dash is being used as an em-dash
    text = re.sub(r" \u2013 ", ", ", text)
    return text


@app.route("/tutor", methods=["POST"])
def tutor():
    """
    Course tutor endpoint. Like /chat, but the conversation is about one
    course unit.

    Request body:
    {
        "unit": "unit-0",
        "conversation_id": "optional-id",
        "messages": [{"role": "user", "content": "..."}],
        "profile": "optional learner profile text from Unit 0"
    }

    Response: {"conversation_id": "tutor-unit-0-...", "response": "..."}

    Conversation IDs always start with "tutor-<unit>-" so tutor conversations
    are easy to find in the log sheet and the review tool.

    Requires sign-in (Google or an email link), so every conversation is tied
    to a teacher and can be picked up again from /tutor/progress.
    """
    try:
        user = get_optional_user()
    except InvalidTokenError:
        return jsonify({"error": "Your sign-in expired. Please sign in again."}), 401
    if user is None:
        return jsonify({"error": "Please sign in to use the course tutor."}), 401

    limit_error = _tutor_limit_error(user)
    if limit_error:
        return limit_error

    data = request.get_json(silent=True) or {}
    unit_slug = data.get("unit", "")
    unit = TRAINING_UNITS.get(unit_slug)
    if not unit:
        return jsonify({"error": f"Unknown course unit '{unit_slug}'."}), 400

    messages = data.get("messages")
    messages_error = _messages_error(messages)
    if messages_error:
        return jsonify({"error": messages_error}), 400

    prefix = f"tutor-{unit_slug}-"
    conversation_id = str(data.get("conversation_id") or uuid.uuid4())
    if not conversation_id.startswith(prefix):
        conversation_id = prefix + conversation_id

    profile = data.get("profile") or ""
    if not isinstance(profile, str):
        profile = ""
    plan = data.get("plan") or ""
    if not isinstance(plan, str) or unit_slug == PLAN_UNIT:
        plan = ""

    user_info = {"organization": f"course {unit_slug}"}
    if user:
        user_info.update(name=user["name"], email=user["email"])

    try:
        response = _create_message(messages, tutor_system_prompt(unit, profile, plan), TUTOR_MAX_TOKENS)
        assistant_message = remove_em_dashes(response.content[0].text)
        _log_exchange(conversation_id, messages, assistant_message, response, user_info)
        reply = {"conversation_id": conversation_id, "response": assistant_message}
        if voice_enabled():
            reply["speech_token"] = speech_token(assistant_message)
        return jsonify(reply)
    except anthropic.RateLimitError:
        return jsonify({"error": "Service is busy. Please try again in a moment."}), 503
    except anthropic.APIError as e:
        app.logger.error(f"Anthropic API error: {e}")
        return jsonify({"error": "Something went wrong. Please try again."}), 500


PROFILE_BLOCK = re.compile(r"```profile\n(.*?)```", re.S)
DELIVERABLE_BLOCK = re.compile(r"```deliverable\n(.*?)```", re.S)


def unit_for_conversation(conversation_id: str) -> str | None:
    """The course unit a tutor conversation ID belongs to, e.g. "unit-0"."""
    for slug in TRAINING_UNITS:
        if conversation_id.startswith(f"tutor-{slug}-"):
            return slug
    return None


def rebuild_progress(rows: list[list[str]], email: str) -> dict:
    """
    Rebuild one teacher's course progress from the conversation log rows.

    For each unit, the most recently active tutor conversation; plus the
    latest learner profile the tutor wrote. Each exchange is logged as the
    new user message and the reply, numbered by position in the
    conversation, so a retried message replaces the earlier row.
    """
    email = email.lower()
    conversations: dict[str, dict] = {}
    for row in rows:
        if len(row) < 10 or row[9].strip().lower() != email:
            continue
        try:
            msg_number = int(row[2])
        except ValueError:
            continue
        unit = unit_for_conversation(row[1])
        if not unit or row[3] not in ("user", "assistant"):
            continue
        conv = conversations.setdefault(row[1], {"unit": unit, "last": "", "messages": {}})
        conv["messages"][msg_number] = {"role": row[3], "content": row[4], "timestamp": row[0]}
        conv["last"] = max(conv["last"], row[0])

    units: dict[str, dict] = {}
    profile, profile_time = "", ""
    plan, plan_time = "", ""
    for conv_id, conv in conversations.items():
        messages = [conv["messages"][n] for n in sorted(conv["messages"])]
        for m in messages:
            if m["role"] != "assistant":
                continue
            found = PROFILE_BLOCK.findall(m["content"])
            if found and m["timestamp"] >= profile_time:
                profile, profile_time = found[-1].strip(), m["timestamp"]
            found = DELIVERABLE_BLOCK.findall(m["content"]) if conv["unit"] == PLAN_UNIT else []
            if found and m["timestamp"] >= plan_time:
                plan, plan_time = found[-1].strip(), m["timestamp"]
        current = units.get(conv["unit"])
        if current is None or conv["last"] > current["updated"]:
            units[conv["unit"]] = {
                "conversation_id": conv_id,
                "updated": conv["last"],
                "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
            }
    return {"units": units, "profile": profile, "plan": plan}


@app.route("/tutor/progress", methods=["GET"])
def tutor_progress():
    """
    The signed-in teacher's saved course progress, so they can pick up on
    any device.

    Response: {"units": {"unit-0": {"conversation_id", "updated", "messages"}}, "profile": "...", "plan": "..."}

    Rebuilt from the conversation log sheet on every request. Fine for a
    prototype; move to a real datastore before the course is large.
    """
    try:
        user = get_optional_user()
    except InvalidTokenError:
        return jsonify({"error": "Your sign-in expired. Please sign in again."}), 401
    if user is None:
        return jsonify({"error": "Please sign in to see your progress."}), 401

    gc = get_sheets_client()
    if not gc:
        return jsonify({"units": {}, "profile": "", "plan": ""})
    try:
        rows = gc.open_by_key(SPREADSHEET_ID).sheet1.get_all_values()
    except Exception as e:
        app.logger.error(f"Could not read the log sheet for progress: {e}")
        return jsonify({"units": {}, "profile": "", "plan": ""})
    progress = rebuild_progress(rows, user["email"])
    if voice_enabled():
        for saved in progress["units"].values():
            for m in saved["messages"]:
                if m["role"] == "assistant":
                    m["speech_token"] = speech_token(m["content"])
    return jsonify(progress)


# ---------------------------------------------------------------------------
# Submitting a deliverable
#
# The teacher presses "Send to Navigation Games" on a saved box. The reviewer
# gets an email they can reply to (Reply-To is the teacher), the teacher gets
# a copy with the curriculum links spelled out, and the submission is logged
# in the "Submissions" tab of the log sheet, which the weekly check-in script
# reads.
# ---------------------------------------------------------------------------

COURSE_REVIEWER_EMAIL = os.environ.get("COURSE_REVIEWER_EMAIL", "") or EMAIL_LINK_SENDER
SITE_URL = "https://curriculum.navigationgames.org"
SUBMISSIONS_SHEET_TITLE = "Submissions"
SUBMISSIONS_HEADER = ["timestamp", "email", "name", "unit", "kind", "conversation_id", "text"]
SUBMISSION_MAX_CHARS = 20000
SUBMISSIONS_PER_DAY = 20  # per teacher
submission_rate_store: dict[str, list[float]] = {}
SUBMISSION_KINDS = {"deliverable": "work", "profile": "learner profile", "ymp": "map application answers"}
# When the reviewer replies. The unit plan drives Consultation 1, so it's quicker.
REVIEW_TURNAROUND = {"unit-4": "within 3 business days"}


def full_links(text: str) -> str:
    """Spell out Markdown links for an email: [Map Walk](/activities/...) -> Map Walk (https://...)."""

    def spell(match):
        url = match.group(2)
        if url.startswith("/"):
            url = SITE_URL + url
        return f"{match.group(1)} ({url})"

    return re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", spell, text)


def submission_emails(unit_slug: str, unit: dict, kind: str, text: str, user: dict, conversation_id: str):
    """The (reviewer email, teacher email) pairs of (subject, body) for a submission."""
    who = f"{user['name']} <{user['email']}>" if user["name"] else user["email"]
    what = SUBMISSION_KINDS[kind]
    title = unit["title"]
    turnaround = REVIEW_TURNAROUND.get(unit_slug, "within a week")
    reviewer = (
        f"Course submission: {title}, {what}, from {who}",
        f"{who} sent their {what} for {title}.\n\n"
        f"{full_links(text)}\n\n"
        f"Reply to this email to answer them ({turnaround}). The whole conversation is in the "
        f"review tool, {SITE_URL}/review-conversations/, as {conversation_id or 'an unsaved conversation'}.",
    )
    teacher = (
        f"Your {what} for {title}",
        f"Thanks! Navigation Games has your {what} for {title}, and someone will reply {turnaround}. "
        "Here's a copy of what you sent, with the links to the curriculum spelled out:\n\n"
        f"{full_links(text)}\n\n"
        "Questions in the meantime? Just reply to this email.\n\nNavigation Games",
    )
    return reviewer, teacher


def _log_submission(row: list[str]) -> None:
    gc = get_sheets_client()
    if not gc:
        return
    try:
        sheet = _get_or_create_worksheet(gc.open_by_key(SPREADSHEET_ID), SUBMISSIONS_SHEET_TITLE, SUBMISSIONS_HEADER)
        sheet.append_row(row, value_input_option="RAW")
    except Exception as e:
        app.logger.error(f"Could not log the submission: {e}")


@app.route("/tutor/submit", methods=["POST"])
def tutor_submit():
    """
    Send a saved deliverable to Navigation Games.

    Request body: {"unit": "unit-4", "kind": "deliverable", "text": "...", "conversation_id": "..."}
    Response: {"ok": true, "emailed": true, "turnaround": "within 3 business days"}

    "emailed" is false when email isn't set up; the submission is still logged.
    """
    try:
        user = get_optional_user()
    except InvalidTokenError:
        return jsonify({"error": "Your sign-in expired. Please sign in again."}), 401
    if user is None:
        return jsonify({"error": "Please sign in to send your work."}), 401

    data = request.get_json(silent=True) or {}
    unit_slug = data.get("unit", "")
    unit = TRAINING_UNITS.get(unit_slug)
    if not unit:
        return jsonify({"error": "Unknown course unit."}), 400
    kind = data.get("kind", "")
    if kind not in SUBMISSION_KINDS:
        return jsonify({"error": "Unknown kind of submission."}), 400
    text = data.get("text")
    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "Nothing to send."}), 400
    text = text.strip()[:SUBMISSION_MAX_CHARS]
    conversation_id = str(data.get("conversation_id") or "")[:200]

    if not _check_rate_limit(submission_rate_store, user["email"].lower(), SUBMISSIONS_PER_DAY):
        return jsonify({"error": "That's a lot of sending for one day. Please email admin@navigationgames.org instead."}), 429

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    _log_submission([now, user["email"], user["name"], unit_slug, kind, conversation_id, text])

    emailed = False
    if EMAIL_LINK_SENDER and COURSE_REVIEWER_EMAIL and (GMAIL_SERVICE_ACCOUNT_JSON or EMAIL_LINK_LOG_ONLY):
        reviewer, teacher = submission_emails(unit_slug, unit, kind, text, user, conversation_id)
        try:
            send_email(COURSE_REVIEWER_EMAIL, *reviewer, reply_to=user["email"])
            send_email(user["email"], *teacher, reply_to=COURSE_REVIEWER_EMAIL)
            emailed = True
        except Exception as e:
            app.logger.error(f"Could not email the submission: {e}")
    return jsonify({"ok": True, "emailed": emailed, "turnaround": REVIEW_TURNAROUND.get(unit_slug, "within a week")})


# ---------------------------------------------------------------------------
# Tutor voice (ElevenLabs)
#
# Reads tutor replies aloud in a cloned voice. The endpoint only speaks text
# the tutor itself wrote (each reply comes with a signed speech_token) or a
# unit's opening, so nobody can make the voice say whatever they like.
# Speaking costs per character, so each teacher has a daily allowance.
# ---------------------------------------------------------------------------

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()  # a piped-in secret can end in a newline
ELEVENLABS_VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID", "").strip()
ELEVENLABS_MODEL = os.environ.get("ELEVENLABS_MODEL", "eleven_v4")
# Shown next to the speaker button, e.g. "AI voice based on Barb's"
TUTOR_VOICE_LABEL = os.environ.get("TUTOR_VOICE_LABEL", "AI voice")
# ElevenLabs charges about one credit per character. A typical reply is
# 300 to 800 characters, and a minute of speech is about 900.
SPEECH_DAILY_CHARS = int(os.environ.get("TUTOR_SPEECH_DAILY_CHARS", "20000"))  # per teacher, enough for the longest unit
# For the whole course, per calendar month (UTC), so a busy week can't use up
# the ElevenLabs plan. Kept in memory like the other limits: it starts again
# on a redeploy and is counted per Cloud Run instance, so it is a safety net,
# not exact accounting.
SPEECH_MONTHLY_CHARS = int(os.environ.get("TUTOR_SPEECH_MONTHLY_CHARS", "100000"))
SPEECH_MAX_CHARS = 5000  # per reply
speech_usage_store: dict[str, list[tuple[float, int]]] = {}
speech_month_usage = {"month": "", "chars": 0}

SAVED_BLOCK_SPEECH = {
    "profile": "I've written your profile in the box below.",
    "deliverable": "I've written it in the box below.",
    "ymp": "I've put your answers in the box below.",
}


def voice_enabled() -> bool:
    return bool(ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID and SIGN_IN_SECRET)


def speech_token(text: str) -> str:
    """A signature showing the tutor wrote this text."""
    return hmac.new(SIGN_IN_SECRET.encode(), b"ng-speech:" + text.encode(), hashlib.sha256).hexdigest()


def speech_text(reply: str) -> str:
    """What to say aloud for a tutor reply: no saved boxes, links or Markdown marks."""
    text = re.sub(
        r"```(\w*)\n.*?```",
        lambda m: SAVED_BLOCK_SPEECH.get(m.group(1), "I've written it in the box below."),
        reply,
        flags=re.S,
    )
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)  # [words](url) -> words
    text = re.sub(r"https?://\S+", "", text)
    text = re.sub(r"^#+\s*", "", text, flags=re.M)
    text = re.sub(r"^\s*[-*]\s+", "", text, flags=re.M)
    text = text.replace("**", "").replace("`", "")
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()[:SPEECH_MAX_CHARS]


def _month_chars_used() -> int:
    month = datetime.now(timezone.utc).strftime("%Y-%m")
    if speech_month_usage["month"] != month:
        speech_month_usage.update(month=month, chars=0)
    return speech_month_usage["chars"]


def speech_chars_left(email: str) -> int:
    """Characters this teacher can still have read aloud today (less if the course's month is nearly used up)."""
    now = time.time()
    recent = [(t, n) for t, n in speech_usage_store.get(email, []) if now - t < RATE_LIMIT_WINDOW]
    speech_usage_store[email] = recent
    today_left = SPEECH_DAILY_CHARS - sum(n for _, n in recent)
    month_left = SPEECH_MONTHLY_CHARS - _month_chars_used()
    return max(0, min(today_left, month_left))


def _record_speech(email: str, chars: int) -> None:
    speech_usage_store.setdefault(email, []).append((time.time(), chars))
    _month_chars_used()
    speech_month_usage["chars"] += chars


def _unrecord_speech(email: str, chars: int) -> None:
    """Give back characters when ElevenLabs failed, so the teacher isn't charged for nothing."""
    usage = speech_usage_store.get(email, [])
    if usage and usage[-1][1] == chars:
        usage.pop()
    speech_month_usage["chars"] = max(0, speech_month_usage["chars"] - chars)


def synthesize_speech(text: str) -> bytes:
    """MP3 audio of text in the tutor's voice, from ElevenLabs."""
    response = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVENLABS_VOICE_ID}",
        params={"output_format": "mp3_44100_128"},
        headers={"xi-api-key": ELEVENLABS_API_KEY, "Accept": "audio/mpeg"},
        json={"text": text, "model_id": ELEVENLABS_MODEL},
        timeout=60,
    )
    response.raise_for_status()
    return response.content


@app.route("/tutor/voice", methods=["GET"])
def tutor_voice():
    """
    Whether the tutor can speak, and the label to show by the speaker button.
    For a signed-in teacher, also how many characters they can still have
    read aloud today ("chars_left") and the daily allowance ("daily_chars").
    """
    voice = {"enabled": voice_enabled(), "label": TUTOR_VOICE_LABEL}
    try:
        user = get_optional_user()
    except InvalidTokenError:
        user = None
    if voice["enabled"] and user:
        voice.update(chars_left=speech_chars_left(user["email"].lower()), daily_chars=SPEECH_DAILY_CHARS)
    return jsonify(voice)


@app.route("/tutor/speak", methods=["POST"])
def tutor_speak():
    """
    Read a tutor reply aloud.

    Request body, either:
      {"text": "<a tutor reply>", "speech_token": "<from /tutor or /tutor/progress>"}
      {"unit": "unit-0"}   (the unit's opening message)

    Response: audio/mpeg
    """
    if not voice_enabled():
        return jsonify({"error": "The tutor's voice isn't set up."}), 404
    try:
        user = get_optional_user()
    except InvalidTokenError:
        return jsonify({"error": "Your sign-in expired. Please sign in again."}), 401
    if user is None:
        return jsonify({"error": "Please sign in to hear the tutor."}), 401

    data = request.get_json(silent=True) or {}
    if data.get("unit"):
        unit = TRAINING_UNITS.get(data["unit"])
        if not unit:
            return jsonify({"error": "Unknown course unit."}), 400
        text = unit["opening"]
    else:
        text = data.get("text")
        token = data.get("speech_token")
        if not isinstance(text, str) or not isinstance(token, str) or not hmac.compare_digest(
            token, speech_token(text)
        ):
            return jsonify({"error": "The tutor can only read its own replies."}), 403

    spoken = speech_text(text)
    if not spoken:
        return jsonify({"error": "Nothing to read aloud."}), 400
    email = user["email"].lower()
    if len(spoken) > speech_chars_left(email):
        if SPEECH_MONTHLY_CHARS - _month_chars_used() < len(spoken):
            message = "The tutor's voice is used up for this month. You can still read the replies."
        else:
            message = "You've used today's read-aloud credits. You can still read the replies, and the credits come back tomorrow."
        return jsonify({"error": message}), 429
    _record_speech(email, len(spoken))
    try:
        audio = synthesize_speech(spoken)
    except requests.RequestException as e:
        _unrecord_speech(email, len(spoken))
        app.logger.error(f"ElevenLabs error: {e}")
        return jsonify({"error": "The tutor's voice isn't available right now."}), 502
    return Response(audio, mimetype="audio/mpeg", headers={"Cache-Control": "private, max-age=86400"})


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
# Auth optional: anonymous submissions are rate limited and their free-text
# name/email is unverified public input. Signed-in submissions skip the rate
# limit and are tagged with the verified Google identity instead.
# RAW value input prevents formula injection.
# ---------------------------------------------------------------------------


@app.route("/page-feedback", methods=["POST"])
def page_feedback():
    """
    Accept thumbs up/down and/or a comment about a specific site page.

    Request body:
    {
        "page": "/activities/core/animal-o/",
        "title": "Animal-O",
        "rating": "up" | "down" | null,
        "comment": "optional text",
        "submitter": "optional name or email"
    }
    """
    try:
        user = get_optional_user()
    except InvalidTokenError:
        return jsonify({"error": "Your sign-in expired. Please sign in again."}), 401

    if user is None:
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

    # Signed-in submissions carry a verified identity, replacing free text
    if user:
        submitter = f"{user['name']} <{user['email']}> (verified)".strip()

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

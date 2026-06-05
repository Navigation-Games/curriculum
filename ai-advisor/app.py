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
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic

app = Flask(__name__)

# CORS: allow the curriculum site and localhost for development
ALLOWED_ORIGINS = [
    "https://navgames.github.io",
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


# Rate limiting: simple in-memory store (resets on deploy)
# For production, use Redis or similar
rate_limit_store: dict[str, list[float]] = {}
RATE_LIMIT_MAX = 20  # conversations per day per IP
RATE_LIMIT_WINDOW = 86400  # 24 hours in seconds


def check_rate_limit(ip: str) -> bool:
    """Return True if the request is within rate limits."""
    now = time.time()
    if ip not in rate_limit_store:
        rate_limit_store[ip] = []

    # Remove old entries outside the window
    rate_limit_store[ip] = [
        t for t in rate_limit_store[ip] if now - t < RATE_LIMIT_WINDOW
    ]

    if len(rate_limit_store[ip]) >= RATE_LIMIT_MAX:
        return False

    rate_limit_store[ip].append(now)
    return True


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
        _log_exchange(conversation_id, messages, assistant_message, response)

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
):
    """
    Log a conversation exchange to Google Sheets and stdout.

    Each exchange appends rows for the new user message and assistant response.
    The full conversation history is sent to Claude each time, but we only log
    the new messages (the last user message and the assistant response) to
    avoid duplicating earlier messages in the sheet.
    """
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    model = api_response.model
    input_tokens = api_response.usage.input_tokens
    output_tokens = api_response.usage.output_tokens

    # Message number: how many messages deep we are in this conversation
    msg_number = len(messages)

    # Rows to append: the latest user message + the assistant response
    rows = [
        [now, conversation_id, msg_number, "user", messages[-1]["content"], "", "", ""],
        [now, conversation_id, msg_number + 1, "assistant", assistant_response, model, str(input_tokens), str(output_tokens)],
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
    }
    if hasattr(api_response.usage, "cache_creation_input_tokens"):
        log_entry["cache_creation_tokens"] = api_response.usage.cache_creation_input_tokens
    if hasattr(api_response.usage, "cache_read_input_tokens"):
        log_entry["cache_read_tokens"] = api_response.usage.cache_read_input_tokens

    app.logger.info(f"ADVISOR_LOG: {json.dumps(log_entry)}")


if __name__ == "__main__":
    # Local development
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)

"""
Tests for optional sign-in on the public endpoints (/chat and /page-feedback).

Run from the ai-advisor/ directory:  pytest

The Anthropic API, Google Sheets, and Google token verification are all
faked, so no credentials or network access are needed. What these tests
cannot cover: real ID token verification and the sign-in UI. Those are
checked manually after deployment (see README).
"""

import os

import gspread
import pytest

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key-not-used")

import app as advisor  # noqa: E402


# ---------------------------------------------------------------------------
# Fakes
# ---------------------------------------------------------------------------


class FakeUsage:
    input_tokens = 10
    output_tokens = 5


class FakeContent:
    text = "Here is a lesson plan."


class FakeApiResponse:
    content = [FakeContent()]
    model = "claude-fake"
    usage = FakeUsage()


class FakeWorksheet:
    def __init__(self):
        self.rows = []

    def get_all_values(self):
        return self.rows

    def append_row(self, row, value_input_option=None):
        self.rows.append(row)


class FakeSpreadsheet:
    def __init__(self):
        self.worksheets: dict[str, FakeWorksheet] = {}

    def worksheet(self, title):
        if title not in self.worksheets:
            raise gspread.WorksheetNotFound(title)
        return self.worksheets[title]

    def add_worksheet(self, title, rows, cols):
        self.worksheets[title] = FakeWorksheet()
        return self.worksheets[title]


VIEWER_CLAIMS = {
    "email": "teacher@gmail.com",
    "email_verified": True,
    "name": "Ms. Teacher",
}

STAFF_CLAIMS = {
    "email": "barb@navigationgames.org",
    "email_verified": True,
    "hd": "navigationgames.org",
    "name": "Barb",
}


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setattr(advisor, "rate_limit_store", {})
    monkeypatch.setattr(advisor, "page_feedback_rate_store", {})
    monkeypatch.setattr(advisor, "_create_message", lambda messages: FakeApiResponse())
    return advisor.app.test_client()


def signed_in_as(monkeypatch, claims):
    """Configure the OAuth client ID and make any token verify as `claims`."""
    monkeypatch.setattr(advisor, "REVIEW_OAUTH_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(
        advisor.google_id_token,
        "verify_oauth2_token",
        lambda token, request, audience, clock_skew_in_seconds=0: dict(claims),
    )
    return {"Authorization": "Bearer fake-token"}


def rejected_tokens(monkeypatch):
    """Configure the OAuth client ID and make every token fail verification."""

    def raise_value_error(token, request, audience, clock_skew_in_seconds=0):
        raise ValueError("bad token")

    monkeypatch.setattr(advisor, "REVIEW_OAUTH_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(advisor.google_id_token, "verify_oauth2_token", raise_value_error)
    return {"Authorization": "Bearer garbage"}


def chat(client, headers=None, ip="1.2.3.4"):
    return client.post(
        "/chat",
        json={"messages": [{"role": "user", "content": "Help me plan"}]},
        headers={"X-Forwarded-For": ip, **(headers or {})},
    )


def exhaust(store_key, count):
    """Prefill a rate-limit bucket as if `count` requests already happened."""
    import time

    advisor.rate_limit_store[store_key] = [time.time()] * count


# ---------------------------------------------------------------------------
# /chat
# ---------------------------------------------------------------------------


def test_anonymous_chat_still_works(client):
    r = chat(client)
    assert r.status_code == 200
    assert r.get_json()["response"] == "Here is a lesson plan."


def test_anonymous_limit_suggests_signing_in(client):
    exhaust("1.2.3.4", advisor.RATE_LIMIT_MAX)
    r = chat(client)
    assert r.status_code == 429
    assert "Sign in" in r.get_json()["error"]


def test_invalid_token_returns_401_not_anonymous_fallback(client, monkeypatch):
    headers = rejected_tokens(monkeypatch)
    r = chat(client, headers)
    assert r.status_code == 401


def test_signed_in_uses_email_bucket_not_ip(client, monkeypatch):
    headers = signed_in_as(monkeypatch, VIEWER_CLAIMS)
    # IP bucket is exhausted, but the signed-in user is unaffected
    exhaust("1.2.3.4", advisor.RATE_LIMIT_MAX)
    r = chat(client, headers)
    assert r.status_code == 200
    assert "email:teacher@gmail.com" in advisor.rate_limit_store


def test_signed_in_limit_is_higher(client, monkeypatch):
    headers = signed_in_as(monkeypatch, VIEWER_CLAIMS)
    exhaust("email:teacher@gmail.com", advisor.SIGNED_IN_RATE_LIMIT_MAX - 1)
    assert chat(client, headers).status_code == 200
    assert chat(client, headers).status_code == 429


def test_staff_has_no_limit(client, monkeypatch):
    headers = signed_in_as(monkeypatch, STAFF_CLAIMS)
    exhaust("email:barb@navigationgames.org", advisor.SIGNED_IN_RATE_LIMIT_MAX)
    assert chat(client, headers).status_code == 200


def test_unverified_email_rejected(client, monkeypatch):
    headers = signed_in_as(monkeypatch, {**VIEWER_CLAIMS, "email_verified": False})
    assert chat(client, headers).status_code == 401


def test_unconfigured_server_treats_token_as_anonymous(client, monkeypatch):
    monkeypatch.setattr(advisor, "REVIEW_OAUTH_CLIENT_ID", "")
    r = chat(client, {"Authorization": "Bearer anything"})
    assert r.status_code == 200
    assert "1.2.3.4" in advisor.rate_limit_store


def test_verified_identity_overrides_user_info(client, monkeypatch):
    headers = signed_in_as(monkeypatch, VIEWER_CLAIMS)
    logged = {}

    def fake_log(conversation_id, messages, assistant_response, api_response, user_info=None):
        logged.update(user_info or {})

    monkeypatch.setattr(advisor, "_log_exchange", fake_log)
    r = client.post(
        "/chat",
        json={
            "messages": [{"role": "user", "content": "Hi"}],
            "user_info": {"name": "Self Reported", "email": "fake@example.com"},
        },
        headers=headers,
    )
    assert r.status_code == 200
    assert logged["email"] == "teacher@gmail.com"  # verified email wins
    assert logged["name"] == "Self Reported"  # typed name is kept


# ---------------------------------------------------------------------------
# /page-feedback
# ---------------------------------------------------------------------------


@pytest.fixture
def spreadsheet(monkeypatch):
    ss = FakeSpreadsheet()
    monkeypatch.setattr(advisor, "_open_spreadsheet", lambda: ss)
    return ss


def feedback(client, headers=None, ip="1.2.3.4"):
    return client.post(
        "/page-feedback",
        json={"page": "/p/", "rating": "up", "submitter": "typed name"},
        headers={"X-Forwarded-For": ip, **(headers or {})},
    )


def test_signed_in_feedback_skips_rate_limit(client, monkeypatch, spreadsheet):
    headers = signed_in_as(monkeypatch, VIEWER_CLAIMS)
    for _ in range(advisor.PAGE_FEEDBACK_RATE_MAX + 5):
        assert feedback(client, headers).status_code == 201
    # The anonymous IP bucket was never touched
    assert advisor.page_feedback_rate_store == {}


def test_signed_in_feedback_uses_verified_identity(client, monkeypatch, spreadsheet):
    headers = signed_in_as(monkeypatch, VIEWER_CLAIMS)
    assert feedback(client, headers).status_code == 201
    row = spreadsheet.worksheets[advisor.PAGE_FEEDBACK_SHEET_TITLE].rows[-1]
    assert row[5] == "Ms. Teacher <teacher@gmail.com> (verified)"


def test_invalid_token_feedback_returns_401(client, monkeypatch, spreadsheet):
    headers = rejected_tokens(monkeypatch)
    assert feedback(client, headers).status_code == 401


def test_anonymous_feedback_still_rate_limited(client, spreadsheet):
    for _ in range(advisor.PAGE_FEEDBACK_RATE_MAX):
        assert feedback(client).status_code == 201
    assert feedback(client).status_code == 429

"""
Tests for the /review/* endpoints (staff conversation review).

Run from the ai-advisor/ directory:  pytest

Google Sheets and token verification are faked, so no credentials or
network access are needed. What these tests cannot cover: real Google
ID token verification, real Sheets reads/writes, and the sign-in UI.
Those are checked manually after deployment (see README).
"""

import os

import pytest

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key-not-used")

import app as advisor  # noqa: E402


# ---------------------------------------------------------------------------
# Fakes
# ---------------------------------------------------------------------------


class FakeWorksheet:
    def __init__(self, rows):
        self.rows = rows
        self.appended = []

    def get_all_values(self):
        return self.rows

    def append_row(self, row, value_input_option=None):
        self.appended.append(row)
        self.rows.append(row)


class FakeSpreadsheet:
    def __init__(self, log_rows, feedback_rows):
        self.sheet1 = FakeWorksheet(log_rows)
        self.feedback = FakeWorksheet(feedback_rows)

    def worksheet(self, title):
        return self.feedback


LOG_ROWS = [
    # Hand-added header row (msg_number not numeric, must be skipped)
    ["timestamp", "conversation_id", "msg_number", "role", "content"],
    # conv1: rows out of order, user info only on the user row
    ["2026-06-01 10:00:00 UTC", "conv1", "2", "assistant", "Hi **there**", "claude-sonnet", "100", "50", "", "", ""],
    ["2026-06-01 10:00:00 UTC", "conv1", "1", "user", "Hello", "", "", "", "Ms. Smith", "smith@x.org", "Cambridge ES"],
    # Malformed row (too short, must be skipped)
    ["bad row"],
    # conv2: anonymous user
    ["2026-06-02 09:00:00 UTC", "conv2", "1", "user", "Camp question", "", "", "", "", "", ""],
    ["2026-06-02 09:00:00 UTC", "conv2", "2", "assistant", "Answer", "claude-sonnet", "90", "40", "", "", ""],
    # Row with no conversation_id (must be skipped)
    ["2026-06-02 09:00:00 UTC", "", "3", "user", "orphan", "", "", "", "", "", ""],
]

FEEDBACK_ROWS = [
    list(advisor.FEEDBACK_HEADER),
    ["2026-06-03 12:00:00 UTC", "conv1", "kieran@navigationgames.org", "commented", "Good answer"],
]

STAFF_CLAIMS = {
    "email": "barb@navigationgames.org",
    "email_verified": True,
    "hd": "navigationgames.org",
}


@pytest.fixture
def client():
    return advisor.app.test_client()


@pytest.fixture
def spreadsheet(monkeypatch):
    ss = FakeSpreadsheet([list(r) for r in LOG_ROWS], [list(r) for r in FEEDBACK_ROWS])
    monkeypatch.setattr(advisor, "_open_spreadsheet", lambda: ss)
    return ss


@pytest.fixture
def signed_in(monkeypatch, spreadsheet):
    """Configure the OAuth client ID and accept any token as a staff account."""
    monkeypatch.setattr(advisor, "REVIEW_OAUTH_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(
        advisor.google_id_token,
        "verify_oauth2_token",
        lambda token, request, audience, clock_skew_in_seconds=0: dict(STAFF_CLAIMS),
    )
    return {"Authorization": "Bearer fake-token"}


# ---------------------------------------------------------------------------
# Auth gating
# ---------------------------------------------------------------------------


def test_unconfigured_server_returns_503(client, monkeypatch):
    monkeypatch.setattr(advisor, "REVIEW_OAUTH_CLIENT_ID", "")
    assert client.get("/review/conversations").status_code == 503


def test_missing_token_returns_401(client, monkeypatch):
    monkeypatch.setattr(advisor, "REVIEW_OAUTH_CLIENT_ID", "test-client-id")
    assert client.get("/review/conversations").status_code == 401


def test_invalid_token_returns_401(client, monkeypatch):
    monkeypatch.setattr(advisor, "REVIEW_OAUTH_CLIENT_ID", "test-client-id")
    # The real verifier raises ValueError on a garbage token
    r = client.get(
        "/review/conversations", headers={"Authorization": "Bearer garbage"}
    )
    assert r.status_code == 401


@pytest.mark.parametrize(
    "claims",
    [
        # Consumer account: no hd claim at all
        {"email": "someone@gmail.com", "email_verified": True},
        # Wrong Workspace domain
        {"email": "x@other.org", "email_verified": True, "hd": "other.org"},
        # Right domain but unverified email
        {"email": "x@navigationgames.org", "email_verified": False, "hd": "navigationgames.org"},
    ],
)
def test_non_staff_accounts_rejected(client, monkeypatch, claims):
    monkeypatch.setattr(advisor, "REVIEW_OAUTH_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(
        advisor.google_id_token,
        "verify_oauth2_token",
        lambda token, request, audience, clock_skew_in_seconds=0: claims,
    )
    r = client.get("/review/conversations", headers={"Authorization": "Bearer t"})
    assert r.status_code == 403


def test_write_endpoints_also_gated(client, monkeypatch):
    monkeypatch.setattr(advisor, "REVIEW_OAUTH_CLIENT_ID", "test-client-id")
    assert client.post("/review/conversations/x/feedback", json={"feedback": "y"}).status_code == 401
    assert client.post("/review/conversations/x/dismiss").status_code == 401


# ---------------------------------------------------------------------------
# Sheet row grouping
# ---------------------------------------------------------------------------


def test_load_conversations_grouping(spreadsheet):
    convs = advisor.load_conversations(spreadsheet)
    assert set(convs) == {"conv1", "conv2"}
    # Messages sorted by msg_number even though rows were out of order
    assert [m["msg_number"] for m in convs["conv1"]["messages"]] == [1, 2]
    assert convs["conv1"]["user_name"] == "Ms. Smith"
    assert convs["conv1"]["user_org"] == "Cambridge ES"
    assert convs["conv1"]["model"] == "claude-sonnet"
    assert convs["conv2"]["user_name"] == ""


def test_my_status():
    entries = [
        {"reviewer_email": "a@navigationgames.org", "status": "dismissed", "feedback": ""},
        {"reviewer_email": "a@navigationgames.org", "status": "commented", "feedback": "hi"},
    ]
    # commented wins over dismissed for the same reviewer
    assert advisor._my_status(entries, "a@navigationgames.org") == "commented"
    assert advisor._my_status(entries, "b@navigationgames.org") is None


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


def test_list_hides_reviewed_by_default(client, signed_in, monkeypatch):
    # kieran has commented on conv1, so kieran's default list is just conv2
    claims = dict(STAFF_CLAIMS, email="kieran@navigationgames.org")
    monkeypatch.setattr(
        advisor.google_id_token,
        "verify_oauth2_token",
        lambda token, request, audience, clock_skew_in_seconds=0: claims,
    )
    data = client.get("/review/conversations", headers=signed_in).get_json()
    ids = [c["conversation_id"] for c in data["conversations"]]
    assert ids == ["conv2"]


def test_list_show_all_includes_status(client, signed_in, monkeypatch):
    claims = dict(STAFF_CLAIMS, email="kieran@navigationgames.org")
    monkeypatch.setattr(
        advisor.google_id_token,
        "verify_oauth2_token",
        lambda token, request, audience, clock_skew_in_seconds=0: claims,
    )
    data = client.get("/review/conversations?all=true", headers=signed_in).get_json()
    by_id = {c["conversation_id"]: c for c in data["conversations"]}
    assert set(by_id) == {"conv1", "conv2"}
    assert by_id["conv1"]["my_status"] == "commented"
    assert by_id["conv1"]["comment_count"] == 1
    assert by_id["conv2"]["my_status"] is None
    # Newest first
    assert data["conversations"][0]["conversation_id"] == "conv2"


def test_list_for_other_reviewer_shows_everything(client, signed_in):
    # barb hasn't reviewed anything yet
    data = client.get("/review/conversations", headers=signed_in).get_json()
    ids = {c["conversation_id"] for c in data["conversations"]}
    assert ids == {"conv1", "conv2"}


def test_thread_view(client, signed_in):
    data = client.get("/review/conversations/conv1", headers=signed_in).get_json()
    assert [m["role"] for m in data["messages"]] == ["user", "assistant"]
    assert data["feedback"][0]["reviewer_email"] == "kieran@navigationgames.org"
    assert data["my_status"] is None


def test_thread_unknown_id_404(client, signed_in):
    assert client.get("/review/conversations/nope", headers=signed_in).status_code == 404


def test_submit_feedback_appends_row(client, signed_in, spreadsheet):
    r = client.post(
        "/review/conversations/conv2/feedback",
        headers=signed_in,
        json={"feedback": "Too long-winded"},
    )
    assert r.status_code == 201
    row = spreadsheet.feedback.appended[-1]
    assert row[1:] == ["conv2", "barb@navigationgames.org", "commented", "Too long-winded"]


def test_submit_feedback_validation(client, signed_in, spreadsheet):
    assert (
        client.post("/review/conversations/conv2/feedback", headers=signed_in, json={}).status_code
        == 400
    )
    assert (
        client.post(
            "/review/conversations/conv2/feedback",
            headers=signed_in,
            json={"feedback": "   "},
        ).status_code
        == 400
    )
    too_long = "x" * (advisor.FEEDBACK_MAX_CHARS + 1)
    assert (
        client.post(
            "/review/conversations/conv2/feedback",
            headers=signed_in,
            json={"feedback": too_long},
        ).status_code
        == 400
    )
    assert (
        client.post(
            "/review/conversations/nope/feedback",
            headers=signed_in,
            json={"feedback": "y"},
        ).status_code
        == 404
    )
    assert spreadsheet.feedback.appended == []


def test_dismiss_appends_row_and_hides_conversation(client, signed_in, spreadsheet):
    r = client.post("/review/conversations/conv2/dismiss", headers=signed_in)
    assert r.status_code == 200
    row = spreadsheet.feedback.appended[-1]
    assert row[1:] == ["conv2", "barb@navigationgames.org", "dismissed", ""]

    data = client.get("/review/conversations", headers=signed_in).get_json()
    ids = [c["conversation_id"] for c in data["conversations"]]
    assert "conv2" not in ids

"""
Tests for email sign-in links (/auth/email-link, /auth/email-link/verify),
email-link sessions on other endpoints, and /tutor/progress.

Run from the ai-advisor/ directory:  pytest

No email is sent: send_sign_in_email is replaced by a fake that records
the link. Google Sheets is faked too.
"""

import os
import time
from urllib.parse import parse_qs, urlparse

import pytest

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key-not-used")

import app as advisor  # noqa: E402

SITE = "https://curriculum.navigationgames.org"
TEACHER = "Teacher@School.org"


@pytest.fixture
def outbox(monkeypatch):
    """Sign-in emails 'sent' during a test, as (to, link) pairs."""
    sent = []
    monkeypatch.setattr(advisor, "SIGN_IN_SECRET", "test-secret")
    monkeypatch.setattr(advisor, "EMAIL_LINK_LOG_ONLY", True)
    monkeypatch.setattr(advisor, "email_link_rate_store", {})
    monkeypatch.setattr(advisor, "send_sign_in_email", lambda to, link: sent.append((to, link)))
    return sent


@pytest.fixture
def client(outbox):
    return advisor.app.test_client()


def request_link(client, email=TEACHER, return_to=SITE + "/training/unit-0/", ip="1.1.1.1"):
    return client.post(
        "/auth/email-link",
        json={"email": email, "return_to": return_to},
        headers={"X-Forwarded-For": ip},
    )


def token_from(link):
    return parse_qs(urlparse(link).query)["token"][0]


# ---------------------------------------------------------------------------
# Requesting and using a link
# ---------------------------------------------------------------------------


def test_link_round_trip(client, outbox):
    assert request_link(client).get_json() == {"ok": True}
    to, link = outbox[0]
    assert to == "teacher@school.org"  # addresses are lowercased
    assert link.startswith(SITE + "/sign-in/?token=")
    assert parse_qs(urlparse(link).query)["next"] == ["/training/unit-0/"]

    r = client.post("/auth/email-link/verify", json={"token": token_from(link)})
    assert r.status_code == 200
    data = r.get_json()
    assert data["email"] == "teacher@school.org"
    assert data["session_token"].startswith("ngs.")
    assert data["exp"] > time.time() + 29 * 24 * 3600


def test_links_from_local_development_point_back_to_localhost(client, outbox):
    request_link(client, return_to="http://localhost:3000/training/unit-1/")
    assert outbox[0][1].startswith("http://localhost:3000/sign-in/")


def test_return_to_must_be_our_site(client, outbox):
    for bad in ["https://evil.example/", "javascript:alert(1)", "//evil.example/x", "", "/training/"]:
        r = request_link(client, return_to=bad)
        assert r.status_code == 400, bad
    assert outbox == []


def test_invalid_email_is_rejected(client, outbox):
    for bad in ["", "not-an-email", "a@b", "x" * 300 + "@example.org"]:
        assert request_link(client, email=bad).status_code == 400, bad
    assert outbox == []


def test_expired_link_is_rejected(client, outbox, monkeypatch):
    request_link(client)
    monkeypatch.setattr(advisor, "LINK_TOKEN_MAX_AGE", -1)
    r = client.post("/auth/email-link/verify", json={"token": token_from(outbox[0][1])})
    assert r.status_code == 401


def test_tampered_link_is_rejected(client, outbox):
    request_link(client)
    token = token_from(outbox[0][1])
    r = client.post("/auth/email-link/verify", json={"token": token[:-2] + "xx"})
    assert r.status_code == 401


def test_session_token_cannot_be_used_as_a_link(client):
    session = advisor.make_session_token("teacher@school.org")
    r = client.post("/auth/email-link/verify", json={"token": session[len("ngs."):]})
    assert r.status_code == 401


def test_link_token_cannot_be_used_as_a_session():
    link_token = advisor.make_link_token("teacher@school.org")
    assert advisor.read_session_token("ngs." + link_token) is None


def test_expired_session_is_rejected(monkeypatch, outbox):
    token = advisor.make_session_token("teacher@school.org")
    monkeypatch.setattr(advisor, "SESSION_TOKEN_MAX_AGE", -1)
    assert advisor.read_session_token(token) is None


def test_rate_limited_per_address(client, outbox):
    for i in range(advisor.EMAIL_LINKS_PER_ADDRESS):
        assert request_link(client, ip=f"2.2.2.{i}").status_code == 200
    assert request_link(client, ip="2.2.2.99").status_code == 429


def test_rate_limited_per_ip(client, outbox):
    for i in range(advisor.EMAIL_LINKS_PER_IP):
        assert request_link(client, email=f"t{i}@school.org").status_code == 200
    assert request_link(client, email="another@school.org").status_code == 429


def test_turned_off_without_a_secret(client, outbox, monkeypatch):
    monkeypatch.setattr(advisor, "SIGN_IN_SECRET", "")
    assert request_link(client).status_code == 503
    assert outbox == []


def test_turned_off_without_a_sender(client, outbox, monkeypatch):
    monkeypatch.setattr(advisor, "EMAIL_LINK_LOG_ONLY", False)
    monkeypatch.setattr(advisor, "EMAIL_LINK_SENDER", "")
    assert request_link(client).status_code == 503


# ---------------------------------------------------------------------------
# Email-link sessions elsewhere
# ---------------------------------------------------------------------------


def test_email_users_are_viewers_never_staff(client, outbox):
    token = advisor.make_session_token("barb@navigationgames.org")
    with advisor.app.test_request_context(headers={"Authorization": "Bearer " + token}):
        user = advisor.get_optional_user()
    assert user == {"email": "barb@navigationgames.org", "name": "", "is_staff": False}


def test_email_sessions_cannot_use_the_review_tool(client, monkeypatch):
    monkeypatch.setattr(advisor, "REVIEW_OAUTH_CLIENT_ID", "test-client-id")
    token = advisor.make_session_token("barb@navigationgames.org")
    r = client.get("/review/conversations", headers={"Authorization": "Bearer " + token})
    assert r.status_code == 401


# ---------------------------------------------------------------------------
# /tutor/progress
# ---------------------------------------------------------------------------


def log_row(when, conv_id, n, role, content, email="teacher@school.org"):
    return [when, conv_id, str(n), role, content, "", "", "", "", email, "course"]


ROWS = [
    log_row("2026-10-20 10:00:00 UTC", "tutor-unit-0-old", 1, "user", "Hi"),
    log_row("2026-10-20 10:00:00 UTC", "tutor-unit-0-old", 2, "assistant", "```profile\nState: MA\n```"),
    log_row("2026-10-21 09:00:00 UTC", "tutor-unit-0-new", 1, "user", "Starting over"),
    log_row("2026-10-21 09:00:00 UTC", "tutor-unit-0-new", 2, "assistant", "Welcome back"),
    log_row("2026-10-21 09:05:00 UTC", "tutor-unit-0-new", 3, "user", "Colorado now"),
    log_row("2026-10-21 09:05:00 UTC", "tutor-unit-0-new", 4, "assistant", "Updated:\n```profile\nState: CO\n```"),
    # A retried message: same numbers, logged again; the later row wins
    log_row("2026-10-21 09:06:00 UTC", "tutor-unit-0-new", 4, "assistant", "Updated:\n```profile\nState: CO, Denver\n```"),
    log_row("2026-10-22 08:00:00 UTC", "tutor-unit-1-a", 1, "user", "Pitch time"),
    log_row("2026-10-22 08:00:00 UTC", "tutor-unit-1-a", 2, "assistant", "Go ahead"),
    # Someone else's conversation and an advisor conversation are ignored
    log_row("2026-10-23 08:00:00 UTC", "tutor-unit-1-b", 1, "user", "Not mine", email="other@school.org"),
    log_row("2026-10-23 08:00:00 UTC", "plain-advisor-chat", 1, "user", "Plan my lessons"),
]


def test_progress_rebuild_picks_latest_conversation_and_profile():
    progress = advisor.rebuild_progress(ROWS, "Teacher@School.org")
    assert set(progress["units"]) == {"unit-0", "unit-1"}
    unit0 = progress["units"]["unit-0"]
    assert unit0["conversation_id"] == "tutor-unit-0-new"
    assert [m["content"] for m in unit0["messages"]][0] == "Starting over"
    assert len(unit0["messages"]) == 4
    assert progress["units"]["unit-1"]["conversation_id"] == "tutor-unit-1-a"
    assert progress["profile"] == "State: CO, Denver"


def test_progress_requires_sign_in(client):
    assert client.get("/tutor/progress").status_code == 401


def test_progress_without_a_sheet_is_empty(client, monkeypatch):
    monkeypatch.setattr(advisor, "get_sheets_client", lambda: None)
    token = advisor.make_session_token("teacher@school.org")
    r = client.get("/tutor/progress", headers={"Authorization": "Bearer " + token})
    assert r.get_json() == {"units": {}, "profile": "", "plan": ""}


def test_progress_reads_the_log_sheet(client, monkeypatch):
    class FakeSheet:
        def get_all_values(self):
            return ROWS

    class FakeSpreadsheet:
        sheet1 = FakeSheet()

    class FakeClient:
        def open_by_key(self, key):
            return FakeSpreadsheet()

    monkeypatch.setattr(advisor, "get_sheets_client", lambda: FakeClient())
    token = advisor.make_session_token("teacher@school.org")
    r = client.get("/tutor/progress", headers={"Authorization": "Bearer " + token})
    assert r.get_json()["profile"] == "State: CO, Denver"


# ---------------------------------------------------------------------------
# /auth/google-session: a 30-day session for Google sign-ins
# ---------------------------------------------------------------------------


def google_signed_in(monkeypatch, claims):
    monkeypatch.setattr(advisor, "REVIEW_OAUTH_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(
        advisor.google_id_token,
        "verify_oauth2_token",
        lambda token, request, audience, clock_skew_in_seconds=0: dict(claims),
    )
    return {"Authorization": "Bearer google-token"}


def test_google_token_becomes_a_session(client, monkeypatch):
    headers = google_signed_in(monkeypatch, {"email": "teacher@gmail.com", "email_verified": True, "name": "T"})
    r = client.post("/auth/google-session", headers=headers)
    assert r.status_code == 200
    session = r.get_json()["session_token"]
    assert session.startswith(advisor.SESSION_TOKEN_PREFIX)
    assert advisor.read_session_token(session) == "teacher@gmail.com"


def test_google_session_is_never_staff(client, monkeypatch):
    headers = google_signed_in(
        monkeypatch,
        {"email": "barb@navigationgames.org", "email_verified": True, "hd": "navigationgames.org"},
    )
    session = client.post("/auth/google-session", headers=headers).get_json()["session_token"]
    with advisor.app.test_request_context(headers={"Authorization": "Bearer " + session}):
        assert advisor.get_optional_user()["is_staff"] is False


def test_google_session_needs_a_google_token(client, monkeypatch):
    assert client.post("/auth/google-session").status_code == 401
    session = advisor.make_session_token("teacher@gmail.com")
    r = client.post("/auth/google-session", headers={"Authorization": "Bearer " + session})
    assert r.status_code == 400


def test_google_session_off_without_secret(client, monkeypatch):
    monkeypatch.setattr(advisor, "SIGN_IN_SECRET", "")
    headers = google_signed_in(monkeypatch, {"email": "teacher@gmail.com", "email_verified": True})
    assert client.post("/auth/google-session", headers=headers).status_code == 503

"""
Tests for sending course work to Navigation Games (/tutor/submit) and for
the Unit 4 plan reaching later units.

Run from the ai-advisor/ directory:  pytest

Email and Google Sheets are faked, so no credentials or network access are
needed.
"""

import os

import pytest

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key-not-used")

import app as advisor  # noqa: E402
from test_tutor import FakeApiResponse, TEACHER, signed_in  # noqa: E402


@pytest.fixture
def mail(monkeypatch):
    """Records the emails sent and the submissions logged."""
    record = {"sent": [], "logged": []}
    monkeypatch.setattr(advisor, "SIGN_IN_SECRET", "test-secret")
    monkeypatch.setattr(advisor, "EMAIL_LINK_SENDER", "course@navigationgames.org")
    monkeypatch.setattr(advisor, "COURSE_REVIEWER_EMAIL", "reviewer@navigationgames.org")
    monkeypatch.setattr(advisor, "GMAIL_SERVICE_ACCOUNT_JSON", "{}")
    monkeypatch.setattr(advisor, "submission_rate_store", {})
    monkeypatch.setattr(advisor, "tutor_rate_store", {})
    monkeypatch.setattr(
        advisor, "send_email", lambda to, subject, body, reply_to="": record["sent"].append((to, subject, body, reply_to))
    )
    monkeypatch.setattr(advisor, "_log_submission", lambda row: record["logged"].append(row))
    return record


@pytest.fixture
def client(mail):
    return advisor.app.test_client()


PLAN = "Session 1 (Nov 3, 45 min): Goal: walk the boundary. [Know Your Space](/lessons/school/grade-3-5/lesson-1/)"


def submit(client, headers=None, **body):
    body = {"unit": "unit-4", "kind": "deliverable", "text": PLAN, "conversation_id": "tutor-unit-4-abc", **body}
    return client.post("/tutor/submit", json=body, headers=signed_in() if headers is None else headers)


def test_submission_emails_the_reviewer_and_the_teacher(client, mail):
    response = submit(client)
    assert response.status_code == 200
    assert response.get_json() == {"ok": True, "emailed": True, "turnaround": "within 3 business days"}
    (to_reviewer, subject, body, reply_to), (to_teacher, _, teacher_body, teacher_reply_to) = mail["sent"]
    assert to_reviewer == "reviewer@navigationgames.org"
    assert reply_to == TEACHER  # the reviewer just hits reply
    assert "tutor-unit-4-abc" in body
    assert to_teacher == TEACHER
    assert teacher_reply_to == "reviewer@navigationgames.org"
    assert "Know Your Space (https://curriculum.navigationgames.org/lessons/school/grade-3-5/lesson-1/)" in teacher_body


def test_submission_is_logged(client, mail):
    submit(client)
    (row,) = mail["logged"]
    assert row[1:6] == [TEACHER, "", "unit-4", "deliverable", "tutor-unit-4-abc"]


def test_other_units_get_a_week(client):
    assert submit(client, unit="unit-1").get_json()["turnaround"] == "within a week"


def test_still_logged_without_email(client, mail, monkeypatch):
    monkeypatch.setattr(advisor, "EMAIL_LINK_SENDER", "")
    assert submit(client).get_json()["emailed"] is False
    assert mail["sent"] == [] and len(mail["logged"]) == 1


def test_teachers_must_sign_in(client):
    assert submit(client, headers={}).status_code == 401


def test_bad_requests(client):
    assert submit(client, unit="unit-99").status_code == 400
    assert submit(client, kind="essay").status_code == 400
    assert submit(client, text="  ").status_code == 400


def test_daily_limit(client, monkeypatch):
    monkeypatch.setattr(advisor, "SUBMISSIONS_PER_DAY", 1)
    assert submit(client).status_code == 200
    assert submit(client).status_code == 429


def test_plan_reaches_later_units_but_not_unit_4(client, monkeypatch):
    prompts = []

    def fake_create_message(messages, system_prompt=None, max_tokens=None):
        prompts.append(system_prompt)
        return FakeApiResponse()

    monkeypatch.setattr(advisor, "_create_message", fake_create_message)
    monkeypatch.setattr(advisor, "get_sheets_client", lambda: None)
    for unit in ("unit-1", "unit-4"):
        client.post(
            "/tutor",
            json={"unit": unit, "messages": [{"role": "user", "content": "Hi"}], "plan": PLAN},
            headers=signed_in(),
        )
    assert "walk the boundary" in prompts[0]
    assert "walk the boundary" not in prompts[1]


def test_progress_brings_back_the_latest_plan():
    rows = [
        ["2026-10-24 10:00:00 UTC", "tutor-unit-4-abc", "2", "assistant", "```deliverable\nOld plan\n```", "", "", "", "", TEACHER],
        ["2026-10-25 10:00:00 UTC", "tutor-unit-4-abc", "4", "assistant", "```deliverable\nNew plan\n```", "", "", "", "", TEACHER],
        ["2026-10-26 10:00:00 UTC", "tutor-unit-1-xyz", "2", "assistant", "```deliverable\nA pitch\n```", "", "", "", "", TEACHER],
    ]
    assert advisor.rebuild_progress(rows, TEACHER)["plan"] == "New plan"

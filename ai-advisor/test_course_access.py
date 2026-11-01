"""
Tests for who may use the teacher course (the CourseAccess and CourseSettings
tabs, GET /training/access, and the checks on the tutor endpoints).

Run from the ai-advisor/ directory:  pytest

The Anthropic API and Google Sheets are faked, so no credentials or network
access are needed.
"""

import os
import time

import pytest

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key-not-used")

import app as advisor  # noqa: E402


class FakeUsage:
    input_tokens = 10
    output_tokens = 5


class FakeContent:
    text = "Tell me about your students."


class FakeApiResponse:
    content = [FakeContent()]
    model = "claude-fake"
    usage = FakeUsage()


class FakeSheet:
    def __init__(self, rows):
        self.rows = rows

    def get_all_values(self):
        return self.rows


ENROLLED = "enrolled@school.org"
STRANGER = "stranger@school.org"


@pytest.fixture
def sheets(monkeypatch):
    """The fake access list: ENROLLED is on it, and Units 1 and 2 are open."""
    state = {
        "access": [["email", "name", "applicant_id", "added", "note"], ["  Enrolled@School.org ", "Ellen", "KO-2026-001", "", ""], ["", "", "", "", ""]],
        "settings": [["setting", "value"], ["units_open", "2"]],
        "fail": False,
        "reads": 0,
    }

    def fake_worksheet(spreadsheet, title, header):
        state["reads"] += 1
        if state["fail"]:
            raise RuntimeError("sheet unavailable")
        return FakeSheet(state["access"] if title == advisor.COURSE_ACCESS_SHEET_TITLE else state["settings"])

    monkeypatch.setattr(advisor, "SPREADSHEET_ID", "fake-sheet-id")
    monkeypatch.setattr(advisor, "_open_spreadsheet", lambda: object())
    monkeypatch.setattr(advisor, "_get_or_create_worksheet", fake_worksheet)
    monkeypatch.setattr(advisor, "_course_access_cache", {"at": 0.0, "ok": False, "emails": set(), "units_open": 2})
    return state


@pytest.fixture
def client(monkeypatch, sheets):
    monkeypatch.setattr(advisor, "SIGN_IN_SECRET", "test-secret")
    monkeypatch.setattr(advisor, "rate_limit_store", {})
    monkeypatch.setattr(advisor, "tutor_rate_store", {})
    monkeypatch.setattr(advisor, "_create_message", lambda messages, system_prompt=None, max_tokens=None: FakeApiResponse())
    monkeypatch.setattr(advisor, "get_sheets_client", lambda: None)
    return advisor.app.test_client()


def headers(email):
    return {"Authorization": "Bearer " + advisor.make_session_token(email), "X-Forwarded-For": "5.6.7.8"}


def as_staff(monkeypatch):
    monkeypatch.setattr(
        advisor, "get_optional_user", lambda: {"email": "staff@navigationgames.org", "name": "Staff", "is_staff": True}
    )


def ask(client, email, unit="unit-1"):
    body = {"unit": unit, "messages": [{"role": "user", "content": "Hi, I teach PE."}]}
    return client.post("/tutor", json=body, headers=headers(email))


# --- the tutor -------------------------------------------------------------

def test_enrolled_teacher_can_use_an_open_unit(client):
    assert ask(client, ENROLLED, "unit-1").status_code == 200
    assert ask(client, ENROLLED, "unit-2").status_code == 200


def test_email_case_and_spaces_do_not_matter(client):
    # The sheet has "  Enrolled@School.org ", the teacher signs in as enrolled@school.org
    assert ask(client, "ENROLLED@school.org").status_code == 200


def test_someone_not_on_the_list_is_refused(client):
    r = ask(client, STRANGER)
    assert r.status_code == 403
    assert r.get_json()["code"] == "not_enrolled"


def test_unit_past_units_open_is_refused(client):
    r = ask(client, ENROLLED, "unit-3")
    assert r.status_code == 403
    assert r.get_json()["code"] == "unit_not_open"


def test_opening_a_unit_in_the_sheet_takes_effect_after_the_cache_expires(client, sheets, monkeypatch):
    assert ask(client, ENROLLED, "unit-3").status_code == 403
    sheets["settings"][1][1] = "3"
    # Still the cached copy
    assert ask(client, ENROLLED, "unit-3").status_code == 403
    advisor._course_access_cache["at"] = time.time() - advisor.COURSE_ACCESS_CACHE_SECONDS - 1
    assert ask(client, ENROLLED, "unit-3").status_code == 200


def test_staff_can_use_any_unit_without_being_on_the_list(client, monkeypatch):
    as_staff(monkeypatch)
    assert ask(client, "ignored@x.org", "unit-1").status_code == 200
    assert ask(client, "ignored@x.org", "unit-8").status_code == 200


def test_email_link_session_is_never_staff(client):
    # Even a navigationgames.org address, signed in by email link, must be on the list
    r = ask(client, "someone@navigationgames.org")
    assert r.status_code == 403


def test_missing_or_bad_units_open_setting_falls_back_to_the_default(client, sheets):
    sheets["settings"] = [["setting", "value"], ["units_open", "soon"]]
    assert ask(client, ENROLLED, "unit-2").status_code == 200
    assert ask(client, ENROLLED, "unit-3").status_code == 403


def test_sheet_failure_with_nothing_cached_closes_the_course(client, sheets):
    sheets["fail"] = True
    assert ask(client, ENROLLED).status_code == 503


def test_sheet_failure_after_a_good_read_uses_the_last_copy(client, sheets):
    assert ask(client, ENROLLED).status_code == 200
    sheets["fail"] = True
    advisor._course_access_cache["at"] = time.time() - advisor.COURSE_ACCESS_CACHE_SECONDS - 1
    assert ask(client, ENROLLED).status_code == 200


def test_the_sheet_is_not_read_on_every_request(client, sheets):
    ask(client, ENROLLED)
    reads = sheets["reads"]
    ask(client, ENROLLED)
    ask(client, ENROLLED, "unit-2")
    assert sheets["reads"] == reads


def test_access_is_not_enforced_without_a_log_sheet(client, monkeypatch):
    monkeypatch.setattr(advisor, "SPREADSHEET_ID", "")
    assert ask(client, STRANGER, "unit-6").status_code == 200


# --- the other tutor endpoints ---------------------------------------------

def test_progress_needs_enrollment(client):
    assert client.get("/tutor/progress", headers=headers(STRANGER)).status_code == 403
    assert client.get("/tutor/progress", headers=headers(ENROLLED)).status_code == 200


def test_submit_needs_enrollment_and_an_open_unit(client):
    body = {"unit": "unit-1", "kind": "profile", "text": "My profile"}
    assert client.post("/tutor/submit", json=body, headers=headers(STRANGER)).status_code == 403
    body["unit"] = "unit-4"
    r = client.post("/tutor/submit", json=body, headers=headers(ENROLLED))
    assert r.status_code == 403
    assert r.get_json()["code"] == "unit_not_open"


def test_voice_needs_enrollment(client, monkeypatch):
    monkeypatch.setattr(advisor, "voice_enabled", lambda: True)
    r = client.post("/tutor/speak", json={"unit": "unit-1"}, headers=headers(STRANGER))
    assert r.status_code == 403


# --- GET /training/access ---------------------------------------------------

def test_access_needs_sign_in(client):
    assert client.get("/training/access").status_code == 401


def test_access_for_an_enrolled_teacher(client):
    r = client.get("/training/access", headers=headers(ENROLLED))
    assert r.status_code == 200
    assert r.get_json() == {"enrolled": True, "is_staff": False, "units_open": 2}


def test_access_for_someone_not_enrolled_reveals_nothing_more(client):
    r = client.get("/training/access", headers=headers(STRANGER))
    assert r.status_code == 200
    assert r.get_json() == {"enrolled": False}


def test_access_for_staff_has_every_unit_open(client, monkeypatch):
    as_staff(monkeypatch)
    r = client.get("/training/access", headers=headers("x@y.org"))
    # Staff also learn how far the course is open to teachers, for the preview banner
    assert r.get_json() == {"enrolled": True, "is_staff": True, "units_open": None, "teachers_units_open": 2}


def test_access_check_fails_closed_when_the_sheet_is_unreadable(client, sheets):
    sheets["fail"] = True
    assert client.get("/training/access", headers=headers(ENROLLED)).status_code == 503


def test_progress_includes_the_teachers_name_and_applicant_id(client):
    # The surveys are pre-filled from the CourseAccess row
    r = client.get("/tutor/progress", headers=headers(ENROLLED))
    assert r.get_json()["person"] == {"name": "Ellen", "applicant_id": "KO-2026-001"}


def test_progress_person_is_empty_for_staff_not_on_the_list(client, monkeypatch):
    as_staff(monkeypatch)
    r = client.get("/tutor/progress", headers=headers("x@y.org"))
    assert r.get_json()["person"] == {}

"""
Tests for the POST /page-feedback endpoint ("Was this page helpful?").

Run from the ai-advisor/ directory:  pytest

Google Sheets is faked, so no credentials or network access are needed.
"""

import os

import gspread
import pytest

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key-not-used")

import app as advisor  # noqa: E402


class FakeWorksheet:
    def __init__(self, rows=None):
        self.rows = rows or []

    def get_all_values(self):
        return self.rows

    def append_row(self, row, value_input_option=None):
        self.rows.append(row)


class FakeSpreadsheet:
    """Unlike test_review.py's fake, this one models tab creation."""

    def __init__(self):
        self.worksheets: dict[str, FakeWorksheet] = {}

    def worksheet(self, title):
        if title not in self.worksheets:
            raise gspread.WorksheetNotFound(title)
        return self.worksheets[title]

    def add_worksheet(self, title, rows, cols):
        self.worksheets[title] = FakeWorksheet()
        return self.worksheets[title]


@pytest.fixture
def client():
    return advisor.app.test_client()


@pytest.fixture
def spreadsheet(monkeypatch):
    ss = FakeSpreadsheet()
    monkeypatch.setattr(advisor, "_open_spreadsheet", lambda: ss)
    # Fresh rate-limit buckets per test
    monkeypatch.setattr(advisor, "page_feedback_rate_store", {})
    monkeypatch.setattr(advisor, "rate_limit_store", {})
    return ss


def post(client, body, ip="1.2.3.4"):
    return client.post(
        "/page-feedback", json=body, headers={"X-Forwarded-For": ip}
    )


def test_full_submission_appends_row(client, spreadsheet):
    r = post(
        client,
        {
            "page": "/curriculum/activities/core/animal-o/",
            "title": "Animal-O",
            "rating": "up",
            "comment": "Great with my 3rd graders",
            "submitter": "Ms. Smith",
        },
    )
    assert r.status_code == 201
    rows = spreadsheet.worksheets[advisor.PAGE_FEEDBACK_SHEET_TITLE].rows
    # Row 0 is the header (tab was auto-created), row 1 the submission
    assert rows[0] == advisor.PAGE_FEEDBACK_HEADER
    assert rows[1][1:] == [
        "/curriculum/activities/core/animal-o/",
        "Animal-O",
        "up",
        "Great with my 3rd graders",
        "Ms. Smith",
    ]


def test_rating_only_is_valid(client, spreadsheet):
    r = post(client, {"page": "/p/", "rating": "down"})
    assert r.status_code == 201
    row = spreadsheet.worksheets[advisor.PAGE_FEEDBACK_SHEET_TITLE].rows[-1]
    assert row[3] == "down"
    assert row[4] == ""


def test_comment_only_is_valid(client, spreadsheet):
    r = post(client, {"page": "/p/", "comment": "Add more photos"})
    assert r.status_code == 201
    row = spreadsheet.worksheets[advisor.PAGE_FEEDBACK_SHEET_TITLE].rows[-1]
    assert row[3] == ""
    assert row[4] == "Add more photos"


def test_empty_submission_rejected(client, spreadsheet):
    assert post(client, {"page": "/p/"}).status_code == 400
    assert post(client, {"page": "/p/", "comment": "   "}).status_code == 400


def test_unknown_rating_rejected(client, spreadsheet):
    assert post(client, {"page": "/p/", "rating": "sideways"}).status_code == 400
    assert post(client, {"page": "/p/", "rating": 5}).status_code == 400


def test_missing_page_rejected(client, spreadsheet):
    assert post(client, {"rating": "up"}).status_code == 400
    assert post(client, {"page": "", "rating": "up"}).status_code == 400
    too_long = "/" + "x" * advisor.PAGE_FEEDBACK_PAGE_MAX_CHARS
    assert post(client, {"page": too_long, "rating": "up"}).status_code == 400


def test_overlong_fields_rejected(client, spreadsheet):
    long_comment = "x" * (advisor.PAGE_FEEDBACK_COMMENT_MAX_CHARS + 1)
    assert post(client, {"page": "/p/", "comment": long_comment}).status_code == 400
    long_submitter = "x" * (advisor.PAGE_FEEDBACK_SUBMITTER_MAX_CHARS + 1)
    assert (
        post(client, {"page": "/p/", "rating": "up", "submitter": long_submitter}).status_code
        == 400
    )


def test_tab_auto_created_once(client, spreadsheet):
    assert advisor.PAGE_FEEDBACK_SHEET_TITLE not in spreadsheet.worksheets
    post(client, {"page": "/p/", "rating": "up"})
    post(client, {"page": "/p/", "rating": "down"})
    rows = spreadsheet.worksheets[advisor.PAGE_FEEDBACK_SHEET_TITLE].rows
    # One header plus two submissions; header not repeated
    assert rows[0] == advisor.PAGE_FEEDBACK_HEADER
    assert len(rows) == 3


def test_rate_limit_separate_from_chat(client, spreadsheet):
    for _ in range(advisor.PAGE_FEEDBACK_RATE_MAX):
        assert post(client, {"page": "/p/", "rating": "up"}).status_code == 201
    assert post(client, {"page": "/p/", "rating": "up"}).status_code == 429
    # A different IP is unaffected
    assert post(client, {"page": "/p/", "rating": "up"}, ip="5.6.7.8").status_code == 201
    # Page feedback never touched the chat bucket
    assert advisor.rate_limit_store == {}


def test_sheets_unavailable_returns_503(client, monkeypatch):
    monkeypatch.setattr(advisor, "_open_spreadsheet", lambda: None)
    monkeypatch.setattr(advisor, "page_feedback_rate_store", {})
    r = post(client, {"page": "/p/", "rating": "up"})
    assert r.status_code == 503

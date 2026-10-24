"""
Tests for the tutor's voice (/tutor/voice and /tutor/speak).

Run from the ai-advisor/ directory:  pytest

ElevenLabs, the Anthropic API and Google Sheets are faked, so no credentials
or network access are needed.
"""

import os

import pytest
import requests

os.environ.setdefault("ANTHROPIC_API_KEY", "test-key-not-used")

import app as advisor  # noqa: E402
from test_tutor import FakeApiResponse, TEACHER, signed_in  # noqa: E402


@pytest.fixture
def spoken(monkeypatch):
    """Records the text sent to the (fake) ElevenLabs."""
    said = []

    def fake_synthesize(text):
        said.append(text)
        return b"fake mp3"

    monkeypatch.setattr(advisor, "SIGN_IN_SECRET", "test-secret")
    monkeypatch.setattr(advisor, "ELEVENLABS_API_KEY", "test-key")
    monkeypatch.setattr(advisor, "ELEVENLABS_VOICE_ID", "test-voice")
    monkeypatch.setattr(advisor, "speech_usage_store", {})
    monkeypatch.setattr(advisor, "speech_month_usage", {"month": "", "chars": 0})
    monkeypatch.setattr(advisor, "tutor_rate_store", {})
    monkeypatch.setattr(advisor, "synthesize_speech", fake_synthesize)
    monkeypatch.setattr(advisor, "_create_message", lambda *args, **kwargs: FakeApiResponse())
    monkeypatch.setattr(advisor, "get_sheets_client", lambda: None)
    return said


@pytest.fixture
def client(spoken):
    return advisor.app.test_client()


def speak(client, headers=None, **body):
    return client.post("/tutor/speak", json=body, headers=signed_in() if headers is None else headers)


def test_voice_is_off_without_a_key(client, monkeypatch):
    monkeypatch.setattr(advisor, "ELEVENLABS_API_KEY", "")
    assert client.get("/tutor/voice").get_json()["enabled"] is False
    assert speak(client, unit="unit-0").status_code == 404


def test_voice_reports_its_label(client, monkeypatch):
    monkeypatch.setattr(advisor, "TUTOR_VOICE_LABEL", "AI voice based on Barb's")
    assert client.get("/tutor/voice").get_json() == {"enabled": True, "label": "AI voice based on Barb's"}


def test_replies_come_with_a_speech_token_that_reads_them_aloud(client, spoken):
    reply = client.post(
        "/tutor", json={"unit": "unit-0", "messages": [{"role": "user", "content": "Hi"}]}, headers=signed_in()
    ).get_json()
    response = speak(client, text=reply["response"], speech_token=reply["speech_token"])
    assert response.status_code == 200
    assert response.mimetype == "audio/mpeg"
    assert spoken == [reply["response"]]


def test_no_speech_token_without_the_voice(client, monkeypatch):
    monkeypatch.setattr(advisor, "ELEVENLABS_VOICE_ID", "")
    reply = client.post(
        "/tutor", json={"unit": "unit-0", "messages": [{"role": "user", "content": "Hi"}]}, headers=signed_in()
    ).get_json()
    assert "speech_token" not in reply


def test_it_will_not_read_text_the_tutor_did_not_write(client, spoken):
    token = advisor.speech_token("Tell me about your students.")
    assert speak(client, text="Something else entirely.", speech_token=token).status_code == 403
    assert speak(client, text="Something else entirely.").status_code == 403
    assert spoken == []


def test_it_reads_a_unit_opening(client, spoken):
    assert speak(client, unit="unit-0").status_code == 200
    assert spoken == [advisor.speech_text(advisor.TRAINING_UNITS["unit-0"]["opening"])]
    assert speak(client, unit="unit-99").status_code == 400


def test_teachers_must_sign_in(client):
    assert speak(client, headers={}, unit="unit-0").status_code == 401
    assert speak(client, headers={"Authorization": "Bearer ngs.bad"}, unit="unit-0").status_code == 401


def test_daily_allowance(client, monkeypatch):
    monkeypatch.setattr(advisor, "SPEECH_DAILY_CHARS", 20)
    text = "Hello there teacher."  # 20 characters
    token = advisor.speech_token(text)
    assert speak(client, text=text, speech_token=token).status_code == 200
    assert speak(client, text=text, speech_token=token).status_code == 429


def test_teachers_see_how_much_listening_is_left(client, monkeypatch):
    monkeypatch.setattr(advisor, "SPEECH_DAILY_CHARS", 100)
    assert client.get("/tutor/voice", headers=signed_in()).get_json()["chars_left"] == 100
    text = "Hello there teacher."
    speak(client, text=text, speech_token=advisor.speech_token(text))
    voice = client.get("/tutor/voice", headers=signed_in()).get_json()
    assert voice["chars_left"] == 80
    assert voice["daily_chars"] == 100
    assert "chars_left" not in client.get("/tutor/voice").get_json()


def test_monthly_limit_for_the_whole_course(client, monkeypatch):
    monkeypatch.setattr(advisor, "SPEECH_MONTHLY_CHARS", 30)
    text = "Hello there teacher."  # 20 characters
    token = advisor.speech_token(text)
    assert speak(client, text=text, speech_token=token).status_code == 200
    other_teacher = {"Authorization": "Bearer " + advisor.make_session_token("other@school.org")}
    response = speak(client, headers=other_teacher, text=text, speech_token=token)
    assert response.status_code == 429
    assert "this month" in response.get_json()["error"]


def test_elevenlabs_failure_is_reported_and_not_counted(client, monkeypatch):
    def broken(text):
        raise requests.ConnectionError("down")

    monkeypatch.setattr(advisor, "synthesize_speech", broken)
    assert speak(client, unit="unit-0").status_code == 502
    assert advisor.speech_chars_left(TEACHER) == advisor.SPEECH_DAILY_CHARS
    assert advisor.speech_month_usage["chars"] == 0


def test_progress_replies_get_speech_tokens(client, monkeypatch):
    rows = [
        ["2026-10-24T10:00:00", "tutor-unit-0-abc", "1", "user", "Hi", "", "", "", "", TEACHER],
        ["2026-10-24T10:00:01", "tutor-unit-0-abc", "2", "assistant", "Welcome!", "", "", "", "", TEACHER],
    ]

    class FakeSheet:
        sheet1 = type("Sheet", (), {"get_all_values": lambda self: rows})()

    class FakeClient:
        def open_by_key(self, key):
            return FakeSheet()

    monkeypatch.setattr(advisor, "get_sheets_client", lambda: FakeClient())
    messages = client.get("/tutor/progress", headers=signed_in()).get_json()["units"]["unit-0"]["messages"]
    assert "speech_token" not in messages[0]
    assert messages[1]["speech_token"] == advisor.speech_token("Welcome!")


def test_speech_text_skips_saved_boxes_links_and_markdown():
    reply = (
        "**Great.** See [the grade 3-5 lessons](/lessons/school/grade-3-5/) or https://example.org.\n\n"
        "```profile\nName and role: Pat, PE teacher\n```\n\n"
        "- First point\n- Second point"
    )
    said = advisor.speech_text(reply)
    assert "Great." in said
    assert "the grade 3-5 lessons" in said
    assert "/lessons/" not in said and "example.org" not in said
    assert "Pat" not in said
    assert "I've written your profile in the box below." in said
    assert "**" not in said and "- First" not in said

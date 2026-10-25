"""
Tests for the course tutor endpoint (/tutor).

Run from the ai-advisor/ directory:  pytest

The Anthropic API and Google Sheets are faked, so no credentials or network
access are needed. These tests use the real training-units.json, so run
`node scripts/build-content.js` first if you have changed content/training/.
"""

import json
import os
from pathlib import Path

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


@pytest.fixture
def sent():
    """Records what the tutor sent to the (fake) Claude API."""
    return {}


@pytest.fixture
def client(monkeypatch, sent):
    def fake_create_message(messages, system_prompt=None, max_tokens=None):
        sent["messages"] = messages
        sent["system_prompt"] = system_prompt
        sent["max_tokens"] = max_tokens
        return FakeApiResponse()

    monkeypatch.setattr(advisor, "SIGN_IN_SECRET", "test-secret")
    monkeypatch.setattr(advisor, "rate_limit_store", {})
    monkeypatch.setattr(advisor, "tutor_rate_store", {})
    monkeypatch.setattr(advisor, "_create_message", fake_create_message)
    monkeypatch.setattr(advisor, "get_sheets_client", lambda: None)
    return advisor.app.test_client()


TEACHER = "teacher@school.org"


def signed_in():
    """Headers for a teacher signed in with an email link."""
    return {"Authorization": "Bearer " + advisor.make_session_token(TEACHER), "X-Forwarded-For": "5.6.7.8"}


def ask(client, unit="unit-0", headers=None, **extra):
    body = {"unit": unit, "messages": [{"role": "user", "content": "Hi, I teach PE."}], **extra}
    return client.post("/tutor", json=body, headers=signed_in() if headers is None else headers)


def test_every_unit_in_the_content_files_is_available():
    content_dir = Path(__file__).parent.parent / "content" / "training"
    slugs = {p.stem for p in content_dir.glob("unit-*.md")}
    assert slugs and slugs == set(advisor.TRAINING_UNITS)


def test_tutor_replies(client):
    r = ask(client)
    assert r.status_code == 200
    assert r.get_json()["response"] == "Tell me about your students."


def test_system_prompt_has_general_and_unit_instructions(client, sent):
    ask(client, unit="unit-1")
    unit = advisor.TRAINING_UNITS["unit-1"]
    assert "Course tutor for the Kickstart Orienteering Teacher Course" in sent["system_prompt"]
    assert unit["instructions"] in sent["system_prompt"]
    assert unit["opening"] in sent["system_prompt"]


def test_system_prompt_leaves_out_reviewer_notes(client, sent):
    ask(client, unit="unit-0")
    raw = (Path(__file__).parent.parent / "content" / "training" / "unit-0.md").read_text()
    reviewer_notes = raw.split("## Reviewer notes", 1)[1].strip()
    assert reviewer_notes not in sent["system_prompt"]


def test_profile_is_passed_to_the_tutor(client, sent):
    ask(client, unit="unit-4", profile="Students (grades, number): grade 4, 60")
    assert "grade 4, 60" in sent["system_prompt"]


def test_profile_is_truncated(client, sent):
    ask(client, unit="unit-4", profile="x" * 10000)
    assert "x" * advisor.TUTOR_PROFILE_MAX_CHARS in sent["system_prompt"]
    assert "x" * (advisor.TUTOR_PROFILE_MAX_CHARS + 1) not in sent["system_prompt"]


def test_conversation_id_names_the_unit(client):
    r = ask(client, unit="unit-2", conversation_id="abc")
    assert r.get_json()["conversation_id"] == "tutor-unit-2-abc"
    r = ask(client, unit="unit-2", conversation_id="tutor-unit-2-abc")
    assert r.get_json()["conversation_id"] == "tutor-unit-2-abc"


def test_unknown_unit_is_rejected(client):
    r = ask(client, unit="unit-99")
    assert r.status_code == 400


def test_malformed_messages_are_rejected(client):
    r = client.post("/tutor", json={"unit": "unit-0", "messages": []}, headers=signed_in())
    assert r.status_code == 400
    r = client.post(
        "/tutor",
        json={"unit": "unit-0", "messages": [{"role": "assistant", "content": "Hi"}]},
        headers=signed_in(),
    )
    assert r.status_code == 400


def test_signed_in_teachers_are_not_limited(client):
    import time

    # Using up the advisor's daily limit doesn't affect the course tutor
    advisor.rate_limit_store["email:" + TEACHER] = [time.time()] * advisor.SIGNED_IN_RATE_LIMIT_MAX
    assert ask(client).status_code == 200


def test_anonymous_teachers_must_sign_in(client):
    r = ask(client, headers={"X-Forwarded-For": "5.6.7.8"})
    assert r.status_code == 401
    assert "sign in" in r.get_json()["error"].lower()


def test_bad_session_token_gets_401(client):
    r = ask(client, headers={"Authorization": "Bearer ngs.not-a-real-token"})
    assert r.status_code == 401


def test_conversation_is_logged_under_the_signed_in_email(client, monkeypatch):
    logged = {}
    monkeypatch.setattr(
        advisor, "_log_exchange",
        lambda conv_id, messages, reply, response, user_info: logged.update(user_info),
    )
    ask(client)
    assert logged["email"] == TEACHER


def test_training_units_json_is_valid():
    data = json.loads(advisor.TRAINING_UNITS_PATH.read_text())
    for unit in data.values():
        for key in ("title", "minutes", "deliverable", "page", "make", "look_for", "opening", "instructions"):
            assert unit.get(key), key


def test_tutor_gets_room_for_long_deliverables(client, sent):
    ask(client)
    assert sent["max_tokens"] == advisor.TUTOR_MAX_TOKENS > advisor.MAX_TOKENS


def test_em_dashes_are_removed_but_ranges_stay():
    assert advisor.remove_em_dashes("Map Walk — students find") == "Map Walk, students find"
    assert advisor.remove_em_dashes("indoor—gym") == "indoor, gym"
    assert advisor.remove_em_dashes("a – b") == "a, b"
    assert advisor.remove_em_dashes("Grades 3–5") == "Grades 3–5"


def test_style_checklist_comes_last(client, sent):
    ask(client)
    assert sent["system_prompt"].rstrip().endswith(advisor.TUTOR_STYLE.rstrip())


def test_conversation_history_is_marked_for_caching(monkeypatch):
    captured = {}

    def fake_create(**kwargs):
        captured.update(kwargs)
        return FakeApiResponse()

    monkeypatch.setattr(advisor.client.messages, "create", fake_create)
    messages = [
        {"role": "user", "content": "Hi"},
        {"role": "assistant", "content": "Hello!"},
        {"role": "user", "content": "I teach 4th grade."},
    ]
    advisor._create_message(messages, "system text", 100)

    sent_messages = captured["messages"]
    assert sent_messages[:2] == messages[:2]
    assert sent_messages[-1] == {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "I teach 4th grade.",
                "cache_control": {"type": "ephemeral"},
            }
        ],
    }
    # The caller's copy, which gets logged, is unchanged
    assert messages[-1] == {"role": "user", "content": "I teach 4th grade."}

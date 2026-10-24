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

    monkeypatch.setattr(advisor, "rate_limit_store", {})
    monkeypatch.setattr(advisor, "_create_message", fake_create_message)
    monkeypatch.setattr(advisor, "get_sheets_client", lambda: None)
    return advisor.app.test_client()


def ask(client, unit="unit-0", **extra):
    body = {"unit": unit, "messages": [{"role": "user", "content": "Hi, I teach PE."}], **extra}
    return client.post("/tutor", json=body, headers={"X-Forwarded-For": "5.6.7.8"})


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
    r = client.post("/tutor", json={"unit": "unit-0", "messages": []})
    assert r.status_code == 400
    r = client.post(
        "/tutor",
        json={"unit": "unit-0", "messages": [{"role": "assistant", "content": "Hi"}]},
    )
    assert r.status_code == 400


def test_tutor_shares_the_daily_chat_limit(client):
    import time

    advisor.rate_limit_store["5.6.7.8"] = [time.time()] * advisor.RATE_LIMIT_MAX
    r = ask(client)
    assert r.status_code == 429


def test_training_units_json_is_valid():
    data = json.loads(advisor.TRAINING_UNITS_PATH.read_text())
    for unit in data.values():
        for key in ("title", "minutes", "deliverable", "page", "make", "look_for", "opening", "instructions"):
            assert unit.get(key), key


def test_tutor_gets_room_for_long_deliverables(client, sent):
    ask(client)
    assert sent["max_tokens"] == advisor.TUTOR_MAX_TOKENS > advisor.MAX_TOKENS

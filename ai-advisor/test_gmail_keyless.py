"""The Gmail sender signs keylessly when GMAIL_SERVICE_ACCOUNT_EMAIL is set."""

import google.auth
from google.auth import iam

import app as advisor


def test_keyless_credentials_send_as_sender(monkeypatch):
    monkeypatch.setattr(advisor, "GMAIL_SERVICE_ACCOUNT_EMAIL", "mailer@example.iam.gserviceaccount.com")
    monkeypatch.setattr(advisor, "EMAIL_LINK_SENDER", "training@example.org")
    monkeypatch.setattr(google.auth, "default", lambda scopes=None: (object(), "project"))

    credentials = advisor.gmail_credentials()

    assert credentials.service_account_email == "mailer@example.iam.gserviceaccount.com"
    assert credentials._subject == "training@example.org"
    assert credentials._scopes == [advisor.GMAIL_SEND_SCOPE]
    assert isinstance(credentials.signer, iam.Signer)  # no key file involved

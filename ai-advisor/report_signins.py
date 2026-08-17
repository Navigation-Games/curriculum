#!/usr/bin/env python3
"""
Report on who has used the advisor and page feedback, and how much.

Reads two tabs of the conversation log spreadsheet:
- sheet1 (chat log): timestamp, conversation_id, msg_number, role, content,
  model, input_tokens, output_tokens, user_name, user_email, user_org
- PageFeedback: timestamp, page, title, rating, comment, submitter

Sign-in caveat: the chat log's user_email column holds a Google-verified
address when the visitor was signed in, but the advisor's intro form also
lets anonymous visitors type any email into a free-text field, and the
chat log does not currently mark which rows are which. PageFeedback does
mark this: signed-in submissions are tagged "Name <email> (verified)".

So this report treats an email as a "confirmed sign-in" only if it shows
up verified in PageFeedback at least once, and reports chat activity for
those emails with confidence. Emails that only ever appear in the chat
log are listed separately as self-reported (not confirmed via sign-in).

Usage:
    python report_signins.py [--sheet-id SHEET_ID] [--csv out.csv]

Requires Application Default Credentials with read access to Sheets:
    gcloud auth application-default login --scopes="openid,https://www.googleapis.com/auth/userinfo.email,https://www.googleapis.com/auth/spreadsheets.readonly"

The signed-in Google account must have at least viewer access to the
conversation log spreadsheet.
"""

import argparse
import csv
import re
import sys
from collections import defaultdict
from datetime import datetime

import gspread
from google.auth import default as google_auth_default

DEFAULT_SHEET_ID = "13P76_hPAVDDjnwJ9aazIdW-WAtGKNW5fBVD6TX1s5aY"
PAGE_FEEDBACK_SHEET_TITLE = "PageFeedback"
VERIFIED_SUBMITTER_RE = re.compile(r"<([^>]+)>\s*\(verified\)\s*$")


def get_client():
    creds, _ = google_auth_default(
        scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"]
    )
    return gspread.authorize(creds)


def parse_timestamp(raw: str):
    try:
        return datetime.strptime(raw.replace(" UTC", ""), "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return None


def load_chat_activity(spreadsheet):
    """Return {email: {name, messages, conversations: set, first, last}}."""
    rows = spreadsheet.sheet1.get_all_values()[1:]  # skip header
    activity = defaultdict(
        lambda: {"name": "", "messages": 0, "conversations": set(), "first": None, "last": None}
    )
    for row in rows:
        if len(row) < 11:
            continue
        timestamp, conversation_id, _msg_number, role, _content, _model, _in_tok, _out_tok, \
            user_name, user_email, _user_org = row[:11]
        email = user_email.strip()
        if not email:
            continue
        entry = activity[email]
        entry["name"] = entry["name"] or user_name.strip()
        entry["conversations"].add(conversation_id)
        if role == "user":
            entry["messages"] += 1
        ts = parse_timestamp(timestamp)
        if ts:
            if entry["first"] is None or ts < entry["first"]:
                entry["first"] = ts
            if entry["last"] is None or ts > entry["last"]:
                entry["last"] = ts
    return activity


def load_page_feedback_activity(spreadsheet):
    """Return {email: {name, submissions, first, last}} for verified submitters,
    plus a count of anonymous/self-reported submissions."""
    try:
        ws = spreadsheet.worksheet(PAGE_FEEDBACK_SHEET_TITLE)
    except gspread.WorksheetNotFound:
        return {}, 0

    rows = ws.get_all_values()[1:]  # skip header
    activity = defaultdict(
        lambda: {"name": "", "submissions": 0, "first": None, "last": None}
    )
    unverified_count = 0
    for row in rows:
        if len(row) < 6:
            continue
        timestamp, _page, _title, _rating, _comment, submitter = row[:6]
        match = VERIFIED_SUBMITTER_RE.search(submitter.strip())
        if not match:
            unverified_count += 1
            continue
        email = match.group(1).strip()
        name = submitter[: match.start()].strip()
        entry = activity[email]
        entry["name"] = entry["name"] or name
        entry["submissions"] += 1
        ts = parse_timestamp(timestamp)
        if ts:
            if entry["first"] is None or ts < entry["first"]:
                entry["first"] = ts
            if entry["last"] is None or ts > entry["last"]:
                entry["last"] = ts
    return activity, unverified_count


def fmt_ts(ts):
    return ts.strftime("%Y-%m-%d") if ts else "-"


def build_rows(chat_activity, feedback_activity):
    confirmed_emails = set(feedback_activity)
    confirmed_rows = []
    for email in sorted(confirmed_emails):
        fb = feedback_activity[email]
        chat = chat_activity.get(email)
        first_candidates = [t for t in (fb["first"], chat["first"] if chat else None) if t]
        last_candidates = [t for t in (fb["last"], chat["last"] if chat else None) if t]
        confirmed_rows.append({
            "email": email,
            "name": fb["name"] or (chat["name"] if chat else ""),
            "chat_messages": chat["messages"] if chat else 0,
            "chat_conversations": len(chat["conversations"]) if chat else 0,
            "page_feedback": fb["submissions"],
            "first_seen": fmt_ts(min(first_candidates)) if first_candidates else "-",
            "last_seen": fmt_ts(max(last_candidates)) if last_candidates else "-",
        })

    self_reported_rows = []
    for email in sorted(set(chat_activity) - confirmed_emails):
        chat = chat_activity[email]
        self_reported_rows.append({
            "email": email,
            "name": chat["name"],
            "chat_messages": chat["messages"],
            "chat_conversations": len(chat["conversations"]),
            "first_seen": fmt_ts(chat["first"]),
            "last_seen": fmt_ts(chat["last"]),
        })

    confirmed_rows.sort(key=lambda r: (r["chat_messages"] + r["page_feedback"]), reverse=True)
    self_reported_rows.sort(key=lambda r: r["chat_messages"], reverse=True)
    return confirmed_rows, self_reported_rows


def print_table(title, rows, columns):
    print(f"\n{title}")
    print("-" * len(title))
    if not rows:
        print("(none)")
        return
    widths = {c: max(len(c), max(len(str(r[c])) for r in rows)) for c in columns}
    header = "  ".join(c.ljust(widths[c]) for c in columns)
    print(header)
    print("  ".join("-" * widths[c] for c in columns))
    for r in rows:
        print("  ".join(str(r[c]).ljust(widths[c]) for c in columns))


def write_csv(path, confirmed_rows, self_reported_rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["status", "email", "name", "chat_messages", "chat_conversations",
                          "page_feedback_submissions", "first_seen", "last_seen"])
        for r in confirmed_rows:
            writer.writerow(["confirmed sign-in", r["email"], r["name"], r["chat_messages"],
                              r["chat_conversations"], r["page_feedback"], r["first_seen"], r["last_seen"]])
        for r in self_reported_rows:
            writer.writerow(["self-reported only", r["email"], r["name"], r["chat_messages"],
                              r["chat_conversations"], "", r["first_seen"], r["last_seen"]])


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--sheet-id", default=DEFAULT_SHEET_ID, help="Conversation log spreadsheet ID")
    parser.add_argument("--csv", help="Optional path to also write the report as CSV")
    args = parser.parse_args()

    gc = get_client()
    try:
        spreadsheet = gc.open_by_key(args.sheet_id)
    except Exception as e:
        print(f"Could not open spreadsheet {args.sheet_id}: {e}", file=sys.stderr)
        sys.exit(1)

    chat_activity = load_chat_activity(spreadsheet)
    feedback_activity, unverified_feedback_count = load_page_feedback_activity(spreadsheet)
    confirmed_rows, self_reported_rows = build_rows(chat_activity, feedback_activity)

    print_table(
        "Confirmed Google sign-ins (verified via page feedback)",
        confirmed_rows,
        ["email", "name", "chat_messages", "chat_conversations", "page_feedback", "first_seen", "last_seen"],
    )
    print_table(
        "Chat-only emails (self-reported in the intro form, not confirmed by a Google sign-in)",
        self_reported_rows,
        ["email", "name", "chat_messages", "chat_conversations", "first_seen", "last_seen"],
    )
    print(f"\nAnonymous page feedback submissions (no name/email given): {unverified_feedback_count}")

    if args.csv:
        write_csv(args.csv, confirmed_rows, self_reported_rows)
        print(f"\nWrote CSV to {args.csv}")


if __name__ == "__main__":
    main()

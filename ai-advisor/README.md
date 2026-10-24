# AI Lesson Plan Advisor

> **Changed something in this folder? Redeploy.** The live advisor and course tutor do not update on `git push`. After any change to `app.py`, `system-prompt.md`, `tutor-prompt.md`, `tutor-style.md`, `requirements.txt`, or the generated `site-map.md` or `training-units.json`, follow [Redeploying after changes](#redeploying-after-changes).

One backend service, deployed on Cloud Run as `lesson-advisor`, runs two things: the lesson plan advisor (`/chat`, at `/plan-my-lessons/` on the site) and the teacher course tutor (`/tutor`, on the `/training/` unit pages). The folder and service keep the advisor's name.

The advisor helps teachers plan orienteering lessons. Teachers chat with an AI advisor that recommends lesson sequences based on their grade level, schedule, space, and equipment.

The advisor recommends from the existing Navigation Games curriculum. It does not generate new content.

## Architecture

- **Backend:** Python (Flask) on Google Cloud Run
- **AI:** Anthropic Claude API (Sonnet) with prompt caching
- **Frontend:** React chat component embedded in the Docusaurus curriculum site
- **Logging:** stdout (Cloud Run logs) for now; Google Sheets integration planned

## Files

```
ai-advisor/
  app.py              - Flask backend (chat endpoint, review endpoints, rate limiting, logging)
  test_review.py      - Tests for the /review endpoints (run with pytest)
  system-prompt.md    - Curriculum knowledge baked into the AI's system prompt
  tutor-prompt.md     - General instructions for the teacher course tutor (/tutor)
  tutor-style.md      - Short style checklist, put at the end of the tutor's prompt
  training-units.json - Course unit material for the tutor (generated from content/training/)
  test_tutor.py       - Tests for the /tutor endpoint
  test_email_signin.py - Tests for email sign-in links and /tutor/progress
  test_tutor_voice.py - Tests for the tutor's voice (/tutor/voice, /tutor/speak)
  requirements.txt    - Python dependencies
  Dockerfile          - Cloud Run container
  .env.example        - Template for local dev environment variables
  .gitignore          - Keeps .env and __pycache__ out of git
```

Frontend files (in the Docusaurus site):

```
site/src/pages/plan-my-lessons.tsx         - Page at /plan-my-lessons/
site/src/pages/plan-my-lessons.module.css  - Page styles
site/src/components/AdvisorChat/index.tsx  - Chat component
site/src/components/AdvisorChat/formatMessage.tsx - Shared markdown-ish renderer
site/src/components/AdvisorChat/styles.module.css - Chat styles
site/src/pages/review-conversations.tsx    - Staff review page at /review-conversations/
site/src/pages/review-conversations.module.css - Page styles
site/src/components/ReviewConversations/index.tsx - Review component
site/src/components/ReviewConversations/styles.module.css - Review styles
site/src/components/TrainingTutor/index.tsx - Course tutor chat on /training/unit-N/ pages
site/src/components/EmailSignInForm/       - "Email me a sign-in link" form
site/src/pages/sign-in.tsx                 - Where sign-in links land (/sign-in/)
```

## Endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/health` | GET | none | Cloud Run health check |
| `/chat` | POST | optional Google ID token (rate limited) | Advisor chat |
| `/review/conversations` | GET | Google ID token (staff) | List conversations (`?all=true` to include reviewed/dismissed) |
| `/review/conversations/<id>` | GET | Google ID token (staff) | Full thread plus all reviewers' feedback |
| `/review/conversations/<id>/feedback` | POST | Google ID token (staff) | Add a feedback comment (`{"feedback": "..."}`) |
| `/review/conversations/<id>/dismiss` | POST | Google ID token (staff) | Hide a conversation from the reviewer's default list |
| `/tutor` | POST | sign-in required: Google ID token or email-link session (shares the signed-in `/chat` limit) | Teacher course tutor (`{"unit", "conversation_id", "messages", "profile"}`). Conversation IDs start with `tutor-<unit>-`, so tutor conversations show up in the log sheet and the review tool |
| `/tutor/progress` | GET | sign-in required | The teacher's latest conversation for each unit and their latest learner profile, rebuilt from the log sheet, so they can pick up on any device |
| `/tutor/voice` | GET | public | Whether the tutor can read replies aloud, and the voice's label |
| `/tutor/speak` | POST | sign-in required | MP3 of a tutor reply (signed with a `speech_token`) or a unit opening, in the ElevenLabs voice. Daily character allowance per teacher |
| `/auth/email-link` | POST | none (rate limited per IP and per address) | Email a 15-minute sign-in link (`{"email", "return_to"}`). `return_to` must be on the curriculum site or localhost |
| `/auth/email-link/verify` | POST | the link's token | Exchange a sign-in link's token for a 30-day session token (`{"token"}`) |
| `/auth/google-session` | POST | Google ID token | Swaps a one-hour Google sign-in for a 30-day session token (never staff), so the course tutor doesn't sign teachers out mid-unit. Needs `SIGN_IN_SECRET` |
| `/page-feedback` | POST | optional Google ID token (rate limited when anonymous) | "Was this page helpful?" feedback from docs pages (`{"page", "title", "rating", "comment", "submitter"}`) |

The `/review/*` endpoints are for Navigation Games staff. They require a Google ID token from a `navigationgames.org` account, sent as `Authorization: Bearer <token>`. The backend verifies the token signature, audience (our OAuth client ID), the `hd` claim, and `email_verified`. Feedback is stored in a **Feedback** tab of the logging spreadsheet, which the backend creates automatically if missing (columns: timestamp, conversation_id, reviewer_email, status, feedback).

### Optional sign-in on public endpoints

`/chat` and `/page-feedback` accept an optional Google ID token (same header, same OAuth client, any Google account). Tiers:

- **Anonymous**: 20 chat messages/day per IP; 10 feedback submissions/day per IP.
- **Signed in (any Google account)**: 100 chat messages/day keyed to the verified email; no feedback limit; feedback and conversation logs carry the verified identity (`Name <email> (verified)` in the feedback sheet; verified email overrides the self-reported one in the conversation log).
- **Staff (`navigationgames.org` via the `hd` claim)**: no chat limit.

A present-but-invalid/expired token returns 401 (the frontend then prompts to sign in again) rather than silently falling back to anonymous limits. If `REVIEW_OAUTH_CLIENT_ID` is unset, tokens are ignored and everyone is anonymous.

**Consent screen requirement:** public viewer sign-in only works if the OAuth consent screen is **External** and published. If it is currently Internal (staff-only), outside Google accounts cannot sign in; staff sign-in keeps working either way.

`/page-feedback` powers the "Was this page helpful?" widget at the bottom of every docs page. Anonymous rows are unverified public input; treat the tab accordingly. Rows marked `(verified)` carry a backend-verified identity.

## Local development

### Prerequisites

- Python 3.10+
- An Anthropic API key (from console.anthropic.com)
- Node.js 18+ (for the Docusaurus frontend)

### Run the backend

```bash
cd ai-advisor
cp .env.example .env
# Edit .env and add your Anthropic API key
pip install -r requirements.txt
python app.py
```

The backend runs at http://localhost:8080.

### Run the frontend

In a separate terminal:

```bash
cd site
npm install
npm start
```

Go to http://localhost:3000/plan-my-lessons/ to test the chat.

The frontend defaults to http://localhost:8080 for the backend API during local development.

### Run the tests

The test suites fake Google Sheets, the Anthropic API, and token
verification, so they need no credentials or network access:

```bash
cd ai-advisor
pip install pytest
python -m pytest -q
```

This covers `/review/*` (test_review.py), `/page-feedback`
(test_page_feedback.py), and the optional sign-in behavior on `/chat` and
`/page-feedback` (test_signed_in.py). Run it after any change to `app.py`.
Real OAuth/Sheets/Anthropic integration is checked manually after deployment.

## Google Cloud deployment

### Google Cloud project

Project ID: `navigation-games-curriculum`

### 1. Enable required APIs

In the Google Cloud Console, go to **APIs & Services > Library** and enable:

- **Cloud Run Admin API**
- **Artifact Registry API**
- **Cloud Build API**

Container Scanning API is not needed for this project. Skip it if prompted.

### 2. Create an Artifact Registry repository

Go to **Artifact Registry > Repositories > Create Repository**:

- Name: `advisor`
- Format: Docker
- Region: `us-central1`

### 3. Enable Secret Manager and store the API key

First, enable the **Secret Manager API** in APIs & Services > Library.

Then go to **Secret Manager > Create Secret**:

- Name: `anthropic-api-key`
- Secret value: your Anthropic API key

After creating the secret, grant the Cloud Run service account access to read it:

1. Click on **anthropic-api-key** in Secret Manager
2. Go to the **Permissions** tab
3. Click **Grant Access**
4. New principal: `YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com`
5. Role: **Secret Manager Secret Accessor**
6. Click Save

### 4. Build and deploy

These commands use PowerShell (the `backtick` line continuation character). Run from the `ai-advisor/` directory.

First, make sure gcloud is pointed at the right project:

```powershell
gcloud config set project navigation-games-curriculum
```

Build the container image. This uploads local files to Cloud Build (no local Docker needed):

```powershell
gcloud builds submit `
  --tag us-central1-docker.pkg.dev/navigation-games-curriculum/advisor/lesson-advisor
```

Deploy to Cloud Run:

```powershell
gcloud run deploy lesson-advisor `
  --image us-central1-docker.pkg.dev/navigation-games-curriculum/advisor/lesson-advisor `
  --region us-central1 `
  --allow-unauthenticated `
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest `
  --memory 256Mi `
  --min-instances 0 `
  --max-instances 3
```

### 5. Note the service URL

After deployment, Cloud Run provides a URL like:

```
https://lesson-advisor-523012695945.us-central1.run.app
```

### 6. Connect the frontend to the deployed backend

#### GitHub Actions (production builds)

1. Go to your repo on GitHub: **Settings > Secrets and variables > Actions**
2. Click the **Variables** tab
3. Click **New repository variable**
4. Name: `ADVISOR_API_URL`
5. Value: your Cloud Run URL (e.g., `https://lesson-advisor-523012695945.us-central1.run.app`)

The deploy workflow (`.github/workflows/deploy.yml`) already passes this variable to the build step.

#### Local builds (PowerShell)

```powershell
$env:ADVISOR_API_URL = "https://lesson-advisor-523012695945.us-central1.run.app"
cd site
npm run build
```

#### Local development

No setup needed. The frontend defaults to `http://localhost:8080`, which is where the local Python backend runs.

## Conversation review setup (one time)

The review page (`/review-conversations/`) lets Navigation Games staff sign in with Google and comment on advisor conversations. It needs an OAuth client ID.

### 1. Configure the OAuth consent screen

In the Google Cloud Console (project `navigation-games-curriculum`), go to **APIs & Services > OAuth consent screen**:

- User type: **Internal** if the project belongs to the navigationgames.org Workspace organization. If Internal is not offered, choose **External** and publish the app to production (no Google verification is needed for the basic sign-in scopes; the backend's domain check enforces staff-only access either way).
- App name: `Navigation Games Conversation Review`, plus a support email. Default scopes are fine.

### 2. Create the OAuth client ID

Go to **APIs & Services > Credentials > Create Credentials > OAuth client ID**:

- Application type: **Web application**
- Authorized JavaScript origins: `https://curriculum.navigationgames.org`, `https://navigation-games.github.io`, `http://localhost:3000`, and `http://localhost`
- No redirect URIs needed (the page uses the Google Identity Services button flow)

### 3. Configure the backend and frontend

Set the client ID on the Cloud Run service (persists across future deploys):

```powershell
gcloud run services update lesson-advisor `
  --region us-central1 `
  --set-env-vars REVIEW_OAUTH_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

For the frontend, either paste the client ID as the fallback value of `reviewOauthClientId` in `site/docusaurus.config.ts` (client IDs are public, not secrets), or set a `REVIEW_OAUTH_CLIENT_ID` repository variable in GitHub Actions and pass it through the deploy workflow. For local dev, set `$env:REVIEW_OAUTH_CLIENT_ID` before `npm start`, and add `REVIEW_OAUTH_CLIENT_ID` to `ai-advisor/.env`.

## Email sign-in links setup (one time)

Teachers without a Google account can sign in to the course with a link we email them. The backend sends it through the Navigation Games Google Workspace, as one Workspace address, using a service account that is allowed to send mail as that address. You need to be a Google Cloud owner of `navigation-games-curriculum` and a Workspace super admin.

1. **Pick the sender address.** It has to be a real Workspace user (not a group), such as a new `course@navigationgames.org` account or an existing staff account. Replies to sign-in emails go there, so someone should read it.
2. **Turn on the Gmail API** in the Google Cloud project: APIs & Services > Library > Gmail API > Enable.
3. **Create a service account**, for example `course-mailer`, under IAM & Admin > Service Accounts. Give it no project roles. Open it, note its **Client ID** (a long number), then Keys > Add key > JSON, and download the key file.
4. **Allow it to send mail as the sender.** In the Workspace Admin console: Security > Access and data control > API controls > Manage Domain Wide Delegation > Add new. Paste the Client ID, with the single scope `https://www.googleapis.com/auth/gmail.send`. That scope can send mail but can't read anyone's inbox.
5. **Store the secrets** in Secret Manager and give them to Cloud Run:

   ```powershell
   # A long random string for signing links
   $bytes = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
   [Convert]::ToBase64String($bytes) | gcloud secrets create sign-in-secret --data-file=-
   gcloud secrets create gmail-service-account --data-file=course-mailer-key.json

   gcloud run services update lesson-advisor --region us-central1 `
     --update-secrets "SIGN_IN_SECRET=sign-in-secret:latest,GMAIL_SERVICE_ACCOUNT_JSON=gmail-service-account:latest" `
     --update-env-vars EMAIL_LINK_SENDER=course@navigationgames.org
   ```

   Keep the quotes around the `--update-secrets` value. Without them PowerShell treats the comma as a list separator and gcloud fails with "Invalid secret spec".

   The Cloud Run service account needs the Secret Accessor role on both secrets (Secret Manager > the secret > Permissions), the same as for the Anthropic key.
   **Changing the sender later** (for example from a staff address to `course@navigationgames.org`): run `gcloud run services update lesson-advisor --region us-central1 --update-env-vars EMAIL_LINK_SENDER=<new address>`. No rebuild, new secret or Admin console change is needed, because domain-wide delegation covers every user in the Workspace. While a staff address is the sender, replies to sign-in emails go to that inbox and copies collect in its Sent mail.
6. **Delete the downloaded key file** from your computer once it is in Secret Manager.
7. **Test it**: open a course unit while signed out, enter your own address under "No Google account?", and check that the email arrives and the link signs you in.

If your Workspace blocks service account keys (some organizations do), tell Claude: the sender can instead sign as the Cloud Run service account without a key file, which takes a little more code.

## Tutor voice setup (one time)

The course tutor can read its replies aloud in a voice made with ElevenLabs (set up October 2026 with a professional clone of Barb's voice, on the `eleven_v4` model). Teachers who are signed in get a **Listen** button under each tutor message, a **Read replies aloud** switch (off by default) that plays each new reply, and a note in the chat header like "Listening: 75% left today". The page says the voice is an AI voice, using `TUTOR_VOICE_LABEL`. Keep that label honest, so nobody thinks they're hearing the real person.

**How it's protected.** The backend only reads the tutor's own replies (each comes with a signed `speech_token`) and unit openings, never text someone sends it, so nobody can use the endpoint to make the voice say something else. Saved boxes (profile, plan, map answers) and link addresses are not read out.

**What it costs.** ElevenLabs charges about 1 credit per character on `eleven_v4`. A tutor reply is roughly 300 to 800 characters, and a minute of speech about 900. The October 2026 plan has about 121,000 credits a month. Three limits keep usage in check:

- Each teacher can have `TUTOR_SPEECH_DAILY_CHARS` (default 20,000, about 20 minutes of speech) read aloud per 24 hours. That's meant to cover listening through the longest unit. Teachers see what's left as a percentage, not characters.
- The whole course can use `TUTOR_SPEECH_MONTHLY_CHARS` (default 100,000) per calendar month. When it runs out, Listen stops for everyone with a message, and replies can still be read. Like the other limits it's kept in memory, so it starts again on a redeploy and is counted per Cloud Run instance. It's a safety net, not exact accounting; the ElevenLabs usage page is the real count.
- Replaying a message uses the audio already in the browser, so it costs nothing.

If teachers really use the voice, the fix is a bigger ElevenLabs plan and higher limits. In ElevenLabs, turn off usage-based billing (overage) if your plan offers it, so going past the plan's credits stops the voice instead of charging more.

### Setting it up

1. **Make the voice** in ElevenLabs (the ElevenCreative platform): Voices > Add a new voice. A professional clone wants at least 30 minutes of clear, natural speech (more is better); an instant clone works from a few minutes. Try it in Text to Speech with a real tutor reply, and compare models in the Settings tab (the Model dropdown) before going further.
2. **Copy the voice ID**: Voices > the voice > ⋯ > Copy voice ID. It looks like `vdzQGpyDQcjP4RmRrvWy`.
3. **Make an API key**: your profile > API Keys > Create. Give it **Text to Speech: Access** and nothing else (no Voices or Voice collections permission is needed to speak in a voice by its ID). If it offers a credit limit for the key, set one near the course's monthly limit. ElevenLabs shows the key only once.
4. **Store the key** (PowerShell, any folder). Paste the key at the prompt, so it never ends up in a file or your command history:

   ```powershell
   Read-Host "ElevenLabs API key" | gcloud secrets create elevenlabs-api-key --data-file=-
   ```

   It should say `Created version [1] of the secret [elevenlabs-api-key]`. Check with `gcloud secrets list`.
5. **Let Cloud Run read it.** This has to come after step 4; on a secret that doesn't exist yet it fails with "404 ... not found".

   ```powershell
   gcloud secrets add-iam-policy-binding elevenlabs-api-key --member="serviceAccount:523012695945-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
   ```

   Without this, step 6 fails with "Permission denied on secret ... must be granted the 'Secret Manager Secret Accessor' role".
6. **Connect the key and the voice**, with the real voice ID (no angle brackets):

   ```powershell
   gcloud run services update lesson-advisor --region us-central1 `
     --update-secrets "ELEVENLABS_API_KEY=elevenlabs-api-key:latest" `
     --update-env-vars "ELEVENLABS_VOICE_ID=<voice id>,TUTOR_VOICE_LABEL=AI voice based on Barb's,ELEVENLABS_MODEL=eleven_v4"
   ```

   It worked if it ends with "serving 100 percent of traffic".
7. **Redeploy** if the running code is older than the voice feature (see [Redeploying after changes](#redeploying-after-changes)).
8. **Check the backend**: open https://lesson-advisor-523012695945.us-central1.run.app/tutor/voice in a browser. It should show `{"enabled":true,"label":"AI voice based on Barb's"}`. If `enabled` is false, the key, voice ID or `SIGN_IN_SECRET` is missing.
9. **Check the page**: open a course unit, signed in, and hard refresh (Ctrl+Shift+R) so the browser loads the new site. The website half updates by itself through GitHub Actions on every push to main; only the backend needs redeploying.

### Changing it later

None of these need a rebuild; each is one `gcloud run services update lesson-advisor --region us-central1 ...` command:

- **Bigger limits**: `--update-env-vars TUTOR_SPEECH_DAILY_CHARS=30000` or `TUTOR_SPEECH_MONTHLY_CHARS=200000`.
- **Another voice** (for example a different staff member for some units, an idea on the roadmap): `--update-env-vars "ELEVENLABS_VOICE_ID=<id>,TUTOR_VOICE_LABEL=AI voice based on <name>'s"`. Get the person's consent to clone their voice first.
- **Another model**: `--update-env-vars ELEVENLABS_MODEL=<model id>`, for example `eleven_flash_v2_5`, which ElevenLabs prices lower per character. Check the price on the ElevenLabs plan page.
- **New API key**: `Read-Host "ElevenLabs API key" | gcloud secrets versions add elevenlabs-api-key --data-file=-`, then redeploy or run any `services update` so Cloud Run picks up the new version.
- **Turn the voice off**: `--remove-env-vars ELEVENLABS_VOICE_ID`. The Listen buttons disappear.

## Daily activity email (one time)

A Google Apps Script bound to the advisor conversation log spreadsheet emails `president@navigationgames.org` once a day when new rows have been added (conversations, feedback, or page feedback) — a count per tab plus a link to the sheet. It stays quiet on days with no new activity. The script source is `daily-summary-email.gs` in this directory; it lives in the Sheet's Apps Script project, not in the deployed backend.

### 1. Open the script editor

Open the [conversation log spreadsheet](https://docs.google.com/spreadsheets/d/13P76_hPAVDDjnwJ9aazIdW-WAtGKNW5fBVD6TX1s5aY) with an account that has edit access, then **Extensions > Apps Script**.

### 2. Add the script

Paste the contents of `daily-summary-email.gs` into `Code.gs`, replacing the placeholder content, and save.

### 3. Authorize it

Select the `checkForNewActivity` function in the toolbar dropdown and click **Run** once. Approve the permission prompt (it needs to read the sheet and send email as the account running the script). This first run also records the current row counts as the baseline, so it will not immediately count all existing history as "new."

### 4. Add the daily trigger

In the left sidebar, click the clock icon (**Triggers**) > **Add Trigger**:

- Function: `checkForNewActivity`
- Event source: **Time-driven**
- Type: **Day timer**, pick any time window (e.g. 6am–7am)

The email is sent from whichever Google account set up the trigger. To change the recipient, edit the `RECIPIENT` constant at the top of the script.

## Redeploying after changes

Any time you change `app.py`, `system-prompt.md`, `tutor-prompt.md`, or `requirements.txt`, or want the advisor to pick up a regenerated `site-map.md` or `training-units.json` (rebuilt by `scripts/build-content.js` and appended to the system prompt at startup), you need to rebuild the container image and redeploy. The live advisor does not change on `git push`. Both steps are required. Run from the `ai-advisor/` directory in PowerShell:

```powershell
# Step 1: Rebuild the container image
gcloud builds submit `
  --tag us-central1-docker.pkg.dev/navigation-games-curriculum/advisor/lesson-advisor

# Step 2: Deploy the new image
gcloud run deploy lesson-advisor `
  --image us-central1-docker.pkg.dev/navigation-games-curriculum/advisor/lesson-advisor `
  --region us-central1
```

If `gcloud builds submit` fails with `Dockerfile required when specifying --tag`, you are not in the `ai-advisor/` directory. Cloud Build uploads the current directory as the build source, and the Dockerfile lives here. Either `cd ai-advisor` first, or pass the directory explicitly from the repo root:

```powershell
gcloud builds submit ai-advisor `
  --tag us-central1-docker.pkg.dev/navigation-games-curriculum/advisor/lesson-advisor
```

If you only change frontend files (`site/src/components/AdvisorChat/`, `site/src/components/ReviewConversations/`, `site/src/pages/plan-my-lessons.*`, `site/src/pages/review-conversations.*`), you do NOT need to rebuild the backend. Those changes go out with the normal Docusaurus build via `git push` (GitHub Actions deploys automatically).

If you only change the `ADVISOR_API_URL` GitHub Actions variable or other GitHub settings, you can trigger a rebuild from GitHub: **Actions > Deploy to GitHub Pages > Run workflow**.

## Configuration

| Environment variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Backend (Cloud Run secret) | Authenticates with the Claude API |
| `ADVISOR_MODEL` | Backend (optional) | Pin the Claude model (default: claude-sonnet-4-6). If the pinned model is unavailable (e.g. retired), the app auto-selects a current one at startup, preferring Sonnet. |
| `PORT` | Backend (set by Cloud Run) | Server port (default: 8080) |
| `ADVISOR_SHEET_ID` | Backend (optional) | Google Sheet ID for conversation logging; also used by the review endpoints |
| `REVIEW_OAUTH_CLIENT_ID` | Backend + frontend (build time) | OAuth client ID for staff sign-in on the review page |
| `ADVISOR_API_URL` | Frontend (build time) | Backend URL for the chat component |
| `SIGN_IN_SECRET` | Backend (Cloud Run secret) | Signs email sign-in links and sessions. Any long random string. Changing it signs everyone out who used an email link |
| `EMAIL_LINK_SENDER` | Backend | The Workspace address sign-in emails come from, e.g. `course@navigationgames.org` |
| `GMAIL_SERVICE_ACCOUNT_JSON` | Backend (Cloud Run secret) | Key for the service account that sends as `EMAIL_LINK_SENDER` (see "Email sign-in links setup") |
| `EMAIL_LINK_LOG_ONLY` | Backend (local development) | `true` writes sign-in links to the log instead of emailing them. Never set it in production |
| `ELEVENLABS_API_KEY` | Backend (Cloud Run secret) | ElevenLabs key for the tutor's voice (see "Tutor voice setup"). Without it, or without `ELEVENLABS_VOICE_ID` or `SIGN_IN_SECRET`, there are no speaker buttons |
| `ELEVENLABS_VOICE_ID` | Backend | The ElevenLabs voice the tutor speaks in |
| `ELEVENLABS_MODEL` | Backend (optional) | ElevenLabs model, default `eleven_v4` (about 1 credit per character; speaks the teacher's language) |
| `TUTOR_VOICE_LABEL` | Backend (optional) | Shown with the voice, default `AI voice`. For a cloned voice say whose, e.g. `AI voice based on Barb's` |
| `TUTOR_SPEECH_DAILY_CHARS` | Backend (optional) | Characters each teacher can have read aloud per day, default 20000 (about 20 minutes of speech, enough to listen through the longest unit). Teachers see the percentage they have left today |
| `TUTOR_SPEECH_MONTHLY_CHARS` | Backend (optional) | Characters the whole course can have read aloud per calendar month, default 100000. In memory, so it restarts on a redeploy: a safety net, not exact accounting |

Without `SIGN_IN_SECRET` and a sender (or log-only mode), email sign-in is off: the course still works with Google sign-in, and the email form says email sign-in isn't set up yet.

## Troubleshooting

### The advisor says "isn't available right now"

That message comes from the frontend whenever the backend `/chat` endpoint fails. The backend can be healthy while `/chat` is broken, so check in this order:

1. **Is the service up?** `curl https://lesson-advisor-523012695945.us-central1.run.app/health` should return `{"status":"ok"}`. If it does, the container is running and the problem is inside the chat call.
2. **Does `/chat` actually work?** Test it directly (note: it needs a `messages` array, not a `message` string):
   ```powershell
   curl -s -X POST https://lesson-advisor-523012695945.us-central1.run.app/chat `
     -H "Content-Type: application/json" `
     -d '{\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'
   ```
   A 500 with `{"error":"Something went wrong..."}` means the Claude API call failed.
3. **Read the logs for the real error.** The handler logs the underlying Anthropic error before returning the generic 500. Authenticate with the **president@navigationgames.org** account first (`gcloud auth login`), then:
   ```powershell
   gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=lesson-advisor" `
     --project navigation-games-curriculum --limit 15 --freshness 1d `
     --format "value(timestamp,textPayload)"
   ```
   Look for `Anthropic API error: ...`. Common causes: `not_found_error` (bad/retired model ID), `authentication_error` (bad API key), `credit balance is too low` (billing).

### Retired Claude model (the June 2026 outage)

On 2026-06-16 the advisor went down because it was pinned to the dated model alias `claude-sonnet-4-20250514`, which Anthropic retired on June 15. The API returned `404 not_found_error` on every chat call.

The app now defends against this automatically (see `resolve_model()` in `app.py`): at startup it lists available models and, if the pinned `ADVISOR_MODEL` is gone, falls back to the newest current model, preferring Sonnet. It also re-resolves once at request time if a model retires while an instance is running. So a retired model should no longer cause an outage.

If you ever need to force a specific model, set `ADVISOR_MODEL` to a current bare alias (not a dated one): `claude-sonnet-4-6`, `claude-opus-4-8`, or `claude-haiku-4-5`. Either rebuild and redeploy, or update the live service without a rebuild:
```powershell
gcloud run services update lesson-advisor --region us-central1 `
  --update-env-vars ADVISOR_MODEL=claude-sonnet-4-6
```

## Cost

At realistic usage (under 100 conversations/month), API costs are under $10/month. Cloud Run with min-instances=0 has no cost when idle.

## Future additions

- Intake form before chat (name, email, school)
- Follow-up survey link at end of conversations
- Rate limiting with Redis (current in-memory store resets on deploy)

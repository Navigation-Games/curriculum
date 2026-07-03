# AI Lesson Plan Advisor

A backend service that helps teachers plan orienteering lessons. Teachers chat with an AI advisor that recommends lesson sequences based on their grade level, schedule, space, and equipment.

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
```

## Endpoints

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/health` | GET | none | Cloud Run health check |
| `/chat` | POST | none (rate limited) | Advisor chat |
| `/review/conversations` | GET | Google ID token | List conversations (`?all=true` to include reviewed/dismissed) |
| `/review/conversations/<id>` | GET | Google ID token | Full thread plus all reviewers' feedback |
| `/review/conversations/<id>/feedback` | POST | Google ID token | Add a feedback comment (`{"feedback": "..."}`) |
| `/review/conversations/<id>/dismiss` | POST | Google ID token | Hide a conversation from the reviewer's default list |
| `/page-feedback` | POST | none (rate limited) | "Was this page helpful?" feedback from docs pages (`{"page", "title", "rating", "comment", "submitter"}`) |

The `/review/*` endpoints are for Navigation Games staff. They require a Google ID token from a `navigationgames.org` account, sent as `Authorization: Bearer <token>`. The backend verifies the token signature, audience (our OAuth client ID), the `hd` claim, and `email_verified`. Feedback is stored in a **Feedback** tab of the logging spreadsheet, which the backend creates automatically if missing (columns: timestamp, conversation_id, reviewer_email, status, feedback).

`/page-feedback` powers the "Was this page helpful?" widget at the bottom of every docs page. It needs no auth (10 submissions/day per IP) and writes to a **PageFeedback** tab, also auto-created (columns: timestamp, page, title, rating, comment, submitter). Rows are unverified public input; treat the tab accordingly.

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

The `/review/*` endpoints have a test suite that fakes Google Sheets and token
verification, so it needs no credentials or network access:

```bash
cd ai-advisor
pip install pytest
python -m pytest test_review.py -q
```

Run it after any change to `app.py`. The chat endpoint and real OAuth/Sheets
integration are not covered; those are checked manually after deployment.

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
- Authorized JavaScript origins: `https://navigation-games.github.io`, `http://localhost:3000`, and `http://localhost`
- No redirect URIs needed (the page uses the Google Identity Services button flow)

### 3. Configure the backend and frontend

Set the client ID on the Cloud Run service (persists across future deploys):

```powershell
gcloud run services update lesson-advisor `
  --region us-central1 `
  --set-env-vars REVIEW_OAUTH_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

For the frontend, either paste the client ID as the fallback value of `reviewOauthClientId` in `site/docusaurus.config.ts` (client IDs are public, not secrets), or set a `REVIEW_OAUTH_CLIENT_ID` repository variable in GitHub Actions and pass it through the deploy workflow. For local dev, set `$env:REVIEW_OAUTH_CLIENT_ID` before `npm start`, and add `REVIEW_OAUTH_CLIENT_ID` to `ai-advisor/.env`.

## Redeploying after changes

Any time you change `app.py`, `system-prompt.md`, or `requirements.txt`, or want the advisor to pick up a regenerated `site-map.md` (rebuilt by `scripts/build-content.js` and appended to the system prompt at startup), you need to rebuild the container image and redeploy. The live advisor does not change on `git push`. Both steps are required. Run from the `ai-advisor/` directory in PowerShell:

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

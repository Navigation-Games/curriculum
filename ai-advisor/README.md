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
  app.py              - Flask backend (chat endpoint, rate limiting, logging)
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
site/src/components/AdvisorChat/styles.module.css - Chat styles
```

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

From a terminal with `gcloud` installed and authenticated:

```bash
cd ai-advisor

# Set your project
gcloud config set project navigation-games-curriculum

# Build the container image (uses Cloud Build, no local Docker needed)
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/navigation-games-curriculum/advisor/lesson-advisor

# Deploy to Cloud Run
gcloud run deploy lesson-advisor \
  --image us-central1-docker.pkg.dev/navigation-games-curriculum/advisor/lesson-advisor \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets ANTHROPIC_API_KEY=anthropic-api-key:latest \
  --memory 256Mi \
  --min-instances 0 \
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

## Redeploying after changes

To update the backend after changing `app.py` or `system-prompt.md`:

```bash
cd ai-advisor
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/navigation-games-curriculum/advisor/lesson-advisor

gcloud run deploy lesson-advisor \
  --image us-central1-docker.pkg.dev/navigation-games-curriculum/advisor/lesson-advisor \
  --region us-central1
```

## Configuration

| Environment variable | Where | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | Backend (Cloud Run secret) | Authenticates with the Claude API |
| `ADVISOR_MODEL` | Backend (optional) | Override the Claude model (default: claude-sonnet-4-20250514) |
| `PORT` | Backend (set by Cloud Run) | Server port (default: 8080) |
| `ADVISOR_API_URL` | Frontend (build time) | Backend URL for the chat component |

## Cost

At realistic usage (under 100 conversations/month), API costs are under $10/month. Cloud Run with min-instances=0 has no cost when idle.

## Future additions

- Google Sheets logging for conversation review
- Intake form before chat (name, email, school)
- Follow-up survey link at end of conversations
- Rate limiting with Redis (current in-memory store resets on deploy)

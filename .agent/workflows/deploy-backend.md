---
description: Deploy the backend to Google Cloud Run
---

# Deploy Backend to Cloud Run

## Quick Deploy (env vars already saved)

// turbo

1. Run from the `backend/` directory:
   ```bash
   cd c:\ArenAI\ArenAI\backend
   gcloud run deploy arenai-backend --source . --region us-central1 --project project-c51b6aa6-3bde-49a4-9b0 --allow-unauthenticated
   ```

Service URL: `https://arenai-backend-279714222087.us-central1.run.app`

## If you need to update env vars

```bash
gcloud run services update arenai-backend --region us-central1 --project project-c51b6aa6-3bde-49a4-9b0 --update-env-vars "KEY=value,KEY2=value2"
```

## Current env vars on Cloud Run

- `DB_HOST=34.172.49.18`
- `DB_PORT=3306`
- `DB_NAME=arenaidb`
- `DB_USER=root`
- `DB_PASSWORD=DAKe5?LNjoZluak+`
- `DB_SSL=true`
- `DB_SSL_CA_PATH=cert/server-ca-arenai.pem`
- `DB_SSL_CERT_PATH=cert/client-cert-arenai.pem`
- `DB_SSL_KEY_PATH=cert/client-key-arenai.pem`
- `JWT_SECRET=super-secret-key-change-me`
- `JWT_EXPIRES_IN=1h`
- `GOOGLE_CLOUD_PROJECT_ID=project-c51b6aa6-3bde-49a4-9b0`
- `GOOGLE_CLOUD_LOCATION=us-central1`
- `GOOGLE_APPLICATION_CREDENTIALS=cert/project-c51b6aa6-3bde-49a4-9b0-dab00faa1edc.json`

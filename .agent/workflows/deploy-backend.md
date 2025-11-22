---
description: Deploy the backend to Google Cloud Run
---

# Deploy Backend to Cloud Run

This workflow builds the backend Docker image and deploys it to Google Cloud Run.

## Prerequisites

- Google Cloud SDK (`gcloud`) installed and authenticated.
- A Google Cloud project with Cloud Run and Artifact Registry/Container Registry enabled.

## Steps

1.  **Authenticate with Google Cloud** (if not already logged in):
    ```bash
    gcloud auth login
    gcloud config set project [YOUR_PROJECT_ID]
    ```

2.  **Configure Docker to use gcloud credentials**:
    ```bash
    gcloud auth configure-docker
    ```

3.  **Build and Push the Docker Image**:
    Replace `[YOUR_PROJECT_ID]` with your actual project ID.
    ```bash
    docker build -t gcr.io/[YOUR_PROJECT_ID]/arenai-backend:latest ./backend
    docker push gcr.io/[YOUR_PROJECT_ID]/arenai-backend:latest
    ```

4.  **Deploy to Cloud Run**:
    ```bash
    gcloud run deploy arenai-backend \
      --image gcr.io/[YOUR_PROJECT_ID]/arenai-backend:latest \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars NODE_ENV=production
    ```
    *Note: Add other environment variables (DB credentials, etc.) using `--set-env-vars KEY=VALUE,KEY2=VALUE2`.*

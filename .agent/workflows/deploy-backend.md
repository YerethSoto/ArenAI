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
    gcloud config set project project-c51b6aa6-3bde-49a4-9b0
    ```

2.  **Configure Docker to use gcloud credentials**:

    ```bash
    gcloud auth configure-docker
    ```

3.  **Build and Push the Docker Image**:

    ```bash
    docker build -t gcr.io/project-c51b6aa6-3bde-49a4-9b0/arenai-backend:latest ./backend
    docker push gcr.io/project-c51b6aa6-3bde-49a4-9b0/arenai-backend:latest
    ```

4.  **Deploy to Cloud Run (source-based, recommended)**:
    ```bash
    cd backend
    gcloud run deploy arenai-backend --source . --region us-central1 --project project-c51b6aa6-3bde-49a4-9b0 --clear-base-image
    ```
    _Note: Add other environment variables (DB credentials, etc.) using `--set-env-vars KEY=VALUE,KEY2=VALUE2`._

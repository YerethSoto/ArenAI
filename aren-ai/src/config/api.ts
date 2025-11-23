// Hardcoded for production APK to ensure it points to Cloud Run
export const API_BASE_URL = 'https://arenai-backend-271931294892.us-central1.run.app';

export const getApiUrl = (endpoint: string) => {
    // Remove leading slash if present to avoid double slashes if base url has trailing slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    // Ensure base url doesn't have trailing slash if we are adding one, or handle it gracefully
    // For simplicity, let's assume VITE_API_BASE_URL might or might not have it.
    // A robust way:
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`;
    return `${baseUrl}${cleanEndpoint}`;
};

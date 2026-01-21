import { getApiUrl } from '../config/api';

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    name: string;
    lastName?: string | null;
    role?: string;
    institution?: {
        id: number;
        name: string;
    } | null;
}

export interface UpdateProfileData {
    name?: string;
    lastName?: string;
    email?: string;
}

class UserService {
    private getAuthToken(): string | null {
        return localStorage.getItem('authToken');
    }

    private getHeaders(): HeadersInit {
        const token = this.getAuthToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    async getProfile(): Promise<UserProfile> {
        const response = await fetch(getApiUrl('/users/profile'), {
            method: 'GET',
            headers: this.getHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        return response.json();
    }

    async updateProfile(data: UpdateProfileData): Promise<{ success: boolean; user: UserProfile | null }> {
        const response = await fetch(getApiUrl('/users/profile'), {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'Failed to update profile');
        }

        return response.json();
    }

    // Update local storage with new user data
    updateLocalUserData(updates: Partial<UserProfile>): void {
        try {
            const current = localStorage.getItem('userData');
            if (current) {
                const userData = JSON.parse(current);
                const updated = { ...userData, ...updates };
                localStorage.setItem('userData', JSON.stringify(updated));
            }
        } catch (error) {
            console.error('Error updating local user data:', error);
        }
    }
}

export const userService = new UserService();

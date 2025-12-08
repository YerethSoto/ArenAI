import { UserData } from '../types/user';

export const getUserData = (): UserData => {
    try {
        const storedData = localStorage.getItem("userData");
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error("Error parsing user data:", error);
    }

    // Fallback data if nothing is stored
    return {
        name: "Maria Garcia",
        email: "maria.garcia@arenai.edu",
        username: "maria.garcia",
    };
};

export const saveUserData = (data: UserData): void => {
    try {
        localStorage.setItem("userData", JSON.stringify(data));
    } catch (error) {
        console.error("Error saving user data:", error);
    }
};

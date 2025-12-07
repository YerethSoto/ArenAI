export interface UserData {
    name: string;
    email: string;
    username: string;
}

export const getUserData = (): UserData => {
    try {
        const storedData = localStorage.getItem('userData');
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
    }

    return {
        name: 'Estudiante',
        email: 'Error',
        username: 'Error'
    };
};

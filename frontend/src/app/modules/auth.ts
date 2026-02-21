
export const getAuth = () => {
    return localStorage.getItem('token');
};

export const getUserId = () => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            return user.id;
        } catch (e) {
            return null;
        }
    }
    return null;
};

export const useAuth = () => {
    const saveAuth = (token: string | undefined) => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
    };

    const saveCurrentUser = (user: any) => {
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
        } else {
            localStorage.removeItem('currentUser');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
    };

    return { getAuth, getUserId, saveAuth, saveCurrentUser, logout };
};

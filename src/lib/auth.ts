export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

const AUTH_KEY = "admin_user";

export const Auth = {
    login: (user: User) => {
        const data = {
            user,
            timestamp: new Date().getTime()
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(data));
    },

    logout: () => {
        localStorage.removeItem(AUTH_KEY);
        window.location.href = "/admin/login";
    },

    getUser: (): User | null => {
        if (typeof window === "undefined") return null;

        const stored = localStorage.getItem(AUTH_KEY);
        if (!stored) return null;

        try {
            const parsed = JSON.parse(stored);
            const now = new Date().getTime();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (now - parsed.timestamp > twentyFourHours) {
                localStorage.removeItem(AUTH_KEY);
                return null;
            }

            return parsed.user as User;
        } catch (e) {
            localStorage.removeItem(AUTH_KEY);
            return null;
        }
    },

    isAuthenticated: (): boolean => {
        return !!Auth.getUser();
    }
};

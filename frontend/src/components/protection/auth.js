import { jwtDecode } from "jwt-decode";

export const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token || !userData) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
    }
    try {
        const { exp } = jwtDecode(token); 
        if (Date.now() >= exp * 1000) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            return false;
        }
        return true;
    } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
    }
};
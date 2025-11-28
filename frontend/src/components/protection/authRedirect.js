import { isAuthenticated } from "./auth";

export const redirectIfNotAuthenticated = () => {
  if (!isAuthenticated()) {
    sessionStorage.setItem("authMessage", "Tu sesión ha expirado.");
    window.location.href = "/auth/login";
  }
};
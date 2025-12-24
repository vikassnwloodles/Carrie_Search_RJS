// src/hooks/useAuthUtils.js
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function useAuthUtils() {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();

    function logoutAndNavigate() {
        logout();
        navigate("/");
    }

    function anotherHelperFunction() {}

    return {
        isAuthenticated,
        user,
        logoutAndNavigate,
        anotherHelperFunction
    };
}

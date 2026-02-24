import { useState } from "react";
import { removeThreadFromSpaceAPI } from "../api/threadsApi";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";

export function useRemoveThreadFromSpace() {
    const { logoutAndNavigate } = useAuthUtils()
    const [loading, setLoading] = useState(false);

    const removeThreadFromSpace = async (thread_id, onCloseModal) => {
        setLoading(true);
        try {
            const res = await removeThreadFromSpaceAPI(thread_id);
            // showCustomToast("Thread removed successfully!", { type: "success" });
            if (onCloseModal) onCloseModal();
        } catch (err) {
            if (err.status === 401) {
                showCustomToast("Session expired. Please log in again.", { type: "warn" });
                logoutAndNavigate();
            } else {
                showCustomToast(err.message || "Something went wrong!", { type: "error" });
            }
        } finally {
            setLoading(false);
        }
    };

    return { removeThreadFromSpace, loading };
}
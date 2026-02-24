import { useState } from "react";
import { addThreadToSpaceAPI } from "../api/threadsApi";
import { showCustomToast } from "../utils/customToast";
import { useAuthUtils } from "../utils/useAuthUtils";

export function useAddThreadToSpace() {
    const { logoutAndNavigate } = useAuthUtils()
    const [loading, setLoading] = useState(false);

    const addThreadToSpace = async (thread_id, space_id, onCloseModal) => {
        setLoading(true);
        try {
            const res = await addThreadToSpaceAPI(thread_id, space_id);
            // showCustomToast("Thread added successfully!", { type: "success" });
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

    return { addThreadToSpace, loading };
}
// async function fetchSpaces() {
//   if (fetchedSpaces) return;
//   try {
//     const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/get-spaces/`, {
//       headers: {
//         "Content-Type": "application/json"
//       },
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       if (res.status === 401) {
//         showCustomToast("Session expired. Please log in again.", { type: "warn" });
//         logoutAndNavigate();
//       } else {
//         showCustomToast("Failed to load spaces", { type: "error" });
//       }
//       return;
//     }

//     setSpacesContainer(Array.isArray(data) ? data : []);
//     setFetchedSpaces(true);
//   } catch {
//     showCustomToast("Network error while loading spaces", { type: "error" });
//   }
// }

import { fetchWithAuth } from "./fetchWithAuth";

export async function fetchSpacesApi() {
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_API_URL}/get-spaces/`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const error = new Error("Failed to fetch spaces");
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return Array.isArray(data) ? data : [];
}
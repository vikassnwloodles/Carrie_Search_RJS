import { fetchWithAuth } from "./fetchWithAuth";

/**
 * Delete a generated media item by search_result_id.
 * @param {string} search_result_id - The search result ID of the media to delete
 */
export async function deleteGeneratedMediaAPI(search_result_id) {
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_API_URL}/delete-generated-media/`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ search_result_id: String(search_result_id) }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || data.detail || "Failed to delete media");
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

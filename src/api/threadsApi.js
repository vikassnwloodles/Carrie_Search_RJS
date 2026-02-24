import { fetchWithAuth } from "./fetchWithAuth";

export async function fetchThreadsApi() {
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_API_URL}/threads/`,
    {
      headers: { "Content-Type": "application/json" },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const error = new Error("Failed to load threads");
    error.status = res.status;
    throw error;
  }

  return Array.isArray(data) ? data : [];
}



export async function addThreadToSpaceAPI(thread_id, space_id) {
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_API_URL}/add-thread-to-space/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id, space_id }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.message || "Unknown error" };
  return data;
}


export async function removeThreadFromSpaceAPI(thread_id) {
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_API_URL}/remove-thread-from-space/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id }),
    }
  );

  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.message || "Unknown error" };
  return data;
}


// Rename Thread
export async function renameThreadAPI(thread_id, title) {
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_API_URL}/rename-thread/`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id, title }),
    }
  );

  const data = await res.json();
  if (!res.ok)
    throw { status: res.status, message: data.message || "Unknown error" };

  return data;
}


// Delete Thread
export async function deleteThreadAPI(thread_id) {
  const res = await fetchWithAuth(
    `${import.meta.env.VITE_API_URL}/delete-thread/`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ thread_id }),
    }
  );

  const data = await res.json();
  if (!res.ok)
    throw { status: res.status, message: data.message || "Unknown error" };

  return data;
}
export async function fetchWithAuth(url, options = {}) {
  const access = localStorage.getItem("authToken");
  const refresh = localStorage.getItem("refToken");

  const isFormData = options.body instanceof FormData;

  const baseOptions = {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
      Authorization: access ? `Bearer ${access}` : undefined,
    },
  };

  let response = await fetch(url, baseOptions);

  // If access expired → try refresh
  if (response.status === 401 && refresh) {
    const refreshResponse = await fetch(
      `${import.meta.env.VITE_API_URL}/token/refresh/`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
      }
    );

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      localStorage.setItem("authToken", data.access);

      const retryOptions = {
        ...options,
        headers: {
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
          ...(options.headers || {}),
          Authorization: `Bearer ${data.access}`,
        },
      };

      return fetch(url, retryOptions);
    } else {
      localStorage.clear();
      window.location.href = "/";
      return Promise.reject("Session expired");
    }
  }

  return response;
}

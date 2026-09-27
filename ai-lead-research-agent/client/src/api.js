async function request(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    },
    ...options
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export const api = {
  research: (company) =>
    request("/api/leads/research", {
      method: "POST",
      body: JSON.stringify({ company })
    }),

  history: () => request("/api/leads"),

  get: (id) => request(`/api/leads/${id}`),

  review: (id, payload) =>
    request(`/api/leads/${id}/review`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    }),

  regenerate: (id) =>
    request(`/api/leads/${id}/regenerate`, {
      method: "POST"
    })
};

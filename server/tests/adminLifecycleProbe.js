const baseUrl = "http://localhost:5000/api/applications";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { "content-type": "application/json", ...(options.headers || {}) },
  });
  const body = await response.text();
  console.log(`${options.method || "GET"} ${path}: ${response.status} ${body}`);
  return { response, body: body ? JSON.parse(body) : null };
}

(async () => {
  const created = await request("", {
    method: "POST",
    body: JSON.stringify({
      name: "Lifecycle Probe",
      email: "lifecycle@example.com",
      education: "Secondary Education",
      program: "Undergraduate",
      goals: "Lifecycle verification",
    }),
  });
  const id = created.body._id;
  await request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status: "accepted", reviewed: true }),
  });
  await request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status: "rejected", reviewed: true }),
  });
  await request(`/${id}`, { method: "DELETE" });
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

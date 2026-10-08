const baseUrl = "https://njsif-scholarship-ch3c.onrender.com/api/applications";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.text();
  console.log(`${options.method || "GET"} ${path}: ${response.status}`);
  console.log(body);
  return { response, body: body ? JSON.parse(body) : null };
}

(async () => {
  const created = await request("", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Render Mutation Probe",
      email: "render-probe@example.com",
      education: "Secondary Education",
      program: "Undergraduate",
      goals: "Temporary Render mutation verification",
    }),
  });
  const id = created.body._id;

  const bulk = await request("/bulk-update", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ids: [id], status: "rejected", reviewed: true }),
  });
  const deleted = await request(`/${id}`, { method: "DELETE" });
  console.log(`PROBE_ID=${id}`);
  console.log(`BULK_STATUS=${bulk.response.status}`);
  console.log(`DELETE_STATUS=${deleted.response.status}`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

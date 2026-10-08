const baseUrl = "https://njsif-scholarship-4rrh.vercel.app/api/backend/applications";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  console.log(`${options.method || "GET"} ${path}: ${response.status}`);
  console.log(text);
  return { response, text };
}

(async () => {
  const created = await request("", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Vercel Mutation Probe",
      email: "vercel-probe@example.com",
      education: "Secondary Education",
      program: "Undergraduate",
      goals: "Temporary Vercel mutation verification",
    }),
  });
  const id = JSON.parse(created.text)._id;

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

const id = "6e9fc297-cf53-4abc-b9b6-c578624ee3c3";

fetch(`http://localhost:3100/api/backend/applications/${id}`, {
  method: "PUT",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ status: "accepted", reviewed: true }),
})
  .then(async (response) => {
    console.log(`STATUS=${response.status}`);
    console.log(await response.text());
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

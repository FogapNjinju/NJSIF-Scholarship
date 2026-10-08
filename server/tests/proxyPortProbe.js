const net = require("node:net");
for (const port of [3000, 3001, 3100]) {
  const socket = net.createConnection({ host: "127.0.0.1", port, timeout: 500 });
  socket.once("connect", () => {
    console.log(`${port}:open`);
    socket.end();
  });
  socket.once("error", () => console.log(`${port}:closed`));
}

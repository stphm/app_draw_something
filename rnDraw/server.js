const WebSocket = require('ws');
const serverWs = new WebSocket.Server({
  port: 8080,
});

let sockets = [];
serverWs.on('connection', function (socket) {
  sockets.push(socket);

  console.log(`connectet client`);

  // When you receive a message, send that message to every socket.
  socket.on('message', function (msg) {
    console.log(msg);
    sockets.forEach(s => s.send(msg));
  });

  // When a socket closes, or disconnects, remove it from the array.
  socket.on('close', function () {
    sockets = sockets.filter(s => s !== socket);
  });
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// ▼▼▼ THE MAGIC FIX: Allowing outside connections (CORS) ▼▼▼
const io = new Server(server, {
  cors: {
    origin: "*", // The star means "Allow connections from any app or phone"
    methods: ["GET", "POST"]
  }
});
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// Serve your map to the browser
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Listen for phone connections
io.on('connection', (socket) => {
  console.log('A device connected:', socket.id);
  
  // When the phone sends GPS data, broadcast it to the map
  socket.on('update_location', (data) => {
    io.emit('update_location', data);
  });

  socket.on('disconnect', () => {
    console.log('Device disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

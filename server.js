const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path'); // New: helps find files

const app = express();
app.use(cors());

// NEW: Serve the index.html file when someone visits your future website URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

let devices = {};

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);
    socket.emit('current_locations', devices);

    socket.on('update_location', (data) => {
        devices[data.id] = data;
        io.emit('location_changed', data);
        console.log(`Update from ${data.id}:`, data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// NEW: Cloud providers use 'process.env.PORT'. We use 3000 only as a backup.
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

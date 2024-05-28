const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = {};

app.use(express.json());

app.post('/new-room', (req, res) => {
    const roomId = uuidv4();
    rooms[roomId] = [];
    res.json({ roomId });
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId) => {
        if (rooms[roomId]) {
            socket.join(roomId);
            socket.emit('room-joined', roomId);
        } else {
            socket.emit('error', 'Room not found');
        }
    });

    socket.on('send-message', (roomId, message) => {
        if (rooms[roomId]) {
            io.to(roomId).emit('receive-message', message);
        }
    });
});

server.listen(3001, () => {
    console.log('Server listening on port 3001');
});

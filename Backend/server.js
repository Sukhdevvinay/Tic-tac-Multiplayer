const express = require('express');
const http = require("http");
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const socketIO = require("socket.io");
const ip = require("ip");

const registerSocketHandlers = require('./socketHandlers');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    const roomId = uuidv4();
    res.redirect(`/index/${roomId}`);
});

app.get('/index/:roomId', (req, res) => {
    const roomId = req.params.roomId;
    res.render('index', { roomId });
});

app.get('/create-room', (req, res) => {
    const roomId = uuidv4();
    const serverIp = ip.address();
    res.json({ roomId, serverIp });
});

// Socket.IO logic
const rooms = {}; // roomId -> { player1, player2, turn }

io.on("connection", (socket) => {
    console.log("User connected", socket.id);
    registerSocketHandlers(socket, io, rooms);
});

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
    console.log(`Server is running at: http://${ip.address()}:${PORT}`);
});

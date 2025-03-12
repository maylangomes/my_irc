require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

app.use(cors());

let users = {};
let channels = {};

io.on("connection", (socket) => {
    console.log("Nouvelle connexion");

    socket.on("set_username", (username) => {
        users[socket.id] = { username, channel: null };
        console.log(`CONNEXION : ${username} - ID : ${socket.id} - Channel : ${users[socket.id].channel}`);
        socket.emit("message", "Bienvenue sur my_irc " + username);
    });

    socket.on("join_channel", (channel) => {
        if (!channels[channel]) {
            channels[channel] = [];
        }
    
        users[socket.id].channel = channel;
        channels[channel].push(socket.id);
        socket.join(channel);
    
        console.log(`${users[socket.id].username} a rejoint ${channel}`);
        io.to(channel).emit("message", `${users[socket.id].username} a rejoint ${channel}`);
    });

    socket.on("send_message", (message) => {
        console.log(`Message reçu de ${socket.id} : ${message}`);
        const user = users[socket.id];
        if (!user) {
            console.log("user n'existe pas");
            return
        }

        if (!user.channel) {
            console.log(`L'utilisateur ${user.username} n'est pas dans un channel.`);
            return;
        }

        if (user.channel) {
            io.to(user.channel).emit("message", `${user.username}: ${message}`);
        }
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        console.log("Utilisateur déconnecté");
    });
});

server.listen(5000, () => console.log("Serveur démarré sur le port 5000"));

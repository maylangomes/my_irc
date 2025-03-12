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
let channels = [];

io.on("connection", (socket) => {
    console.log("Nouvelle connexion", socket.id);

    socket.on("set_username", (username) => {
        if (!username) return;

        users[socket.id] = { username, channel: null };
        console.log(`CONNEXION : ${username} - ID : ${socket.id}`);
        socket.emit("message", "Bienvenue sur my_irc " + username);
    });

    socket.on("get_channels", () => {
        socket.emit("channel_list", channels);
    });

    socket.on("create_channel", (channel) => {
        if (!channels.includes(channel)) {
            channels.push(channel);
            io.emit("channel_list", channels);
            console.log(`Channel créé : ${channel}`);
        }
    });

    socket.on("join_channel", (channel) => {
        if (!channels.includes(channel)) {
            console.log("Channel inexistant.");
            return;
        }
    
        if (!users[socket.id]) {
            console.log(`Erreur : utilisateur introuvable (ID: ${socket.id}).`);
            return;
        }

        users[socket.id].channel = channel;
        socket.join(channel);

        console.log(`${users[socket.id].username} a rejoint ${channel}`);
        io.to(channel).emit("message", `${users[socket.id].username} a rejoint ${channel}`);
    });

    socket.on("send_message", ({ channel, message }) => {
        const user = users[socket.id];
        if (!user) {
            console.log(`Erreur : utilisateur introuvable (ID: ${socket.id})`);
            return;
        }

        if (!user.channel) {
            console.log(`L'utilisateur ${user.username} n'est pas dans un channel.`);
            return;
        }

        io.to(channel).emit("message", `${user.username}: ${message}`);
    });

    socket.on("change_nickname", (newUsername) => {
        if (!users[socket.id]) {
            console.log(`Erreur : utilisateur introuvable (ID: ${socket.id})`);
            return;
        }
    
        const oldUsername = users[socket.id].username;
        users[socket.id].username = newUsername;
    
        console.log(`Changement de pseudo : ${oldUsername} ➝ ${newUsername}`);
        socket.emit("message", `Pseudo changé en ${newUsername}`);
    });

    socket.on("list_channels", (searchTerm) => {
        let filteredChannels = channels;
    
        if (searchTerm) {
            filteredChannels = channels.filter(channel => channel.includes(searchTerm));
        }
    
        console.log(`Liste des channels demandée (filtre: "${searchTerm}"):`, filteredChannels);
        socket.emit("channel_list", filteredChannels);
    });

    socket.on("disconnect", () => {
        delete users[socket.id];
        console.log("Utilisateur déconnecté");
    });
});

server.listen(5000, () => console.log("Serveur démarré sur le port 5000"));

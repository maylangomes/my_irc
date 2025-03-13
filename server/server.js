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

    socket.on("create_channel", (channel) => {
        if (!channel || channels.includes(channel)) {
            socket.emit("message", `Le channel "${channel}" existe déjà ou est invalide.`);
            return;
        }
    
        channels.push(channel);
        io.emit("channel_list", channels);
        socket.emit("channel_created", channel);
    
        console.log(`Channel créé : ${channel}`);
    });

    socket.on("delete_channel", (channel) => {
        if (!channels.includes(channel)) {
            socket.emit("channel_not_found", channel);
            return;
        }
    
        channels = channels.filter(ch => ch !== channel);
    
        io.to(channel).emit("message", `Channel "${channel}" a été supprimé.`);
        io.socketsLeave(channel);
    
        io.emit("channel_list", channels);
        socket.emit("channel_deleted", channel);
    
        console.log(`Channel supprimé : ${channel}`);
    });

    socket.on("leave_channel", (channel) => {
        if (!users[socket.id] || users[socket.id].channel !== channel) {
            console.log(`Erreur : ${users[socket.id]?.username || "Utilisateur inconnu"} n'est pas dans ${channel}`);
            return;
        }
    
        socket.leave(channel);
        console.log(`${users[socket.id].username} a quitté ${channel}`);
        
        io.to(channel).emit("message", `${users[socket.id].username} a quitté ${channel}`);
        
        users[socket.id].channel = null;
    });

    socket.on("join_channel", (channel) => {
        if (!channels.includes(channel)) {
            console.log(`Erreur : channel "${channel}" inexistant.`);
            socket.emit("channel_not_found", channel);
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
        socket.emit("channel_joined", channel);
    });
    
    socket.on("list_users", (channel) => {
        if (!channels.includes(channel)) {
            socket.emit("message", `Le channel "${channel}" n'existe pas.`);
            return;
        }
    
        const usersInChannel = Object.values(users)
            .filter(user => user.channel === channel)
            .map(user => user.username);
    
        socket.emit("user_list", usersInChannel);
    });
    

    socket.on("disconnect", () => {
        delete users[socket.id];
        console.log("Utilisateur déconnecté");
    });
});

server.listen(5000, () => console.log("Serveur démarré sur le port 5000"));

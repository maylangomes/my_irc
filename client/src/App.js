import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

socket.on("connect", () => {
    console.log("Connecté au serveur WebSocket avec ID :", socket.id);
});

socket.on("disconnect", () => {
    console.log("Déconnecté du serveur WebSocket");
});

console.log("test co", socket);

function App() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [channel, setChannel] = useState("");

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", message);
      setMessage("");
    }
  };

  const handleJoinChannel = (channel) => {
    if (channel.trim() !== "") {
        socket.emit("join_channel", channel);
        console.log(`Rejoint le channel : ${channel}`);
    }
  };

  return (
    <div>
      <h1>Chat IRC</h1>
      
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={() => socket.emit("set_username", username)}>Se connecter</button>

      <input
        type="text"
        placeholder="Nom du channel"
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
      />
      <button onClick={() => handleJoinChannel(channel)}>Rejoindre</button>

      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Envoyer</button>

      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;

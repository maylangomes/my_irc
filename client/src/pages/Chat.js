import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Chat({ socket }) {
  const { channel } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (!username) {
      console.log("Utilisateur non trouvé, retour à la connexion.");
      navigate("/");
      return;
    }

    socket.emit("set_username", username);

    socket.emit("join_channel", channel);

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("leave_channel", channel);
      socket.off("message");
    };
  }, [socket, channel, navigate]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      if (message.startsWith("/nick ")) {
        const newUsername = message.split(" ")[1];
        if (newUsername) {
          localStorage.setItem("username", newUsername);
          socket.emit("change_nickname", newUsername);
          setMessage("");
        }
      } else if (message.startsWith("/list")) {
        const searchTerm = message.split(" ")[1] || "";
        socket.emit("list_channels", searchTerm);
        setMessage("");
      } else {
        socket.emit("send_message", { channel, message });
        setMessage("");
      }
    }
  };
  
  useEffect(() => {
    socket.on("channel_list", (channelList) => {
      setMessages((prev) => [
        ...prev,
        `Channels disponibles : ${channelList.join(", ") || "Aucun channel trouvé"}`,
      ]);
    });
  
    return () => {
      socket.off("channel_list");
    };
  }, [socket]);
  

  const handleLeaveChannel = () => {
    socket.emit("leave_channel", channel);
    navigate("/channels");
  };

  return (
    <div>
      <h1>Chat - {channel}</h1>

      <button onClick={handleLeaveChannel}>
        Retour aux channels
      </button>

      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>

      <input
        type="text"
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Envoyer</button>
    </div>
  );
}

export default Chat;

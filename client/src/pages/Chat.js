import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Chat({ socket }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [channel, setChannel] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) {
      navigate("/");
      return;
    }

    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, [socket, navigate]);

  const handleSendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", message);
      setMessage("");
    }
  };

  const handleJoinChannel = () => {
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
        placeholder="Nom du channel"
        value={channel}
        onChange={(e) => setChannel(e.target.value)}
      />
      <button onClick={handleJoinChannel}>Rejoindre</button>

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

export default Chat;

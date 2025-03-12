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
      socket.emit("send_message", { channel, message });
      setMessage("");
    }
  };

  const handleLeaveChannel = () => {
    socket.emit("leave_channel", channel);
    navigate("/channels");
  };

  return (
    <div>
      <h1>Chat - {channel}</h1>

      <button onClick={handleLeaveChannel} style={{ marginBottom: "10px" }}>
        ⬅ Retour aux channels
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

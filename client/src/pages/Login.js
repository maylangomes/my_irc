import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("http://localhost:5000", { transports: ["websocket"] });

function Login({ setSocket }) {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (username.trim() !== "") {
      socket.emit("set_username", username);
      setSocket(socket);
      navigate("/chat");
    }
  };

  return (
    <div>
      <h1>Connexion</h1>
      <input
        type="text"
        placeholder="Nom d'utilisateur"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleLogin}>Se connecter</button>
    </div>
  );
}

export default Login;

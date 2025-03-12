import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login({ socket }) {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username.trim()) return;

    socket.emit("set_username", username);

    localStorage.setItem("username", username);

    navigate("/channels");
  };

  return (
    <div>
      <h2>Connexion</h2>
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

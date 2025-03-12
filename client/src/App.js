import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import io from "socket.io-client";
import Login from "./pages/Login";
import Channel from "./pages/Channel";
import Chat from "./pages/Chat";

const socket = io("http://10.68.244.101:5000", { transports: ["websocket"] });

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login socket={socket} />} />
        <Route path="/channels" element={<Channel socket={socket} />} />
        <Route path="/chat/:channel" element={<Chat socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;

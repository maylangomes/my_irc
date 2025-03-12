import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

function App() {
  const [socket, setSocket] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setSocket={setSocket} />} />
        <Route path="/chat" element={<Chat socket={socket} />} />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Channel({ socket }) {
  const [channelName, setChannelName] = useState("");
  const [channels, setChannels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("get_channels");

    socket.on("channel_list", (channelList) => {
      setChannels(channelList);
    });

    return () => {
      socket.off("channel_list");
    };
  }, [socket]);

  const handleCreateChannel = () => {
    if (channelName.trim() !== "") {
      socket.emit("create_channel", channelName);
      setChannelName("");
    }
  };

  const handleJoinChannel = (channel) => {
    navigate(`/chat/${channel}`);
  };

  return (
    <div>
      <h1>Channels</h1>

      <input
        type="text"
        placeholder="Créer un channel"
        value={channelName}
        onChange={(e) => setChannelName(e.target.value)}
      />
      <button onClick={handleCreateChannel}>Créer</button>

      <h2>Liste des Channels</h2>
      <ul>
        {channels.map((channel, index) => (
          <li key={index} onClick={() => handleJoinChannel(channel)} style={{ cursor: "pointer" }}>
            {channel}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Channel;

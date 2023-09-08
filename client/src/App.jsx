import React, { useState } from "react";
import io from "socket.io-client";

const socket = io("https://chat-bot.pandashop.uz");
const id = Math.floor(Math.random() * 1000);

export const App = () => {
  const [messages, setMessages] = useState([]);
  const [key, setKey] = useState(null);
  const user = `User_${id}`;
  document.querySelector("title").innerText = user;

  if (key) socket.emit("join-room", { room: key, user });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!key) return alert("Room nomini kiriting");
    const msg = e.target.msg.value;
    if (msg.lengtg) return alert("Xabar kiriting");
    socket.emit("send-message", { room: key, msg, user });
    e.target.msg.value = "";
  };

  //  Roomdagi xabarlarni olish
  socket.emit("get-messages", key);
  socket.on("receive-messages", (data) => setMessages(data));

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="room"
          placeholder="Room"
          onChange={(e) => setKey(e.target.value)}
        />
        <input type="text" name="msg" placeholder="Xabar yozing..." autoFocus />
        <button>Yuborish</button>
      </form>

      <ol>
        {messages?.reverse()?.map((msg, i) => {
          return (
            <li key={i}>
              <b>{msg.user}</b> - {msg.msg}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

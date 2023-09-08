const express = require("express");
const port = process.env.PORT || 8080;
const socketIo = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Ulangan foydalanuvchilarni saqlash uchun obyekt
const connectedUsers = {};

// Roomga yuboriladigan xabarlar
const roomMessages = {};

io.on("connection", (socket) => {
  // Foydalanuvchini qo'shish
  socket.on("join-room", ({ user, room }) => {
    // Foydalanuvchini roomga qo'shish
    socket.join(room);

    // Foydalanuvchini saqlash
    connectedUsers[socket.id] = { user, room };
    console.log(`${user} joined: ${room}`);
  });

  // Xabarlarni yuborish
  socket.on("send-message", (data) => {
    const room = data.room;

    // Roomga xabar yuborish
    socket.to(room).emit("receive-message", data);

    // Roomga xabarlar saqlash
    if (!roomMessages[room]) roomMessages[room] = [];
    roomMessages[room].push(data);

    // Roomdagi xabarlarni yuborish
    socket.to(room).emit("receive-messages", roomMessages[room]);
  });

  // Roomdagi xabarlarni olish
  socket.on("get-messages", (room) => {
    socket.emit("receive-messages", roomMessages[room] || []);
  });

  socket.on("disconnect", () => delete connectedUsers[socket.id]);
});

server.listen(port, () => console.log(`Listening on port ${port}`));

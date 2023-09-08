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
  // Authentifikatsiya qilish
  socket.on("auth", (user) => console.log(user));

  // Ulangan foydalanuvchilarni ro'yxatga qo'shish
  connectedUsers[socket.id] = socket;

  // Ulangan foydalanuvchilarni olishish
  const users = Object.keys(connectedUsers);

  // Ulangan foydalanuvchilarni brauzerga yuborish
  socket.emit("allUsers", users);

  // Foydalanuvchi  "room" ga qo'shilish
  socket.on("joinRoom", (data) => {
    const { room, user } = data;
    console.log("Foydalanuvchi roomga qo'shildi");
    socket.join(room);
  });

  // Foydalanuvchi "room" ga xabar yuborish
  socket.on("sendMessageToRoom", (data) => {
    const { room, msg, user } = data;
    console.log("Foydalanuvchi xabar yubordi");
    // Xabarni roomga yuborish
    io.to(room).emit("message", { msg, user });

    // Xabarni saqlash
    if (!roomMessages[room]) {
      roomMessages[room] = [];
    }
    roomMessages[room].push({ msg, user });
  });

  // Foydalanuvchi "room" ga xabar yuborish
  socket.on("getRoomMessages", (room) => {
    socket.emit("allMessages", roomMessages[room]);
  });

  socket.on("disconnect", () => {
    console.log("Foydalanuvchi soketdan chiqdi");
    delete connectedUsers[socket.id];
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

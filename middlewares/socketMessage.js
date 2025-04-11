async function socketIoMessageMain(io) {
    let activeUsers = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("joinChat", (user) => {
    if (activeUsers.length >= 2) {
      socket.emit("chatFull", "Chat room is full. Please try again later.");
      return;
    }

    activeUsers.push({ id: socket.id, user });
    console.log("Active users:", activeUsers);

    io.emit(
      "userList",
      activeUsers.map((u) => u.user)
    );
  });

  socket.on("message", async (msg) => {
    const chatMessage = new Chat({
      user: msg.user,
      message: msg.message,
      time: msg.time,
    });
    await chatMessage.save();

    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((u) => u.id !== socket.id);
    io.emit(
      "userList",
      activeUsers.map((u) => u.user)
    );
    console.log("User disconnected:", socket.id);
  });
});
}
module.exports = {socketIoMessageMain}
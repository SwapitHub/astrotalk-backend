function socketVoiceCall(io) {
  io.on("connection", (socket) => {
    console.log("✅ New user connected:", socket.id);

    // User joins a room
    socket.on("join-room", ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`${userId} joined room: ${roomId}`);

      // Notify others
      socket.to(roomId).emit("user-joined", { userId, socketId: socket.id });
    });

    // Send offer to a specific user in room
    socket.on("offer", ({ roomId, targetSocketId, offer }) => {
      io.to(targetSocketId).emit("offer", {
        senderSocketId: socket.id,
        offer,
      });
    });

    // Send answer
    socket.on("answer", ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit("answer", {
        senderSocketId: socket.id,
        answer,
      });
    });

    // ICE candidates
    socket.on("ice-candidate", ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit("ice-candidate", {
        senderSocketId: socket.id,
        candidate,
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", socket.id);
      io.emit("user-left", { socketId: socket.id });
    });
  });
}

module.exports = { socketVoiceCall };
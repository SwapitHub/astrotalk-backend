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

    //screen share
    socket.on("start-screen-share", ({ roomId, userId }) => {
      socket.to(roomId).emit("user-started-screen-share", { userId, socketId: socket.id });
    });

    socket.on("stop-screen-share", ({ roomId, userId }) => {
      socket.to(roomId).emit("user-stopped-screen-share", { userId, socketId: socket.id });
    });

    // ICE candidates
    socket.on("ice-candidate", ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit("ice-candidate", {
        senderSocketId: socket.id,
        candidate,
      });
    });

    // Mic toggle
    socket.on("toggle-mic", ({ roomId, userId, isMicOn }) => {
      socket.to(roomId).emit("user-mic-toggled", {
        userId,
        socketId: socket.id,
        isMicOn,
      });
    });

    socket.on("join-user-call", async (roomId) => {
      console.log("🔔 join-user-call-requestPaidChat:", roomId);

      io.emit("join-user-call-new-notification", {
        message: "You have a new join user call request!",
        roomId,
      });
    });

    socket.on("accept-join-user-call", async (roomId) => {
      console.log("🔔 accept-join-user-call-requestPaidChat:", roomId);

      io.emit("accept-join-user-call-new-notification", {
        message: "You have a new accept-join-user-call request!",
        roomId,
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
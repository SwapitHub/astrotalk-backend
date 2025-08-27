// middlewares/socketVoiceCall.js
function socketVoiceCall(io) {
  io.on("connection", (socket) => {
    socket.on("call-user", ({ targetSocketId, offer }) => {
      io.to(targetSocketId).emit("receive-call", {
        callerSocketId: socket.id,
        offer,
      });
    });

    socket.on("answer-call", ({ targetSocketId, answer }) => {
      io.to(targetSocketId).emit("call-answered", { answer });
    });

    socket.on("ice-candidate", ({ targetSocketId, candidate }) => {
      io.to(targetSocketId).emit("ice-candidate", { candidate });
    });

    socket.on("end-call", ({ targetSocketId }) => {
      io.to(targetSocketId).emit("call-ended");
    });
  });
}

module.exports = { socketVoiceCall };
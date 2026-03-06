const { Server } = require("socket.io");

const io = new Server(4000, {
  cors: {
    origin: "*"
  }
});

const roomMembers = new Map();

function broadcastRoomMembers(sessionId) {
  const members = Array.from(roomMembers.get(sessionId) || []);
  io.to(sessionId).emit("roomMembers", { sessionId, members });
}

io.on("connection", (socket) => {
  socket.on("joinSession", ({ sessionId, senderId }) => {
    if (!sessionId || !senderId) {
      return;
    }

    socket.data.sessionId = sessionId;
    socket.data.senderId = senderId;

    socket.join(sessionId);

    if (!roomMembers.has(sessionId)) {
      roomMembers.set(sessionId, new Set());
    }

    roomMembers.get(sessionId).add(senderId);
    broadcastRoomMembers(sessionId);
  });

  socket.on("leaveSession", ({ sessionId, senderId }) => {
    if (!sessionId || !senderId) {
      return;
    }

    socket.leave(sessionId);

    if (roomMembers.has(sessionId)) {
      roomMembers.get(sessionId).delete(senderId);
      if (roomMembers.get(sessionId).size === 0) {
        roomMembers.delete(sessionId);
      } else {
        broadcastRoomMembers(sessionId);
      }
    }
  });

  socket.on("syncEvent", (payload) => {
    if (!payload?.sessionId) {
      return;
    }

    socket.to(payload.sessionId).emit("syncEvent", payload);
  });

  socket.on("disconnect", () => {
    const sessionId = socket.data.sessionId;
    const senderId = socket.data.senderId;

    if (!sessionId || !senderId || !roomMembers.has(sessionId)) {
      return;
    }

    roomMembers.get(sessionId).delete(senderId);
    if (roomMembers.get(sessionId).size === 0) {
      roomMembers.delete(sessionId);
    } else {
      broadcastRoomMembers(sessionId);
    }
  });
});

console.log("Socket.IO sync server running on http://localhost:4000");

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const socketIo = require('socket.io');
const {
  router: userRouter,
  socketIoMessage,
} = require("./routes/userChatRouter");
const { connectMongoDb } = require("./db/db");
const { socketIoMessageMain } = require("./middlewares/socketMessage");
const { AuthRoutes } = require("./routes/loginUserRouter");
const { astrologerRoutes } = require("./routes/astrologerRegistationRouter");
const {
  userIdAstRoute,
  socketUserIdToAstrologerMsg,
} = require("./routes/userIdToAstrologerRoute");
const {
  businessProfileRoute,
} = require("./routes/businessProfileAstrologerRouter");
const otpRoutes = require("./routes/OtpRoute");
const { denominationRoute } = require("./routes/denominationAdminRouter");
const { razorpayRouter } = require("./routes/razorpayRouter");

const app = express();
const server = http.createServer(app);
// Enhanced CORS configuration
const allowedOrigins = [
  'https://astrotalk-front-end-s6af.vercel.app',
  'https://astrotalk-backend.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());


// Socket.io configuration with enhanced settings
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  pingTimeout: 30000,
  pingInterval: 25000,
  cookie: false
});

// Handle connection events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Your existing socket event handlers
  socket.on("userId-to-astrologer", async (messageId) => {
    try {
      // Add validation and logging
      console.log('Received message:', messageId);
      
      if (!messageId || !messageId.userIdToAst || !messageId.astrologerIdToAst) {
        throw new Error("Required fields missing");
      }

      // Rest of your existing handler code...
      
    } catch (error) {
      console.error('Socket error:', error);
      socket.emit("userId-to-astrologer-error", {
        error: error.message,
        receivedData: messageId
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
// const io = new Server(server, {
//   cors: {
//     // origin: ["http://localhost:3000", "http://localhost:3001"],
//     origin: ["https://astrotalk-front-end-s6af.vercel.app/"],
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// mongo db connection

// connectMongoDb("mongodb://localhost:27017/chatting");

connectMongoDb(
  "mongodb+srv://swapitshamsher:Eb25QUq9aEt27aSQ@astrologer.euynurr.mongodb.net/astrotalk?retryWrites=true&w=majority&appName=astrologer"
);

// user connect chatting socket.io
socketIoMessageMain(io);

// routes
app.use("/chat", userRouter);
app.use("/auth", AuthRoutes);
app.use("/auth", astrologerRoutes);
app.use("/", userIdAstRoute);
app.use("/", businessProfileRoute);
app.use("/", otpRoutes);
app.use("/", denominationRoute);
app.use("/", razorpayRouter);

// Pass io to socketIoMessage in post chat api
socketIoMessage(io);

socketUserIdToAstrologerMsg(io);

server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

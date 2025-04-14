require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
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
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

// mongo db connection

connectMongoDb("mongodb://localhost:27017/chatting");

// connectMongoDb(
//   "mongodb+srv://swapitshamsher:Eb25QUq9aEt27aSQ@astrologer.euynurr.mongodb.net/astrotalk?retryWrites=true&w=majority&appName=astrologer"
// );

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

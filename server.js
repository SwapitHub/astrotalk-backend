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
const adminRoutes = require("./routes/adminLoginRouter");
const addLanguageRoute = require("./routes/addLanguageRouter");
const addProfessionRoute = require("./routes/addProfessionRouter");
const adminCommissionRoute = require("./routes/adminCommissionRouter");
const emailRouter = require("./routes/emailRouter");
const { ratingRoutes } = require("./routes/ratingRouter");
const { orderRoutes } = require("./routes/orderRouter");
const addGalleryRoute = require("./routes/addGalleryRouter");
const helmet = require("helmet");
const { socketVoiceCall } = require("./middlewares/socketVoiceCall");
const { astroShopList } = require("./routes/astroMallShopListingRouter");
const { astroShopProduct } = require("./routes/astroMallShopProductRouter");
const { astroGemJewelry } = require("./routes/astromallGemstoneJewelryRoute");
const { addressRoute } = require("./routes/saveAddressRoute");
const { razorpayShopRouter } = require("./routes/razorPayShopRouter");
const adminCommissionRoutePuja = require("./routes/adminCommissionPujaRouter");
const addProductFooterRoute = require("./routes/addFooterRouter");
const HomeBannerRouter = require("./routes/HomeBannerRouter");
const { seoMetaData } = require("./routes/seoMetaDataRoute");
const { seminarData } = require("./routes/seminarRouter");
const { userSeminar } = require("./routes/userSeminarRegistrationRoute");
const { paymentWithdrawalRoutes } = require("./routes/paymentWithdrawalRouter");
const { blockCategory } = require("./routes/blogsCategoryRouter");
const { addBlogs } = require("./routes/addBlogsRouter");
const path = require("path");

const app = express();
// secure API use helmet call
app.use(helmet());
// Public folder serve 
app.use("/public", express.static("public"));


const server = http.createServer(app);
const allowedOrigins = [
  "https://astrotalk-front-end.vercel.app",
  "http://72.60.101.71:3000",
  "https://astro.weddingbyte.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(
        new Error("The CORS policy does not allow access from this origin."),
        false
      );
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

// === SOCKET.IO ===
const io = new Server(server, {
  path: "/api/socket.io",
  cors: { origin: ["https://astro.weddingbyte.com", "http://localhost:3000"], credentials: true },
  transports: ["websocket", "polling"],
  pingInterval: 25000,
  pingTimeout: 60000
});



io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);
  socket.on("message", (data) => console.log("Message received:", data));
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});


const PORT = process.env.PORT || 8080;

app.use(express.json());
// app.use(cors());

// mongo db connection

// connectMongoDb("mongodb://localhost:27017/chatting");

connectMongoDb(
  "mongodb+srv://swapitshamsher:Eb25QUq9aEt27aSQ@astrologer.euynurr.mongodb.net/astrotalk?retryWrites=true&w=majority&appName=astrologer"
);

// app.use(express.json());
// user connect chatting socket.io

// routes
app.use("/chat", userRouter);
app.use("/auth", AuthRoutes);
app.use("/auth", astrologerRoutes);
app.use("/", userIdAstRoute);
app.use("/", businessProfileRoute);
app.use("/", otpRoutes);
app.use("/", denominationRoute);
app.use("/", razorpayRouter);
app.use("/", adminRoutes);
app.use("/", addLanguageRoute);
app.use("/", addProfessionRoute);
app.use("/", adminCommissionRoute);
app.use("/", emailRouter);
app.use("/", ratingRoutes);
app.use("/", orderRoutes);
app.use("/", addGalleryRoute);
app.use("/", astroShopList);
app.use("/", astroShopProduct);
app.use("/", astroGemJewelry);
app.use("/", addressRoute);
app.use("/", razorpayShopRouter);
app.use("/", adminCommissionRoutePuja);
app.use("/", addProductFooterRoute);
app.use("/", HomeBannerRouter);
app.use("/", seoMetaData);
app.use("/", seminarData);
app.use("/", userSeminar);
app.use("/", paymentWithdrawalRoutes);
app.use("/", blockCategory);
app.use("/", addBlogs);

// Pass io to socketIoMessage in post chat api
socketIoMessage(io);
socketIoMessageMain(io);
socketUserIdToAstrologerMsg(io);
socketVoiceCall(io);


server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);


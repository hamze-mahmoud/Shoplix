require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./db");

// Routers
const productsRouter = require("./routes/products");
const notificationsRouter = require("./routes/notifications");
const authRouter = require("./routes/auth");
const cartRouter = require("./routes/cart");
const usersRouter = require("./routes/users");
const ordersRouter = require("./routes/orders");
const categoriesRouter = require("./routes/categories");
const adminRouter = require("./routes/admin");
const adminDashboard = require("./routes/dashboard");
const reviewsRouter = require("./routes/reviews");
const bannersRouter = require("./routes/banners");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// =======================
// DATABASE
// =======================
connectDB();

// =======================
// CORS CONFIG
// =======================
// Allow the configured frontend origin plus any localhost/127.0.0.1 dev origin
// (Vite often falls back to a random port when 5173 is taken). Credentialed
// requests can't use "*", so we reflect the request origin when it's allowed.
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

const isAllowedOrigin = (origin) =>
  !origin || // same-origin / curl / server-to-server
  allowedOrigins.includes(origin) ||
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

const corsOptions = {
  origin: (origin, cb) =>
    isAllowedOrigin(origin)
      ? cb(null, true)
      : cb(new Error(`Origin not allowed by CORS: ${origin}`)),
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// =======================
// MIDDLEWARE
// =======================
app.use(cookieParser()); // ✅ IMPORTANT

app.use(express.json());
app.use(bodyParser.json());

app.use(
  express.static(
    path.join(__dirname, "uploads")
  )
);

// =======================
// SOCKET.IO CONFIG
// =======================
const io = new Server(server, {
  cors: {
    origin: (origin, cb) =>
      isAllowedOrigin(origin)
        ? cb(null, true)
        : cb(new Error(`Origin not allowed by CORS: ${origin}`)),
    credentials: true,
  },
});

app.set("io", io);

// =======================
// DEBUG MIDDLEWARE
// =======================
// Remove later when everything works
app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.originalUrl}`
  );

  console.log(
    "Authorization:",
    req.headers.authorization
  );

  console.log(
    "Refresh Cookie:",
    req.cookies?.refreshToken
      ? "EXISTS"
      : "MISSING"
  );

  next();
});

// =======================
// ROUTES
// =======================
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/auth", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/users", usersRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/dashboard", adminDashboard);
app.use("/api/reviews", reviewsRouter);
app.use("/api/banners", bannersRouter);

// =======================
// HEALTH CHECK
// =======================
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message:
      "Green Light backend running",
  });
});

// =======================
// SOCKET EVENTS
// =======================
let onlineCount = 0;

const broadcastOnline = () => io.emit("online_users", { count: onlineCount });

io.on("connection", (socket) => {
  onlineCount++;
  broadcastOnline();
  console.log(`Socket connected (${socket.id}). Online: ${onlineCount}`);

  // Send the current count immediately to the newcomer
  socket.emit("online_users", { count: onlineCount });

  // Client joins a personal room so we can target it with
  // io.to(userId).emit(...) for real-time notifications.
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId.toString());
    }
  });

  // Admins join an "admins" room to receive live order events
  socket.on("join_admin", () => socket.join("admins"));

  socket.on("disconnect", () => {
    onlineCount = Math.max(0, onlineCount - 1);
    broadcastOnline();
    console.log(`Socket disconnected (${socket.id}). Online: ${onlineCount}`);
  });
});

// =======================
// GLOBAL ERROR HANDLER
// =======================
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Internal Server Error",
  });
});

// =======================
// START SERVER
// =======================
server.listen(PORT, () => {
  console.log(
    `Server listening on port ${PORT}`
  );
});
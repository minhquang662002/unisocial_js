require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000;
const SocketServer = require("./SocketServer");
const http = require("http").createServer(app);

const io = new Server(http, {
  cors: {
    credentials: true,
  },
});

const URL = process.env.MONGODB_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected!");
  } catch (err) {
    console.log(err);
  }
};
connectDB();
io.on("connection", (socket) => {
  SocketServer(socket);
});
app.use(express.json());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api", require("./routes/authRoute"));
app.use("/api", require("./routes/userRoute"));
app.use("/api", require("./routes/postRoute"));
app.use("/api", require("./routes/commentRoute"));
app.use("/api", require("./routes/friendRoute"));
app.use("/api", require("./routes/newsRoute"));
app.use("/api", require("./routes/messageRoute"));
app.use("/api", require("./routes/notificationRoute"));

http.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

if (process.env.NODE_ENV === "production") {
  let path = require("path");

  app.get("*", (req, res) => {
    app.use(express.static(path.resolve(__dirname, "client", "build")));
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

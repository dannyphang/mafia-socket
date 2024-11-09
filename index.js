import express from "express";
import cors from "cors";
import http from "http";

const app = express();
const server = http.createServer(app);

// socket
import * as socketIo from "socket.io";
const io = new socketIo.Server(server, {
  cors: {
    origin: "*",
  },
});

import characterRouter from "./util/character.js";
import WORDS from "./util/words.js";

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.on("startGame", ({ gameId }) => {
    WORDS.createGame().then((words) => {
      io.to(gameId).emit("startGame", words);
      console.log("Someone is starting a game");
    });
  });

  socket.on("gameUpdate", ({ gameId, words }) => {
    io.to(gameId).emit(gameId, words);
  });

  socket.on("joinGame", ({ gameId }) => {
    socket.join(gameId);
    console.log("a player joined the room " + gameId);
    socket.to(gameId).emit("joinGame", "A player joined the game!");
  });
});

const PORT = process.env.PORT || 3000;

app.all("/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
});

// to resolve CORS issue
app.use(cors());

app.use("/character", characterRouter);

server.listen(PORT, () => console.log("Server is running on port " + PORT));

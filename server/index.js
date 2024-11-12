import express from "express";
import cors from "cors";
import http from "http";

const app = express();
const server = http.createServer(app);

// socket
import * as socketIo from "socket.io";

import characterRouter from "./util/character.js";
import roomRouter from "./util/room.js";
import playerRouter from "./util/player.js";
import * as games from "./util/game.js";

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
app.use("/room", roomRouter);
app.use("/player", playerRouter);

const io = new socketIo.Server(server, {
  cors: {
    origin: "*",
    methods: "POST, GET, PUT, DELETE, OPTIONS",
    allowedHeaders:
      "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers",
    credentials: "true",
  },
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("roomUpdate", ({ roomId, room }) => {
    io.to(roomId).emit(roomId, room);
  });

  socket.on("joinRoom", ({ room, player }) => {
    socket.join(room.roomId);
    if (player) {
      games.playerJoinRoom(player, room).then((roomU) => {
        console.log(`${player.playerName} is joined the room ${roomU.roomId}`);
        socket.to(roomU.roomId).emit("joinRoom", roomU);
      });
    }
  });
});

server.listen(PORT, () => console.log("Server is running on port " + PORT));

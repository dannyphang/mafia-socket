import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase/firebase-admin.js";
import responseModel from "../shared/function.js";

router.use(express.json());

const roomCollectionName = "Room";

// create new room
router.post("/", async (req, res) => {
  try {
    let newRef = db.default.db.collection(roomCollectionName).doc();
    let room = {
      roomId: newRef.id,
      statusid: 1,
      playerList: [],
      gameStarted: true,
    };

    await newRef.set(room);

    res.status(200).json(responseModel({ data: room }));
  } catch (error) {
    console.log("error", error);
    res.status(400).json(
      responseModel({
        isSuccess: false,
        responseMessage: error,
      })
    );
  }
});

export default router;

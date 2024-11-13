import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase/firebase-admin.js";
import responseModel from "../shared/function.js";

router.use(express.json());

const characterCollectionName = "Character";
const roomCollectionName = "Room";

// get all character
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.default.db
      .collection(characterCollectionName)
      .orderBy("characterOrder")
      .where("statusId", "==", 1)
      .get();

    const list = snapshot.docs.map((doc) => {
      return doc.data();
    });

    res.status(200).json(responseModel({ data: list }));
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

// get all character by roomId
router.get("/room/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const snapshot = await db.default.db
      .collection(roomCollectionName)
      .doc(id)
      .get();

    const room = snapshot.data().statusId == 1 ? snapshot.data() : {};

    if (room) {
      let list = [];
      room.playerList.forEach(async (p, index) => {
        if (p.characterId) {
          const snapshot2 = await db.default.db
            .collection(characterCollectionName)
            .doc(p.characterId)
            .get();
          const character =
            snapshot2.data().statusId == 1 ? snapshot2.data() : {};

          list.push(character);
        }

        if (index === room.playerList.length - 1) {
          res.status(200).json(responseModel({ data: list }));
        }
      });
    }
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

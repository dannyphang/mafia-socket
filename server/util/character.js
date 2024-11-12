import { Router } from "express";
import express from "express";
const router = Router();
import * as db from "../firebase/firebase-admin.js";
import responseModel from "../shared/function.js";

router.use(express.json());

const characterCollectionName = "Character";

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

export default router;

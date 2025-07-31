import express from "express";
import { createUser, getUserById } from "../controllers/userController.js";
import verifyFirebaseToken from "../middleware/verifyFirebaseToken.js";

const router = express.Router();

router.post("/", verifyFirebaseToken, createUser);
router.get("/:uid", verifyFirebaseToken, getUserById);

export default router;

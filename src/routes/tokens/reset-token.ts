import { Router } from "express";
import {
  IsAuthenticated,
  UserCredentials,
} from "../../middlewares/is-authenticated";
import path from "path";
import crypto from "crypto";
import { UserModel } from "../../models/user.model";

const router = Router();

export default router.post("/reset", IsAuthenticated(), async (req, res) => {
  const { email }: UserCredentials = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const newToken = crypto.randomBytes(32).toString("hex");

    await UserModel.updateOne(
      { email },
      {
        token: newToken,
      },
    );

    res.status(201).json({
      success: true,
      message: "Token reset successfully",
      data: { token: newToken },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal Server Error (${path.basename(import.meta.filename)})`,
    });
    return;
  }
});

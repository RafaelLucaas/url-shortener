import express from "express";
import "dotenv/config";
import { connectToDatabase } from "./lib/mongodb";
import shorten from "./routes/url/shorten";
import redirect from "./routes/redirect";
import register from "./routes/auth/register";
import resetToken from "./routes/tokens/reset-token";

const app = express();
const port = 8080;

app.set("trust proxy", 1);
app.use(express.json());

connectToDatabase();
app.listen(port, () => console.log(`Server is running on port ${port}`));

// AUTH
app.use("/auth", register);

// TOKENS
app.use("/tokens", resetToken);

// URL
app.use("/url", shorten);
app.use(redirect);

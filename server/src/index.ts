import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./env";
import { errorHandler } from "./middlewares/error";
import authRoutes from "./modules/auth/routes";
import postRoutes from "./modules/post/routes";

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ limit: "5mb" }));

app.get("/health", (_req, res) => res.json({ ok: true })); 

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API on http://localhost:${env.PORT}`);
});
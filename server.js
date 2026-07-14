import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import transactionsRouter from "./routes/transactions.js";
import summaryRouter from "./routes/summary.js";
import authRouter from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  }),
);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({ message: "Money Tracker API is alive" });
});

app.use("/api/transactions", authMiddleware, transactionsRouter);
app.use("/api/summary", authMiddleware, summaryRouter);
app.use("/api/auth", authRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

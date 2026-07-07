import express from "express";
import transactionsRouter from "./routes/transactions.js";
import summaryRouter from "./routes/summary.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/summary", summaryRouter);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/transactions", transactionsRouter);

app.use((req, res) => {
  res.status(404).json({ error: `Route {req.method} ${req.url} not found` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

app.get("/", (req, res) => {
  res.json({ message: "Money Tracker API is alive" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

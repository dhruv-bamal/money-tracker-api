import express from "express";
import transactionsRouter from "./routes/transactions.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use("/api/transactions", transactionsRouter);

app.get("/", (req, res) => {
  res.json({ message: "Money Tracker API is alive" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

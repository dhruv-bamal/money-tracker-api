import { Router } from "express";
import pool from "../db.js";
import { totalByCategory, detectRecurring } from "../lib/logic.js";

const router = Router();
const TEMP_USER_ID = "d5dde641-b803-4b8c-94fa-e3a8c9157722";

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
      [TEMP_USER_ID],
    );

    const transactions = result.rows;

    res.status(200).json({
      totalByCategory: totalByCategory(transactions),
      recurring: detectRecurring(transactions),
      transactionCount: transactions.length,
      totalSpent: transactions.reduce(
        (sum, t) => sum + parseFloat(t.amount),
        0,
      ),
    });
  } catch (err) {
    console.error("GET /summary error:", err.message);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

export default router;

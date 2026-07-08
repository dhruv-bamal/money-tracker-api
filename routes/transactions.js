import { Router } from "express";
import pool from "../db.js";
import { categorize } from "../lib/logic.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
      [req.user.id],
    );

    const enriched = result.rows.map((row) => ({
      ...row,
      category: categorize(row),
    }));

    res.status(200).json(enriched);
  } catch (err) {
    console.error("GET /transactions error:", err.message);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.post("/", async (req, res) => {
  const { amount, merchant, date } = req.body;

  if (!amount || !merchant || !date) {
    return res
      .status(400)
      .json({ error: "amount, merchant, and date are required" });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  if (isNaN(Date.parse(date))) {
    return res.status(400).json({
      error: "date must be a valid date string (YYYY-MM-DD)",
    });
  }

  if (merchant.trim().length === 0) {
    return res.status(400).json({
      error: "merchant cannot be blank",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, merchant, date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [req.user.id, parsedAmount, merchant.trim(), date],
    );

    const created = {
      ...result.rows[0],
      category: categorize(result.rows[0]),
    };

    res.status(201).json(created);
  } catch (err) {
    console.error("POST /transactions error:", err.message);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM transactions WHERE id = $1 AND user_id = $2 ",
      [id, req.user.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.status(204).send();
  } catch (err) {
    console.error("DELETE /transactions error:", err.message);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

export default router;

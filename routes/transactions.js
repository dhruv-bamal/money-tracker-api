import pool from "../db.js";
import { Router } from "express";

const router = Router();

const TEMP_USER_ID = "d5dde641-b803-4b8c-94fa-e3a8c9157722";

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
      [TEMP_USER_ID],
    );
    res.status(200).json(result.rows);
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
      .json({ error: "amount, merchant, and date are required fields" });
  }
  if (isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, amount, merchant, date)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [TEMP_USER_ID, amount, merchant, date],
    );
    res.status(201).json(result.rows[0]);
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
      [id, TEMP_USER_ID],
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

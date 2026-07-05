import { Router } from "express";
const router = Router();

const mockTransactions = [
  {
    id: "1",
    user_id: "d5dde641-b803-4b8c-94fa-e3a8c9157722",
    amount: 450,
    merchant: "Swiggy",
    date: "2026-06-01",
  },
  {
    id: "2",
    user_id: "d5dde641-b803-4b8c-94fa-e3a8c9157722",
    amount: 650,
    merchant: "Zomato",
    date: "2026-06-02",
  },
  {
    id: "3",
    user_id: "d5dde641-b803-4b8c-94fa-e3a8c9157722",
    amount: 199,
    merchant: "Netflix",
    date: "2026-06-03",
  },
  {
    id: "4",
    user_id: "d5dde641-b803-4b8c-94fa-e3a8c9157722",
    amount: 250,
    merchant: "Uber",
    date: "2026-06-04",
  },
  {
    id: "5",
    user_id: "d5dde641-b803-4b8c-94fa-e3a8c9157722",
    amount: 1200,
    merchant: "Amazon",
    date: "2026-06-05",
  },
  {
    id: "6",
    user_id: "d5dde641-b803-4b8c-94fa-e3a8c9157722",
    amount: 99,
    merchant: "Spotify",
    date: "2026-06-05",
  },
  {
    id: "7",
    user_id: "d5dde641-b803-4b8c-94fa-e3a8c9157722",
    amount: 500,
    merchant: "Electricity Bill",
    date: "2026-06-08",
  },
  {
    id: "8",
    user_id: "d5dde641-b803-4b8c-94fa-e3a8c9157722",
    amount: 650,
    merchant: "Swiggy",
    date: "2026-06-10",
  },
  {
    id: "9",
    user_id: "d5dde641-b803-4b8c-94fa-e3a8c9157722",
    amount: 199,
    merchant: "Netflix",
    date: "2026-07-03",
  },
  {
    id: "10",
    user_id: "d5dde641-b803-4b8c-94fa-e3a8c9157722",
    amount: 99,
    merchant: "Spotify",
    date: "2026-07-05",
  },
];

router.get("/", (req, res) => {
  res.status(200).json(mockTransactions);
});

router.post("/", (req, res) => {
  const { amount, merchant, date } = req.body;
  console.log("Recevied:", { amount, merchant, date });
  const created = { id: "new-mock-id", amount, merchant, date };
  res.status(201).json(created);
});

router.delete("/:id", (req, res) => {
  console.log("Deleting id:", req.params.id);
  res.status(204).send();
});

export default router;

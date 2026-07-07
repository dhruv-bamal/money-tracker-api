const categoryKeywords = {
  Food: [
    "swiggy",
    "zomato",
    "mcdonalds",
    "kfc",
    "subway",
    "dominos",
    "grubhub",
  ],
  Transport: ["uber", "ola", "lyft", "taxi", "metro", "bus", "train"],
  Subscriptions: [
    "netflix",
    "spotify",
    "hotstar",
    "disney",
    "prime",
    "apple tv",
  ],
  Shopping: ["amazon", "flipkart", "myntra", "ajio", "nykaa", "uniqlo"],
  Bills: [
    "electricity",
    "water",
    "gas",
    "recharge",
    "bill",
    "internet",
    "phone",
  ],
  Other: [],
};

export function categorize(transaction) {
  const merchant = transaction.merchant.toLowerCase();

  const category = Object.keys(categoryKeywords).find((cat) => {
    return categoryKeywords[cat].some((keyword) => merchant.includes(keyword));
  });

  return category || "Other";
}

export function totalByCategory(transactions) {
  const totals = {
    Food: 0,
    Transport: 0,
    Subscriptions: 0,
    Shopping: 0,
    Bills: 0,
    Other: 0,
  };

  for (const transaction of transactions) {
    const category = categorize(transaction);
    console.log(
      transaction.merchant,
      "->",
      category,
      "amount:",
      transaction.amount,
    );
    totals[category] += transaction.amount;
  }

  return totals;
}

export function detectRecurring(transactions) {
  const grouped = transactions.reduce((acc, tx) => {
    const merchant = tx.merchant.toLowerCase();
    if (!acc[merchant]) acc[merchant] = [];
    acc[merchant].push(tx);
    return acc;
  }, {});

  return Object.entries(grouped)
    .filter(([, group]) => {
      if (group.length < 2) return false;

      const amounts = group.map((t) => t.amount);
      const minAmount = Math.min(...amounts);
      const maxAmount = Math.max(...amounts);
      const percentDiff = (maxAmount - minAmount) / minAmount;

      return percentDiff <= 0.1;
    })
    .map(([merchant, group]) => ({
      merchant: merchant,
      amount: group[0].amount,
      count: group.length,
    }));
}

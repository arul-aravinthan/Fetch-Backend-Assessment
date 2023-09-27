const express = require("express");
const app = express();
const port = 8000;
// const bodyParser = require("body-parser");
app.use(express.json());
// app.use(bodyParser.json());
const transactions = [];
const balances = {};
let total = 0;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post("/add", (req, res) => {
  let { payer, points, timestamp } = req.body;
  timestamp = new Date(timestamp);
  transactions.push({ payer, points, timestamp });
  // add points to payer's balance, if payer doesn't exist, create new payer
  balances[payer] = (balances[payer] || 0) + points;
  total += points;
  return res.status(200).json({ message: "Points added successfully" });
});

app.post("/spend", (req, res) => {
  let { points: totalSpend } = req.body;
  if (totalSpend > total) {
    return res.status(400).send("User does not have enough points");
  }
  // sort transactions by timestamp
  transactions.sort((a, b) => a.timestamp - b.timestamp);
  //Keeps track of how much each payer is spending
  const spend = {};
  while (totalSpend > 0) {
    transaction = transactions.shift();
    const { payer, points } = transaction;
    const amount = Math.min(totalSpend, points);
    totalSpend -= amount;
    balances[payer] -= amount;
    total -= amount;

    spend[payer] = (spend[payer] || 0) - amount;
  }
  return res.status(200).send(spend);
});

app.get("/balances", (req, res) => {
  return res.status(200).send(balances);
});

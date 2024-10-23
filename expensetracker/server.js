const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Create a new transaction
app.post('/transactions', (req, res) => {
    const { type, category, amount, date, description } = req.body;
    const sql = `INSERT INTO transactions (type, category, amount, date, description) VALUES (?, ?, ?, ?, ?)`;
    
    db.run(sql, [type, category, amount, date, description], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Retrieve all transactions
app.get('/transactions', (req, res) => {
    const sql = `SELECT * FROM transactions`;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Retrieve a transaction by ID
app.get('/transactions/:id', (req, res) => {
    const sql = `SELECT * FROM transactions WHERE id = ?`;
    
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

// Update a transaction by ID
app.put('/transactions/:id', (req, res) => {
    const { type, category, amount, date, description } = req.body;
    const sql = `UPDATE transactions SET type = ?, category = ?, amount = ?, date = ?, description = ? WHERE id = ?`;
    
    db.run(sql, [type, category, amount, date, description, req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ updatedID: req.params.id });
    });
});

// Delete a transaction by ID
app.delete('/transactions/:id', (req, res) => {
    const sql = `DELETE FROM transactions WHERE id = ?`;
    
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ deletedID: req.params.id });
    });
});

// Retrieve summary
app.get('/summary', (req, res) => {
    const sqlIncome = `SELECT SUM(amount) AS totalIncome FROM transactions WHERE type = 'income'`;
    const sqlExpense = `SELECT SUM(amount) AS totalExpense FROM transactions WHERE type = 'expense'`;

    db.all(sqlIncome, [], (err, incomeRow) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(sqlExpense, [], (err, expenseRow) => {
            if (err) return res.status(500).json({ error: err.message });

            const totalIncome = incomeRow[0].totalIncome || 0;
            const totalExpense = expenseRow[0].totalExpense || 0;
            const balance = totalIncome - totalExpense;

            res.json({ totalIncome, totalExpense, balance });
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

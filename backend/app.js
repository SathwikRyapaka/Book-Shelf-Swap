const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({
        message: "API is running"
    });
});

// Put your existing API routes here.
// For example:
// app.use("/api/books", bookRoutes);
// app.use("/api/auth", authRoutes);

module.exports = app;
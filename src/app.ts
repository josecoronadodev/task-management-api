import express from "express";
import { env } from "./config/env";
import { pool } from "./persistence/database";
import authRoutes from "./api/routes/auth.routes";
import taskRoutes from "./api/routes/task.routes";

const app = express();

app.use(express.json());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

app.get("/", (_req, res) => {
  res.json({
    message: "Task Management API",
  });
});

app.get("/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      database: "disconnected",
    });
  }
});

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});
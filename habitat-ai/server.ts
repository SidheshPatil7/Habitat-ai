import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("health.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    frequency TEXT DEFAULT 'daily',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER,
    status INTEGER DEFAULT 0,
    date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY(habit_id) REFERENCES habits(id)
  );

  CREATE TABLE IF NOT EXISTS health_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT,
    date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default habits if none exist
const habitCount = db.prepare("SELECT count(*) as count FROM habits").get() as { count: number };
if (habitCount.count === 0) {
  const insert = db.prepare("INSERT INTO habits (name, category) VALUES (?, ?)");
  insert.run("Drink Water", "Hydration");
  insert.run("Exercise", "Fitness");
  insert.run("Meditation", "Mental Health");
  insert.run("Read 10 Pages", "Growth");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/habits", (req, res) => {
    const habits = db.prepare(`
      SELECT h.*, 
      (SELECT status FROM habit_logs WHERE habit_id = h.id AND date = CURRENT_DATE) as completed
      FROM habits h
    `).all();
    res.json(habits);
  });

  app.post("/api/habits/log", (req, res) => {
    const { habit_id, status } = req.body;
    const date = new Date().toISOString().split('T')[0];
    
    const existing = db.prepare("SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?").get(habit_id, date);
    
    if (existing) {
      db.prepare("UPDATE habit_logs SET status = ? WHERE id = ?").run(status ? 1 : 0, (existing as any).id);
    } else {
      db.prepare("INSERT INTO habit_logs (habit_id, status, date) VALUES (?, ?, ?)").run(habit_id, status ? 1 : 0, date);
    }
    res.json({ success: true });
  });

  app.get("/api/metrics", (req, res) => {
    const metrics = db.prepare("SELECT * FROM health_metrics ORDER BY date DESC LIMIT 100").all();
    res.json(metrics);
  });

  app.post("/api/metrics", (req, res) => {
    const { type, value, unit } = req.body;
    db.prepare("INSERT INTO health_metrics (type, value, unit) VALUES (?, ?, ?)").run(type, value, unit);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

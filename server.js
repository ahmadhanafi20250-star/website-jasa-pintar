const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

// 🔥 TAMBAHAN INI (MIDTRANS IMPORT)
const Midtrans = require("midtrans-client");

const app = express();

app.use(express.json());
app.use(cors());

// ================= DATABASE =================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "jasapintar"
});

db.connect(err => {
  if (err) {
    console.log("❌ DB error:", err);
  } else {
    console.log("✅ MySQL Connected");
  }
});

// ================= AUTH =================
const ADMIN_USER = "admin";
const ADMIN_PASS = "12345";
const TOKEN = "RAHASIA_ADMIN_TOKEN";

// middleware proteksi
function auth(req, res, next) {
  const token = req.headers["authorization"];
  if (token !== TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

// ================= STATIC FILE =================
app.use(express.static(path.join(__dirname, "public")));

// ================= ROUTE FRONTEND =================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    return res.json({ success: true, token: TOKEN });
  }

  res.json({ success: false });
});

// ================= CREATE ORDER =================
app.post("/order", (req, res) => {
  const { nama, wa, layanan, deskripsi } = req.body;

  if (!nama || !wa) {
    return res.json({ success: false, message: "Data kurang" });
  }

  const sql = "INSERT INTO orders (nama, wa, layanan, deskripsi) VALUES (?,?,?,?)";

  db.query(sql, [nama, wa, layanan, deskripsi], err => {
    if (err) {
      console.log(err);
      return res.json({ success: false });
    }

    res.json({ success: true });
  });
});

// ================= READ ORDER =================
app.get("/orders", auth, (req, res) => {
  db.query("SELECT * FROM orders ORDER BY id DESC", (err, result) => {
    if (err) {
      console.log(err);
      return res.json([]);
    }

    res.json(result);
  });
});

// ================= DELETE =================
app.delete("/delete/:id", auth, (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM orders WHERE id=?", [id], err => {
    if (err) {
      console.log(err);
      return res.json({ success: false });
    }

    res.json({ success: true });
  });
});

// ================= STATS =================
app.get("/stats", auth, (req, res) => {
  db.query("SELECT COUNT(*) as total FROM orders", (err, result) => {
    if (err) return res.json({ total: 0 });
    res.json({ total: result[0].total });
  });
});

// ================= SERVER =================
app.listen(3000, () => {
  console.log("🚀 Server jalan di http://localhost:3000");
});
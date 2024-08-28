const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

dotenv.config();

const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// signup endpoint //

app.post("/signup", (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "all fields are required" });
  }

  const query =
    "INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)";
  db.query(query, [first_name, last_name, email, password], (err) => {
    if (err) {
      console.error(err.message);
      return res
        .status(500)
        .json({ message: "Error creating user", error: err.message });
    }
    res.status(201).json({ message: "User created successfully" });
  });
});

// Login Route

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const query = "SELECT * FROM users WHERE email = ?";
  db.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching user" });
    }

    if (results.length === 0 || results[0].password !== password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "5h",
    });
    res.status(200).json({ token, user });
  });
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.status(401).json({ message: "not logged in" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error(err);
      return res.status(403).json({ error: err.message });
    }
    req.user = user;
    next();
  });
}

app.post("/booking", authenticateToken, (req, res) => {
  const { passenger_name, from_location, to_location } = req.body;
  const user_id = req.user.id;

  if (!passenger_name || !from_location || !to_location) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const query =
    "INSERT INTO bookings (user_id, passenger_name, from_location, to_location) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [user_id, passenger_name, from_location, to_location],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Error creating booking" });
      }
      res.status(201).json({ message: "Booking created successfully" });
    }
  );
});

// Delete Booking Route
app.delete("/booking/:id", authenticateToken, (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user.id;

  console.log(bookingId, userId);

  // Check if the booking exists and if the user owns it
  const query = "SELECT * FROM bookings WHERE id = ? AND user_id = ?";
  db.query(query, [bookingId, userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Error fetching booking" });
    }

    if (results.length === 0) {
      return res
        .status(403)
        .json({ error: "You are not authorized to delete this booking" });
    }

    // Proceed to delete the booking
    const deleteQuery = "DELETE FROM bookings WHERE id = ?";
    db.query(deleteQuery, [bookingId], (err) => {
      if (err) {
        return res.status(500).json({ error: "Error deleting booking" });
      }
      res.status(200).json({ message: "Booking deleted successfully" });
    });
  });
});

// Get All Bookings Route
app.get('/bookings', (req, res) => {
  const query = 'SELECT * FROM bookings';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching bookings' });
    }
    res.status(200).json(results);
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

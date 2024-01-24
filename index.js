const GymMember = require("./models/GymMemberModel");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

const mongoURI =
  "mongodb+srv://shejaemeric051:dKEP7xOAaDi1QGAW@project.yjqodfk.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

db.once("open", () => {
  console.log("Connected to MongoDB Atlas");
});

app.post("/api/register", async (req, res) => {
  try {
    const { name, password, email, workoutTime } = req.body;

    const existingMember = await GymMember.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ error: "Email already taken" });
    }

    const newMember = new GymMember({
      name,
      email,
      password,
      workoutTime,
    });

    const savedMember = await newMember.save();

    res.status(201).json({
      message: "Registration successful",
      memberId: savedMember._id,
      member: savedMember,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/members", async (req, res) => {
  try {
    const members = await GymMember.find({}, { password: 0 });
    res.status(200).json({ members });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/api/members/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const member = await GymMember.findById(id);

    if (!member) {
      return res.status(404).json({ error: "Gym Member not found" });
    }

    const { _id, name, email, workoutTime } = member;

    res.status(200).json({ member: { _id, name, email, workoutTime } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await GymMember.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!(password === user.password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.status(200).json({ token, userId: user._id, user: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/api/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { newData } = req.body;
    await GymMember.findByIdAndUpdate(id, newData);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await GymMember.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;


const express = require('express');
const mongoose = require('mongoose');
const Notes = require("../models/notes");
const routerNotes = express.Router();

// Create
routerNotes.post("/", async (req, res) => {
  try {
    const newCourse = await Notes.create(req.body);
    return res.status(201).json(newCourse);
  } catch (error) {
    return res.status(500).json({ error: "Could not create course" });
  }
});

// Read all
routerNotes.get("/", async (req, res) => {
  try {
    const courses = await Notes.find();
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ error: "Could not retrieve courses" });
  }
});

// Read by ID
routerNotes.get("/:id", async (req, res) => {
  try {
    const course = await Notes.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ error: "Could not retrieve course" });
  }
});

// Update
routerNotes.put("/:id", async (req, res) => {
  try {
    const updatedCourse = await Notes.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.status(200).json(updatedCourse);
  } catch (error) {
    return res.status(500).json({ error: "Could not update course" });
  }
});

// Delete
routerNotes.delete("/:id", async (req, res) => {
  try {
    const deletedCourse = await Notes.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ error: "Could not delete course" });
  }
});
routerNotes.delete("/", async (req, res) => {
  try {
    await Notes.deleteMany({});
    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ error: "Could not delete courses" });
  }
});
// Delete notes by userId
routerNotes.delete("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId parameter" });
    }

    // Assuming your Notes model has a field called "userId" to identify user's notes
    const deletedNotes = await Notes.deleteMany({ userID: userId });
    if (!deletedNotes) {
      return res.status(404).json({ error: "Notes not found for the user" });
    }

    // Assuming you want to send a response indicating successful deletion
    return res.status(200).json({ message: "User's notes deleted successfully" });
  } catch (error) {
    console.error("Error deleting user's notes:", error);
    return res.status(500).json({ error: "Could not delete user's notes" });
  }
});
module.exports = routerNotes;
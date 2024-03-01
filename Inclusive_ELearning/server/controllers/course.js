// controllers/coursesController.js

const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Course = require("../models/courses");

// Create
router.post("/", async (req, res) => {
  try {
    const newCourse = await Course.create(req.body);
    return res.status(201).json(newCourse);
  } catch (error) {
    return res.status(500).json({ error: "Could not create course" });
  }
});

// Read all
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    return res.status(200).json(courses);
  } catch (error) {
    return res.status(500).json({ error: "Could not retrieve courses" });
  }
});

// Read by ID
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.status(200).json(course);
  } catch (error) {
    return res.status(500).json({ error: "Could not retrieve course" });
  }
});
router.delete("/", async (req, res) => {
  try {
    await Course.deleteMany({});
    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ error: "Could not delete courses" });
  }
});
// Update

router.patch("/:id", async (req, res) => {
  try {
    const courseId = req.params.id; // Lấy id từ URL
    const course = await Course.findById(courseId); // Tìm khóa học dựa trên id
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    
    // Tăng giá trị duration lên 1
    course.duration += 1;

    // Lưu lại khóa học đã cập nhật
    const updatedCourse = await course.save();

    return res.status(200).json(updatedCourse);
  } catch (error) {
    return res.status(500).json({ error: "Could not update course" });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
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
router.delete("/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ error: "Course not found" });
    }
    return res.status(204).json();
  } catch (error) {
    return res.status(500).json({ error: "Could not delete course" });
  }
});


module.exports = router;
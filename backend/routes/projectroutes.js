const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const protect = require('../middleware/auth');

// Create a project
router.post('/', protect, async (req, res) => {
  try {
    const existing = await Project.findOne({ user: req.user._id, name: req.body.name });
    if (existing) {
      return res.status(400).json({ message: 'Project name already exists' });
    }

    const project = await Project.create({
      user: req.user._id,
      name: req.body.name,
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all projects
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete project
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

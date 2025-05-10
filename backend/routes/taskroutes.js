const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const Task = require('../models/Task');

console.log('Registering /tasks POST');
// Create Task
router.post('/', protect, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body, // must include project, title, etc.
      user: req.user._id // Add the user ID from the auth middleware
    });
    res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ message: error.message });
  }
});

console.log('Registering /tasks GET for project');
// Get all tasks for a project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId, user: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

console.log('Registering /tasks PUT');
// Update Task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

console.log('Registering /tasks DELETE');
// Delete Task
router.delete('/:id', protect, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

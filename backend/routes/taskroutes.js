const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const protect = require('../middleware/auth');

// Get all tasks for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', protect, async (req, res) => {
  try {
    // Verify project belongs to user
    const project = await Project.findOne({ 
      _id: req.body.project, 
      user: req.user._id 
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = new Task({
      ...req.body,
      user: req.user._id
    });
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If project is being changed, verify new project belongs to user
    if (req.body.project && req.body.project !== task.project.toString()) {
      const project = await Project.findOne({ 
        _id: req.body.project, 
        user: req.user._id 
      });
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
    }

    const update = { ...req.body };
    if (req.body.status === 'completed') {
      update.completedAt = new Date();
    } else if (req.body.status && req.body.status !== 'completed') {
      update.completedAt = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

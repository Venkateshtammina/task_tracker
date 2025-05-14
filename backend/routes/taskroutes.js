const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const protect = require('../middleware/auth');

// Get all tasks for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = { user: req.user._id };
    
    if (projectId) {
      // Verify project belongs to user
      const project = await Project.findOne({ 
        _id: projectId, 
        user: req.user._id 
      });
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      query.project = projectId;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', protect, async (req, res) => {
  try {
    const { title, description, project, priority, status } = req.body;

    // Verify project belongs to user
    const projectExists = await Project.findOne({ 
      _id: project, 
      user: req.user._id 
    });
    
    if (!projectExists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check for duplicate task title in the same project
    const existingTask = await Task.findOne({
      title: title.trim(),
      project,
      user: req.user._id
    });

    if (existingTask) {
      return res.status(400).json({ message: 'A task with this title already exists in this project' });
    }

    const task = new Task({
      title: title.trim(),
      description: description?.trim(),
      project,
      priority: priority || 'medium',
      status: status || 'pending',
      user: req.user._id
    });

    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
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

    // Check for duplicate task title if title is being changed
    if (req.body.title && req.body.title !== task.title) {
      const existingTask = await Task.findOne({
        title: req.body.title.trim(),
        project: req.body.project || task.project,
        user: req.user._id,
        _id: { $ne: req.params.id }
      });

      if (existingTask) {
        return res.status(400).json({ message: 'A task with this title already exists in this project' });
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
    console.error('Error updating task:', error);
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
    console.error('Error deleting task:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

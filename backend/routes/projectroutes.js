const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const protect = require('../middleware/auth');

// Get all projects for the logged-in user
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a project
router.post('/', protect, async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check for duplicate project name
    const existing = await Project.findOne({ 
      user: req.user._id, 
      name: name.trim() 
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Project name already exists' });
    }

    const project = await Project.create({
      user: req.user._id,
      name: name.trim(),
      description: description?.trim()
    });
    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update a project
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if new name conflicts with existing project
    if (req.body.name && req.body.name.trim() !== project.name) {
      const existing = await Project.findOne({ 
        user: req.user._id, 
        name: req.body.name.trim(),
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({ message: 'Project name already exists' });
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name?.trim(),
        description: req.body.description?.trim()
      },
      { new: true }
    );
    res.json(updatedProject);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete a project and its tasks
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete all tasks associated with this project
    await Task.deleteMany({ 
      project: req.params.id,
      user: req.user._id 
    });
    
    // Delete the project
    await project.deleteOne();
    
    res.json({ message: 'Project and associated tasks deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

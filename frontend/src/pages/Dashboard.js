import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { useActivity } from '../context/ActivityContext';
import '../styles/dashboard.css';
import { Box, Card, CardContent, Typography, Button, TextField, Grid, Paper, Select, MenuItem, Snackbar, Alert, Avatar, IconButton, Switch, Menu, Accordion, AccordionSummary, AccordionDetails, Chip, Divider, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';
import { LinearProgress } from '@mui/material';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { projects, createProject, deleteProject } = useProjects();
  const { tasks, createTask, updateTask, deleteTask, fetchTasks } = useTasks();
  const { fetchActivitySummary } = useActivity();
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium'
  });
  const [projectSearch, setProjectSearch] = useState('');
  const [taskSearch, setTaskSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [darkMode, setDarkMode] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState({ _id: '', title: '', description: '', priority: 'medium', status: 'pending', project: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#f50057' },
    },
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Fetch all tasks for all projects on dashboard load
    if (projects.length > 0) {
      projects.forEach(project => {
        fetchTasks(project._id);
      });
    }
  }, [projects]);

  const handleLogout = () => {
    setShowUserDetails(false);
    logout();
    navigate('/login');
  };

  const toggleUserDetails = () => {
    setShowUserDetails(!showUserDetails);
  };

  const handleNavigation = (path) => {
    setShowUserDetails(false);
    navigate(path);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      await createProject(newProjectName);
      await fetchActivitySummary();
      setNewProjectName('');
      showSnackbar('Project created!', 'success');
    }
  };

  const handleDeleteProject = async (projectId) => {
    setItemToDelete(projectId);
    setDeleteType('project');
    setDeleteConfirmOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (selectedProject && newTask.title.trim()) {
      await createTask({
        ...newTask,
        priority: newTask.priority || 'medium',
        projectId: selectedProject._id
      });
      await fetchActivitySummary();
      setNewTask({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium'
      });
      showSnackbar('Task created!', 'success');
      fetchTasks(selectedProject._id);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    if (!selectedProject) return;
    await updateTask(taskId, { status: newStatus }, selectedProject._id);
    await fetchActivitySummary();
    showSnackbar('Task status updated!', 'info');
  };

  const handleDeleteTask = async (taskId) => {
    setItemToDelete(taskId);
    setDeleteType('task');
    setDeleteConfirmOpen(true);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEditTaskOpen = (task) => {
    setEditTaskData({
      _id: task._id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      project: task.project
    });
    setEditDialogOpen(true);
  };

  const handleEditTaskClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditTaskChange = (e) => {
    setEditTaskData({ ...editTaskData, [e.target.name]: e.target.value });
  };

  const handleEditTaskSubmit = async () => {
    await updateTask(editTaskData._id, {
      title: editTaskData.title,
      description: editTaskData.description,
      priority: editTaskData.priority,
      status: editTaskData.status,
      project: editTaskData.project
    }, editTaskData.project);
    await fetchActivitySummary();
    setEditDialogOpen(false);
    showSnackbar('Task updated!', 'success');
  };

  const handleError = (error) => {
    setError(error.response?.data?.message || 'An error occurred');
    setTimeout(() => setError(null), 5000);
  };

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    try {
      if (deleteType === 'task') {
        await deleteTask(itemToDelete, /* optionally pass projectId if needed */);
        await fetchActivitySummary();
        showSnackbar('Task deleted!', 'info');
      } else {
        await deleteProject(itemToDelete);
        await fetchActivitySummary();
        showSnackbar('Project deleted!', 'info');
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
      setDeleteType('');
    }
  };

  const handleSelectProject = (project) => {
    setSelectedProject(project);
    fetchTasks(project._id);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          background: darkMode ? 'linear-gradient(135deg, #232526 0%, #414345 100%)' : 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 6,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', px: 4, mb: 2 }}>
          <IconButton onClick={handleMenu} size="large">
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              {user?.name ? getInitials(user.name) : 'U'}
            </Avatar>
          </IconButton>
        </Box>
        {/* Welcome Banner */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={700} color="primary.main" gutterBottom>
            Welcome, {user?.name?.split(' ')[0] || 'User'}!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your projects and tasks efficiently.
          </Typography>
        </Box>
        <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: 1200, width: '100%' }}>
          {/* Project Creation Panel */}
          <Grid item xs={12} md={3}>
            <Paper elevation={4} sx={{ p: 4, borderRadius: 4, textAlign: 'center', minHeight: 350 }}>
              <AddCircleOutlineIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 2 }}>Create Project</Typography>
              <form onSubmit={handleCreateProject} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <TextField
                  label="New project name"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  size="small"
                  fullWidth
                />
                <Button type="submit" variant="contained" color="primary">Create</Button>
              </form>
            </Paper>
          </Grid>
          {/* Projects List */}
          <Grid item xs={12} md={7}>
            <Box>
              {!selectedProject ? (
                <>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Projects</Typography>
                  <TextField
                    label="Search projects"
                    value={projectSearch}
                    onChange={e => setProjectSearch(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ mb: 3 }}
                  />
                  {projects.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <FolderOpenIcon color="disabled" sx={{ fontSize: 64, mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No projects yet. Start by creating one!
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {projects
                        .filter(project => project.name.toLowerCase().includes(projectSearch.toLowerCase()))
                        .map(project => (
                          <Card key={project._id} sx={{ cursor: 'pointer', boxShadow: 3, width: '100%' }} onClick={() => handleSelectProject(project)}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, position: 'relative' }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>{project.name[0].toUpperCase()}</Avatar>
                                <Typography variant="h6">{project.name}</Typography>
                                <IconButton
                                  size="small"
                                  color="error"
                                  sx={{ position: 'absolute', top: 8, right: 8 }}
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteProject(project._id);
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{project.description}</Typography>
                            </CardContent>
                          </Card>
                        ))}
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <Button onClick={handleBackToProjects} sx={{ mb: 2 }} variant="outlined">Back to Projects</Button>
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>{selectedProject.name}</Typography>
                  {/* Task Creation for selected project */}
                  <form onSubmit={handleCreateTask} style={{ marginBottom: 16 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                      <TextField
                        label="Task title"
                        value={newTask.title}
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        size="small"
                        fullWidth
                      />
                      <Select
                        value={newTask.priority}
                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                        size="small"
                        sx={{ minWidth: 140 }}
                      >
                        <MenuItem value="low">Low Priority</MenuItem>
                        <MenuItem value="medium">Medium Priority</MenuItem>
                        <MenuItem value="high">High Priority</MenuItem>
                      </Select>
                    </Box>
                    <TextField
                      label="Task description"
                      value={newTask.description}
                      onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                      multiline
                      minRows={2}
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <Button type="submit" variant="contained" color="primary">Add Task</Button>
                  </form>
                  <Divider sx={{ my: 2 }} />
                  {/* Tasks for selected project */}
                  <TextField
                    label="Search tasks"
                    value={taskSearch}
                    onChange={e => setTaskSearch(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  {tasks.filter(task => task.project === selectedProject._id).length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AssignmentTurnedInIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No tasks for this project yet.
                      </Typography>
                    </Box>
                  ) : (
                    tasks
                      .filter(task => task.project === selectedProject._id)
                      .filter(task =>
                        (task.title?.toLowerCase().includes(taskSearch.toLowerCase()) ||
                          task.description?.toLowerCase().includes(taskSearch.toLowerCase()))
                      )
                      .map(task => (
                        <Card key={task._id} sx={{ mb: 2, boxShadow: 1, borderRadius: 2 }}>
                          <CardContent>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1" fontWeight={600}>{task.title}</Typography>
                                <Typography
                                  variant="body2"
                                  color={
                                    task.priority === 'high' ? 'error' :
                                    task.priority === 'medium' ? 'primary' :
                                    'text.secondary'
                                  }
                                  sx={{ ml: 1, fontWeight: 600 }}
                                >
                                  {task.priority === 'low' && 'Low Priority'}
                                  {task.priority === 'medium' && 'Medium Priority'}
                                  {task.priority === 'high' && 'High Priority'}
                                  {!task.priority && 'No Priority'}
                                </Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}
                              </Typography>
                              {task.completedAt && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Completed:</strong> {new Date(task.completedAt).toLocaleString()}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                              <Chip label={task.status} color={task.status === 'completed' ? 'success' : 'warning'} size="small" />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'center' }}>
                              <Select
                                value={task.status}
                                onChange={async (e) => {
                                  await handleTaskStatusChange(task._id, e.target.value);
                                  fetchTasks(selectedProject._id);
                                }}
                                size="small"
                                sx={{ minWidth: 140 }}
                              >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="in-progress">In Progress</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                              </Select>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleDeleteTask(task._id)}
                              >
                                Delete
                              </Button>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                sx={{ ml: 1 }}
                                onClick={() => handleEditTaskOpen(task)}
                              >
                                <EditIcon fontSize="small" />
                                Edit
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </>
              )}
            </Box>
          </Grid>
        </Grid>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!error}
          autoHideDuration={5000}
          onClose={() => setError(null)}
        >
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
        <Dialog open={editDialogOpen} onClose={handleEditTaskClose}>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogContent sx={{ minWidth: 350 }}>
            <TextField
              margin="dense"
              label="Title"
              name="title"
              value={editTaskData.title}
              onChange={handleEditTaskChange}
              fullWidth
            />
            <TextField
              margin="dense"
              label="Description"
              name="description"
              value={editTaskData.description}
              onChange={handleEditTaskChange}
              fullWidth
              multiline
              minRows={2}
            />
            <Select
              label="Priority"
              name="priority"
              value={editTaskData.priority}
              onChange={handleEditTaskChange}
              fullWidth
              sx={{ mt: 2 }}
            >
              <MenuItem value="low">Low Priority</MenuItem>
              <MenuItem value="medium">Medium Priority</MenuItem>
              <MenuItem value="high">High Priority</MenuItem>
            </Select>
            <Select
              label="Status"
              name="status"
              value={editTaskData.status}
              onChange={handleEditTaskChange}
              fullWidth
              sx={{ mt: 2 }}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditTaskClose}>Cancel</Button>
            <Button onClick={handleEditTaskSubmit} variant="contained">Save</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this {deleteType}? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
        {isLoading && (
          <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
            <LinearProgress />
          </Box>
        )}
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => { handleCloseMenu(); navigate('/profile'); }}>
            <AccountCircleIcon fontSize="small" sx={{ mr: 1 }} />
            Profile
          </MenuItem>
          <MenuItem onClick={() => { handleCloseMenu(); navigate('/settings'); }}>
            <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
            Settings
          </MenuItem>
          <MenuItem onClick={() => { handleCloseMenu(); handleLogout(); }}>
            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;

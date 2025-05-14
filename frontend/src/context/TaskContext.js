import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();

  // Clear tasks when user changes
  useEffect(() => {
    if (!user) {
      setTasks([]);
    }
  }, [user]);

  const fetchTasks = async (projectId) => {
    if (!user || !projectId) return;
    try {
      const response = await API.get(`/tasks?projectId=${projectId}&userId=${user._id}`);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  };

  const createTask = async (taskData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      const response = await API.post('/tasks', { ...taskData, userId: user._id });
      setTasks(prevTasks => [...prevTasks, response.data]);
      return { success: true };
    } catch (error) {
      console.error('Error creating task:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create task' 
      };
    }
  };

  const updateTask = async (taskId, updates, projectId) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      const response = await API.put(`/tasks/${taskId}`, { 
        ...updates, 
        projectId,
        userId: user._id 
      });
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? response.data : task
        )
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating task:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update task' 
      };
    }
  };

  const deleteTask = async (taskId, projectId) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      await API.delete(`/tasks/${taskId}?projectId=${projectId}&userId=${user._id}`);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      return { success: true };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete task' 
      };
    }
  };

  // Only fetch tasks if a token is present (optional, for consistency)
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (token && projectId) {
  //     fetchTasks(projectId);
  //   }
  // }, [projectId]);

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      fetchTasks, 
      createTask, 
      updateTask, 
      deleteTask 
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);

import { createContext, useContext, useState } from 'react';
import API from '../services/api';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async (projectId) => {
    const res = await API.get(`/tasks/project/${projectId}`);
    setTasks(res.data);
  };

  const createTask = async (task) => {
    try {
      const formattedTask = {
        ...task,
        project: task.projectId,
        status: task.status || 'pending'
      };
      delete formattedTask.projectId;
      await API.post('/tasks', formattedTask);
      await fetchTasks(formattedTask.project);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create task');
    }
  };

  const updateTask = async (id, data, projectId) => {
    await API.put(`/tasks/${id}`, data);
    await fetchTasks(projectId);
  };

  const deleteTask = async (id, projectId) => {
    await API.delete(`/tasks/${id}`);
    await fetchTasks(projectId);
  };

  // Only fetch tasks if a token is present (optional, for consistency)
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (token && projectId) {
  //     fetchTasks(projectId);
  //   }
  // }, [projectId]);

  return (
    <TaskContext.Provider value={{ tasks, fetchTasks, createTask, updateTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);

import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from './AuthContext';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const { user } = useAuth();

  // Clear projects when user changes
  useEffect(() => {
    if (!user) {
      setProjects([]);
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    try {
      const response = await API.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  };

  const createProject = async (name) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      const response = await API.post('/projects', { name });
      setProjects(prevProjects => [...prevProjects, response.data]);
      return { success: true };
    } catch (error) {
      console.error('Error creating project:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create project' 
      };
    }
  };

  const updateProject = async (id, data) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      const response = await API.put(`/projects/${id}`, data);
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project._id === id ? response.data : project
        )
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating project:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update project' 
      };
    }
  };

  const deleteProject = async (id) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      await API.delete(`/projects/${id}`);
      setProjects(prevProjects => prevProjects.filter(project => project._id !== id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete project' 
      };
    }
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      fetchProjects, 
      createProject, 
      updateProject, 
      deleteProject 
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);

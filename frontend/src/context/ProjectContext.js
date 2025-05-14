import { createContext, useContext, useState } from 'react';
import API from '../services/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);

  const fetchProjects = async (userId) => {
    try {
      const response = await API.get(`/projects?userId=${userId}`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }
  };

  const createProject = async (name, userId) => {
    try {
      const response = await API.post('/projects', { name, userId });
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

  const updateProject = async (id, data, userId) => {
    try {
      const response = await API.put(`/projects/${id}`, { ...data, userId });
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

  const deleteProject = async (id, userId) => {
    try {
      await API.delete(`/projects/${id}?userId=${userId}`);
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

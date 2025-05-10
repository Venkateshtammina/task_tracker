import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchProjects = async () => {
    const res = await API.get('/projects');
    setProjects(res.data);
  };

  const createProject = async (name) => {
    try {
      await API.post('/projects', { name });
      await fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create project');
    }
  };

  const deleteProject = async (projectId) => {
    try {
      await API.delete(`/projects/${projectId}`);
      await fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete project');
    }
  };

  const selectProject = (project) => {
    setSelectedProject(project);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchProjects();
    }
  }, []);

  return (
    <ProjectContext.Provider value={{ projects, createProject, deleteProject, selectedProject, selectProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => useContext(ProjectContext);

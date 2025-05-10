import { createContext, useContext, useState } from 'react';
import API from '../services/api';

const ActivityContext = createContext();

export const ActivityProvider = ({ children }) => {
  const [summary, setSummary] = useState(null);

  const fetchActivitySummary = async () => {
    try {
      const res = await API.get('/auth/activity-summary');
      console.log('Fetched activity summary:', res.data);
      setSummary(res.data);
    } catch (error) {
      setSummary(null);
      console.error('Failed to fetch activity summary:', error);
    }
  };

  return (
    <ActivityContext.Provider value={{ summary, fetchActivitySummary }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => useContext(ActivityContext); 
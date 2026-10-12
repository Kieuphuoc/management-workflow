'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { INITIAL_JOBS, JobItem } from '../data/mockJmsData';

interface JobsContextType {
  jobs: JobItem[];
  selectedJob: JobItem;
  setSelectedJob: (job: JobItem) => void;
  addJob: (newJob: JobItem) => void;
  updateJob: (updatedJob: JobItem) => void;
  findJobById: (id: string) => JobItem | undefined;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<JobItem[]>(INITIAL_JOBS);
  const [selectedJob, setSelectedJob] = useState<JobItem>(INITIAL_JOBS[0]);

  const addJob = (newJob: JobItem) => {
    setJobs(prev => [newJob, ...prev]);
    setSelectedJob(newJob);
  };

  const updateJob = (updatedJob: JobItem) => {
    setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
    if (selectedJob.id === updatedJob.id) {
      setSelectedJob(updatedJob);
    }
  };

  const findJobById = (idOrCode: string) => {
    return jobs.find(j => j.id === idOrCode || j.jobCode === idOrCode);
  };

  return (
    <JobsContext.Provider
      value={{
        jobs,
        selectedJob,
        setSelectedJob,
        addJob,
        updateJob,
        findJobById,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
}

export function useJobs() {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
}

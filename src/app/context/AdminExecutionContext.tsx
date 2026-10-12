'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  TaskDeclarationItem, SystemAuditLogItem,
  INITIAL_DECLARATION_TASKS, INITIAL_SYSTEM_AUDIT_LOGS
} from '../data/mockAdminExecutionData';

export interface WorkingEntity {
  code: string;
  name: string;
  shortName: string;
  isArito?: boolean;
}

export const WORKING_ENTITIES: WorkingEntity[] = [
  {
    code: 'CTY CP Công nghệ Arito Demo',
    name: 'ARITO - CTY CP Công nghệ Arito Demo',
    shortName: 'Arito Enterprise',
    isArito: true,
  },
  {
    code: 'ARITO-VN',
    name: 'ARITO-VN (Arito Communications)',
    shortName: 'ARITO-VN',
  },
  {
    code: 'DELTA',
    name: 'DELTA (Arito Group)',
    shortName: 'DELTA',
  },
  {
    code: 'BIZ-EYES',
    name: 'BIZ-EYES (Arito Group)',
    shortName: 'BIZ-EYES',
  },
];

interface AdminExecutionContextType {
  tasks: TaskDeclarationItem[];
  logs: SystemAuditLogItem[];
  selectedEntity: string;
  setSelectedEntity: (code: string) => void;
  notificationToast: string | null;
  showToast: (msg: string) => void;
  handleAddTask: (newTask: TaskDeclarationItem) => void;
  handleUpdateTask: (task: TaskDeclarationItem) => void;
  handleDeleteTasks: (ids: string[]) => void;
  handleToggleTaskStatus: (id: string) => void;
}

const AdminExecutionContext = createContext<AdminExecutionContextType | undefined>(undefined);

export function AdminExecutionProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<TaskDeclarationItem[]>(INITIAL_DECLARATION_TASKS);
  const [logs] = useState<SystemAuditLogItem[]>(() => INITIAL_SYSTEM_AUDIT_LOGS.map(log => ({
    ...log,
    eventKey: log.eventKey ?? `${log.subsystem}:${log.screenCode}:${log.actionName}`,
  })));
  const [selectedEntity, setSelectedEntity] = useState<string>('CTY CP Công nghệ Arito Demo');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  const handleAddTask = (newTask: TaskDeclarationItem) => {
    setTasks(prev => [...prev, newTask]);
  };

  const handleUpdateTask = (task: TaskDeclarationItem) => {
    setTasks(prev => prev.map(item => item.id === task.id ? task : item));
  };

  const handleDeleteTasks = (ids: string[]) => {
    setTasks(prev => prev.filter(t => !ids.includes(t.id)));
  };

  const handleToggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'active' ? 'inactive' : 'active' };
      }
      return t;
    }));
  };


  return (
    <AdminExecutionContext.Provider
      value={{
        tasks,
        logs,
        selectedEntity,
        setSelectedEntity,
        notificationToast,
        showToast,
        handleAddTask,
        handleUpdateTask,
        handleDeleteTasks,
        handleToggleTaskStatus,
      }}
    >
      {children}
    </AdminExecutionContext.Provider>
  );
}

export function useAdminExecution() {
  const context = useContext(AdminExecutionContext);
  if (!context) {
    throw new Error('useAdminExecution must be used within an AdminExecutionProvider');
  }
  return context;
}

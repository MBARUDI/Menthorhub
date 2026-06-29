import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { TaskProvider } from './ListaDeTarefas/context/TaskContext';
import { AuthProvider } from './ListaDeTarefas/context/AuthContext';
import App from './ListaDeTarefas/App';
import './ListaDeTarefas/index.css';

export default function ListaTarefasModule() {
  return (
    <div className="w-full h-full relative flex flex-col" style={{ minHeight: '100%' }}>
      <MemoryRouter>
        <AuthProvider>
          <TaskProvider>
            <App />
          </TaskProvider>
        </AuthProvider>
      </MemoryRouter>
    </div>
  );
}

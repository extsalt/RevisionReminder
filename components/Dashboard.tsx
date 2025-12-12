import React from 'react';
import { TaskList } from '../types';
import { Button } from './Button';
import { Plus, Calendar, ChevronRight } from 'lucide-react';

interface DashboardProps {
  lists: TaskList[];
  onCreateClick: () => void;
  onListClick: (list: TaskList) => void;
  loading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  lists, 
  onCreateClick, 
  onListClick, 
  loading
}) => {
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(timestamp));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
                QuickList
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Your Lists</h2>
          <Button onClick={onCreateClick} icon={<Plus size={18} />}>
            New List
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : lists.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-dashed border-slate-300">
            <div className="mx-auto h-12 w-12 text-slate-400">
              <Plus size={48} />
            </div>
            <h3 className="mt-2 text-sm font-medium text-slate-900">No lists yet</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new task list.</p>
            <div className="mt-6">
              <Button onClick={onCreateClick}>Create List</Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => {
              const completedCount = list.tasks.filter(t => t.completed).length;
              const totalCount = list.tasks.length;
              const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

              return (
                <div 
                  key={list.id} 
                  onClick={() => onListClick(list)}
                  className="bg-white overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-slate-100 group"
                >
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-slate-900 truncate pr-4">{list.name}</h3>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    
                    <div className="flex items-center text-xs text-slate-500 mb-4">
                      <Calendar size={12} className="mr-1" />
                      {formatDate(list.createdAt)}
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 mb-2">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{completedCount} of {totalCount} completed</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
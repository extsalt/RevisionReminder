import React, { useState, useEffect } from 'react';
import { TaskList, Task } from '../types';
import { Button } from './Button';
import { ArrowLeft, Copy, Trash2, CheckCircle, Circle, Save } from 'lucide-react';

interface ActiveListProps {
  list: TaskList;
  onBack: () => void;
  onUpdate: (updatedTasks: Task[]) => Promise<void>;
  onDuplicate: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export const ActiveList: React.FC<ActiveListProps> = ({ 
  list, 
  onBack, 
  onUpdate,
  onDuplicate,
  onDelete
}) => {
  const [tasks, setTasks] = useState<Task[]>(list.tasks);
  const [isSaving, setIsSaving] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTasks(list.tasks);
    setHasChanges(false);
  }, [list]);

  const toggleTask = (taskId: string) => {
    const newTasks = tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(newTasks);
    setHasChanges(true);
    
    // Auto-save logic could go here, but manual save is safer for avoiding excessive writes in this demo
    // However, for UX, let's auto-save after a debounce or immediately for simplicity
    saveChanges(newTasks); 
  };

  const saveChanges = async (currentTasks: Task[]) => {
    setIsSaving(true);
    try {
      await onUpdate(currentTasks);
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicate = async () => {
    if (!window.confirm("Create a fresh copy of this list?")) return;
    setIsDuplicating(true);
    try {
      await onDuplicate();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this list? This cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await onDelete();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  const progress = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={20} className="mr-1" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-2">
               <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleDuplicate}
                isLoading={isDuplicating}
                icon={<Copy size={16} />}
                className="hidden sm:flex"
              >
                Duplicate
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={handleDelete}
                isLoading={isDeleting}
                icon={<Trash2 size={16} />}
                className="ml-2"
              >
                Delete
              </Button>
            </div>
          </div>
          
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-slate-900">{list.name}</h1>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
              <span>{new Date(list.createdAt).toLocaleDateString()}</span>
              <span>{progress}% Complete</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
               <div 
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                ></div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No tasks in this list.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <li 
                  key={task.id} 
                  className={`group flex items-center p-4 hover:bg-slate-50 transition-colors cursor-pointer ${task.completed ? 'bg-slate-50/50' : ''}`}
                  onClick={() => toggleTask(task.id)}
                >
                  <div className={`flex-shrink-0 mr-4 ${task.completed ? 'text-green-500' : 'text-slate-300 group-hover:text-indigo-500'}`}>
                    {task.completed ? <CheckCircle size={24} className="fill-current" /> : <Circle size={24} />}
                  </div>
                  <span className={`flex-1 text-lg ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.text}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Mobile Duplicate Button (Sticky Bottom) */}
        <div className="sm:hidden fixed bottom-6 right-6">
           <button 
             onClick={handleDuplicate}
             className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
           >
             <Copy size={24} />
           </button>
        </div>
      </main>
    </div>
  );
};
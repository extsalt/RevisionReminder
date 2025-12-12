import React, { useState, useEffect, useRef } from 'react';
import { TaskList, Task } from '../types';
import { Button } from './Button';
import { ArrowLeft, Copy, Trash2, CheckCircle, Circle, Plus, Edit2, X, Check, ListPlus } from 'lucide-react';

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
  
  // Edit & Add State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  
  // Inline Insert State
  const [insertingAfterId, setInsertingAfterId] = useState<string | null>(null);
  const [insertValue, setInsertValue] = useState('');

  // Ref for focus management
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTasks(list.tasks);
  }, [list]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const saveChanges = async (currentTasks: Task[]) => {
    setIsSaving(true);
    try {
      await onUpdate(currentTasks);
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTask = (taskId: string) => {
    if (editingId === taskId) return; // Don't toggle while editing
    
    const newTasks = tasks.map(t => 
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(newTasks);
    saveChanges(newTasks); 
  };

  // --- Item Management ---

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemValue.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newItemValue.trim(),
      completed: false
    };

    const newTasks = [...tasks, newTask];
    setTasks(newTasks);
    setNewItemValue('');
    saveChanges(newTasks);
  };

  const handleInsertBelow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!insertValue.trim() || !insertingAfterId) return;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: insertValue.trim(),
      completed: false
    };

    const index = tasks.findIndex(t => t.id === insertingAfterId);
    if (index === -1) return;

    const newTasks = [...tasks];
    newTasks.splice(index + 1, 0, newTask);
    
    setTasks(newTasks);
    setInsertValue('');
    setInsertingAfterId(null);
    saveChanges(newTasks);
  };

  const startInserting = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    setInsertingAfterId(taskId);
    setInsertValue('');
    // Cancel other modes
    setEditingId(null);
  };

  const startEditing = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setEditingId(task.id);
    setEditValue(task.text);
    // Cancel other modes
    setInsertingAfterId(null);
  };

  const saveEdit = (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!editValue.trim()) return;

    const newTasks = tasks.map(t => 
      t.id === editingId ? { ...t, text: editValue.trim() } : t
    );
    
    setTasks(newTasks);
    setEditingId(null);
    setEditValue('');
    saveChanges(newTasks);
  };

  const cancelEdit = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
    setEditValue('');
  };

  const handleDeleteItem = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (!window.confirm("Remove this item?")) return;
    
    const newTasks = tasks.filter(t => t.id !== taskId);
    setTasks(newTasks);
    saveChanges(newTasks);
  };

  // --- List Management ---

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

  const handleDeleteList = async () => {
    if (!window.confirm("Are you sure you want to delete this WHOLE list? This cannot be undone.")) return;
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
                onClick={handleDeleteList}
                isLoading={isDeleting}
                icon={<Trash2 size={16} />}
                className="ml-2"
              >
                Delete List
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

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 pb-32">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <React.Fragment key={task.id}>
                <li 
                  className={`group flex items-center p-4 hover:bg-slate-50 transition-colors ${task.completed ? 'bg-slate-50/50' : ''}`}
                >
                  {editingId === task.id ? (
                    <div className="flex-1 flex items-center gap-2 w-full">
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-3 py-2 border"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                      <button 
                        onClick={saveEdit} 
                        className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                        title="Save"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={cancelEdit} 
                        className="p-2 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                        title="Cancel"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div 
                        className="flex-1 flex items-center cursor-pointer min-w-0"
                        onClick={() => toggleTask(task.id)}
                      >
                        <div className={`flex-shrink-0 mr-4 ${task.completed ? 'text-green-500' : 'text-slate-300 group-hover:text-indigo-500'}`}>
                          {task.completed ? <CheckCircle size={24} className="fill-current" /> : <Circle size={24} />}
                        </div>
                        <span className={`flex-1 text-lg truncate pr-2 ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {task.text}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => startEditing(e, task)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                          title="Edit Item"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={(e) => startInserting(e, task.id)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
                          title="Insert Item Below"
                        >
                          <ListPlus size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteItem(e, task.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                          title="Delete Item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </>
                  )}
                </li>
                {insertingAfterId === task.id && (
                  <li className="bg-indigo-50/30 border-l-4 border-indigo-500 p-3 pl-4 animate-in fade-in slide-in-from-top-2">
                     <form onSubmit={handleInsertBelow} className="flex gap-2 items-center">
                        <div className="text-indigo-400 pl-1"><Plus size={16} /></div>
                        <input
                          autoFocus
                          type="text"
                          value={insertValue}
                          onChange={(e) => setInsertValue(e.target.value)}
                          placeholder="Type new item..."
                          className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          onKeyDown={(e) => {
                             if (e.key === 'Escape') setInsertingAfterId(null);
                          }}
                        />
                        <Button size="sm" type="submit">Add</Button>
                        <button 
                          type="button" 
                          onClick={() => setInsertingAfterId(null)}
                          className="p-1.5 text-slate-400 hover:text-slate-600"
                        >
                          <X size={18}/>
                        </button>
                     </form>
                  </li>
                )}
              </React.Fragment>
            ))}
            
            {tasks.length === 0 && (
              <li className="p-8 text-center text-slate-500">
                No tasks yet. Add one below!
              </li>
            )}
          </ul>

          {/* Add Item Form - Integrated into list visually */}
          <div className="bg-slate-50 border-t border-slate-200 p-4">
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newItemValue}
                onChange={(e) => setNewItemValue(e.target.value)}
                placeholder="Add a new item to the end..."
                className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
              />
              <Button type="submit" icon={<Plus size={18} />}>
                Add
              </Button>
            </form>
          </div>
        </div>
        
        {/* Mobile Duplicate Button (Sticky Bottom Right) */}
        <div className="sm:hidden fixed bottom-6 right-6 z-20">
           <button 
             onClick={handleDuplicate}
             className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
             title="Duplicate List"
           >
             <Copy size={24} />
           </button>
        </div>
      </main>
    </div>
  );
};
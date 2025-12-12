import React, { useState } from 'react';
import { Button } from './Button';
import { Input, TextArea } from './Input';
import { X } from 'lucide-react';

interface CreateListModalProps {
  onClose: () => void;
  onSubmit: (name: string, csv: string) => Promise<void>;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [csv, setCsv] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !csv.trim()) return;

    setLoading(true);
    try {
      await onSubmit(name, csv);
      onClose();
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">Create New List</h3>
                <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-500">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <Input 
                  label="List Name" 
                  placeholder="e.g., Grocery Trip, Weekend Chores" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
                
                <TextArea 
                  label="Items (Comma Separated)" 
                  placeholder="Milk, Eggs, Bread, Butter" 
                  value={csv}
                  onChange={(e) => setCsv(e.target.value)}
                  rows={4}
                  required
                />
                <p className="text-xs text-slate-500">
                  Enter your tasks separated by commas. We'll turn them into a checklist for you.
                </p>
              </div>
            </div>
            
            <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Button type="submit" isLoading={loading} className="w-full sm:w-auto sm:ml-3">
                Create List
              </Button>
              <Button type="button" variant="secondary" onClick={onClose} className="mt-3 w-full sm:w-auto sm:mt-0">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
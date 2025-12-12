import React, { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { CreateListModal } from './components/CreateListModal';
import { ActiveList } from './components/ActiveList';
import { 
  getUserLists, 
  createTaskList, 
  duplicateTaskList,
  updateTaskStatus,
  deleteTaskList
} from './services/firebase';
import { TaskList, Task } from './types';

// Hardcoded ID for local storage usage
const GUEST_ID = 'guest_user';

function App() {
  // App State
  const [view, setView] = useState<'DASHBOARD' | 'ACTIVE_LIST'>('DASHBOARD');
  const [lists, setLists] = useState<TaskList[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);

  // Load lists on mount
  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    setLoadingLists(true);
    try {
      const data = await getUserLists(GUEST_ID);
      setLists(data);
    } catch (error) {
      console.error("Error fetching lists", error);
    } finally {
      setLoadingLists(false);
    }
  };

  const handleCreateList = async (name: string, csv: string) => {
    const items = csv.split(',').filter(item => item.trim().length > 0);
    if (items.length === 0) return;

    try {
      await createTaskList(GUEST_ID, name, items);
      await fetchLists();
    } catch (error) {
      console.error("Error creating list", error);
      alert("Failed to create list.");
    }
  };

  const handleOpenList = (list: TaskList) => {
    setActiveListId(list.id);
    setView('ACTIVE_LIST');
  };

  const handleBackToDashboard = () => {
    setActiveListId(null);
    setView('DASHBOARD');
    fetchLists(); // Refresh in case of background updates
  };

  const handleUpdateTasks = async (updatedTasks: Task[]) => {
    if (!activeListId) return;
    
    // Optimistic update locally
    setLists(prev => prev.map(l => {
      if (l.id === activeListId) {
        return { ...l, tasks: updatedTasks };
      }
      return l;
    }));

    try {
      await updateTaskStatus(activeListId, updatedTasks);
    } catch (error) {
      console.error("Failed to sync task update", error);
      fetchLists(); // Revert on error
    }
  };

  const handleDuplicate = async () => {
    if (!activeListId) return;
    const currentList = lists.find(l => l.id === activeListId);
    if (!currentList) return;

    try {
      await duplicateTaskList(GUEST_ID, currentList);
      await fetchLists();
      setView('DASHBOARD');
      setActiveListId(null);
    } catch (error) {
      console.error("Error duplicating", error);
      alert("Failed to duplicate list.");
    }
  };

  const handleDelete = async () => {
    if (!activeListId) return;
    try {
      await deleteTaskList(activeListId);
      setActiveListId(null);
      setView('DASHBOARD');
      await fetchLists();
    } catch (error) {
      console.error("Error deleting", error);
    }
  };

  return (
    <>
      {view === 'DASHBOARD' && (
        <Dashboard 
          lists={lists} 
          loading={loadingLists} 
          onCreateClick={() => setShowCreateModal(true)}
          onListClick={handleOpenList}
        />
      )}

      {view === 'ACTIVE_LIST' && activeListId && (
        <ActiveList 
          list={lists.find(l => l.id === activeListId)!}
          onBack={handleBackToDashboard}
          onUpdate={handleUpdateTasks}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      )}

      {showCreateModal && (
        <CreateListModal 
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateList}
        />
      )}
    </>
  );
}

export default App;
import { TaskList, Task } from "../types";

// Key for localStorage
const STORAGE_KEY = 'quicklist_data';

// Helper to get data
const getStore = (): TaskList[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading from local storage", e);
    return [];
  }
};

// Helper to save data
const setStore = (data: TaskList[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Error writing to local storage", e);
  }
};

// --- Storage Services ---

export const createTaskList = async (userId: string, name: string, rawTasks: string[]): Promise<string> => {
  // Simulate network delay for better UX feel
  await new Promise(resolve => setTimeout(resolve, 300));

  const tasks: Task[] = rawTasks.map((text, index) => ({
    id: `task-${Date.now()}-${index}`,
    text: text.trim(),
    completed: false
  }));

  const newList: TaskList = {
    id: `list-${Date.now()}`,
    userId, // Kept for interface compatibility, though unused in local storage
    name,
    tasks,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const lists = getStore();
  setStore([newList, ...lists]);
  return newList.id;
};

export const duplicateTaskList = async (userId: string, originalList: TaskList): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 300));

  // Reset completion status for duplication
  const freshTasks = originalList.tasks.map(t => ({
    ...t,
    completed: false
  }));

  const newList: TaskList = {
    id: `list-${Date.now()}`,
    userId,
    name: `${originalList.name} (Copy)`,
    tasks: freshTasks,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const lists = getStore();
  setStore([newList, ...lists]);
  return newList.id;
};

export const updateTaskStatus = async (listId: string, tasks: Task[]) => {
  // We don't artificially delay updates to make the UI snappy
  const lists = getStore();
  const updatedLists = lists.map(list => {
    if (list.id === listId) {
      return { ...list, tasks, updatedAt: Date.now() };
    }
    return list;
  });
  setStore(updatedLists);
};

export const deleteTaskList = async (listId: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const lists = getStore();
  const filteredLists = lists.filter(list => list.id !== listId);
  setStore(filteredLists);
};

export const getUserLists = async (userId: string): Promise<TaskList[]> => {
  // Simulate loading
  await new Promise(resolve => setTimeout(resolve, 500));
  const lists = getStore();
  // Sort by createdAt desc
  return lists.sort((a, b) => b.createdAt - a.createdAt);
};

export const signInWithGoogle = async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { uid: 'guest_user' };
};
import { contextBridge, ipcRenderer } from "electron";

export interface Task {
  id: number;
  text: string;
  createdAt: string;
}

const api = {
  listTasks: (): Promise<Task[]> => ipcRenderer.invoke("tasks:list"),
  createTask: (text: string): Promise<Task> =>
    ipcRenderer.invoke("tasks:create", text),
  updateTask: (id: number, text: string): Promise<Task | null> =>
    ipcRenderer.invoke("tasks:update", id, text),
  deleteTask: (id: number): Promise<boolean> =>
    ipcRenderer.invoke("tasks:delete", id),
};

contextBridge.exposeInMainWorld("tasksApi", api);

export type TasksApi = typeof api;

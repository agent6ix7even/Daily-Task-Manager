export interface Task {
  id: number;
  text: string;
  createdAt: string;
}

export interface TasksApi {
  listTasks: () => Promise<Task[]>;
  createTask: (text: string) => Promise<Task>;
  updateTask: (id: number, text: string) => Promise<Task | null>;
  deleteTask: (id: number) => Promise<boolean>;
}

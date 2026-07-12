import type { TasksApi } from "./types";

declare global {
  interface Window {
    tasksApi: TasksApi;
  }
}

export {};

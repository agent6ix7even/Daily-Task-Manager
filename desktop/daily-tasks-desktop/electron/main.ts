import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";

interface Task {
  id: number;
  text: string;
  createdAt: string;
}

interface StoreSchema {
  tasks: Task[];
  nextId: number;
}

const defaultData: StoreSchema = { tasks: [], nextId: 1 };

class JsonStore {
  private filePath: string;
  private data: StoreSchema;

  constructor(fileName: string) {
    this.filePath = path.join(app.getPath("userData"), fileName);
    this.data = this.load();
  }

  private load(): StoreSchema {
    try {
      const raw = fs.readFileSync(this.filePath, "utf-8");
      return { ...defaultData, ...JSON.parse(raw) };
    } catch {
      return { ...defaultData };
    }
  }

  private save(): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  get<K extends keyof StoreSchema>(key: K): StoreSchema[K] {
    return this.data[key];
  }

  set<K extends keyof StoreSchema>(key: K, value: StoreSchema[K]): void {
    this.data[key] = value;
    this.save();
  }
}

let store: JsonStore;

function createWindow(): void {
  const win = new BrowserWindow({
    width: 900,
    height: 720,
    minWidth: 480,
    minHeight: 400,
    backgroundColor: "#f7f4ee",
    title: "Дневник задач",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

ipcMain.handle("tasks:list", () => {
  return store.get("tasks");
});

ipcMain.handle("tasks:create", (_event, text: string) => {
  const tasks = store.get("tasks");
  const nextId = store.get("nextId");
  const task: Task = {
    id: nextId,
    text,
    createdAt: new Date().toISOString(),
  };
  store.set("tasks", [...tasks, task]);
  store.set("nextId", nextId + 1);
  return task;
});

ipcMain.handle("tasks:update", (_event, id: number, text: string) => {
  const tasks = store.get("tasks");
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const updated: Task = { ...tasks[index], text };
  const nextTasks = [...tasks];
  nextTasks[index] = updated;
  store.set("tasks", nextTasks);
  return updated;
});

ipcMain.handle("tasks:delete", (_event, id: number) => {
  const tasks = store.get("tasks");
  store.set("tasks", tasks.filter((t) => t.id !== id));
  return true;
});

app.whenReady().then(() => {
  store = new JsonStore("tasks-store.json");
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

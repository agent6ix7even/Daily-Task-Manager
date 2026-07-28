import { useState, useRef, useEffect, FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, X, PenLine, Loader2, Check, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import { 
  useListTasks, 
  useCreateTask, 
  useUpdateTask, 
  useDeleteTask, 
  getListTasksQueryKey 
} from '@workspace/api-client-react';
import { useTheme } from '@/hooks/use-theme';

export default function Home() {
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading, isError } = useListTasks();
  
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const { theme, toggleTheme } = useTheme();

  const [newTaskText, setNewTaskText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTaskText, setEditTaskText] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Focus the edit input when it opens
  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const handleCreateTask = (e: FormEvent) => {
    e.preventDefault();
    const text = newTaskText.trim();
    if (!text) return;

    createTask.mutate(
      { data: { text } },
      {
        onSuccess: () => {
          setNewTaskText('');
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          toast.success('Задача добавлена');
        },
        onError: () => {
          toast.error('Не удалось добавить задачу');
        }
      }
    );
  };

  const handleUpdateTask = (id: number) => {
    const text = editTaskText.trim();
    if (!text) {
      // If empty, delete it? No, just cancel editing.
      setEditingId(null);
      return;
    }

    const task = tasks.find(t => t.id === id);
    if (task && task.text === text) {
      setEditingId(null);
      return;
    }

    updateTask.mutate(
      { id, data: { text } },
      {
        onSuccess: () => {
          setEditingId(null);
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
        },
        onError: () => {
          toast.error('Не удалось обновить задачу');
        }
      }
    );
  };

  const handleDeleteTask = (id: number) => {
    deleteTask.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
          toast.success('Задача удалена');
        },
        onError: () => {
          toast.error('Не удалось удалить задачу');
        }
      }
    );
  };

  const startEditing = (id: number, currentText: string) => {
    setEditingId(id);
    setEditTaskText(currentText);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12" data-testid="status-loading">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-12 text-destructive font-serif" data-testid="status-error">
          Не удалось загрузить записи.
        </div>
      );
    }

    if (tasks.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground italic font-serif" data-testid="status-empty">
          Здесь пока пусто. Напишите свою первую задачу.
        </div>
      );
    }

    return (
      <ul className="space-y-3 mt-8">
        {tasks.map((task) => (
          <li 
            key={task.id} 
            className="group flex items-start gap-4 p-3 -mx-3 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            data-testid={`row-task-${task.id}`}
          >
            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" />
            
            <div className="flex-1 min-w-0">
              {editingId === task.id ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editTaskText}
                    onChange={(e) => setEditTaskText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleUpdateTask(task.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 bg-transparent border-b border-foreground/40 focus:border-foreground py-0.5 text-base focus:outline-none transition-colors font-sans"
                    data-testid={`input-edit-task-${task.id}`}
                  />
                  <button
                    onClick={() => handleUpdateTask(task.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    data-testid={`button-save-task-${task.id}`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-base font-sans leading-relaxed break-words">{task.text}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => startEditing(task.id, task.text)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      data-testid={`button-edit-task-${task.id}`}
                    >
                      <PenLine className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      data-testid={`button-delete-task-${task.id}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen w-full flex justify-center pb-24 px-4 sm:px-6">
      <div className="w-full max-w-2xl mt-16 sm:mt-24">
        
        <header className="mb-12">
          <div className="flex items-start justify-between">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl sm:text-4xl font-serif text-foreground tracking-tight">
                Дневник задач
              </h1>
              <p className="text-muted-foreground font-serif italic text-sm sm:text-base">
                Что нужно сделать сегодня?
              </p>
            </div>
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
              className="mt-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              data-testid="button-toggle-theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        <main>
          <form 
            onSubmit={handleCreateTask}
            className="relative flex items-center mb-8 group"
          >
            <div className="absolute left-0 pl-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-foreground transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Новая запись..."
              className="w-full bg-transparent border-b-2 border-muted-foreground/30 focus:border-foreground py-3 pl-10 pr-4 text-lg placeholder:text-muted-foreground focus:outline-none transition-colors font-sans"
              data-testid="input-new-task"
              disabled={createTask.isPending}
            />
          </form>

          {renderContent()}
        </main>
        
      </div>
    </div>
  );
}

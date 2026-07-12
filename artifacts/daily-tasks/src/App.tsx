import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { Toaster } from 'sonner';
import Home from '@/pages/home';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Switch>
          <Route path="/" component={Home} />
          <Route>
            <div className="flex h-screen items-center justify-center font-serif text-xl">
              Страница не найдена
            </div>
          </Route>
        </Switch>
      </WouterRouter>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          className: 'font-sans rounded-none border border-border bg-background text-foreground shadow-sm',
          style: {
            borderRadius: '0px',
          }
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
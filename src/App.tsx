import { AppRouter } from './routes';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <AppRouter />
      <Toaster richColors position="top-right" duration={3000} />
    </>
  );
}

export default App;

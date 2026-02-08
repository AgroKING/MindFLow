import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { router } from './router';
import { OfflineBanner } from './components/common/OfflineBanner';

function App() {
  return (
    <>
      <OfflineBanner />
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;

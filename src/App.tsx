import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes/AppRoutes';
import { Toaster } from "@/components/ui/toaster";
import { Provider } from 'react-redux';
import { store } from '@/store';
function App() {
  return (
    <BrowserRouter>
    <Provider store={store}>
      <AppRoutes />
      <Toaster />
      </Provider>
    </BrowserRouter>
  );
}

export default App;
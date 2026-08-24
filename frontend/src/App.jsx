import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/ToastProvider';
import { CustomModulesProvider } from './components/CustomModulesProvider';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Computers } from './pages/Computers';
import { ServerRoom } from './pages/ServerRoom';
import { Toners } from './pages/Toners';
import { HddInventory } from './pages/HddInventory';
import { HddDetail } from './pages/HddDetail';
import { Warranty } from './pages/Warranty';
import { CustomModulePage } from './pages/CustomModulePage';

function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <CustomModulesProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="computers" element={<Computers />} />
                <Route path="server-room" element={<ServerRoom />} />
                <Route path="toners" element={<Toners />} />
                <Route path="hdd" element={<HddInventory />} />
                <Route path="hdd/record/:kind/:id" element={<HddDetail />} />
                <Route path="warranty" element={<Warranty />} />
                <Route path="modules/:slug" element={<CustomModulePage />} />
              </Route>
            </Routes>
          </CustomModulesProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;

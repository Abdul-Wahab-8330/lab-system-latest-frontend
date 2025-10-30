import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from './context/AuthProvider';
import { TestProvider } from './context/TestContext';
import { PatientsProvider } from './context/PatientsContext';
import { AddedPatientsProvider } from './context/AddedPatientsContext';
import { LabInfoProvider } from './context/LabnfoContext';
import { InventoryProvider } from './context/InventoryContext';



createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <InventoryProvider>
      <AddedPatientsProvider>
        <LabInfoProvider>
          <PatientsProvider>
            <TestProvider>
              <BrowserRouter>
                <App />
              </BrowserRouter>
            </TestProvider>
          </PatientsProvider>
        </LabInfoProvider>
      </AddedPatientsProvider>
    </InventoryProvider>
  </AuthProvider>
)

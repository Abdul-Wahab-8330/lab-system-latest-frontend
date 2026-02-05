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
import { ExpenseProvider } from './context/ExpenseContext';
import { SystemFiltersProvider } from './context/SystemFiltersContext';
import { DoctorsProvider } from './context/DoctorsContext';
import { GeneralSettingsProvider } from './context/GeneralSettingsContext';


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <DoctorsProvider>
        <SystemFiltersProvider>
          <ExpenseProvider>
            <InventoryProvider>
              <AddedPatientsProvider>
                <LabInfoProvider>
                  <PatientsProvider>
                    <TestProvider>
                      <GeneralSettingsProvider>
                      <App />
                      </GeneralSettingsProvider>
                    </TestProvider>
                  </PatientsProvider>
                </LabInfoProvider>
              </AddedPatientsProvider>
            </InventoryProvider>
          </ExpenseProvider>
        </SystemFiltersProvider>
      </DoctorsProvider>
    </AuthProvider>
  </BrowserRouter>
)

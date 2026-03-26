import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/index';
import Dashboard from './pages/Dashboard/index';
import NewRequest from './pages/NewRequest/index';
import RequestSubmitted from './pages/RequestSubmitted/index';
import ConsultationStatus from './pages/ConsultationStatus/index';
import MessageSpecialist from './pages/MessageSpecialist/index';
import PatientDetail from './pages/PatientDetail/index';
import ActiveCases from './pages/ActiveCases/index';
import Specialist from './pages/Specialist/index';
import ArchiveCases from './pages/ArchiveCases/index';
import Requests from './pages/Requests/index';
import ActivityHistory from './pages/ActivityHistory/index';
import AuthCallback from './pages/AuthCallback/index';
import Settings from './pages/Settings/index';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/api/auth/healthid" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new-request" element={<NewRequest />} />
        <Route path="/request-submitted" element={<RequestSubmitted />} />
        <Route path="/consultation-status" element={<ConsultationStatus />} />
        <Route path="/message-specialist" element={<MessageSpecialist />} />
        <Route path="/patient-detail" element={<PatientDetail />} />
        <Route path="/active-cases" element={<ActiveCases />} />
        <Route path="/specialist" element={<Specialist />} />
        <Route path="/archive-cases" element={<ArchiveCases />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/activity-history" element={<ActivityHistory />} />
      </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;

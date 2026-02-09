import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import PatientDashboard from './components/PatientDashboard';
import CaretakerDashboard from './components/CaretakerDashboard';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route
                            path="/patient-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['PATIENT']}>
                                    <PatientDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/caretaker-dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['CARETAKER']}>
                                    <CaretakerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;

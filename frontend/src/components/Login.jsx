import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Alert,
    Tab,
    Tabs
} from '@mui/material';
import { Login as LoginIcon, PersonAdd } from '@mui/icons-material';

const Login = () => {
    const [tabValue, setTabValue] = useState(0);
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [registerData, setRegisterData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phoneNumber: '',
        role: 'PATIENT'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const data = await login(loginData.username, loginData.password);
            if (data.role === 'PATIENT') {
                navigate('/patient-dashboard');
            } else {
                navigate('/caretaker-dashboard');
            }
        } catch (err) {
            setError('Invalid credentials. Please try again.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await register(registerData);
            setSuccess('Registration successful! Please login.');
            setTabValue(0);
            setRegisterData({
                username: '',
                password: '',
                email: '',
                fullName: '',
                phoneNumber: '',
                role: 'PATIENT'
            });
        } catch (err) {
            setError(err.response?.data || 'Registration failed. Please try again.');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Dementia Patient Tracker
                    </Typography>

                    <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} centered>
                        <Tab label="Login" icon={<LoginIcon />} />
                        <Tab label="Register" icon={<PersonAdd />} />
                    </Tabs>

                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}

                    {tabValue === 0 ? (
                        <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
                            <TextField
                                fullWidth
                                label="Username"
                                margin="normal"
                                value={loginData.username}
                                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                                required
                                autoComplete="username"
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                margin="normal"
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                required
                                autoComplete="current-password"
                            />
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{ mt: 3 }}
                            >
                                Login
                            </Button>
                        </Box>
                    ) : (
                        <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
                            <TextField
                                fullWidth
                                label="Username"
                                margin="normal"
                                value={registerData.username}
                                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                                required
                                autoComplete="username"
                            />
                            <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                margin="normal"
                                value={registerData.email}
                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                required
                                autoComplete="email"
                            />
                            <TextField
                                fullWidth
                                label="Full Name"
                                margin="normal"
                                value={registerData.fullName}
                                onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                                required
                                autoComplete="name"
                            />
                            <TextField
                                fullWidth
                                label="Phone Number"
                                margin="normal"
                                value={registerData.phoneNumber}
                                onChange={(e) => setRegisterData({ ...registerData, phoneNumber: e.target.value })}
                                autoComplete="tel"
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                margin="normal"
                                value={registerData.password}
                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                required
                                autoComplete="new-password"
                            />
                            <TextField
                                fullWidth
                                select
                                label="Role"
                                margin="normal"
                                value={registerData.role}
                                onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                                SelectProps={{ native: true }}
                            >
                                <option value="PATIENT">Patient</option>
                                <option value="CARETAKER">Caretaker</option>
                            </TextField>
                            <Button
                                fullWidth
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{ mt: 3 }}
                            >
                                Register
                            </Button>
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;

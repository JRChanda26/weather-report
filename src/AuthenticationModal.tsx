import React, { useState } from 'react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Link,
    useTheme,
} from '@mui/material';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './FirebaseConfig';

const AuthenticationModal = ({ open, handleClose, }: { open: boolean; handleClose: () => void; }) => {

    const [authType, setAuthType] = useState<'login' | 'signup' | 'forgot'>('login');
    const [message, setMessage] = useState('');

    // Login
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Signup
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    // Forgot password
    const [resetEmail, setResetEmail] = useState('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{6,}$/;

    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateLoginForm = async () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!loginEmail.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(loginEmail)) {
            newErrors.email = 'Enter a valid email';
        }

        if (!loginPassword.trim()) {
            newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(loginPassword)) {
            newErrors.password = 'Enter a valid password (min 6 chars, uppercase, lowercase, number, symbol)';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return false;
        }

        // ✅ No errors, proceed with Firebase sign-in
        try {
            // await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
            setMessage('Login successful');
            handleClose();
            return true;
        } catch (error: any) {
            setMessage(error.message);
            return false;
        }
    };


    const validateSignupForm = async () => {
        const newErrors: { email?: string; password?: string } = {};

        if (!signupEmail.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(signupEmail)) {
            newErrors.email = 'Enter a valid email';
        }

        if (!signupPassword.trim()) {
            newErrors.password = 'Password is required';
        } else if (!passwordRegex.test(signupPassword)) {
            newErrors.password = 'Enter a valid password (min 6 chars, uppercase, lowercase, number, symbol)';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return false;
        }

        // ✅ No errors, proceed with Firebase sign-up
        try {
            // await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
            setMessage('Account created');
            handleClose();
            return true;
        } catch (error: any) {
            setMessage(error.message);
            return false;
        }
    };

    const validateResetPasswordForm = async () => {
        const newErrors: { email?: string } = {};

        if (!resetEmail.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(resetEmail)) {
            newErrors.email = 'Enter a valid email';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return false;
        }

        // ✅ No errors, proceed with Firebase forgot-password
        try {
            // await sendPasswordResetEmail(auth, resetEmail);
            setMessage('Reset link sent');
            handleClose();
            return true;
        } catch (error: any) {
            setMessage(error.message);
            return false;
        }
    };

    // const modalClose = () => {
    //     setLoginEmail('')
    //     setLoginPassword('')
    //     setSignupEmail('')
    //     setSignupPassword('')
    //     setResetEmail('')
    //     setErrors({})
    //     handleClose();
    // };

    const theme = useTheme();
    const textColor = theme.palette.mode === 'dark' ? '#F2F2F7' : '#1C1C1E';
    const backgroundColor = theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)'

    const modalStyle = {
        position: 'absolute' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: {
            xs: '90%',
            sm: '50%',
            md: '30%',
        },
        backgroundColor: backgroundColor,
        color: textColor,
        backdropFilter: 'blur(4px)',
        border: '2px solid #00bcd4',
        borderRadius: 4,
        boxShadow: 24,
        p: 4,
    };

    return (
        <Modal open={open}
            onClose={() => {
                setLoginEmail('')
                setLoginPassword('')
                setSignupEmail('')
                setSignupPassword('')
                setResetEmail('')
                setErrors({})
                handleClose();
                setAuthType('login')
            }}>
            <Box sx={modalStyle}>
                <Typography variant="h5" mb={2}>
                    {authType === 'login' && 'Login'}
                    {authType === 'signup' && 'Sign Up'}
                    {authType === 'forgot' && 'Forgot Password'}
                </Typography>

                {authType === 'login' && (
                    <>
                        <TextField
                            fullWidth
                            label="Email"
                            margin="normal"
                            value={loginEmail}
                            onChange={(event) => setLoginEmail(event.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            margin="normal"
                            value={loginPassword}
                            onChange={(event) => setLoginPassword(event.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={validateLoginForm}
                            sx={{ mb: 2, backgroundColor: '#00bcd4', color: '#000', borderRadius: 2, '&:hover': { background: '#00bcd4' }, }}
                        >
                            Log In
                        </Button>
                        <Link component="button" underline="hover"
                            onClick={() => {
                                setAuthType('forgot')
                                setLoginEmail('')
                                setLoginPassword('')
                                setSignupEmail('')
                                setSignupPassword('')
                                setResetEmail('')
                                setErrors({})
                            }}
                        >
                            Forgot Password?
                        </Link>
                    </>
                )}

                {authType === 'signup' && (
                    <>
                        <TextField
                            fullWidth
                            label="Email"
                            margin="normal"
                            value={signupEmail}
                            onChange={(event) => setSignupEmail(event.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            margin="normal"
                            value={signupPassword}
                            onChange={(event) => setSignupPassword(event.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={validateSignupForm}
                            sx={{ mb: 2, backgroundColor: '#00bcd4', color: '#000', borderRadius: 2, '&:hover': { background: '#00bcd4' }, }}
                        >
                            Sign Up
                        </Button>
                    </>
                )}

                {authType === 'forgot' && (
                    <>
                        <TextField
                            fullWidth
                            label="Email"
                            margin="normal"
                            value={resetEmail}
                            onChange={(event) => setResetEmail(event.target.value)}
                            error={!!errors.email}
                            helperText={errors.email}
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={validateResetPasswordForm}
                            sx={{ mb: 2, backgroundColor: '#00bcd4', color: '#000', borderRadius: 2, '&:hover': { background: '#00bcd4' }, }}
                        >
                            Send Reset Link
                        </Button>
                    </>
                )}

                {/* Switch Between Login/Signup */}
                <Typography mt={2} display="flex" justifyContent="center" flexDirection="row" align="center" gap={1} variant="body2">
                    {authType === 'login' && (
                        <>
                            Don't have an account?{' '}
                            <Link component="button" underline="hover"
                                onClick={() => {
                                    setAuthType('signup')
                                    setLoginEmail('')
                                    setLoginPassword('')
                                    setSignupEmail('')
                                    setSignupPassword('')
                                    setResetEmail('')
                                    setErrors({})
                                }}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                    {authType === 'signup' && (
                        <>
                            Already have an account?{' '}
                            <Link component="button" underline="hover"
                                onClick={() => {
                                    setAuthType('login')
                                    setLoginEmail('')
                                    setLoginPassword('')
                                    setSignupEmail('')
                                    setSignupPassword('')
                                    setResetEmail('')
                                    setErrors({})
                                }}
                            >
                                Log In
                            </Link>
                        </>
                    )}
                    {authType === 'forgot' && (
                        <>
                            Remember your password?{' '}
                            <Link component="button" underline="hover"
                                onClick={() => {
                                    setAuthType('login')
                                    setLoginEmail('')
                                    setLoginPassword('')
                                    setSignupEmail('')
                                    setSignupPassword('')
                                    setResetEmail('')
                                    setErrors({})
                                }}
                            >
                                Log In
                            </Link>
                        </>
                    )}
                </Typography>

                {/* Message */}
                {message && (
                    <Typography mt={2} align="center" color="error">
                        {message}
                    </Typography>
                )}
            </Box>
        </Modal>
    );
};

export default AuthenticationModal;

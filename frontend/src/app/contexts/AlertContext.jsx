import React, { createContext, useContext, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Create Context
const AlertContext = createContext();

// Provider Component
export const AlertProvider = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState('info'); // info, success, warning, error

    const showAlert = (msg, color = 'info') => {
        setMessage(msg);
        setSeverity(color);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>
        </AlertContext.Provider>
    );
};

// Custom hook to use the Alert Context
export const useAlert = () => {
    return useContext(AlertContext);
};


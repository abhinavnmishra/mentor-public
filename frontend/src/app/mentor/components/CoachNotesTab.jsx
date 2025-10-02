import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    alpha
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { useAxios } from "../../contexts/AxiosContext.jsx";
import { useAlert } from "../../contexts/AlertContext.jsx";
import { Notes, Save } from "@mui/icons-material";

// Modern color palette (consistent with parent component)
const colors = {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#f8fafc',
    surface: '#ffffff',
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    text: {
        primary: '#1e293b',
        secondary: '#64748b',
        disabled: '#94a3b8'
    }
};

const NotesContainer = styled(Box)(({ theme }) => ({
    backgroundColor: alpha(colors.background, 0.5),
    borderRadius: '16px',
    padding: theme.spacing(3),
    border: `1px solid ${colors.border}`,
    marginTop: theme.spacing(3)
}));

export default function CoachNotesTab({ notes, setNotes }) {
    const { showAlert } = useAlert();
    
    return (
        <NotesContainer>
            <Typography 
                variant="h6" 
                sx={{ 
                    fontWeight: 600, 
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <Notes color="primary" />
                Coach Notes
            </Typography>
            
            <TextField
                fullWidth
                multiline
                rows={10}
                variant="outlined"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your analysis, observations, and coaching notes here..."
                sx={{
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: colors.surface,
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }
                }}
            />
            
        </NotesContainer>
    );
}

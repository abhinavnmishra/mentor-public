import React, { useState, useRef, useEffect, useMemo } from "react";
import {
    IconButton,
    styled,
    Alert,
    Box,
    Stack,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    TextField,
    Button,
    Typography,
    alpha,
    Tooltip,
    Autocomplete,
    Chip,
    CircularProgress,
    Grid2 as Grid
} from "@mui/material";
import {
    CalendarToday,
    Schedule,
    AccessTime,
    Person,
    Subject,
    Description,
    CategoryRounded,
    EventNote,
    Close,
    Notes
} from "@mui/icons-material";
import { useAxios } from '../../contexts/AxiosContext';
import LoadingButton from '@mui/lab/LoadingButton';
import { useAlert } from '../../contexts/AlertContext.jsx';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Modern color palette consistent with other components
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

const ModernDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        background: colors.surface,
        overflow: 'hidden',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxHeight: '90vh',
    }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    padding: '32px 32px 0 32px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.text.primary,
    lineHeight: 1.2,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: '24px 32px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: '24px 32px 32px 32px',
    borderTop: `1px solid ${colors.border}`,
    background: alpha(colors.background, 0.3),
    gap: '12px',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-root': {
        color: colors.text.secondary,
        fontWeight: 500,
        fontSize: '0.875rem',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: colors.primary,
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        '& fieldset': {
            borderColor: colors.border,
            borderWidth: '1.5px',
        },
        '&:hover fieldset': {
            borderColor: colors.borderHover,
        },
        '&.Mui-focused fieldset': {
            borderColor: colors.primary,
            borderWidth: '2px',
        },
        '&.Mui-error fieldset': {
            borderColor: colors.error,
        }
    },
    '& .MuiInputBase-input': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        color: colors.text.primary,
    },
    '& .MuiFormHelperText-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.75rem',
        marginLeft: '4px',
    }
}));

const ActionButton = styled(IconButton)(({ theme, variant: buttonVariant }) => ({
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    ...(buttonVariant === 'direct' ? {
        backgroundColor: alpha(colors.success, 0.1),
        color: colors.success,
        border: `1px solid ${alpha(colors.success, 0.2)}`,
        '&:hover': {
            backgroundColor: alpha(colors.success, 0.15),
            transform: 'scale(1.05)',
        }
    } : {
        backgroundColor: alpha(colors.secondary, 0.1),
        color: colors.secondary,
        border: `1px solid ${alpha(colors.secondary, 0.2)}`,
        '&:hover': {
            backgroundColor: alpha(colors.secondary, 0.15),
            transform: 'scale(1.05)',
        }
    })
}));

const FieldLabel = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
}));

const ModernButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '12px 24px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: buttonVariant === 'contained' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
    }
}));

const DurationChip = styled(Chip)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 600,
    borderRadius: '8px',
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
    padding: '8px 12px',
    height: 'auto',
}));

const ScheduleSessionForm = ({ client, program, direct = false, sessionId }) => {
    const [open, setOpen] = useState(false);
    const [sessionName, setSessionName] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const axiosInstance = useAxios();
    const { showAlert } = useAlert();

    // Calculate session duration
    const sessionDuration = useMemo(() => {
        if (!startTime || !endTime) return '';
        const duration = dayjs(endTime).diff(dayjs(startTime), 'minute');
        if (duration <= 0) return '';
        const hours = Math.floor(duration / 60);
        const minutes = duration % 60;
        if (hours === 0) return `${minutes}m`;
        if (minutes === 0) return `${hours}h`;
        return `${hours}h ${minutes}m`;
    }, [startTime, endTime]);

    // Fetch activities for the program
    const fetchActivities = async () => {
        if (!sessionId) return;
        
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/api/programs/activities/${sessionId}`);
            setActivities(response.data || []);
        } catch (error) {
            console.error('Error fetching activities:', error);
            showAlert('Failed to load activities', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && sessionId) {
            fetchActivities();
        }
    }, [open, sessionId]);

    function handleClickOpen() {
        if (!client || !program) {
            showAlert('Client or program information is missing', 'error');
            return;
        }
        setOpen(true);
    }

    function handleClose() {
        setOpen(false);
        setSessionName('');
        setDescription('');
        setStartTime(null);
        setEndTime(null);
        setSelectedActivity(null);
        setError('');
    }

    const handleScheduleSession = async () => {
        if (!validateForm()) return;

        try {
            setLoading(true);
            
            // Format dates to match backend expectation (yyyy-MM-dd HH:mm:ss)
            const formatDateTime = (dateTime) => {
                return dayjs(dateTime).format('YYYY-MM-DD HH:mm:ss');
            };

            const sessionData = {
                programId: program.id,
                clientId: client.id,
                name: sessionName,
                description: description,
                activityTrackerId: selectedActivity ? selectedActivity.id : null,
                startTime: formatDateTime(startTime),
                endTime: formatDateTime(endTime)
            };

            await axiosInstance.post('/api/events/sessions', sessionData);
            
            showAlert('Session scheduled successfully!', 'success');
            handleClose();
        } catch (error) {
            console.error('Error scheduling session:', error);
            showAlert('Failed to schedule session. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleActivityChange = (event, newActivity) => {
        setSelectedActivity(newActivity);
    };

    const validateForm = () => {
        if (!sessionName.trim()) {
            setError('Please enter a session name');
            return false;
        }

        if (!startTime) {
            setError('Please select a start time');
            return false;
        }

        if (!endTime) {
            setError('Please select an end time');
            return false;
        }

        if (dayjs(endTime).isBefore(dayjs(startTime))) {
            setError('End time must be after start time');
            return false;
        }

        setError('');
        return true;
    };

    return (
        <>
            <Tooltip title="Schedule Session">
                <ActionButton 
                    onClick={handleClickOpen} 
                    variant={direct ? "direct" : "default"}
                    size="medium"
                >
                    {direct ? <CalendarToday sx={{fontSize: '20px'}}/> : <Schedule sx={{fontSize: '20px'}}/>}
                </ActionButton>
            </Tooltip>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <ModernDialog
                    open={open}
                    fullWidth={true}
                    maxWidth="md"
                    onClose={handleClose}
                    aria-labelledby="schedule-session-dialog"
                >
                    <StyledDialogTitle>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Box sx={{ 
                                padding: '12px', 
                                borderRadius: '12px', 
                                backgroundColor: alpha(colors.success, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <CalendarToday sx={{ color: colors.success, fontSize: '24px' }} />
                            </Box>
                            <Box>
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 700,
                                        color: colors.text.primary,
                                        fontSize: '1.5rem',
                                        lineHeight: 1.2,
                                        marginBottom: '4px'
                                    }}
                                >
                                    Schedule Session
                                </Typography>
                                <Typography 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        color: colors.text.secondary,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Schedule a coaching session with {client.firstName} {client.lastName}
                                </Typography>
                            </Box>
                        </Box>
                    </StyledDialogTitle>

                    <StyledDialogContent>
                        <Stack spacing={3}>
                            {/* Client Info */}
                            <Box>
                                <FieldLabel>
                                    <Person sx={{ fontSize: '14px' }} />
                                    Client
                                </FieldLabel>
                                <StyledTextField
                                    fullWidth
                                    value={`${client.firstName} ${client.lastName} (${client.email})`}
                                    disabled
                                    placeholder="Client information"
                                />
                            </Box>

                            {/* Session Name */}
                            <Box>
                                <FieldLabel>
                                    <Subject sx={{ fontSize: '14px' }} />
                                    Session Name *
                                </FieldLabel>
                                <StyledTextField
                                    fullWidth
                                    value={sessionName}
                                    onChange={(e) => setSessionName(e.target.value)}
                                    placeholder="Enter session name"
                                    error={!!error && !sessionName.trim()}
                                />
                            </Box>

                            {/* Date and Time Section */}
                            <Box>
                                <FieldLabel>
                                    <AccessTime sx={{ fontSize: '14px' }} />
                                    Session Timing *
                                </FieldLabel>
                                <Stack direction="row" spacing={2}>
                                    <DateTimePicker
                                        label="Start Time"
                                        value={startTime}
                                        onChange={(newValue) => setStartTime(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!error && !startTime,
                                                sx: {
                                                    '& .MuiInputLabel-root': {
                                                        color: colors.text.secondary,
                                                        fontWeight: 500,
                                                        fontSize: '0.875rem',
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: colors.primary,
                                                    },
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '12px',
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                        fontSize: '0.875rem',
                                                        '& fieldset': {
                                                            borderColor: colors.border,
                                                            borderWidth: '1.5px',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: colors.borderHover,
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: colors.primary,
                                                            borderWidth: '2px',
                                                        },
                                                        '&.Mui-error fieldset': {
                                                            borderColor: colors.error,
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                        sx={{ flex: 1 }}
                                    />
                                    <DateTimePicker
                                        label="End Time"
                                        value={endTime}
                                        onChange={(newValue) => setEndTime(newValue)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                error: !!error && !endTime,
                                                sx: {
                                                    '& .MuiInputLabel-root': {
                                                        color: colors.text.secondary,
                                                        fontWeight: 500,
                                                        fontSize: '0.875rem',
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                    },
                                                    '& .MuiInputLabel-root.Mui-focused': {
                                                        color: colors.primary,
                                                    },
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: '12px',
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                        fontSize: '0.875rem',
                                                        '& fieldset': {
                                                            borderColor: colors.border,
                                                            borderWidth: '1.5px',
                                                        },
                                                        '&:hover fieldset': {
                                                            borderColor: colors.borderHover,
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: colors.primary,
                                                            borderWidth: '2px',
                                                        },
                                                        '&.Mui-error fieldset': {
                                                            borderColor: colors.error,
                                                        }
                                                    }
                                                }
                                            }
                                        }}
                                        sx={{ flex: 1 }}
                                    />
                                </Stack>
                                
                                {/* Duration Display */}
                                {sessionDuration && (
                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <Typography 
                                            sx={{ 
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontSize: '0.875rem',
                                                color: colors.text.secondary
                                            }}
                                        >
                                            Session Duration:
                                        </Typography>
                                        <DurationChip 
                                            icon={<AccessTime sx={{ fontSize: '16px' }} />}
                                            label={sessionDuration}
                                        />
                                    </Box>
                                )}
                            </Box>

                            {/* Activity Selection */}
                            <Box>
                                <FieldLabel>
                                    <CategoryRounded sx={{ fontSize: '14px' }} />
                                    Activity
                                </FieldLabel>
                                <Autocomplete
                                    options={activities}
                                    getOptionLabel={(option) => option.title || ''}
                                    value={selectedActivity}
                                    onChange={handleActivityChange}
                                    renderInput={(params) => (
                                        <StyledTextField
                                            {...params}
                                            variant="outlined"
                                            placeholder="Select an activity for this session..."
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props}>
                                            <Typography
                                                sx={{
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {option.title}
                                            </Typography>
                                        </Box>
                                    )}
                                />
                            </Box>

                            {/* Description */}
                            <Box>
                                <FieldLabel>
                                    <Description sx={{ fontSize: '14px' }} />
                                    Description
                                </FieldLabel>
                                <StyledTextField
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add any description or agenda items for this session..."
                                />
                            </Box>

                            {/* Error Display */}
                            {error && (
                                <Alert 
                                    severity="error" 
                                    sx={{ 
                                        borderRadius: '12px',
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}
                        </Stack>
                    </StyledDialogContent>

                    <StyledDialogActions>
                        <ModernButton 
                            onClick={handleClose}
                            variant="outlined"
                            sx={{
                                color: colors.text.secondary,
                                borderColor: colors.border,
                                '&:hover': {
                                    backgroundColor: alpha(colors.secondary, 0.05),
                                    borderColor: colors.borderHover,
                                }
                            }}
                        >
                            Cancel
                        </ModernButton>
                        <LoadingButton
                            loading={loading}
                            onClick={handleScheduleSession}
                            variant="contained"
                            startIcon={<EventNote />}
                            sx={{
                                backgroundColor: colors.success,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                padding: '12px 24px',
                                '&:hover': {
                                    backgroundColor: '#059669',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                }
                            }}
                        >
                            Schedule Session
                        </LoadingButton>
                    </StyledDialogActions>
                </ModernDialog>
            </LocalizationProvider>
        </>
    );
};

export default ScheduleSessionForm; 
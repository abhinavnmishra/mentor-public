import React, {useState} from "react";
import {
    styled,
    Dialog,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton,
    Typography,
    Box,
    Stack,
    Chip,
    alpha,
    Tooltip,
    Divider
} from "@mui/material";
import {H5, H4, Small} from "../../components/Typography.jsx";
import Grid from "@mui/material/Grid2";
import {
    Visibility,
    CalendarToday,
    Assignment,
    Description,
    Schedule,
    Event
} from "@mui/icons-material";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {fDate} from "../utils/format-time.jsx";
import ActivityTracker from "./ActivityTracker.jsx";
import SurveyTracker from "./SurveyTracker.jsx";
import PeerReviewTracker from "./PeerReviewTracker.jsx";

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
    padding: '32px 32px 24px 32px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.text.primary,
    lineHeight: 1.2,
    borderBottom: `1px solid ${colors.border}`,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: '32px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
        '&.Mui-disabled': {
            backgroundColor: alpha(colors.secondary, 0.05),
            '& fieldset': {
                borderColor: alpha(colors.border, 0.5),
            }
        }
    },
    '& .MuiInputBase-input': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        color: colors.text.primary,
        '&.Mui-disabled': {
            color: colors.text.disabled,
            WebkitTextFillColor: colors.text.disabled,
        }
    }
}));

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
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
        '&.Mui-disabled': {
            backgroundColor: alpha(colors.secondary, 0.05),
            '& fieldset': {
                borderColor: alpha(colors.border, 0.5),
            }
        }
    }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.15),
        transform: 'scale(1.05)',
    }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${colors.border}`,
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

const StatusChip = styled(Chip)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    borderRadius: '8px',
    height: '32px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
}));

const ViewClientMilestone = ({milestone}) => {
    const [open, setOpen] = useState(false);

    function handleClickOpen() {
        setOpen(true);
    }
    
    function handleClose() {
        setOpen(false);
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return {
                    backgroundColor: alpha(colors.success, 0.1),
                    color: colors.success,
                    border: `1px solid ${alpha(colors.success, 0.2)}`
                };
            case 'pending':
                return {
                    backgroundColor: alpha(colors.warning, 0.1),
                    color: colors.warning,
                    border: `1px solid ${alpha(colors.warning, 0.2)}`
                };
            default:
                return {
                    backgroundColor: alpha(colors.secondary, 0.1),
                    color: colors.secondary,
                    border: `1px solid ${alpha(colors.secondary, 0.2)}`
                };
        }
    };

    return (
        <>
            <Tooltip title="View Milestone Details">
                <ActionButton onClick={handleClickOpen} size="medium">
                    <Visibility sx={{fontSize: '20px'}}/>
                </ActionButton>
            </Tooltip>

            <ModernDialog
                open={open}
                fullWidth={true}
                maxWidth="lg"
                onClose={handleClose}
                aria-labelledby="milestone-dialog-title"
            >
                <StyledDialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <Box sx={{ 
                                padding: '12px', 
                                borderRadius: '12px', 
                                backgroundColor: alpha(colors.primary, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Assignment sx={{ color: colors.primary, fontSize: '24px' }} />
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
                                    Milestone Tracker
                                </Typography>
                                <Typography 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        color: colors.text.secondary,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Track milestone progress and details
                                </Typography>
                            </Box>
                        </Box>
                        <StatusChip 
                            label={milestone.status == 'COMPLETED' ? 'completed' : 'Pending'}
                            sx={getStatusColor((milestone.status == 'COMPLETED' ? 'completed' : 'Pending'))}
                        />
                    </Box>
                </StyledDialogTitle>

                <StyledDialogContent>
                    <Stack spacing={4}>
                        {/* Overview Section */}
                        <Box>
                            <SectionHeader>
                                <Box sx={{ 
                                    padding: '8px', 
                                    borderRadius: '8px', 
                                    backgroundColor: alpha(colors.primary, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Description sx={{ color: colors.primary, fontSize: '18px' }} />
                                </Box>
                                <Typography 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 600,
                                        color: colors.text.primary,
                                        fontSize: '1.125rem'
                                    }}
                                >
                                    Overview
                                </Typography>
                            </SectionHeader>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Assignment sx={{ fontSize: '14px' }} />
                                        Title
                                    </FieldLabel>
                                    <StyledTextField
                                        disabled
                                        fullWidth
                                        value={milestone.title}
                                        placeholder="Milestone title"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Assignment sx={{ fontSize: '14px' }} />
                                        Type
                                    </FieldLabel>
                                    <StyledTextField
                                        disabled
                                        fullWidth
                                        value={milestone.type}
                                        placeholder="Milestone type"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Event sx={{ fontSize: '14px' }} />
                                        Start Date
                                    </FieldLabel>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <StyledDatePicker 
                                            disabled 
                                            value={milestone.startDate ? dayjs(milestone.startDate) : null} 
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    placeholder: "Select start date"
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Schedule sx={{ fontSize: '14px' }} />
                                        Due Date
                                    </FieldLabel>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <StyledDatePicker 
                                            disabled 
                                            value={milestone.dueDate ? dayjs(milestone.dueDate) : null} 
                                            slotProps={{
                                                textField: {
                                                    fullWidth: true,
                                                    placeholder: "Select due date"
                                                }
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <FieldLabel>
                                        <Description sx={{ fontSize: '14px' }} />
                                        Description
                                    </FieldLabel>
                                    <StyledTextField
                                        disabled
                                        multiline
                                        fullWidth
                                        value={milestone.description}
                                        placeholder="Milestone description"
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                minHeight: '200px',
                                                alignItems: 'flex-start',
                                            },
                                            '& .MuiInputBase-input': {
                                                resize: 'vertical',
                                            },
                                            '& .Mui-disabled': {
                                                WebkitTextFillColor: colors.text.primary,
                                                color: colors.text.primary
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Milestone Type Specific Trackers */}
                        {milestone.type === 'SURVEY' && <SurveyTracker milestone={milestone}/>}
                        {milestone.type === 'PEER_REVIEW' && <PeerReviewTracker milestone={milestone}/>}
                        {milestone.type === 'ACTIVITY' && <ActivityTracker milestone={milestone}/>}
                    </Stack>
                </StyledDialogContent>
            </ModernDialog>
        </>
    );
};

export default ViewClientMilestone;
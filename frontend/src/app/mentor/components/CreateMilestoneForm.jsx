import React, {useState} from "react";
import {H5, Small} from "../../components/Typography.jsx";
import Grid from "@mui/material/Grid2";
import {
    IconButton, 
    styled, 
    alpha, 
    Box, 
    Typography, 
    Tooltip, 
    Fade,
    Paper
} from "@mui/material";
import TextField from "@mui/material/TextField";
import {
    Add,
    Adjust,
    Draw,
    Timeline,
    Assessment,
    Diversity3,
    Spoke,
    Flag,
    Close,
    Info
} from "@mui/icons-material";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Step from "@mui/material/Step";

// Modern color palette (consistent with other components)
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

const ModernDialogRoot = styled('div')(({ theme }) => ({
    '& form': {
        display: 'flex',
        margin: 'auto',
        flexDirection: 'column',
        width: 'fit-content'
    },
    '& .formControl': {
        marginTop: theme.spacing(2),
        minWidth: 120
    },
    '& .formControlLabel': {
        marginTop: theme.spacing(1)
    }
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
        backgroundColor: colors.surface,
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
        padding: '14px 16px',
    },
    '& .MuiFormHelperText-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.75rem',
        marginLeft: '4px',
        marginTop: '6px',
    }
}));

const ModernDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        background: colors.surface,
        overflow: 'hidden',
    }
}));

const ModernDialogTitle = styled(DialogTitle)(({ theme }) => ({
    padding: '24px 24px 16px 24px',
    borderBottom: `1px solid ${colors.border}`,
    backgroundColor: alpha(colors.primary, 0.02),
    '& .MuiTypography-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 600,
        fontSize: '1.25rem',
        color: colors.text.primary,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    }
}));

const ModernDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: '24px',
    backgroundColor: colors.surface,
}));

const ModernDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: '16px 24px 24px 24px',
    backgroundColor: colors.surface,
    borderTop: `1px solid ${colors.border}`,
    gap: '12px',
}));

const AddMilestoneButton = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '16px',
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.05),
        transform: 'translateY(-2px)',
    }
}));

const ModernAddAvatar = styled(Avatar)(({ theme }) => ({
    width: '60px',
    height: '60px',
    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
    color: 'white',
    border: `3px solid ${colors.border}`,
    boxShadow: `0 4px 12px ${alpha(colors.primary, 0.3)}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: `0 6px 16px ${alpha(colors.primary, 0.4)}`,
    }
}));

const AddLabel = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'center',
    transition: 'color 0.2s ease-in-out'
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '12px 24px',
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-1px)',
    }
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
}));

const InfoSection = styled(Paper)(({ theme }) => ({
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.03),
    border: `1px solid ${alpha(colors.primary, 0.1)}`,
    marginBottom: '24px',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: '16px',
    top: '16px',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: alpha(colors.secondary, 0.1),
    color: colors.text.secondary,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.error, 0.1),
        color: colors.error,
        transform: 'scale(1.05)',
    }
}));

const types = ['SURVEY', 'PEER_REVIEW', 'ACTIVITY'];

const getMilestoneTypeIcon = (type) => {
    switch (type) {
        case 'PEER_REVIEW':
            return <Diversity3 sx={{ fontSize: '16px', color: colors.warning }} />;
        case 'SURVEY':
            return <Assessment sx={{ fontSize: '16px', color: colors.success }} />;
        case 'ACTIVITY':
            return <Spoke sx={{ fontSize: '16px', color: colors.primary }} />;
        default:
            return <Flag sx={{ fontSize: '16px', color: colors.secondary }} />;
    }
};

const CreateMilestoneForm = ({ program, onMilestoneCreated }) => {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();

    const [open, setOpen] = useState(false);
    const [fullWidth, setFullWidth] = useState(true);
    const [maxWidth, setMaxWidth] = useState('md');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        title: false,
        type: false
    });
    const [formData, setFormData] = useState({
        title: '',
        type: ''
    });

    function handleClickOpen() {
        setOpen(true);
        setErrors({
            title: false,
            type: false
        });
    }

    function handleClose() {
        setOpen(false);
        setFormData({
            title: '',
            type: ''
        });
        setErrors({
            title: false,
            type: false
        });
    }

    const validateForm = () => {
        const newErrors = {
            title: formData.title.trim() === '',
            type: formData.type.trim() === ''
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
        setErrors(prev => ({
            ...prev,
            [id]: false
        }));
    };

    const handleSelectInputChange = (id, value) => {
        setFormData(prevState => ({
            ...prevState,
            [id]: value
        }));
        setErrors(prev => ({
            ...prev,
            [id]: false
        }));
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        try {
            setLoading(true);
            const { data } = await axiosInstance.post("/api/programs/" + program.id + "/milestones", formData);
            setLoading(false);
            showAlert('Milestone created successfully', 'success');
            if (onMilestoneCreated) {
                onMilestoneCreated();
            }
            handleClose();
        } catch (error) {
            setLoading(false);
            showAlert('Error creating milestone', 'error');
            console.error('Error creating milestone:', error);
        }
    };

    return (
        <ModernDialogRoot>
            <Tooltip 
                title="Add New Milestone" 
                arrow 
                TransitionComponent={Fade} 
                TransitionProps={{ timeout: 600 }}
            >
                <AddMilestoneButton onClick={handleClickOpen}>
                    <ModernAddAvatar>
                        <Add sx={{ fontSize: '28px' }} />
                    </ModernAddAvatar>
                    <AddLabel>Add Milestone</AddLabel>
                </AddMilestoneButton>
            </Tooltip>

            <ModernDialog
                open={open}
                fullWidth={fullWidth}
                maxWidth={maxWidth}
                onClose={handleClose}
                aria-labelledby="create-milestone-dialog-title"
            >
                <ModernDialogTitle id="create-milestone-dialog-title">
                    <Box sx={{ 
                        padding: '8px', 
                        borderRadius: '8px', 
                        backgroundColor: alpha(colors.primary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Timeline sx={{ color: colors.primary, fontSize: '20px' }} />
                    </Box>
                    Create New Milestone
                    <CloseButton onClick={handleClose} size="small">
                        <Close sx={{ fontSize: '16px' }} />
                    </CloseButton>
                </ModernDialogTitle>

                <ModernDialogContent>
                    {/* Information Section */}
                    <InfoSection elevation={0}>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '0.875rem',
                                color: colors.text.secondary,
                                lineHeight: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Info sx={{ fontSize: '16px', color: colors.primary }} />
                            Create a new milestone to track progress in your program. Choose the appropriate type based on your learning objectives.
                        </Typography>
                    </InfoSection>

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <SectionHeader>
                                <Timeline sx={{ fontSize: '14px' }} />
                                Milestone Details
                            </SectionHeader>
                        </Grid>

                        <Grid size={{ xs: 12, md: 8 }}>
                            <StyledTextField
                                required
                                error={errors.title}
                                helperText={errors.title ? 'Title is required' : 'Enter a descriptive title for your milestone'}
                                fullWidth
                                label="Milestone Title"
                                value={formData.title}
                                onChange={handleInputChange}
                                id="title"
                                placeholder="e.g., Project Planning Assessment"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <StyledTextField
                                required
                                error={errors.type}
                                helperText={errors.type ? 'Milestone type is required' : 'Select the type of milestone'}
                                fullWidth
                                select
                                label="Milestone Type"
                                value={formData.type}
                                onChange={(event) => {
                                    handleSelectInputChange("type", event.target.value)
                                }}
                                id="type"
                            >
                                {types.map((option) => (
                                    <MenuItem 
                                        key={option} 
                                        value={option}
                                        sx={{
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.875rem',
                                            padding: '12px 16px',
                                            '&:hover': {
                                                backgroundColor: alpha(colors.primary, 0.05),
                                            }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {getMilestoneTypeIcon(option)}
                                            <Typography sx={{
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontSize: '0.875rem',
                                                fontWeight: 500
                                            }}>
                                                {option.replace('_', ' ')}
                                            </Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </StyledTextField>
                        </Grid>

                        {/* Type Description */}
                        {formData.type && (
                            <Grid size={{ xs: 12 }}>
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        padding: '16px',
                                        borderRadius: '12px',
                                        backgroundColor: alpha(colors.success, 0.03),
                                        border: `1px solid ${alpha(colors.success, 0.1)}`,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        {getMilestoneTypeIcon(formData.type)}
                                        <Typography sx={{
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: colors.text.primary
                                        }}>
                                            {formData.type.replace('_', ' ')} Milestone
                                        </Typography>
                                    </Box>
                                    <Typography sx={{
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontSize: '0.75rem',
                                        color: colors.text.secondary,
                                        lineHeight: 1.5
                                    }}>
                                        {formData.type === 'SURVEY' && 'Create surveys to collect feedback and assess learning progress.'}
                                        {formData.type === 'PEER_REVIEW' && 'Enable peer-to-peer evaluation and collaborative learning.'}
                                        {formData.type === 'ACTIVITY' && 'Design interactive activities and assignments for hands-on learning.'}
                                    </Typography>
                                </Paper>
                            </Grid>
                        )}
                    </Grid>
                </ModernDialogContent>

                <ModernDialogActions>
                    <ActionButton
                        onClick={handleClose}
                        variant="outlined"
                        sx={{
                            borderColor: colors.border,
                            color: colors.text.secondary,
                            '&:hover': {
                                borderColor: colors.secondary,
                                backgroundColor: alpha(colors.secondary, 0.05),
                                color: colors.secondary,
                            }
                        }}
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton
                        disabled={loading}
                        onClick={handleSubmit}
                        variant="contained"
                        startIcon={loading ? null : <Timeline />}
                        sx={{
                            backgroundColor: colors.success,
                            color: 'white',
                            minWidth: '120px',
                            '&:hover': {
                                backgroundColor: '#059669',
                            },
                            '&:disabled': {
                                backgroundColor: alpha(colors.success, 0.5),
                                color: 'white',
                            }
                        }}
                    >
                        {loading ? 'Creating...' : 'Create Milestone'}
                    </ActionButton>
                </ModernDialogActions>
            </ModernDialog>
        </ModernDialogRoot>
    );
};

export default CreateMilestoneForm;
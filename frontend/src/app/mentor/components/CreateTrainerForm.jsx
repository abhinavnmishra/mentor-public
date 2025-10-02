import React, {useState} from "react";
import Grid from "@mui/material/Grid2";
import {
    FormLabel,
    IconButton,
    styled,
    Box,
    Typography,
    alpha,
    Tooltip,
    Stack,
    Chip
} from "@mui/material";
import TextField from "@mui/material/TextField";
import {
    PersonAdd,
    Edit,
    Person,
    Email,
    AdminPanelSettings,
    Description,
    School
} from "@mui/icons-material";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import FormControlLabel from "@mui/material/FormControlLabel";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import LoadingButton from "@mui/lab/LoadingButton";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";
import useAuth from "../../hooks/useAuth.js";

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

const ModernDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '20px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        background: colors.surface,
        maxWidth: '700px',
        width: '100%',
        margin: '16px',
    }
}));

const ModernDialogTitle = styled(DialogTitle)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.text.primary,
    padding: '32px 32px 16px 32px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    [theme.breakpoints.down('sm')]: {
        padding: '24px 24px 16px 24px',
        fontSize: '1.25rem',
    }
}));

const ModernDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: '32px',
    [theme.breakpoints.down('sm')]: {
        padding: '24px',
    }
}));

const ModernDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: '24px 32px 32px 32px',
    borderTop: `1px solid ${colors.border}`,
    gap: '12px',
    [theme.breakpoints.down('sm')]: {
        padding: '20px 24px 24px 24px',
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

const ActionButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '10px 20px',
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: buttonVariant === 'contained' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
        transform: 'translateY(-1px)',
    }
}));

const TriggerButton = styled(IconButton)(({ theme, isCreate }) => ({
    borderRadius: isCreate ? '12px' : '8px',
    backgroundColor: isCreate ? colors.primary : 'rgba(255, 255, 255, 0.9)',
    color: isCreate ? colors.surface : colors.text.primary,
    border: isCreate ? 'none' : `1px solid rgba(255, 255, 255, 0.8)`,
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease-in-out',
    padding: isCreate ? '12px' : '8px',
    '&:hover': {
        backgroundColor: isCreate ? colors.primaryLight : 'rgba(255, 255, 255, 0.95)',
        transform: 'scale(1.05)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    }
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1rem',
    fontWeight: 600,
    color: colors.text.primary,
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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

const RoleSection = styled(Box)(({ theme }) => ({
    padding: '20px',
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    backgroundColor: alpha(colors.secondary, 0.02),
}));

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text.primary,
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&.Mui-error': {
        color: colors.error,
    }
}));

const StyledRadioGroup = styled(RadioGroup)(({ theme }) => ({
    '& .MuiFormControlLabel-root': {
        margin: '0 16px 0 0',
        '& .MuiFormControlLabel-label': {
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontSize: '0.875rem',
            color: colors.text.primary,
        }
    },
    '& .MuiRadio-root': {
        color: colors.border,
        '&.Mui-checked': {
            color: colors.primary,
        }
    }
}));

const CreateTrainerForm = ({trainer, setUpdate}) => {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const { user } = useAuth();
    const organisationId = user.organisationId;

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        firstName: false,
        lastName: false,
        email: false,
        userRole: false,
        shortDescription: false,
        longDescription: false
    });
    const [formData, setFormData] = useState({
        id: (trainer?.userId || null),
        firstName: (trainer?.firstName || ''),
        lastName: (trainer?.lastName || ''),
        email: (trainer?.email || ''),
        userRole: (trainer?.userRole || 'ROLE_USER'),
        shortDescription: (trainer?.shortDescription || ''),
        longDescription: (trainer?.longDescription || ''),
        trainerOrganisationId: organisationId
    });

    const isCreate = !trainer || !trainer.userId;

    function handleClickOpen() {
        setOpen(true);
        setErrors({
            firstName: false,
            lastName: false,
            email: false,
            userRole: false,
            shortDescription: false,
            longDescription: false
        });
    }
    
    function handleClose() {
        setOpen(false);
        setFormData({
            id: (trainer?.userId || null),
            firstName: (trainer?.firstName || ''),
            lastName: (trainer?.lastName || ''),
            email: (trainer?.email || ''),
            userRole: (trainer?.userRole || 'ROLE_USER'),
            shortDescription: (trainer?.shortDescription || ''),
            longDescription: (trainer?.longDescription || ''),
            trainerOrganisationId: organisationId
        });
        setErrors({
            firstName: false,
            lastName: false,
            email: false,
            userRole: false,
            shortDescription: false,
            longDescription: false
        });
    }

    const validateForm = () => {
        const newErrors = {
            firstName: formData.firstName.trim() === '',
            lastName: formData.lastName.trim() === '',
            email: formData.email.trim() === '',
            userRole: formData.userRole === '',
            shortDescription: formData.shortDescription.trim() === '',
            longDescription: formData.longDescription.trim() === ''
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

    const handleRoleChange = (event) => {
        setFormData(prevState => ({
            ...prevState,
            userRole: event.target.value
        }));
        setErrors(prev => ({
            ...prev,
            userRole: false
        }));
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        try {
            setLoading(true);
            const { data } = await axiosInstance.post("/api/trainers", formData);
            setLoading(false);
            showAlert(
                isCreate ?
                    'Trainer Created Successfully' :
                    'Trainer Updated Successfully'
                , 'success');
            handleClose();
        } catch (error) {
            setLoading(false);
            showAlert(
                isCreate ?
                    'Failed To Create Trainer' :
                    'Failed To Update Trainer'
                , 'error');
            console.error('Error saving trainer:', error);
        } finally {
            setUpdate(update => update + 1);
        }
    };

    return (
        <>
            <Tooltip title={isCreate ? "Add New Trainer" : "Edit Trainer"}>
                <TriggerButton 
                    onClick={handleClickOpen} 
                    isCreate={isCreate}
                    aria-label={isCreate ? "add trainer" : "edit trainer"}
                >
                    {isCreate ? (
                        <PersonAdd sx={{fontSize: '24px'}} />
                    ) : (
                        <Edit sx={{fontSize: '20px'}} />
                    )}
                </TriggerButton>
            </Tooltip>

            <ModernDialog
                open={open}
                onClose={handleClose}
                aria-labelledby="trainer-dialog-title"
            >
                <ModernDialogTitle id="trainer-dialog-title">
                    <Box sx={{ 
                        padding: '8px', 
                        borderRadius: '8px', 
                        backgroundColor: alpha(colors.primary, 0.1) 
                    }}>
                        <Person sx={{ color: colors.primary, fontSize: '20px' }} />
                    </Box>
                    {isCreate ? 'Add New Trainer' : 'Update Trainer'}
                </ModernDialogTitle>

                <ModernDialogContent>
                    <Stack spacing={4}>
                        {/* Personal Details Section */}
                        <Box>
                            <SectionHeader>
                                <Person sx={{ fontSize: '18px' }} />
                                Personal Details
                            </SectionHeader>
                            
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Person sx={{ fontSize: '14px' }} />
                                        First Name *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        error={errors.firstName}
                                        helperText={errors.firstName ? 'First name is required' : ''}
                                        placeholder="Enter first name"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        id="firstName"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Person sx={{ fontSize: '14px' }} />
                                        Last Name *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        error={errors.lastName}
                                        helperText={errors.lastName ? 'Last name is required' : ''}
                                        placeholder="Enter last name"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        id="lastName"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Email sx={{ fontSize: '14px' }} />
                                        Email Address *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        type="email"
                                        error={errors.email}
                                        helperText={errors.email ? 'Email is required' : ''}
                                        placeholder="trainer@company.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        id="email"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <AdminPanelSettings sx={{ fontSize: '14px' }} />
                                        Role & Permissions *
                                    </FieldLabel>
                                    <RoleSection>
                                        <StyledFormLabel 
                                            required 
                                            error={errors.userRole} 
                                            id="role-radio"
                                        >
                                            <AdminPanelSettings sx={{ fontSize: '16px' }} />
                                            Select Role
                                        </StyledFormLabel>
                                        <StyledRadioGroup
                                            row
                                            aria-labelledby="role-radio"
                                            value={formData.userRole}
                                            onChange={handleRoleChange}
                                            name="role-radio"
                                        >
                                            <FormControlLabel 
                                                value="ROLE_USER"
                                                control={<Radio />} 
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <School sx={{ fontSize: '16px' }} />
                                                        Trainer
                                                        <Chip 
                                                            label="Standard" 
                                                            size="small" 
                                                            sx={{ 
                                                                backgroundColor: alpha(colors.success, 0.1),
                                                                color: colors.success,
                                                                fontSize: '0.7rem'
                                                            }} 
                                                        />
                                                    </Box>
                                                } 
                                            />
                                            <FormControlLabel 
                                                value="ROLE_ADMIN" 
                                                control={<Radio />} 
                                                label={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <AdminPanelSettings sx={{ fontSize: '16px' }} />
                                                        Admin
                                                        <Chip 
                                                            label="Full Access" 
                                                            size="small" 
                                                            sx={{ 
                                                                backgroundColor: alpha(colors.warning, 0.1),
                                                                color: colors.warning,
                                                                fontSize: '0.7rem'
                                                            }} 
                                                        />
                                                    </Box>
                                                } 
                                            />
                                        </StyledRadioGroup>
                                        {errors.userRole && (
                                            <Typography 
                                                sx={{ 
                                                    color: colors.error,
                                                    fontSize: '0.75rem',
                                                    marginTop: '8px',
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                }}
                                            >
                                                Role selection is required
                                            </Typography>
                                        )}
                                    </RoleSection>
                                </Grid>
                            </Grid>
                        </Box>

                        {/* About Section */}
                        <Box>
                            <SectionHeader>
                                <Description sx={{ fontSize: '18px' }} />
                                Professional Background
                            </SectionHeader>
                            
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12 }}>
                                    <FieldLabel>
                                        <Description sx={{ fontSize: '14px' }} />
                                        Short Overview *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        multiline
                                        rows={3}
                                        error={errors.shortDescription}
                                        helperText={errors.shortDescription ? 'Overview is required' : 'Brief summary of expertise and experience'}
                                        placeholder="Provide a brief overview of the trainer's expertise, experience, and specializations..."
                                        value={formData.shortDescription}
                                        onChange={handleInputChange}
                                        id="shortDescription"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <FieldLabel>
                                        <School sx={{ fontSize: '14px' }} />
                                        Complete Qualifications *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        multiline
                                        rows={6}
                                        error={errors.longDescription}
                                        helperText={errors.longDescription ? 'Qualifications are required' : 'Detailed qualifications, certifications, and professional background'}
                                        placeholder="Provide detailed information about education, certifications, work experience, achievements, and any other relevant qualifications..."
                                        value={formData.longDescription}
                                        onChange={handleInputChange}
                                        id="longDescription"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Stack>
                </ModernDialogContent>

                <ModernDialogActions>
                    <ActionButton 
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
                    </ActionButton>
                    <LoadingButton
                        loading={loading}
                        onClick={handleSubmit}
                        variant="contained"
                        startIcon={<PersonAdd />}
                        sx={{
                            backgroundColor: colors.success,
                            '&:hover': {
                                backgroundColor: '#059669',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            }
                        }}
                    >
                        {isCreate ? 'Create Trainer' : 'Update Trainer'}
                    </LoadingButton>
                </ModernDialogActions>
            </ModernDialog>
        </>
    );
};

export default CreateTrainerForm;
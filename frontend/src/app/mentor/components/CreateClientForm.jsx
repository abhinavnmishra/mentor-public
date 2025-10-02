import React, {useState} from "react";
import {
    IconButton,
    styled,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Typography,
    Box,
    Stack,
    Divider,
    alpha,
    Tooltip
} from "@mui/material";
import {H5} from "../../components/Typography.jsx";
import Grid from "@mui/material/Grid2";
import {
    PersonAdd,
    Edit,
    Person,
    Business,
    Email,
    Work,
    Wc,
    Add
} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";

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
    ...(buttonVariant === 'add' ? {
        backgroundColor: alpha(colors.success, 0.1),
        color: colors.success,
        border: `1px solid ${alpha(colors.success, 0.2)}`,
        '&:hover': {
            backgroundColor: alpha(colors.success, 0.15),
            transform: 'scale(1.05)',
        }
    } : {
        backgroundColor: alpha(colors.primary, 0.1),
        color: colors.primary,
        border: `1px solid ${alpha(colors.primary, 0.2)}`,
        '&:hover': {
            backgroundColor: alpha(colors.primary, 0.15),
            transform: 'scale(1.05)',
        }
    })
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
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

const genders = ['Male', 'Female', 'Others'];

const CreateClientForm = ({program, client, setUpdate}) => {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState({
        firstName: false,
        lastName: false,
        gender: false,
        email: false,
        designation: false
    });
    const [formData, setFormData] = useState({
        id: (client?.user?.id || null),
        firstName: (client?.firstName || ''),
        lastName: (client?.lastName || ''),
        gender: (client?.gender || ''),
        email: (client?.email || ''),
        designation: (client?.designation || ''),
        clientOrganisationId: program.clientOrganisation.id,
        coachingProgramId: program.id
    });

    const isEditMode = formData.id != null && formData.id !== '';

    function handleClickOpen() {
        setOpen(true);
        setErrors({
            firstName: false,
            lastName: false,
            gender: false,
            email: false,
            designation: false
        });
    }

    function handleClose() {
        setOpen(false);
        setFormData({
            id: (client?.user?.id || null),
            firstName: (client?.firstName || ''),
            lastName: (client?.lastName || ''),
            gender: (client?.gender || ''),
            email: (client?.email || ''),
            designation: (client?.designation || ''),
            clientOrganisationId: program.clientOrganisation.id,
            coachingProgramId: program.id
        });
        setErrors({
            firstName: false,
            lastName: false,
            gender: false,
            email: false,
            designation: false
        });
    }

    const validateForm = () => {
        const newErrors = {
            firstName: formData.firstName.trim() === '',
            lastName: formData.lastName.trim() === '',
            gender: formData.gender === '',
            email: formData.email.trim() === '',
            designation: formData.designation.trim() === ''
        };
        
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
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

    const handleSubmit = async () => {
        if (!validateForm()) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        try {
            setLoading(true);
            const { data } = await axiosInstance.post("/api/clients", formData);
            setLoading(false);
            showAlert(
                isEditMode ?
                    'Mentee Updated Successfully' :
                    'Mentee Created Successfully'
                , 'success');
            handleClose();
        } catch (error) {
            setLoading(false);
            showAlert(
                (isEditMode ?
                    'Error Updating Mentee ' :
                    'Error Creating Mentee ') + (error?.response?.data?.message || error.message)
                , 'error');
            console.error('Error creating client:', error);
        } finally {
            setUpdate(update => update + 1);
        }
    };

    return (
        <>
            <Tooltip title={isEditMode ? "Edit Mentee" : "Add New Mentee"}>
                <ActionButton 
                    onClick={handleClickOpen} 
                    variant={isEditMode ? "edit" : "add"}
                    size="medium"
                >
                    {isEditMode ? <Edit sx={{fontSize: '20px'}}/> : <PersonAdd sx={{fontSize: '24px'}}/>}
                </ActionButton>
            </Tooltip>

            <ModernDialog
                open={open}
                fullWidth={true}
                maxWidth="md"
                onClose={handleClose}
                aria-labelledby="mentee-form-dialog"
            >
                <StyledDialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Box sx={{ 
                            padding: '12px', 
                            borderRadius: '12px', 
                            backgroundColor: alpha(isEditMode ? colors.primary : colors.success, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {isEditMode ? 
                                <Edit sx={{ color: colors.primary, fontSize: '24px' }} /> :
                                <PersonAdd sx={{ color: colors.success, fontSize: '24px' }} />
                            }
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
                                {isEditMode ? 'Update Mentee' : 'Add New Mentee'}
                            </Typography>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.secondary,
                                    fontSize: '0.875rem'
                                }}
                            >
                                {isEditMode ? 'Update mentee information and details' : 'Create a new mentee profile for the program'}
                            </Typography>
                        </Box>
                    </Box>
                </StyledDialogTitle>

                <StyledDialogContent>
                    <Stack spacing={4}>
                        {/* Personal Details Section */}
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
                                    <Person sx={{ color: colors.primary, fontSize: '18px' }} />
                                </Box>
                                <Typography 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 600,
                                        color: colors.text.primary,
                                        fontSize: '1rem'
                                    }}
                                >
                                    Personal Information
                                </Typography>
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
                                        <Wc sx={{ fontSize: '14px' }} />
                                        Gender *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        select
                                        error={errors.gender}
                                        helperText={errors.gender ? 'Gender is required' : ''}
                                        placeholder="Select gender"
                                        value={formData.gender}
                                        onChange={(event) => handleSelectInputChange("gender", event.target.value)}
                                        id="gender"
                                    >
                                        {genders.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </StyledTextField>
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
                                        placeholder="Enter email address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        id="email"
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Professional Details Section */}
                        <Box>
                            <SectionHeader>
                                <Box sx={{ 
                                    padding: '8px', 
                                    borderRadius: '8px', 
                                    backgroundColor: alpha(colors.secondary, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Work sx={{ color: colors.secondary, fontSize: '18px' }} />
                                </Box>
                                <Typography 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 600,
                                        color: colors.text.primary,
                                        fontSize: '1rem'
                                    }}
                                >
                                    Professional Information
                                </Typography>
                            </SectionHeader>

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Work sx={{ fontSize: '14px' }} />
                                        Designation *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        error={errors.designation}
                                        helperText={errors.designation ? 'Designation is required' : ''}
                                        placeholder="Enter job designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        id="designation"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Business sx={{ fontSize: '14px' }} />
                                        Organization
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth
                                        disabled
                                        placeholder="Organization name"
                                        value={program.clientOrganisation.name}
                                        id="organisation"
                                    />
                                </Grid>
                            </Grid>
                        </Box>
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
                        onClick={handleSubmit}
                        variant="contained"
                        startIcon={isEditMode ? <Edit /> : <PersonAdd />}
                        sx={{
                            backgroundColor: isEditMode ? colors.primary : colors.success,
                            '&:hover': {
                                backgroundColor: isEditMode ? '#1d4ed8' : '#059669',
                            }
                        }}
                    >
                        {isEditMode ? 'Update Mentee' : 'Create Mentee'}
                    </LoadingButton>
                </StyledDialogActions>
            </ModernDialog>
        </>
    );
};

export default CreateClientForm;
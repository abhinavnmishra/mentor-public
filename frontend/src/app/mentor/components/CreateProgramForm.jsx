import React, {useState, useEffect} from "react";
import {H5} from "../../components/Typography.jsx";
import Grid from "@mui/material/Grid2";
import MenuItem from "@mui/material/MenuItem";
import {IconButton, styled, alpha} from "@mui/material";
import TextField from "@mui/material/TextField";
import {
    LibraryAdd, Edit,
    School,
    Person,
    Business,
    CalendarToday,
    Title,
    Close
} from "@mui/icons-material";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import useAuth from "../../hooks/useAuth.js";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";
import dayjs from "dayjs";
import {
    Box,
    Typography,
    Tooltip,
    Stack,
    Chip,
    CircularProgress
} from "@mui/material";

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
        overflow: 'visible',
    }
}));

const DialogHeader = styled(DialogTitle)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.text.primary,
    padding: '32px 32px 0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    [theme.breakpoints.down("sm")]: {
        padding: '24px 24px 0 24px',
        fontSize: '1.25rem'
    }
}));

const DialogBody = styled(DialogContent)(({ theme }) => ({
    padding: '32px',
    [theme.breakpoints.down("sm")]: {
        padding: '24px'
    }
}));

const DialogFooter = styled(DialogActions)(({ theme }) => ({
    padding: '0 32px 32px 32px',
    gap: '12px',
    [theme.breakpoints.down("sm")]: {
        padding: '0 24px 24px 24px'
    }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${colors.border}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text.primary,
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: colors.text.secondary,
        '&.Mui-focused': {
            color: colors.primary,
        },
        '&.Mui-error': {
            color: colors.error,
        }
    },
    '& .MuiOutlinedInput-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        borderRadius: '12px',
        backgroundColor: colors.surface,
        transition: 'all 0.2s ease-in-out',
        '& fieldset': {
            borderColor: colors.border,
            borderWidth: '1px',
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
        fontSize: '0.875rem',
        padding: '14px 16px',
        color: colors.text.primary,
        '&::placeholder': {
            color: colors.text.disabled,
            opacity: 1,
        }
    },
    '& .MuiFormHelperText-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.75rem',
        marginLeft: '4px',
        '&.Mui-error': {
            color: colors.error,
        }
    }
}));

const ModernDatePicker = styled(DatePicker)(({ theme }) => ({
    '& .MuiInputLabel-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        fontWeight: 500,
        color: colors.text.secondary,
        '&.Mui-focused': {
            color: colors.primary,
        },
        '&.Mui-error': {
            color: colors.error,
        }
    },
    '& .MuiOutlinedInput-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        borderRadius: '12px',
        backgroundColor: colors.surface,
        transition: 'all 0.2s ease-in-out',
        '& fieldset': {
            borderColor: colors.border,
            borderWidth: '1px',
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
        fontSize: '0.875rem',
        padding: '14px 16px',
        color: colors.text.primary,
    }
}));

const CreateButton = styled(Button)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    backgroundColor: colors.primary,
    color: colors.surface,
    border: 'none',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: colors.primaryLight,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(-1px)',
    },
    '&:disabled': {
        backgroundColor: colors.text.disabled,
        color: colors.surface,
        transform: 'none',
        boxShadow: 'none',
    }
}));

const CancelButton = styled(Button)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
    borderRadius: '12px',
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: colors.text.secondary,
    border: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.secondary, 0.05),
        borderColor: colors.borderHover,
        color: colors.text.primary,
    }
}));

const TriggerButton = styled(IconButton)(({ theme }) => ({
    borderRadius: '12px',
    padding: '12px',
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.15),
        borderColor: alpha(colors.primary, 0.3),
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }
}));

const EditTriggerButton = styled(IconButton)(({ theme }) => ({
    borderRadius: '8px',
    padding: '8px',
    backgroundColor: alpha(colors.surface, 0.9),
    color: colors.text.primary,
    border: `1px solid ${alpha(colors.border, 0.5)}`,
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.1),
        borderColor: alpha(colors.primary, 0.3),
        color: colors.primary,
    }
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    color: colors.text.secondary,
    padding: '8px',
    '&:hover': {
        backgroundColor: alpha(colors.error, 0.1),
        color: colors.error,
    }
}));

const CreateProgramForm = ({program, setUpdate, sx}) => {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const { user } = useAuth();
    const organisationId = user.organisationId;

    const [open, setOpen] = useState(false);
    const [fullWidth, setFullWidth] = useState(true);
    const [maxWidth, setMaxWidth] = useState('md');
    const [loading, setLoading] = useState(false);
    const [trainers, setTrainers] = useState([]);
    const [clients, setClients] = useState([]);
    const [errors, setErrors] = useState({
        title: false,
        startDate: false,
        trainerId: false,
        clientOrganisationId: false
    });
    const [formData, setFormData] = useState({
        programId: (program?.id || null),
        title: (program?.title || ''),
        startDate: (program?.startDate || null),
        trainerId: (program?.trainer?.id || ''),
        clientOrganisationId: (program?.clientOrganisation?.id || '')
    });

    const fetchTrainers = async () => {
        try {
            const { data } = await axiosInstance.get(`/api/trainers`);
            setTrainers(data);
        } catch (error) {
            console.error('Error fetching trainers:', error);
            showAlert('Error fetching trainers', 'error');
        }
    };

    const fetchClients = async () => {
        try {
            const { data } = await axiosInstance.get('/api/clients/organisations');
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            showAlert('Error fetching clients', 'error');
        }
    };

    useEffect(() => {
        if (open) {
            fetchTrainers();
            fetchClients();
        }
    }, [open]);

    function handleClickOpen() {
        setOpen(true);
        setErrors({
            title: false,
            startDate: false,
            trainerId: false,
            clientOrganisationId: false
        });
    }

    function handleClose() {
        setOpen(false);
        setFormData({
            programId: (program?.id || null),
            title: (program?.title || ''),
            startDate: (program?.startDate || null),
            trainerId: (program?.trainer?.id || ''),
            clientOrganisationId: (program?.clientOrganisation?.id || ''),
            organisationId: organisationId
        });
        setErrors({
            title: false,
            startDate: false,
            trainerId: false,
            clientOrganisationId: false
        });
    }

    const validateForm = () => {
        const newErrors = {
            title: formData.title.trim() === '',
            startDate: !formData.startDate,
            trainerId: formData.trainerId === '',
            clientOrganisationId: formData.clientOrganisationId === ''
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

    const handleDateChange = (date) => {
        setFormData(prevState => ({
            ...prevState,
            startDate: date
        }));
        setErrors(prev => ({
            ...prev,
            startDate: false
        }));
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        try {
            setLoading(true);
            const { data } = await axiosInstance.post("/api/programs", formData);
            setLoading(false);
            showAlert(
                formData.programId == null || formData.programId === '' ?
                    'Program Created Successfully' :
                    'Program Updated Successfully'
                , 'success');
            handleClose();
        } catch (error) {
            setLoading(false);
            showAlert(
                (formData.programId == null || formData.programId === '' ?
                    'Error Creating Program' :
                    'Error Updating Program') + error.message
                , 'error');
            console.error('Error creating program:', error);
        } finally {
            setUpdate(update => update + 1);
        }
    };

    const isEditing = formData.programId != null && formData.programId !== '';

    return (
        <Box onClick={(event) => event.stopPropagation()}>
            {/* Trigger Button */}
            <Tooltip title={isEditing ? "Edit Program" : "Create New Program"}>
                {isEditing ? (
                    <EditTriggerButton sx={sx} onClick={handleClickOpen}>
                        <Edit sx={{ fontSize: '20px' }} />
                    </EditTriggerButton>
                ) : (
                    <TriggerButton onClick={handleClickOpen}>
                        <LibraryAdd sx={{ fontSize: '24px' }} />
                    </TriggerButton>
                )}
            </Tooltip>

            {/* Dialog */}
            <ModernDialog
                open={open}
                onClose={handleClose}
                maxWidth={false}
            >
                {/* Header */}
                <DialogHeader>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ 
                            padding: '8px', 
                            borderRadius: '8px', 
                            backgroundColor: alpha(colors.primary, 0.1) 
                        }}>
                            <School sx={{ color: colors.primary, fontSize: '20px' }} />
                        </Box>
                        <Typography sx={{
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            color: colors.text.primary,
                        }}>
                            {isEditing ? 'Update Program' : 'Create New Program'}
                        </Typography>
                    </Stack>
                    <CloseButton onClick={handleClose}>
                        <Close sx={{ fontSize: '20px' }} />
                    </CloseButton>
                </DialogHeader>

                {/* Body */}
                <DialogBody>
                    {/* Program Details Section */}
                    <SectionHeader>
                        <Box sx={{ 
                            padding: '6px', 
                            borderRadius: '6px', 
                            backgroundColor: alpha(colors.secondary, 0.1) 
                        }}>
                            <Title sx={{ color: colors.secondary, fontSize: '16px' }} />
                        </Box>
                        <SectionTitle>Program Details</SectionTitle>
                    </SectionHeader>

                    <Grid container spacing={3}>
                        {/* Program Title */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <ModernTextField
                                required
                                fullWidth
                                id="title"
                                label="Program Title"
                                placeholder="Enter program title"
                                value={formData.title}
                                onChange={handleInputChange}
                                error={errors.title}
                                helperText={errors.title ? 'Program title is required' : 'A descriptive title for your mentorship program'}
                                InputProps={{
                                    startAdornment: (
                                        <Title sx={{ 
                                            color: colors.text.disabled, 
                                            fontSize: '18px', 
                                            marginRight: '8px' 
                                        }} />
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Start Date */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <ModernDatePicker
                                    label="Start Date"
                                    value={formData.startDate ? dayjs(formData.startDate) : null}
                                    onChange={handleDateChange}
                                    slotProps={{
                                        textField: {
                                            required: true,
                                            fullWidth: true,
                                            error: errors.startDate,
                                            helperText: errors.startDate ? 'Start date is required' : 'When the program begins',
                                            InputProps: {
                                                startAdornment: (
                                                    <CalendarToday sx={{ 
                                                        color: colors.text.disabled, 
                                                        fontSize: '18px', 
                                                        marginRight: '8px' 
                                                    }} />
                                                ),
                                            }
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>

                        {/* Trainer Selection */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <ModernTextField
                                required
                                fullWidth
                                select
                                id="trainerId"
                                label="Assigned Trainer"
                                value={formData.trainerId}
                                onChange={(event) => handleSelectInputChange('trainerId', event.target.value)}
                                error={errors.trainerId}
                                helperText={errors.trainerId ? 'Trainer selection is required' : 'Choose the trainer for this program'}
                                InputProps={{
                                    startAdornment: (
                                        <Person sx={{ 
                                            color: colors.text.disabled, 
                                            fontSize: '18px', 
                                            marginRight: '8px' 
                                        }} />
                                    ),
                                }}
                            >
                                {trainers.map((trainer) => (
                                    <MenuItem key={trainer.id} value={trainer.id}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography sx={{ fontWeight: 500 }}>
                                                {trainer.firstName} {trainer.lastName}
                                            </Typography>
                                            <Chip 
                                                label={trainer.userRole?.replace('ROLE_', '')}
                                                size="small" 
                                                sx={{ 
                                                    height: '20px', 
                                                    fontSize: '0.7rem',
                                                    backgroundColor: alpha(colors.primary, 0.1),
                                                    color: colors.primary
                                                }} 
                                            />
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </ModernTextField>
                        </Grid>

                        {/* Client Selection */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <ModernTextField
                                required
                                fullWidth
                                select
                                id="clientOrganisationId"
                                label="Client Organization"
                                value={formData.clientOrganisationId}
                                onChange={(event) => handleSelectInputChange('clientOrganisationId', event.target.value)}
                                error={errors.clientOrganisationId}
                                helperText={errors.clientOrganisationId ? 'Client organization is required' : 'Select the client organization'}
                                InputProps={{
                                    startAdornment: (
                                        <Business sx={{ 
                                            color: colors.text.disabled, 
                                            fontSize: '18px', 
                                            marginRight: '8px' 
                                        }} />
                                    ),
                                }}
                            >
                                {clients.map((client) => (
                                    <MenuItem key={client.id} value={client.id}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Typography sx={{ fontWeight: 500 }}>
                                                {client.name}
                                            </Typography>
                                            {client.domain && (
                                                <Chip 
                                                    label={client.domain} 
                                                    size="small" 
                                                    sx={{ 
                                                        height: '20px', 
                                                        fontSize: '0.7rem',
                                                        backgroundColor: alpha(colors.success, 0.1),
                                                        color: colors.success
                                                    }} 
                                                />
                                            )}
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </ModernTextField>
                        </Grid>
                    </Grid>
                </DialogBody>

                {/* Footer */}
                <DialogFooter>
                    <CancelButton onClick={handleClose} disabled={loading}>
                        Cancel
                    </CancelButton>
                    <CreateButton 
                        onClick={handleSubmit} 
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LibraryAdd />}
                    >
                        {loading ? 'Processing...' : (isEditing ? 'Update Program' : 'Create Program')}
                    </CreateButton>
                </DialogFooter>
            </ModernDialog>
        </Box>
    );
};

export default CreateProgramForm;
import React, {useState, useRef} from "react";
import Grid from "@mui/material/Grid2";
import MenuItem from "@mui/material/MenuItem";
import { 
    IconButton, 
    styled, 
    Box, 
    Menu,
    Typography,
    alpha,
    Tooltip,
    Stack,
    Chip
} from "@mui/material";
import TextField from "@mui/material/TextField";
import {
    AddAPhoto,
    AddBusiness,
    Edit,
    Delete,
    Visibility,
    Business,
    Email,
    Domain,
    Groups,
    CloudUpload,
    Close
} from "@mui/icons-material";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Avatar from "@mui/material/Avatar";
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
        maxWidth: '600px',
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

const ImageUploadArea = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px',
    borderRadius: '16px',
    border: `2px dashed ${colors.border}`,
    backgroundColor: alpha(colors.secondary, 0.02),
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
        borderColor: colors.primary,
        backgroundColor: alpha(colors.primary, 0.02),
    }
}));

const LogoPreview = styled(Box)(({ theme }) => ({
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    border: `2px solid ${colors.border}`,
    backgroundColor: colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        borderColor: colors.primary,
        transform: 'scale(1.02)',
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

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const ModernMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: '12px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        marginTop: '8px',
    },
    '& .MuiMenuItem-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        padding: '12px 16px',
        '&:hover': {
            backgroundColor: alpha(colors.primary, 0.05),
        }
    }
}));

const size = ['1-10', '11-50', '51-100', '101-200', '201-500', '501-1000', '1000+'];

const CreateClientOrganisationForm = ({client, setUpdate}) => {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const fileInputRef = useRef(null);
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [logoImageUrl, setLogoImageUrl] = useState(client?.logoImageUrl || '');
    const [anchorEl, setAnchorEl] = useState(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [errors, setErrors] = useState({
        name: false,
        domain: false,
        email: false,
        size: false
    });
    const [formData, setFormData] = useState({
        id: (client?.id || null),
        name: (client?.name || ''),
        domain: (client?.domain || ''),
        email: (client?.email || ''),
        size: (client?.size || '')
    });

    const isCreate = !client || !client.id;

    function handleClickOpen() {
        setOpen(true);
        setErrors({
            name: false,
            domain: false,
            email: false,
            size: false
        });
    }
    
    function handleClose() {
        setOpen(false);
        setFormData({
            id: (client?.id || null),
            name: (client?.name || ''),
            domain: (client?.domain || ''),
            email: (client?.email || ''),
            size: (client?.size || '')
        });
        setLogoImageUrl(client?.logoImageUrl || '');
        setErrors({
            name: false,
            domain: false,
            email: false,
            size: false
        });
    }

    const validateForm = () => {
        const newErrors = {
            name: formData.name.trim() === '',
            domain: formData.domain.trim() === '',
            email: formData.email.trim() === '',
            size: formData.size === ''
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
            const submitData = {
                ...formData,
                logoImageUrl: logoImageUrl
            };
            const { data } = await axiosInstance.post("/api/clients/organisations", submitData);
            setLoading(false);
            showAlert(
                isCreate ?
                    'Client Organisation Created Successfully' :
                    'Client Organisation Updated Successfully'
                , 'success');
            handleClose();
        } catch (error) {
            setLoading(false);
            showAlert('Error saving organisation', 'error');
        } finally {
            setUpdate(update => update + 1);
        }
    };

    const handleImageMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleImageMenuClose = () => {
        setAnchorEl(null);
    };

    const handleRemoveImage = () => {
        setLogoImageUrl('');
        handleImageMenuClose();
    };

    const handlePreviewImage = () => {
        setPreviewOpen(true);
        handleImageMenuClose();
    };

    const handleClosePreview = () => {
        setPreviewOpen(false);
    };

    const handleEditImage = () => {
        fileInputRef.current.click();
        handleImageMenuClose();
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosInstance.post('/public/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const imageId = response.data;
            const newImageUrl = `/public/${imageId}`;
            setLogoImageUrl(newImageUrl);
            showAlert('Logo uploaded successfully', 'success');
        } catch (err) {
            showAlert('Failed to upload logo', 'error');
            console.error('Error uploading logo:', err);
        } finally {
            setUploadingImage(false);
        }
    };

    return (
        <>
            <Tooltip title={isCreate ? "Add New Organization" : "Edit Organization"}>
                <TriggerButton 
                    onClick={handleClickOpen} 
                    isCreate={isCreate}
                    aria-label={isCreate ? "add client" : "edit client"}
                >
                    {isCreate ? (
                        <AddBusiness sx={{fontSize: '24px'}} />
                    ) : (
                        <Edit sx={{fontSize: '20px'}} />
                    )}
                </TriggerButton>
            </Tooltip>

            <ModernDialog
                open={open}
                onClose={handleClose}
                aria-labelledby="organization-dialog-title"
            >
                <ModernDialogTitle id="organization-dialog-title">
                    <Box sx={{ 
                        padding: '8px', 
                        borderRadius: '8px', 
                        backgroundColor: alpha(colors.primary, 0.1) 
                    }}>
                        <Business sx={{ color: colors.primary, fontSize: '20px' }} />
                    </Box>
                    {isCreate ? 'Create Client Organization' : 'Update Client Organization'}
                </ModernDialogTitle>

                <ModernDialogContent>
                    <Stack spacing={4}>
                        {/* Logo Upload Section */}
                        <Box>
                            <SectionHeader>
                                <CloudUpload sx={{ fontSize: '18px' }} />
                                Organization Logo
                            </SectionHeader>
                            
                            {!logoImageUrl ? (
                                <ImageUploadArea onClick={() => fileInputRef.current.click()}>
                                    <Avatar
                                        sx={{
                                            width: '80px',
                                            height: '80px',
                                            backgroundColor: alpha(colors.primary, 0.1),
                                            color: colors.primary,
                                            marginBottom: '16px'
                                        }}
                                    >
                                        <AddAPhoto sx={{fontSize: '32px'}} />
                                    </Avatar>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontWeight: 600,
                                            color: colors.text.primary,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        {uploadingImage ? 'Uploading...' : 'Upload Logo'}
                                    </Typography>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.875rem',
                                            color: colors.text.secondary,
                                            textAlign: 'center'
                                        }}
                                    >
                                        Click to browse or drag and drop your logo
                                    </Typography>
                                    <Chip 
                                        label="Optional" 
                                        size="small" 
                                        sx={{ 
                                            marginTop: '8px',
                                            backgroundColor: alpha(colors.secondary, 0.1),
                                            color: colors.text.secondary,
                                            fontSize: '0.7rem'
                                        }} 
                                    />
                                </ImageUploadArea>
                            ) : (
                                <LogoPreview onClick={handleImageMenuOpen}>
                                    <img
                                        src={`${backendBaseUrl}${logoImageUrl}`}
                                        alt="Organization Logo"
                                        style={{
                                            maxHeight: '200px',
                                            maxWidth: '100%',
                                            objectFit: 'contain'
                                        }}
                                    />
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            backgroundColor: alpha(colors.surface, 0.9),
                                            backdropFilter: 'blur(8px)',
                                            '&:hover': { 
                                                backgroundColor: colors.surface,
                                                transform: 'scale(1.1)'
                                            }
                                        }}
                                        size="small"
                                    >
                                        <Edit sx={{ fontSize: '16px' }} />
                                    </IconButton>
                                </LogoPreview>
                            )}
                            
                            <VisuallyHiddenInput
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                            />
                        </Box>

                        {/* Company Details Section */}
                        <Box>
                            <SectionHeader>
                                <Business sx={{ fontSize: '18px' }} />
                                Company Details
                            </SectionHeader>
                            
                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Business sx={{ fontSize: '14px' }} />
                                        Company Name *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        error={errors.name}
                                        helperText={errors.name ? 'Company name is required' : ''}
                                        placeholder="Enter company name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        id="name"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Domain sx={{ fontSize: '14px' }} />
                                        Domain *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        error={errors.domain}
                                        helperText={errors.domain ? 'Domain is required' : ''}
                                        placeholder="e.g., Technology, Healthcare"
                                        value={formData.domain}
                                        onChange={handleInputChange}
                                        id="domain"
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
                                        placeholder="contact@company.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        id="email"
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <FieldLabel>
                                        <Groups sx={{ fontSize: '14px' }} />
                                        Company Size *
                                    </FieldLabel>
                                    <StyledTextField
                                        fullWidth
                                        required
                                        select
                                        error={errors.size}
                                        helperText={errors.size ? 'Size is required' : ''}
                                        placeholder="Select company size"
                                        value={formData.size}
                                        onChange={(event) => {
                                            handleSelectInputChange('size', event.target.value);
                                        }}
                                        id="size"
                                    >
                                        {size.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option} employees
                                            </MenuItem>
                                        ))}
                                    </StyledTextField>
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
                        startIcon={<AddBusiness />}
                        sx={{
                            backgroundColor: colors.success,
                            '&:hover': {
                                backgroundColor: '#059669',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            }
                        }}
                    >
                        {isCreate ? 'Create Organization' : 'Update Organization'}
                    </LoadingButton>
                </ModernDialogActions>
            </ModernDialog>

            {/* Image Management Menu */}
            <ModernMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleImageMenuClose}
            >
                <MenuItem onClick={handleEditImage}>
                    <Edit sx={{ mr: 2, fontSize: '18px' }} /> Replace Logo
                </MenuItem>
                <MenuItem onClick={handlePreviewImage}>
                    <Visibility sx={{ mr: 2, fontSize: '18px' }} /> Preview
                </MenuItem>
                <MenuItem onClick={handleRemoveImage} sx={{ color: colors.error }}>
                    <Delete sx={{ mr: 2, fontSize: '18px' }} /> Remove Logo
                </MenuItem>
            </ModernMenu>

            {/* Image Preview Overlay */}
            {previewOpen && logoImageUrl && (
                <Box
                    onClick={handleClosePreview}
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        cursor: 'pointer'
                    }}
                >
                    <IconButton
                        onClick={handleClosePreview}
                        sx={{
                            position: 'absolute',
                            top: '24px',
                            right: '24px',
                            color: 'white',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            }
                        }}
                    >
                        <Close />
                    </IconButton>
                    <img
                        src={`${backendBaseUrl}${logoImageUrl}`}
                        alt="Logo Preview"
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            objectFit: 'contain',
                            borderRadius: '12px'
                        }}
                    />
                </Box>
            )}
        </>
    );
};

export default CreateClientOrganisationForm;
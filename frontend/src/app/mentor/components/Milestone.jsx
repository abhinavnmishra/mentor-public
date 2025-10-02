import * as React from 'react';
import {
    Box, 
    Card, 
    IconButton, 
    styled, 
    Typography,
    Paper,
    Chip,
    Tooltip,
    Divider,
    Stack,
    alpha,
} from "@mui/material";
import {H3, H5, Small} from "../../components/Typography.jsx";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
    AutoAwesome, 
    Delete, 
    Publish, 
    Save,
    CalendarToday,
    Category,
    Description,
    Title,
    Info,
} from "@mui/icons-material";
import Grid from "@mui/material/Grid2";
import MenuItem from "@mui/material/MenuItem";
import {DatePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import Activity from "./Activity.jsx";
import Survey from "./Survey.jsx";
import PeerReview from "./PeerReview.jsx";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";
import LoadingButton from "@mui/lab/LoadingButton";
import FocusAreaSelector from "./FocusAreaSelector.jsx";
import {useTheme} from "@mui/material/styles";

const types = [
    {label : 'Activity', value : 'ACTIVITY'},
    {label : 'Survey', value : 'SURVEY'},
    {label : 'Peer Review', value : 'PEER_REVIEW'}]

// Modern color palette
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

// Enhanced styled components with modern design
const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
        }
    }
}));

const ReadOnlyField = styled(Box)(({ theme }) => ({
    padding: '12px 16px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.secondary, 0.05),
    border: `1.5px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    color: colors.text.primary,
    minHeight: '56px',
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

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
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

const EnhanceButton = styled(LoadingButton)(({ theme }) => ({
    position: 'absolute',
    right: '12px',
    top: '12px',
    minWidth: 'auto',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.15),
        transform: 'scale(1.05)',
    },
    '& .MuiLoadingButton-loadingIndicator': {
        color: colors.primary,
    }
}));

export default function Milestone({programFocusAreas, milestone, handleDelete, handlePublish}) {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [enhancingDescription, setEnhancingDescription] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const theme = useTheme();
    const [focusAreas, setFocusAreas] = useState(programFocusAreas);
    const [selectedAreas, setSelectedAreas] = useState(milestone.focusAreas);
    const [formData, setFormData] = useState({
        title: milestone.title || '',
        description: milestone.description || '',
        startDate: milestone.startDate || null,
        dueDate: milestone.dueDate || null,
        focusAreaIds: milestone.focusAreas.map(area => area.id)
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setSelectedAreas(milestone.focusAreas);
        setFormData({
            title: milestone.title || '',
            description: milestone.description || '',
            startDate: milestone.startDate || null,
            dueDate: milestone.dueDate || null,
            focusAreaIds: milestone.focusAreas.map(area => area.id)
        });
    }, [milestone]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        setErrors(prev => ({
            ...prev,
            [id]: ''
        }));
    };

    const handleDateChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value ? value.format('YYYY-MM-DD') : null
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFocusAreasChange = (updatedAreas) => {
        setSelectedAreas(updatedAreas);
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.put(`/api/programs/milestones/${milestone.id}`, {
                title: formData.title,
                description: formData.description || null,
                startDate: formData.startDate,
                dueDate: formData.dueDate,
                focusAreaIds: selectedAreas.map(area => area.id)
            });
            showAlert('Milestone updated successfully', 'success');
        } catch (error) {
            console.error('Error updating milestone:', error);
            showAlert('Failed to update milestone', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoAwesome = async () => {
        if (!milestone.id) {
            showAlert('Please save the milestone first', 'error');
            return;
        }

        setEnhancingDescription(true);
        try {
            const response = await axiosInstance.post('/api/ai/completion', {
                keyword: 'milestone_details',
                id: milestone.id,
                currentText: formData.description
            });

            setFormData(prev => ({
                ...prev,
                description: response.data
            }));
            showAlert('Description enhanced successfully', 'success');
        } catch (error) {
            console.error('Error enhancing description:', error);
            showAlert('Failed to enhance description', 'error');
        } finally {
            setEnhancingDescription(false);
        }
    };

    const getTypeIcon = (type) => {
        switch(type) {
            case 'ACTIVITY': return <Category sx={{ fontSize: '18px' }} />;
            case 'SURVEY': return <Description sx={{ fontSize: '18px' }} />;
            case 'PEER_REVIEW': return <Info sx={{ fontSize: '18px' }} />;
            default: return <Category sx={{ fontSize: '18px' }} />;
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'ACTIVITY': return colors.primary;
            case 'SURVEY': return colors.success;
            case 'PEER_REVIEW': return colors.warning;
            default: return colors.secondary;
        }
    };

    const getTypeLabel = (type) => {
        const typeObj = types.find(t => t.value === type);
        return typeObj ? typeObj.label : type;
    };

    return (
        <Box sx={{ 
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            margin: '0 0',
            padding: '0 0'
        }}>
            {/* Main Details Card */}
            <ModernCard sx={{ padding: '32px', marginTop: '24px' }}>
                {/* Header Section */}
                <SectionHeader>
                    <Box sx={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        backgroundColor: alpha(colors.primary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Description sx={{ color: colors.primary, fontSize: '24px' }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 700,
                                color: colors.text.primary,
                                fontSize: '1.75rem',
                                lineHeight: 1.2,
                                marginBottom: '4px'
                            }}
                        >
                            Milestone Configuration
                        </Typography>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                color: colors.text.secondary,
                                fontSize: '0.875rem'
                            }}
                        >
                            Configure milestone details, timeline, and focus areas
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                        <Tooltip title="Delete Milestone">
                            <ActionButton 
                                onClick={handleDelete} 
                                variant="outlined" 
                                startIcon={<Delete />} 
                                sx={{ 
                                    color: colors.error,
                                    borderColor: colors.error,
                                    '&:hover': {
                                        backgroundColor: alpha(colors.error, 0.1),
                                        borderColor: colors.error,
                                    }
                                }}
                            >
                                Delete
                            </ActionButton>
                        </Tooltip>
                        {milestone.status === 'PAUSED' && (
                            <Tooltip title="Publish Milestone">
                                <ActionButton 
                                    onClick={handlePublish} 
                                    variant="outlined" 
                                    startIcon={<Publish />}
                                    sx={{ 
                                        color: colors.primary,
                                        borderColor: colors.primary,
                                        '&:hover': {
                                            backgroundColor: alpha(colors.primary, 0.1),
                                            borderColor: colors.primary,
                                        }
                                    }}
                                >
                                    Publish
                                </ActionButton>
                            </Tooltip>
                        )}
                        <Tooltip title="Save Changes">
                            <LoadingButton
                                loading={loading}
                                startIcon={<Save />}
                                variant="contained"
                                onClick={handleSubmit}
                                sx={{
                                    backgroundColor: colors.success,
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    padding: '10px 20px',
                                    '&:hover': {
                                        backgroundColor: '#059669',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                    }
                                }}
                            >
                                Save Changes
                            </LoadingButton>
                        </Tooltip>
                    </Stack>
                </SectionHeader>

                <Grid container spacing={4}>
                    {/* Left Column - Main Content */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Stack spacing={3}>
                            {/* Title Field */}
                            <Box>
                                <FieldLabel>
                                    <Title sx={{ fontSize: '14px' }} />
                                    Milestone Title *
                                </FieldLabel>
                                <StyledTextField
                                    fullWidth
                                    id="title"
                                    placeholder="Enter a descriptive title for this milestone"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    error={!!errors.title}
                                    helperText={errors.title}
                                />
                            </Box>

                            {/* Description Field */}
                            <Box>
                                <FieldLabel>
                                    <Description sx={{ fontSize: '14px' }} />
                                    Milestone Description
                                    <Tooltip title="Use AI to enhance your description">
                                        <Info sx={{ fontSize: '14px', color: colors.text.disabled, cursor: 'help' }} />
                                    </Tooltip>
                                </FieldLabel>
                                <Box sx={{ position: 'relative' }}>
                                    <StyledTextField
                                        fullWidth
                                        id="description"
                                        multiline
                                        rows={isDescriptionExpanded ? 12 : 6}
                                        placeholder="Describe the milestone objectives, requirements, and expected outcomes..."
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                alignItems: 'flex-start',
                                            }
                                        }}
                                    />
                                    <EnhanceButton
                                        loading={enhancingDescription}
                                        onClick={handleAutoAwesome}
                                        title="Enhance with AI"
                                    >
                                        <AutoAwesome sx={{ fontSize: '18px' }} />
                                    </EnhanceButton>
                                </Box>
                                <Button
                                    size="small"
                                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                    sx={{
                                        marginTop: '8px',
                                        color: colors.text.secondary,
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    }}
                                >
                                    {isDescriptionExpanded ? 'Show Less' : 'Expand Editor'}
                                </Button>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Right Column - Metadata */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Stack spacing={3}>
                            {/* Type Field (Read-only) */}
                            <Box>
                                <FieldLabel>
                                    <Category sx={{ fontSize: '14px' }} />
                                    Milestone Type
                                </FieldLabel>
                                <ReadOnlyField>
                                    <Box 
                                        sx={{ 
                                            color: getTypeColor(milestone.type),
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {getTypeIcon(milestone.type)}
                                    </Box>
                                    <Typography sx={{ 
                                        fontWeight: 500,
                                        color: colors.text.primary,
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    }}>
                                        {getTypeLabel(milestone.type)}
                                    </Typography>
                                    <Chip 
                                        label="Read Only" 
                                        size="small" 
                                        sx={{ 
                                            marginLeft: 'auto',
                                            backgroundColor: alpha(colors.secondary, 0.1),
                                            color: colors.text.secondary,
                                            fontSize: '0.7rem',
                                            height: '20px',
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        }} 
                                    />
                                </ReadOnlyField>
                            </Box>

                            {/* Start Date */}
                            <Box>
                                <FieldLabel>
                                    <CalendarToday sx={{ fontSize: '14px' }} />
                                    Start Date
                                </FieldLabel>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <StyledDatePicker
                                        value={formData.startDate ? dayjs(formData.startDate) : null}
                                        onChange={(value) => handleDateChange('startDate', value)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                placeholder: "Select start date"
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            {/* Due Date */}
                            <Box>
                                <FieldLabel>
                                    <CalendarToday sx={{ fontSize: '14px' }} />
                                    Due Date
                                </FieldLabel>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <StyledDatePicker
                                        value={formData.dueDate ? dayjs(formData.dueDate) : null}
                                        onChange={(value) => handleDateChange('dueDate', value)}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                placeholder: "Select due date"
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>
                        </Stack>
                    </Grid>

                    {/* Focus Areas Section */}
                    <Grid size={{ xs: 12 }}>
                        <Divider sx={{ marginY: '32px' }} />
                        <FocusAreaSelector
                            availableFocusAreas={focusAreas}
                            selectedFocusAreas={selectedAreas}
                            onFocusAreasChange={handleFocusAreasChange}
                            title="Focus Areas"
                            description="Select focus areas for this milestone. These represent the skills and competencies addressed in this milestone."
                            emptyStateMessage="Select focus areas from the dropdown above to associate with this milestone."
                            removeTooltip="Remove from Milestone"
                        />
                    </Grid>
                </Grid>
            </ModernCard>

            {/* Type-specific Content Card */}
            <ModernCard sx={{ padding: '32px', marginTop: '24px', marginBottom: '120px' }}>

                {milestone.type === 'ACTIVITY' && <Activity milestone={milestone} />}
                {milestone.type === 'SURVEY' && <Survey milestone={milestone} />}
                {milestone.type === 'PEER_REVIEW' && <PeerReview milestone={milestone} />}
            </ModernCard>
        </Box>
    );
}

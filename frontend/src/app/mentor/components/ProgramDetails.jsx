import * as React from 'react';
import Grid from "@mui/material/Grid2";
import {
    Box, 
    Card, 
    IconButton, 
    styled, 
    alpha, 
    Typography, 
    Tooltip, 
    Fade,
    Paper,
    Stack,
    Chip,
    Portal,
    Slide
} from "@mui/material";
import TextField from "@mui/material/TextField";
import {H3} from "../../components/Typography.jsx";
import TrainerCard from "./TrainerCard.jsx";
import Edit from "@mui/icons-material/Edit";
import {
    AutoAwesome, 
    Save, 
    Assessment, 
    Description, 
    Info,
    CheckCircle,
    Schedule,
    Warning
} from "@mui/icons-material";
import LoadingButton from '@mui/lab/LoadingButton';
import {useState} from "react";
import ProgramStatus from "./ProgramStatus.jsx";
import Button from "@mui/material/Button";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";
import FocusAreas from "./FocusAreas.jsx";
import { useNavigate } from "react-router-dom";

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

const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    transition: 'all 0.2s ease-in-out',
    overflow: 'hidden',
    '&:hover': {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        transform: 'translateY(-2px)',
    }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '4px 0',
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: '20px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: 0,
}));

const ActionGroup = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexWrap: 'wrap',
}));

const ModernIconButton = styled(IconButton)(({ theme }) => ({
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.secondary, 0.1),
    color: colors.text.secondary,
    border: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.1),
        color: colors.primary,
        borderColor: colors.primary,
        transform: 'scale(1.05)',
    },
    '&.active': {
        backgroundColor: alpha(colors.primary, 0.1),
        color: colors.primary,
        borderColor: colors.primary,
    }
}));

const EnhanceButton = styled(LoadingButton)(({ theme }) => ({
    width: '44px',
    height: '44px',
    minWidth: '44px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.warning, 0.1),
    color: colors.warning,
    border: `1px solid ${alpha(colors.warning, 0.2)}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.warning, 0.15),
        borderColor: colors.warning,
        transform: 'scale(1.05)',
    },
    '&.Mui-disabled': {
        backgroundColor: alpha(colors.secondary, 0.05),
        color: colors.text.disabled,
        borderColor: colors.border,
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
        transition: 'all 0.2s ease-in-out',
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
        lineHeight: 1.6,
        '&::placeholder': {
            color: colors.text.disabled,
            opacity: 1,
        }
    }
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '12px 20px',
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-1px)',
    }
}));

const SaveButton = styled(ActionButton)(({ theme }) => ({
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
}));

const FloatingNotification = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '16px 20px',
    borderRadius: '16px',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '320px',
    maxWidth: '400px',
    zIndex: 1300,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    [theme.breakpoints.down('sm')]: {
        bottom: '16px',
        right: '16px',
        left: '16px',
        minWidth: 'auto',
        maxWidth: 'none',
    }
}));

const FloatingSaveButton = styled(LoadingButton)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '8px 16px',
    backgroundColor: colors.success,
    minWidth: '80px',
    '&:hover': {
        backgroundColor: '#059669',
    }
}));

const ReportButton = styled(ActionButton)(({ theme }) => ({
    background: 'linear-gradient(135deg, #FF0A6C 0%, #2D27FF 100%)',
    color: 'white',
    '&:hover': {
        background: 'linear-gradient(135deg, #E6095F 0%, #2620E6 100%)',
    }
}));

const InfoSection = styled(Paper)(({ theme }) => ({
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.03),
    border: `1px solid ${alpha(colors.primary, 0.1)}`,
    marginBottom: '20px',
}));

const EditModeIndicator = styled(Chip)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: alpha(colors.warning, 0.1),
    color: colors.warning,
    border: `1px solid ${alpha(colors.warning, 0.2)}`,
    '& .MuiChip-icon': {
        color: colors.warning,
    }
}));

export default function ProgramDetails({program}) {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState(program.description);
    const [status, setStatus] = useState((program.status == null || program.status === '') ? 'ACTIVE' : program.status);
    const [enhancing, setEnhancing] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [originalData, setOriginalData] = useState({
        description: program.description,
        status: program.status || 'ACTIVE'
    });

    // Effect to detect unsaved changes
    React.useEffect(() => {
        const hasChanges = description !== originalData.description || status !== originalData.status;
        setHasUnsavedChanges(hasChanges);
    }, [description, status, originalData]);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const requestBody = {
                description: description,
                status: status
            };

            const { data } = await axiosInstance.put(`/api/programs/${program.id}`, requestBody);
            showAlert('Program updated successfully', 'success');
            setOriginalData({
                description: description,
                status: status
            });
            setHasUnsavedChanges(false);
            setLoading(false);
        } catch (error) {
            console.error('Error updating program:', error);
            showAlert('Error updating program', 'error');
            setLoading(false);
        }
    };

    const handleAutoAwesome = async () => {
        try {
            setEnhancing(true);
            const { data } = await axiosInstance.post('/api/ai/completion', {
                keyword: 'program_description',
                id: program.id,
                currentText: description
            });
            setDescription(data);
            showAlert('Description enhanced successfully', 'success');
        } catch (error) {
            console.error('Error enhancing description:', error);
            showAlert('Error enhancing description', 'error');
        } finally {
            setEnhancing(false);
        }
    };

    return (
        <>
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <ModernCard sx={{ padding: '32px', marginBottom: '32px' }}>
                    <HeaderSection>
                        <SectionTitle>
                            <Box sx={{ 
                                padding: '8px', 
                                borderRadius: '8px', 
                                backgroundColor: alpha(colors.primary, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Description sx={{ color: colors.primary, fontSize: '20px' }} />
                            </Box>
                            About The Program
                        </SectionTitle>
                        
                        <ActionGroup>
                            <Tooltip 
                                title="Enhance with AI" 
                                arrow 
                                TransitionComponent={Fade} 
                                TransitionProps={{ timeout: 600 }}
                            >
                                <EnhanceButton
                                    loading={enhancing}
                                    onClick={handleAutoAwesome}
                                    disabled={loading}
                                >
                                    {!enhancing && <AutoAwesome sx={{ fontSize: '20px' }} />}
                                </EnhanceButton>
                            </Tooltip>
                            
                            <ProgramStatus status={status} setStatus={setStatus}/>
                            
                            <ReportButton
                                variant="contained"
                                startIcon={<Assessment />}
                                onClick={() => window.open('/portal/report/' + program.id, '_blank')}
                            >
                                Report Wizard
                            </ReportButton>
                        </ActionGroup>
                    </HeaderSection>

                    <StyledTextField
                        fullWidth
                        multiline
                        rows={12}
                        disabled={loading || enhancing}
                        value={description}
                        onChange={(event) => {
                            setDescription(event.target.value);
                        }}
                        placeholder="Type program description here..."
                        sx={{
                            marginBottom: '20px',
                            '& .MuiInputBase-root': {
                                alignItems: 'flex-start',
                                padding: '16px',
                            }
                        }}
                    />
                    
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <SaveButton
                            disabled={loading}
                            variant="contained"
                            startIcon={loading ? <Schedule /> : <Save />}
                            onClick={handleSubmit}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </SaveButton>
                    </Box>
                </ModernCard>

                <FocusAreas 
                    programId={program.id}
                    selectedFocusAreas={program.focusAreas}
                    loading={loading}
                    setLoading={setLoading}
                />
            </Grid>
            
            <Grid size={{ xs: 12, lg: 4 }}>
                <Box sx={{ position: 'sticky', top: '24px' }}>
                    <TrainerCard trainer={program.trainerResponseDTO}/>
                </Box>
            </Grid>
        </Grid>

        {/* Floating Notification in Portal */}
        <Portal>
            <Slide direction="up" in={hasUnsavedChanges} mountOnEnter unmountOnExit>
                <FloatingNotification elevation={8}>
                    <Warning sx={{ color: colors.warning, fontSize: '20px' }} />
                    <Box sx={{ flex: 1 }}>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: colors.text.primary,
                                marginBottom: '4px'
                            }}
                        >
                            Unsaved Changes
                        </Typography>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '0.75rem',
                                color: colors.text.secondary,
                                lineHeight: 1.4
                            }}
                        >
                            Your recent changes haven't been saved. To use AI features with new changes, please save first.
                        </Typography>
                    </Box>
                    <FloatingSaveButton
                        loading={loading}
                        variant="contained"
                        onClick={handleSubmit}
                        size="small"
                    >
                        Save
                    </FloatingSaveButton>
                </FloatingNotification>
            </Slide>
        </Portal>
        </>
    );
};

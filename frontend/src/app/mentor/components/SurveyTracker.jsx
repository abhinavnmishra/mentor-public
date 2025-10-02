import React, {useState} from "react";
import {
    styled,
    Card,
    CardContent,
    CardActions,
    Divider,
    TextField,
    Button,
    Typography,
    Box,
    Stack,
    alpha,
    Tooltip,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Switch,
    FormControlLabel,
    IconButton
} from "@mui/material";
import {H5, H4, Small} from "../../components/Typography.jsx";
import Grid from "@mui/material/Grid2";
import {
    Assessment,
    AutoAwesome,
    Launch,
    Save,
    Poll,
    Description,
    CalendarToday,
    Visibility,
    VisibilityOff,
    Fullscreen,
    FullscreenExit
} from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Editor } from '@tinymce/tinymce-react';
import {fDate} from "../utils/format-time.jsx";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";
import {useNavigate} from "react-router-dom";

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

const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    background: `linear-gradient(135deg, ${alpha(colors.primary, 0.02)} 0%, ${alpha(colors.success, 0.02)} 100%)`,
    transition: 'all 0.2s ease-in-out',
    overflow: 'hidden',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
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

const ModernButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '12px 24px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    }
}));

const EnhanceButton = styled(LoadingButton)(({ theme }) => ({
    borderRadius: '12px',
    minWidth: 'auto',
    width: '48px',
    height: '48px',
    backgroundColor: alpha(colors.warning, 0.1),
    color: colors.warning,
    border: `1px solid ${alpha(colors.warning, 0.2)}`,
    transition: 'all 0.2s ease-in-out',
    position: 'absolute',
    right: '16px',
    top: '16px',
    '&:hover': {
        backgroundColor: alpha(colors.warning, 0.15),
        transform: 'scale(1.05)',
    },
    '& .MuiLoadingButton-loadingIndicator': {
        color: colors.warning,
    }
}));

const SaveButton = styled(LoadingButton)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '12px 24px',
    backgroundColor: colors.success,
    minWidth: '120px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: '#059669',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    }
}));

const SurveyTracker = ({milestone}) => {
    const axiosInstance = useAxios();
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [enhancingNotes, setEnhancingNotes] = useState(false);
    const trackerId = milestone.trackerId;

    const [formData, setFormData] = useState({
        trainerNotes: milestone.trainerNotes || '',
        isTrainerNotesVisible: milestone.isTrainerNotesVisible || false
    });
    
    const [editorExpanded, setEditorExpanded] = useState(false);

    const [errors, setErrors] = useState({
        trainerNotes: false
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
        setErrors(prev => ({
            ...prev,
            [id]: false
        }));
    };

    const validateForm = () => {
        const newErrors = {
            trainerNotes: !formData.trainerNotes.trim()
        };
        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showAlert('Please fill in all required fields', 'error');
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.put(`/api/programs/milestoneTrackers/${trackerId}/notes`, {
                trainerNotes: formData.trainerNotes,
                isTrainerNotesVisible: formData.isTrainerNotesVisible
            });
            milestone.trainerNotes = formData.trainerNotes;
            milestone.isTrainerNotesVisible = formData.isTrainerNotesVisible;
            showAlert('Notes saved successfully', 'success');
        } catch (error) {
            console.error('Error saving notes:', error);
            showAlert('Failed to save notes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoAwesomeNotes = async () => {
        if (!trackerId) {
            showAlert('Please save the survey first', 'error');
            return;
        }

        setEnhancingNotes(true);
        try {
            const response = await axiosInstance.post('/api/ai/completion', {
                keyword: 'trainer_notes_client_survey',
                id: trackerId,
                currentText: formData.trainerNotes
            });

            setFormData(prev => ({
                ...prev,
                trainerNotes: response.data
            }));
            showAlert('Notes enhanced successfully', 'success');
        } catch (error) {
            console.error('Error enhancing notes:', error);
            showAlert('Failed to enhance notes', 'error');
        } finally {
            setEnhancingNotes(false);
        }
    };

    return (
        <>
            <Divider sx={{ 
                marginY: '32px',
                borderColor: colors.border,
                borderWidth: '1px'
            }} />

            {/* Editor Fullscreen Dialog */}
            {editorExpanded && (
                <EditorFullscreenDialog
                    open={editorExpanded}
                    onClose={() => setEditorExpanded(false)}
                    value={formData.trainerNotes}
                    onChange={(content) => {
                        setFormData(prev => ({
                            ...prev,
                            trainerNotes: content
                        }));
                        setErrors(prev => ({
                            ...prev,
                            trainerNotes: false
                        }));
                    }}
                    onSave={handleSubmit}
                    enhancing={enhancingNotes}
                    onEnhance={handleAutoAwesomeNotes}
                />
            )}

            <Grid container spacing={4}>
                {/* Survey Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <SectionHeader>
                        <Box sx={{ 
                            padding: '8px', 
                            borderRadius: '8px', 
                            backgroundColor: alpha(colors.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Poll sx={{ color: colors.primary, fontSize: '18px' }} />
                        </Box>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontSize: '1.125rem'
                            }}
                        >
                            Survey
                        </Typography>
                    </SectionHeader>

                    <ModernCard>
                        <CardContent sx={{ padding: '24px' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <Box sx={{ 
                                    padding: '8px', 
                                    borderRadius: '8px', 
                                    backgroundColor: alpha(colors.primary, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Assessment sx={{ color: colors.primary, fontSize: '20px' }} />
                                </Box>
                                <Box>
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontWeight: 600,
                                            color: colors.text.primary,
                                            fontSize: '1.125rem',
                                            lineHeight: 1.2
                                        }}
                                    >
                                        {milestone.survey.title}
                                    </Typography>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            color: colors.text.secondary,
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        Assessment Survey
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ marginY: '16px', borderColor: colors.border }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CalendarToday sx={{ color: colors.text.secondary, fontSize: '16px' }} />
                                <Typography 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontSize: '0.875rem',
                                        color: colors.text.secondary
                                    }}
                                >
                                    <strong>Completed On:</strong> {fDate('01/01/2025')}
                                </Typography>
                            </Box>
                        </CardContent>

                        <CardActions sx={{ padding: '16px 24px 24px 24px', gap: '12px' }}>
                            <ModernButton 
                                onClick={() => { window.open('/portal/response/' + milestone.surveyResponseList[0].id, '_blank');}}
                                variant="contained" 
                                startIcon={<Launch />}
                                sx={{
                                    backgroundColor: colors.primary,
                                    '&:hover': {
                                        backgroundColor: '#1d4ed8',
                                    }
                                }}
                            >
                                View Response
                            </ModernButton>

                            <ModernButton 
                                variant="outlined" 
                                startIcon={<Assessment />}
                                sx={{
                                    color: colors.secondary,
                                    borderColor: colors.border,
                                    '&:hover': {
                                        backgroundColor: alpha(colors.secondary, 0.05),
                                        borderColor: colors.borderHover,
                                    }
                                }}
                            >
                                Download Report
                            </ModernButton>
                        </CardActions>
                    </ModernCard>
                </Grid>

                {/* Trainer Notes Section */}
                <Grid size={{ xs: 12, md: 12 }}>
                    <SectionHeader>
                        <Box sx={{ 
                            padding: '8px', 
                            borderRadius: '8px', 
                            backgroundColor: alpha(colors.secondary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Description sx={{ color: colors.secondary, fontSize: '18px' }} />
                        </Box>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontSize: '1.125rem',
                                flex: 1
                            }}
                        >
                            Trainer Notes
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isTrainerNotesVisible}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isTrainerNotesVisible: e.target.checked }))}
                                    color="primary"
                                    size="small"
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {formData.isTrainerNotesVisible ?
                                        <Visibility sx={{ fontSize: '16px', color: colors.primary }} /> : 
                                        <VisibilityOff sx={{ fontSize: '16px', color: colors.text.secondary }} />
                                    }
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                        {formData.isTrainerNotesVisible ? 'Visible to client' : 'Hidden from client'}
                                    </Typography>
                                </Box>
                            }
                            sx={{ mr: 1 }}
                        />
                    </SectionHeader>

                    <Stack spacing={3} alignItems="flex-end">
                        <Box sx={{ position: 'relative', width: '100%', border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                p: 1, 
                                borderBottom: `1px solid ${colors.border}`,
                                backgroundColor: alpha(colors.background, 0.5)
                            }}>
                                <Tooltip title="Enhance with AI">
                                    <IconButton
                                        size="small"
                                        onClick={handleAutoAwesomeNotes}
                                        disabled={enhancingNotes}
                                        sx={{ mr: 1 }}
                                    >
                                        <AutoAwesome sx={{ fontSize: '20px', color: colors.warning }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={editorExpanded ? "Exit fullscreen" : "Fullscreen mode"}>
                                    <IconButton
                                        size="small"
                                        onClick={() => setEditorExpanded(!editorExpanded)}
                                    >
                                        {editorExpanded ? 
                                            <FullscreenExit sx={{ fontSize: '20px' }} /> : 
                                            <Fullscreen sx={{ fontSize: '20px' }} />
                                        }
                                    </IconButton>
                                </Tooltip>
                            </Box>
                            <Editor
                                tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                                value={formData.trainerNotes}
                                onEditorChange={(content) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        trainerNotes: content
                                    }));
                                    setErrors(prev => ({
                                        ...prev,
                                        trainerNotes: false
                                    }));
                                }}
                                init={{
                                    height: 400,
                                    menubar: false,
                                    plugins: [
                                        'lists', 'link', 'autolink', 'autoresize', 'table'
                                    ],
                                    toolbar: 'undo redo | formatselect | ' +
                                        'bold italic | bullist numlist | ' +
                                        'table link | removeformat',
                                    formats: {
                                        h1: { block: 'h1' },
                                        h2: { block: 'h2' },
                                        h3: { block: 'h3' },
                                        p: { block: 'p' }
                                    },
                                    content_style: 'body { font-family:"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size:14px; line-height: 1.6; padding: 16px; }',
                                    branding: false,
                                    promotion: false,
                                    resize: 'vertical',
                                    autoresize_min_height: 400,
                                    autoresize_max_height: 800,
                                    statusbar: true,
                                    elementpath: false,
                                    placeholder: 'Enter your trainer comments and observations...'
                                }}
                            />
                            {errors.trainerNotes && (
                                <Typography 
                                    sx={{ 
                                        color: colors.error, 
                                        fontSize: '0.75rem', 
                                        mt: 1, 
                                        ml: 2 
                                    }}
                                >
                                    Notes are required
                                </Typography>
                            )}
                        </Box>

                        <SaveButton
                            loading={loading}
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSubmit}
                        >
                            Save Notes
                        </SaveButton>
                    </Stack>
                </Grid>
            </Grid>
        </>
    );
};

// Editor Fullscreen Dialog
const EditorDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        width: '100%',
        maxWidth: '90vw',
        maxHeight: '90vh',
        borderRadius: '16px',
        overflow: 'hidden'
    }
}));

// Add this at the end of the component before the return statement
const EditorFullscreenDialog = ({ open, onClose, value, onChange, onSave, enhancing, onEnhance }) => {
    return (
        <EditorDialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xl"
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: alpha(colors.background, 0.5)
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description sx={{ color: colors.secondary }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Edit Trainer Notes
                    </Typography>
                </Box>
                <Box>
                    <Tooltip title="Enhance with AI">
                        <IconButton
                            onClick={onEnhance}
                            disabled={enhancing}
                            size="small"
                            sx={{ mr: 1 }}
                        >
                            <AutoAwesome sx={{ fontSize: '20px', color: colors.warning }} />
                        </IconButton>
                    </Tooltip>
                    <IconButton onClick={onClose} size="small">
                        <FullscreenExit />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
                <Editor
                    tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                    value={value}
                    onEditorChange={onChange}
                    init={{
                        height: '70vh',
                        menubar: true,
                        plugins: [
                            'lists', 'link', 'image', 'table', 'code', 'fullscreen',
                            'autolink', 'autoresize', 'wordcount'
                        ],
                        toolbar: 'undo redo | formatselect | ' +
                            'bold italic underline strikethrough | ' +
                            'bullist numlist | table link image | ' +
                            'alignleft aligncenter alignright | ' +
                            'removeformat code fullscreen',
                        formats: {
                            h1: { block: 'h1' },
                            h2: { block: 'h2' },
                            h3: { block: 'h3' },
                            p: { block: 'p' }
                        },
                        content_style: 'body { font-family:"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size:14px; line-height: 1.6; padding: 16px; }',
                        branding: false,
                        promotion: false,
                        statusbar: true,
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
                <Button 
                    onClick={onClose}
                    sx={{ 
                        color: colors.text.secondary,
                        borderColor: colors.border,
                        '&:hover': {
                            backgroundColor: alpha(colors.secondary, 0.05),
                            borderColor: colors.borderHover,
                        }
                    }}
                    variant="outlined"
                >
                    Cancel
                </Button>
                <SaveButton
                    onClick={() => {
                        onSave();
                        onClose();
                    }}
                    variant="contained"
                    startIcon={<Save />}
                >
                    Save Changes
                </SaveButton>
            </DialogActions>
        </EditorDialog>
    );
};

export default SurveyTracker;
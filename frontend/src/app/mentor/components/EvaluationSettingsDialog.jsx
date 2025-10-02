import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Slider,
    TextField,
    Tooltip,
    Typography,
    styled,
    Stack,
    Divider,
    alpha,
    Chip
} from '@mui/material';
import {
    Close,
    Edit,
    Save,
    BarChart,
    Info,
    TrendingUp,
    Assessment,
    Speed,
    Timeline
} from '@mui/icons-material';
import { useAxios } from "../../contexts/AxiosContext.jsx";
import { useAlert } from "../../contexts/AlertContext.jsx";
import LoadingButton from '@mui/lab/LoadingButton';

// Modern color palette consistent with Milestone.jsx
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
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        background: colors.surface,
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    padding: '24px 32px 16px 32px',
    borderBottom: `1px solid ${colors.border}`,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    padding: '32px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '&.MuiDialogContent-dividers': {
        borderTop: 'none',
        borderBottom: 'none',
    }
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
    padding: '16px 32px 24px 32px',
    borderTop: `1px solid ${colors.border}`,
    gap: '12px',
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

const ModernSlider = styled(Slider)(({ theme }) => ({
    '& .MuiSlider-thumb': {
        width: '20px',
        height: '20px',
        border: `2px solid ${colors.surface}`,
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
        '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        }
    },
    '& .MuiSlider-track': {
        height: '6px',
        borderRadius: '3px',
    },
    '& .MuiSlider-rail': {
        height: '6px',
        borderRadius: '3px',
        backgroundColor: alpha(colors.secondary, 0.2),
    },
    '& .MuiSlider-valueLabel': {
        backgroundColor: colors.text.primary,
        borderRadius: '8px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.75rem',
        fontWeight: 600,
    }
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

const InfoCard = styled(Box)(({ theme }) => ({
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.05),
    border: `1px solid ${alpha(colors.primary, 0.15)}`,
    marginBottom: '24px',
}));

const PerformanceLevelCard = styled(Box)(({ theme }) => ({
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.secondary, 0.03),
    border: `1px solid ${colors.border}`,
    marginTop: '24px',
}));

const ThresholdContainer = styled(Box)(({ theme }) => ({
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.background, 0.5),
    border: `1px solid ${colors.border}`,
    marginBottom: '16px',
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

// Map score values to colors for the slider
const getScoreColor = (value) => {
    if (value < 2) return colors.error; // Red
    if (value < 4) return colors.warning; // Orange
    if (value < 6) return '#eab308'; // Yellow
    if (value < 8) return '#84cc16'; // Light green
    return colors.success; // Green
};

const getPerformanceLevel = (value) => {
    if (value < 2) return { label: 'Poor', color: colors.error };
    if (value < 4) return { label: 'Fair', color: colors.warning };
    if (value < 6) return { label: 'Good', color: '#eab308' };
    if (value < 8) return { label: 'Very Good', color: '#84cc16' };
    return { label: 'Excellent', color: colors.success };
};

/**
 * EvaluationSettingsDialog - A dialog component for editing evaluation settings for focus areas
 * 
 * @param {Object} focusArea - The focus area to edit evaluation settings for
 * @param {Function} onSave - Callback function when settings are saved
 * @param {string} buttonType - Type of button to show ("icon" or "default")
 */
const EvaluationSettingsDialog = ({ 
    focusArea,
    onSave,
    buttonType = "icon"
}) => {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Initialize default eval object if not present
    const defaultEval = {
        minScore: -1,
        maxScore: 10,
        threshold1: 2,
        threshold2: 4,
        threshold3: 6
    };
    
    const [evalSettings, setEvalSettings] = useState(focusArea?.eval || defaultEval);
    const [errors, setErrors] = useState({});

    // Update settings when focus area changes
    useEffect(() => {
        if (focusArea) {
            setEvalSettings(focusArea.eval || {
                ...defaultEval
            });
        }
    }, [focusArea]);

    const handleClickOpen = () => {
        setOpen(true);
        setErrors({});
    };

    const handleClose = () => {
        setOpen(false);
    };

    const validateSettings = () => {
        const newErrors = {};
        
        // Validate that thresholds are in ascending order
        if (evalSettings.threshold1 >= evalSettings.threshold2) {
            newErrors.threshold1 = "Threshold 1 must be less than Threshold 2";
        }
        
        if (evalSettings.threshold2 >= evalSettings.threshold3) {
            newErrors.threshold2 = "Threshold 2 must be less than Threshold 3";
        }
        
        if (evalSettings.threshold3 > evalSettings.maxScore) {
            newErrors.threshold3 = "Threshold 3 must be less than or equal to Max Score";
        }
        
        if (evalSettings.minScore >= evalSettings.threshold1) {
            newErrors.minScore = "Min Score must be less than Threshold 1";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEvalSettings(prev => ({
            ...prev,
            [name]: Number(value)
        }));
        setErrors(prev => ({
            ...prev,
            [name]: ''
        }));
    };

    const handleSliderChange = (name) => (event, newValue) => {
        setEvalSettings(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = async () => {
        if (!validateSettings()) {
            return;
        }

        try {
            setLoading(true);
            
            // Call the onSave callback with the updated settings
            await onSave(focusArea.id, evalSettings);
            
            // Close the dialog after successful save
            handleClose();
        } catch (error) {
            // Error already handled by the parent component (FocusAreas)
            console.error('Error updating evaluation settings:', error);
            setLoading(false);
        }
    };

    const renderButton = () => {
        if (buttonType === "icon") {
            return (
                <Tooltip title="Configure Evaluation Settings">
                    <IconButton 
                        size="small" 
                        onClick={handleClickOpen}
                        sx={{ 
                            color: colors.primary,
                            backgroundColor: alpha(colors.primary, 0.1),
                            borderRadius: '8px',
                            '&:hover': {
                                backgroundColor: alpha(colors.primary, 0.15),
                                transform: 'scale(1.05)',
                            }
                        }}
                    >
                        <BarChart fontSize="small" />
                    </IconButton>
                </Tooltip>
            );
        }
        
        return (
            <ActionButton
                variant="outlined"
                startIcon={<BarChart />}
                onClick={handleClickOpen}
                size="small"
                sx={{
                    color: colors.primary,
                    borderColor: colors.primary,
                    '&:hover': {
                        backgroundColor: alpha(colors.primary, 0.1),
                        borderColor: colors.primary,
                    }
                }}
            >
                Evaluation Settings
            </ActionButton>
        );
    };

    return (
        <>
            {renderButton()}
            <StyledDialog 
                open={open} 
                onClose={handleClose} 
                maxWidth="md" 
                fullWidth
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
                                <Assessment sx={{ color: colors.primary, fontSize: '24px' }} />
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
                                    Evaluation Settings
                                </Typography>
                                <Typography 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        color: colors.text.secondary,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {focusArea?.name}
                                </Typography>
                            </Box>
                        </Box>
                        <Tooltip title="Close">
                            <IconButton 
                                onClick={handleClose}
                                sx={{ 
                                    color: colors.text.secondary,
                                    '&:hover': {
                                        backgroundColor: alpha(colors.error, 0.1),
                                        color: colors.error,
                                    }
                                }}
                            >
                                <Close />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </StyledDialogTitle>

                <StyledDialogContent>
                    {/* Information Section */}
                    <InfoCard>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <Info sx={{ color: colors.primary, fontSize: '20px', marginTop: '2px' }} />
                            <Box>
                                <Typography 
                                    variant="subtitle2" 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 600,
                                        color: colors.text.primary,
                                        marginBottom: '8px'
                                    }}
                                >
                                    Evaluation Configuration
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        color: colors.text.secondary,
                                        lineHeight: 1.5
                                    }}
                                >
                                    Configure how this focus area will be evaluated in reports. Set the score range and threshold values that define different performance levels for accurate assessment and feedback.
                                </Typography>
                            </Box>
                        </Box>
                    </InfoCard>

                    {/* Score Range Section */}
                    <SectionHeader>
                        <Box sx={{ 
                            padding: '8px', 
                            borderRadius: '8px', 
                            backgroundColor: alpha(colors.success, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Speed sx={{ color: colors.success, fontSize: '18px' }} />
                        </Box>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontSize: '1.125rem'
                            }}
                        >
                            Score Range
                        </Typography>
                    </SectionHeader>

                    <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '32px' }}>
                        <Box sx={{ flex: 1 }}>
                            <FieldLabel>
                                Minimum Score
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                type="number"
                                name="minScore"
                                value={evalSettings.minScore}
                                onChange={handleInputChange}
                                error={!!errors.minScore}
                                helperText={errors.minScore}
                                placeholder="Enter minimum score"
                                inputProps={{ min: -10, max: 0 }}
                            />
                        </Box>
                        <Box sx={{ 
                            padding: '12px 0',
                            display: 'flex',
                            alignItems: 'center',
                            color: colors.text.secondary,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}>
                            to
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <FieldLabel>
                                Maximum Score
                            </FieldLabel>
                            <StyledTextField
                                fullWidth
                                type="number"
                                name="maxScore"
                                value={evalSettings.maxScore}
                                onChange={handleInputChange}
                                placeholder="Enter maximum score"
                                inputProps={{ min: 1, max: 100 }}
                            />
                        </Box>
                    </Box>

                    {/* Thresholds Section */}
                    <SectionHeader>
                        <Box sx={{ 
                            padding: '8px', 
                            borderRadius: '8px', 
                            backgroundColor: alpha(colors.warning, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Timeline sx={{ color: colors.warning, fontSize: '18px' }} />
                        </Box>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontSize: '1.125rem'
                            }}
                        >
                            Performance Thresholds
                        </Typography>
                    </SectionHeader>

                    <Stack spacing={3}>
                        {/* Threshold 1 */}
                        <ThresholdContainer>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                <FieldLabel sx={{ marginBottom: 0, minWidth: '120px' }}>
                                    Threshold 1
                                </FieldLabel>
                                <Chip 
                                    label={getPerformanceLevel(evalSettings.threshold1).label}
                                    size="small"
                                    sx={{ 
                                        backgroundColor: alpha(getPerformanceLevel(evalSettings.threshold1).color, 0.1),
                                        color: getPerformanceLevel(evalSettings.threshold1).color,
                                        fontWeight: 600,
                                        fontSize: '0.75rem'
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <ModernSlider
                                    value={evalSettings.threshold1}
                                    onChange={handleSliderChange('threshold1')}
                                    min={evalSettings.minScore + 1}
                                    max={evalSettings.threshold2 - 1 || evalSettings.maxScore - 2}
                                    step={1}
                                    valueLabelDisplay="auto"
                                    sx={{ 
                                        flex: 1,
                                        '& .MuiSlider-thumb': {
                                            backgroundColor: getScoreColor(evalSettings.threshold1),
                                        },
                                        '& .MuiSlider-track': {
                                            backgroundColor: getScoreColor(evalSettings.threshold1),
                                        }
                                    }}
                                />
                                <StyledTextField
                                    value={evalSettings.threshold1}
                                    onChange={handleInputChange}
                                    name="threshold1"
                                    type="number"
                                    size="small"
                                    error={!!errors.threshold1}
                                    sx={{ width: '100px' }}
                                    inputProps={{ min: evalSettings.minScore + 1, max: evalSettings.threshold2 - 1 || evalSettings.maxScore - 2 }}
                                />
                            </Box>
                            {errors.threshold1 && (
                                <Typography variant="caption" color="error" sx={{ 
                                    marginTop: '8px',
                                    display: 'block',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                }}>
                                    {errors.threshold1}
                                </Typography>
                            )}
                        </ThresholdContainer>

                        {/* Threshold 2 */}
                        <ThresholdContainer>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                <FieldLabel sx={{ marginBottom: 0, minWidth: '120px' }}>
                                    Threshold 2
                                </FieldLabel>
                                <Chip 
                                    label={getPerformanceLevel(evalSettings.threshold2).label}
                                    size="small"
                                    sx={{ 
                                        backgroundColor: alpha(getPerformanceLevel(evalSettings.threshold2).color, 0.1),
                                        color: getPerformanceLevel(evalSettings.threshold2).color,
                                        fontWeight: 600,
                                        fontSize: '0.75rem'
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <ModernSlider
                                    value={evalSettings.threshold2}
                                    onChange={handleSliderChange('threshold2')}
                                    min={evalSettings.threshold1 + 1 || evalSettings.minScore + 2}
                                    max={evalSettings.threshold3 - 1 || evalSettings.maxScore - 1}
                                    step={1}
                                    valueLabelDisplay="auto"
                                    sx={{ 
                                        flex: 1,
                                        '& .MuiSlider-thumb': {
                                            backgroundColor: getScoreColor(evalSettings.threshold2),
                                        },
                                        '& .MuiSlider-track': {
                                            backgroundColor: getScoreColor(evalSettings.threshold2),
                                        }
                                    }}
                                />
                                <StyledTextField
                                    value={evalSettings.threshold2}
                                    onChange={handleInputChange}
                                    name="threshold2"
                                    type="number"
                                    size="small"
                                    error={!!errors.threshold2}
                                    sx={{ width: '100px' }}
                                    inputProps={{ min: evalSettings.threshold1 + 1 || evalSettings.minScore + 2, max: evalSettings.threshold3 - 1 || evalSettings.maxScore - 1 }}
                                />
                            </Box>
                            {errors.threshold2 && (
                                <Typography variant="caption" color="error" sx={{ 
                                    marginTop: '8px',
                                    display: 'block',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                }}>
                                    {errors.threshold2}
                                </Typography>
                            )}
                        </ThresholdContainer>

                        {/* Threshold 3 */}
                        <ThresholdContainer>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                <FieldLabel sx={{ marginBottom: 0, minWidth: '120px' }}>
                                    Threshold 3
                                </FieldLabel>
                                <Chip 
                                    label={getPerformanceLevel(evalSettings.threshold3).label}
                                    size="small"
                                    sx={{ 
                                        backgroundColor: alpha(getPerformanceLevel(evalSettings.threshold3).color, 0.1),
                                        color: getPerformanceLevel(evalSettings.threshold3).color,
                                        fontWeight: 600,
                                        fontSize: '0.75rem'
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <ModernSlider
                                    value={evalSettings.threshold3}
                                    onChange={handleSliderChange('threshold3')}
                                    min={evalSettings.threshold2 + 1 || evalSettings.minScore + 3}
                                    max={evalSettings.maxScore}
                                    step={1}
                                    valueLabelDisplay="auto"
                                    sx={{ 
                                        flex: 1,
                                        '& .MuiSlider-thumb': {
                                            backgroundColor: getScoreColor(evalSettings.threshold3),
                                        },
                                        '& .MuiSlider-track': {
                                            backgroundColor: getScoreColor(evalSettings.threshold3),
                                        }
                                    }}
                                />
                                <StyledTextField
                                    value={evalSettings.threshold3}
                                    onChange={handleInputChange}
                                    name="threshold3"
                                    type="number"
                                    size="small"
                                    error={!!errors.threshold3}
                                    sx={{ width: '100px' }}
                                    inputProps={{ min: evalSettings.threshold2 + 1 || evalSettings.minScore + 3, max: evalSettings.maxScore }}
                                />
                            </Box>
                            {errors.threshold3 && (
                                <Typography variant="caption" color="error" sx={{ 
                                    marginTop: '8px',
                                    display: 'block',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                }}>
                                    {errors.threshold3}
                                </Typography>
                            )}
                        </ThresholdContainer>
                    </Stack>

                    {/* Performance Levels Preview */}
                    <PerformanceLevelCard>
                        <SectionHeader sx={{ marginBottom: '16px', paddingBottom: '8px' }}>
                            <Box sx={{ 
                                padding: '6px', 
                                borderRadius: '6px', 
                                backgroundColor: alpha(colors.secondary, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <TrendingUp sx={{ color: colors.secondary, fontSize: '16px' }} />
                            </Box>
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    fontSize: '1rem'
                                }}
                            >
                                Performance Level Preview
                            </Typography>
                        </SectionHeader>
                        
                        <Stack spacing={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Box sx={{ 
                                    width: '16px', 
                                    height: '16px', 
                                    borderRadius: '50%', 
                                    backgroundColor: colors.error,
                                    flexShrink: 0
                                }}/>
                                <Typography variant="body2" sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.primary,
                                    fontWeight: 500
                                }}>
                                    <strong>Poor:</strong> {evalSettings.minScore} to {evalSettings.threshold1}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Box sx={{ 
                                    width: '16px', 
                                    height: '16px', 
                                    borderRadius: '50%', 
                                    backgroundColor: colors.warning,
                                    flexShrink: 0
                                }}/>
                                <Typography variant="body2" sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.primary,
                                    fontWeight: 500
                                }}>
                                    <strong>Fair:</strong> {evalSettings.threshold1 + 1} to {evalSettings.threshold2}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Box sx={{ 
                                    width: '16px', 
                                    height: '16px', 
                                    borderRadius: '50%', 
                                    backgroundColor: '#eab308',
                                    flexShrink: 0
                                }}/>
                                <Typography variant="body2" sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.primary,
                                    fontWeight: 500
                                }}>
                                    <strong>Good:</strong> {evalSettings.threshold2 + 1} to {evalSettings.threshold3}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Box sx={{ 
                                    width: '16px', 
                                    height: '16px', 
                                    borderRadius: '50%', 
                                    backgroundColor: colors.success,
                                    flexShrink: 0
                                }}/>
                                <Typography variant="body2" sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.primary,
                                    fontWeight: 500
                                }}>
                                    <strong>Excellent:</strong> {evalSettings.threshold3 + 1} to {evalSettings.maxScore}
                                </Typography>
                            </Box>
                        </Stack>
                    </PerformanceLevelCard>
                </StyledDialogContent>

                <StyledDialogActions>
                    <ActionButton 
                        onClick={handleClose} 
                        variant="outlined"
                        sx={{
                            color: colors.text.secondary,
                            borderColor: colors.border,
                            '&:hover': {
                                backgroundColor: alpha(colors.text.secondary, 0.1),
                                borderColor: colors.text.secondary,
                            }
                        }}
                    >
                        Cancel
                    </ActionButton>
                    <LoadingButton 
                        onClick={handleSubmit} 
                        loading={loading} 
                        variant="contained"
                        startIcon={<Save />}
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
                        Save Settings
                    </LoadingButton>
                </StyledDialogActions>
            </StyledDialog>
        </>
    );
};

export default EvaluationSettingsDialog; 
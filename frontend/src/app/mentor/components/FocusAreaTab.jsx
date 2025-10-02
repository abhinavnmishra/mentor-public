import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Slider,
    IconButton,
    Divider,
    alpha,
    LinearProgress,
    Tooltip,
    CircularProgress
} from "@mui/material";
import {
    ExpandMore,
    Edit,
    Save,
    Cancel,
    Psychology,
    TrendingUp,
    ArrowForward,
    BarChart,
    Lightbulb
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import { useAxios } from "../../contexts/AxiosContext.jsx";
import { useAlert } from "../../contexts/AlertContext.jsx";

// Modern color palette (consistent with parent component)
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

const FocusAreaCard = styled(Paper)(({ theme }) => ({
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: theme.spacing(3),
    border: `1px solid ${colors.border}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderColor: colors.borderHover
    }
}));

const FocusAreaHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 3),
    backgroundColor: alpha(colors.background, 0.5),
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
}));

const FocusAreaContent = styled(Box)(({ theme }) => ({
    padding: theme.spacing(3)
}));

const ChildFocusAreaCard = styled(Box)(({ theme }) => ({
    backgroundColor: colors.surface,
    borderRadius: '8px',
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
    '&:hover': {
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        borderColor: colors.borderHover
    }
}));

const ScoreSection = styled(Box)(({ theme }) => ({
    backgroundColor: alpha(colors.primary, 0.05),
    borderRadius: '8px',
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1)
}));

const ScoreLabel = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
}));

const ScoreValue = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 700,
    color: colors.primary
}));

const ProgressBar = styled(Box)(({ theme }) => ({
    height: '8px',
    backgroundColor: alpha(colors.primary, 0.1),
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: theme.spacing(1)
}));

const ProgressFill = styled(Box)(({ theme, progress }) => ({
    height: '100%',
    width: `${progress}%`,
    backgroundColor: colors.primary,
    borderRadius: '4px'
}));

const SummaryBox = styled(Box)(({ theme }) => ({
    backgroundColor: alpha(colors.background, 0.5),
    borderRadius: '8px',
    padding: theme.spacing(2),
    marginTop: theme.spacing(2),
    border: `1px solid ${colors.border}`,
    whiteSpace: 'pre-wrap'
}));

export default function FocusAreaTab({ metadata, surveyResponseId, updateMetadata }) {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [focusAreas, setFocusAreas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingScore, setEditingScore] = useState(false);
    const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
    const [currentScore, setCurrentScore] = useState(0);
    const [currentFocusAreaId, setCurrentFocusAreaId] = useState(null);
    const [savingScore, setSavingScore] = useState(false);
    const [expandedArea, setExpandedArea] = useState(null);

    useEffect(() => {
        fetchFocusAreas();
    }, [surveyResponseId]);

    const fetchFocusAreas = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/api/programs/focusAreas/responseId/${surveyResponseId}`);
            setFocusAreas(data);
        } catch (error) {
            console.error('Error fetching focus areas:', error);
            showAlert('Failed to fetch focus areas', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExpandChange = (focusAreaId) => {
        setExpandedArea(expandedArea === focusAreaId ? null : focusAreaId);
    };

    const handleEditScore = (focusAreaId, currentScore) => {
        setCurrentFocusAreaId(focusAreaId);
        setCurrentScore(currentScore);
        setScoreDialogOpen(true);
    };

    const handleSaveScore = async () => {
        try {
            setSavingScore(true);
            
            // API call to update the focus area score
            // await axiosInstance.put(`/api/focus-areas/score/${surveyResponseId}`, {
            //     focusAreaId: currentFocusAreaId,
            //     score: currentScore
            // });
            
            // Update local state
            if (metadata?.surveyResponse?.evaluation?.focusAreas) {
                const updatedMetadata = { ...metadata };
                const focusAreaIndex = updatedMetadata.surveyResponse.evaluation.focusAreas.findIndex(
                    area => area.focusAreaId === currentFocusAreaId
                );
                
                if (focusAreaIndex !== -1) {
                    updatedMetadata.surveyResponse.evaluation.focusAreas[focusAreaIndex].score = currentScore;
                    updateMetadata(updatedMetadata);
                }
            }
            
            // showAlert('Focus area score updated successfully', 'success');
            setScoreDialogOpen(false);
        } catch (error) {
            console.error('Error updating focus area score:', error);
            showAlert('Failed to update focus area score', 'error');
        } finally {
            setSavingScore(false);
        }
    };

    // Find focus area evaluation data from metadata
    const findFocusAreaEvaluation = (focusAreaId) => {
        if (!metadata?.surveyResponse?.evaluation?.focusAreas) return null;
        
        return metadata.surveyResponse.evaluation.focusAreas.find(
            area => area.focusAreaId === focusAreaId
        );
    };

    // Calculate score percentage for progress bars
    const calculateScorePercentage = (score, maxScore) => {
        if (!score || !maxScore) return 0;
        return (score / maxScore) * 100;
    };

    const renderChildFocusAreas = (children) => {
        if (!children || children.length === 0) return null;
        
        return (
            <Box sx={{ mt: 2 }}>
                <Typography 
                    variant="subtitle2" 
                    sx={{ 
                        fontWeight: 600, 
                        mb: 2,
                        color: colors.text.secondary
                    }}
                >
                    Sub-Focus Areas
                </Typography>
                
                {children.map(child => {
                    const childEvaluation = findFocusAreaEvaluation(child.id);
                    
                    return (
                        <ChildFocusAreaCard key={child.id}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box sx={{ flex: 1 }}>
                                    <Typography 
                                        variant="subtitle1" 
                                        sx={{ 
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}
                                    >
                                        <Lightbulb sx={{ fontSize: '1rem', color: colors.primary }} />
                                        {child.name}
                                    </Typography>
                                    
                                    {child.description && (
                                        <Typography 
                                            variant="body2" 
                                            color={colors.text.secondary}
                                            sx={{ mt: 1 }}
                                        >
                                            {child.description}
                                        </Typography>
                                    )}
                                    
                                    {childEvaluation && (
                                        <>
                                            <Box sx={{ mt: 2 }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="body2" fontWeight={600}>
                                                        Score: {childEvaluation.score}/{childEvaluation.maxScore}
                                                    </Typography>
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => handleEditScore(child.id, childEvaluation.score)}
                                                    >
                                                        <Edit fontSize="small" sx={{ color: colors.primary }} />
                                                    </IconButton>
                                                </Stack>
                                                <ProgressBar>
                                                    <ProgressFill 
                                                        progress={calculateScorePercentage(
                                                            childEvaluation.score, 
                                                            childEvaluation.maxScore
                                                        )} 
                                                    />
                                                </ProgressBar>
                                            </Box>
                                            
                                            {childEvaluation.focusAreaPerformanceSummary && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ 
                                                            fontWeight: 600, 
                                                            mb: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.5
                                                        }}
                                                    >
                                                        <BarChart sx={{ fontSize: '0.875rem', color: colors.primary }} />
                                                        Performance Summary
                                                    </Typography>
                                                    <SummaryBox sx={{ p: 1.5 }}>
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ 
                                                                whiteSpace: 'pre-wrap',
                                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                                fontSize: '0.8125rem'
                                                            }}
                                                        >
                                                            {childEvaluation.focusAreaPerformanceSummary}
                                                        </Typography>
                                                    </SummaryBox>
                                                </Box>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Stack>
                        </ChildFocusAreaCard>
                    );
                })}
            </Box>
        );
    };

    if (loading) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress size={40} thickness={4} sx={{ color: colors.primary, mb: 2 }} />
                <Typography color={colors.text.secondary}>Loading focus areas...</Typography>
            </Box>
        );
    }

    if (focusAreas.length === 0) {
        return (
            <Paper 
                sx={{ 
                    p: 4, 
                    textAlign: 'center',
                    borderRadius: '12px',
                    backgroundColor: alpha(colors.background, 0.5),
                    border: `1px solid ${colors.border}`
                }}
            >
                <Psychology sx={{ fontSize: 48, color: colors.text.disabled, mb: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    No Focus Areas Available
                </Typography>
                <Typography color={colors.text.secondary}>
                    No focus areas have been defined for this assessment yet.
                </Typography>
            </Paper>
        );
    }

    return (
        <>
            {focusAreas.map(focusArea => {
                const evaluation = findFocusAreaEvaluation(focusArea.id);
                
                return (
                    <FocusAreaCard key={focusArea.id} elevation={0}>
                        <FocusAreaHeader>
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TrendingUp sx={{ color: colors.primary }} />
                                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                        {focusArea.name}
                                    </Typography>
                                    
                                    {focusArea.isParent && (
                                        <Chip 
                                            size="small" 
                                            label="Parent" 
                                            sx={{ 
                                                backgroundColor: alpha(colors.primary, 0.1),
                                                color: colors.primary,
                                                fontWeight: 600,
                                                height: '20px',
                                                fontSize: '0.7rem'
                                            }} 
                                        />
                                    )}
                                </Stack>
                                
                                {focusArea.description && (
                                    <Typography 
                                        variant="body2" 
                                        color={colors.text.secondary}
                                        sx={{ mt: 0.5 }}
                                    >
                                        {focusArea.description}
                                    </Typography>
                                )}
                            </Box>
                            
                            {focusArea.isParent && (
                                <IconButton 
                                    onClick={() => handleExpandChange(focusArea.id)}
                                    sx={{ 
                                        transform: expandedArea === focusArea.id ? 'rotate(180deg)' : 'rotate(0)',
                                        transition: 'transform 0.3s'
                                    }}
                                >
                                    <ExpandMore />
                                </IconButton>
                            )}
                        </FocusAreaHeader>
                        
                        <FocusAreaContent>
                            {evaluation && (
                                <>
                                    <ScoreSection>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <ScoreLabel>Overall Score</ScoreLabel>
                                            <Tooltip title="Edit Score">
                                                <IconButton 
                                                    size="small" 
                                                    onClick={() => handleEditScore(focusArea.id, evaluation.score)}
                                                    sx={{ color: colors.primary }}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <ScoreValue>{evaluation.score}</ScoreValue>
                                            <Typography variant="body2" color={colors.text.secondary}>
                                                (Range: {evaluation.minScore} - {evaluation.maxScore})
                                            </Typography>
                                        </Stack>
                                        <ProgressBar>
                                            <ProgressFill 
                                                progress={calculateScorePercentage(evaluation.score, evaluation.maxScore)} 
                                            />
                                        </ProgressBar>
                                    </ScoreSection>
                                    
                                    {evaluation.focusAreaPerformanceSummary && (
                                        <Box sx={{ mt: 3 }}>
                                            <Typography 
                                                variant="subtitle2" 
                                                sx={{ 
                                                    fontWeight: 600, 
                                                    mb: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                <BarChart sx={{ fontSize: '1rem', color: colors.primary }} />
                                                Performance Summary
                                            </Typography>
                                            <SummaryBox>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        whiteSpace: 'pre-wrap',
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                    }}
                                                >
                                                    {evaluation.focusAreaPerformanceSummary}
                                                </Typography>
                                            </SummaryBox>
                                        </Box>
                                    )}
                                </>
                            )}
                            
                            {/* Render child focus areas if this is a parent and it's expanded */}
                            {focusArea.isParent && expandedArea === focusArea.id && (
                                renderChildFocusAreas(focusArea.children)
                            )}
                        </FocusAreaContent>
                    </FocusAreaCard>
                );
            })}
            
            {/* Score Edit Dialog */}
            <Dialog open={scoreDialogOpen} onClose={() => setScoreDialogOpen(false)}>
                <DialogTitle>
                    Edit Focus Area Score
                </DialogTitle>
                <DialogContent sx={{ minWidth: '400px', pt: 2 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" gutterBottom>
                            Adjust the score for this focus area:
                        </Typography>
                        <Slider
                            value={currentScore}
                            onChange={(e, newValue) => setCurrentScore(newValue)}
                            step={0.5}
                            marks
                            min={0}
                            max={30}
                            valueLabelDisplay="on"
                            sx={{
                                color: colors.primary,
                                '& .MuiSlider-valueLabel': {
                                    backgroundColor: colors.primary
                                }
                            }}
                        />
                    </Box>
                    <TextField
                        label="Score"
                        type="number"
                        value={currentScore}
                        onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value >= 0 && value <= 30) {
                                setCurrentScore(value);
                            }
                        }}
                        inputProps={{ min: 0, max: 30, step: 0.5 }}
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button 
                        onClick={() => setScoreDialogOpen(false)}
                        startIcon={<Cancel />}
                        sx={{ color: colors.text.secondary }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSaveScore}
                        variant="contained"
                        startIcon={<Save />}
                        disabled={savingScore}
                        sx={{
                            backgroundColor: colors.primary,
                            '&:hover': {
                                backgroundColor: colors.primaryLight
                            }
                        }}
                    >
                        {savingScore ? 'Saving...' : 'Save Score'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

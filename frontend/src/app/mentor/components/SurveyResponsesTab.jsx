import React, { useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Chip,
    Rating,
    alpha,
    TextField,
    Button,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slider,
    Paper
} from "@mui/material";
import {
    FormatQuote,
    ShortText,
    Subject,
    RadioButtonChecked,
    Grade,
    Edit,
    Save,
    Cancel,
    Psychology,
    AutoFixHigh
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

const QuestionCard = styled(Box)(({ theme }) => ({
    backgroundColor: colors.surface,
    borderRadius: '12px',
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    border: `1px solid ${colors.border}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderColor: colors.borderHover
    }
}));

const QuestionTypeChip = styled(Chip)(({ theme, questiontype }) => {
    // Normalize type to uppercase for consistent comparison
    const normalizedType = questiontype?.toUpperCase();
    
    let chipColor;
    switch(normalizedType) {
        case 'TEXT':
            chipColor = '#3b82f6'; // blue
            break;
        case 'RATING':
            chipColor = '#10b981'; // green
            break;
        case 'MCQ':
        case 'MCQ-MULTISELECT':
            chipColor = '#f59e0b'; // amber
            break;
        case 'TEXTAREA':
            chipColor = '#8b5cf6'; // purple
            break;
        default:
            chipColor = colors.secondary;
    }
    
    return {
        backgroundColor: alpha(chipColor, 0.1),
        color: chipColor,
        fontWeight: 600,
        fontSize: '0.75rem',
        height: '24px',
        '& .MuiChip-icon': {
            color: chipColor
        }
    };
});

const AnswerBox = styled(Box)(({ theme, answertype, rating }) => {
    let bgColor = alpha(colors.background, 0.5);
    let borderColor = colors.border;
    
    // Normalize type to uppercase for consistent comparison
    const normalizedType = answertype?.toUpperCase();
    
    if (normalizedType === 'RATING') {
        const ratingValue = parseInt(rating);
        if (ratingValue > 7) {
            bgColor = alpha(colors.success, 0.05);
            borderColor = alpha(colors.success, 0.2);
        } else if (ratingValue < 4) {
            bgColor = alpha(colors.error, 0.05);
            borderColor = alpha(colors.error, 0.2);
        } else {
            bgColor = alpha(colors.warning, 0.05);
            borderColor = alpha(colors.warning, 0.2);
        }
    }
    
    return {
        backgroundColor: bgColor,
        borderRadius: '8px',
        padding: theme.spacing(2),
        marginTop: theme.spacing(1.5),
        border: `1px solid ${borderColor}`,
        fontSize: '0.95rem',
        color: colors.text.primary,
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    };
});

const ScoreBox = styled(Box)(({ theme }) => ({
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

export default function SurveyResponsesTab({ metadata, surveyResponseId, updateMetadata }) {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [editingScoreId, setEditingScoreId] = useState(null);
    const [scoreDialogOpen, setScoreDialogOpen] = useState(false);
    const [currentScore, setCurrentScore] = useState(0);
    const [currentQuestionId, setCurrentQuestionId] = useState(null);
    const [savingScore, setSavingScore] = useState(false);
    const [runningAIEvaluation, setRunningAIEvaluation] = useState(false);

    // Find the question score data from the evaluation
    const findQuestionScore = (questionId) => {
        if (!metadata?.surveyResponse?.evaluation?.questionScore) return null;
        
        return metadata.surveyResponse.evaluation.questionScore.find(
            q => q.questionId === questionId
        );
    };

    const handleEditScore = (questionId, currentScore) => {
        setCurrentQuestionId(questionId);
        setCurrentScore(currentScore);
        setScoreDialogOpen(true);
    };

    const handleSaveScore = async () => {
        try {
            setSavingScore(true);
            
            // Update local state
            const updatedMetadata = { ...metadata };
            const questionScoreIndex = updatedMetadata.surveyResponse.evaluation.questionScore.findIndex(
                q => q.questionId === currentQuestionId
            );
            
            if (questionScoreIndex !== -1) {
                updatedMetadata.surveyResponse.evaluation.questionScore[questionScoreIndex].score = currentScore;
                updateMetadata(updatedMetadata);
            }
            
            // showAlert('Score updated successfully', 'success');
            setScoreDialogOpen(false);
        } catch (error) {
            console.error('Error updating score:', error);
            showAlert('Failed to update score', 'error');
        } finally {
            setSavingScore(false);
        }
    };
    
    const handleRunAIEvaluation = async () => {
        try {
            setRunningAIEvaluation(true);
            showAlert('Starting AI evaluation...', 'info');
            
            // Call the API to trigger AI evaluation
            const { data } = await axiosInstance.get(`/api/ai/evaluate/${surveyResponseId}`);
            
            // Check if evaluation was successful
            if (data === true) {
                // Trigger metadata refresh in parent component
                updateMetadata(null); // null signals parent to refresh
                showAlert('AI evaluation completed successfully', 'success');
            } else {
                showAlert('AI evaluation failed to complete', 'error');
            }
        } catch (error) {
            console.error('Error running AI evaluation:', error);
            showAlert('Failed to complete AI evaluation', 'error');
        } finally {
            setRunningAIEvaluation(false);
        }
    };

    const getQuestionIcon = (type) => {
        // Normalize type to uppercase for consistent comparison
        const normalizedType = type?.toUpperCase();
        
        switch(normalizedType) {
            case 'TEXT':
                return <ShortText />;
            case 'RATING':
                return <Grade />;
            case 'MCQ':
            case 'MCQ-MULTISELECT':
                return <RadioButtonChecked />;
            case 'TEXTAREA':
                return <Subject />;
            default:
                return <ShortText />;
        }
    };

    const renderAnswerByType = (question) => {
        // Normalize type to uppercase for consistent comparison
        const type = question.type?.toUpperCase();
        
        // Check for empty response based on question type
        const hasResponse = () => {
            switch(type) {
                case 'RATING':
                    return question.rating !== null && question.rating !== undefined;
                case 'MCQ':
                case 'MCQ-MULTISELECT':
                    return question.optionsSelected && question.optionsSelected.length > 0;
                case 'TEXT':
                case 'TEXTAREA':
                default:
                    return question.answer && question.answer !== "";
            }
        };
        
        if (!hasResponse()) {
            return <Typography sx={{ fontStyle: 'italic', color: colors.text.disabled }}>No answer provided</Typography>;
        }
        
        switch(type) {
            case 'RATING':
                const rating = parseInt(question.rating);
                return (
                    <Box>
                        <Rating 
                            value={rating} 
                            max={10} 
                            readOnly 
                            precision={1}
                            sx={{ 
                                color: rating > 7 ? colors.success : rating < 4 ? colors.error : colors.warning,
                                fontSize: '1.5rem'
                            }} 
                        />
                        <Typography sx={{ mt: 1, fontWeight: 600 }}>{rating}/10</Typography>
                    </Box>
                );
            case 'MCQ':
            case 'MCQ-MULTISELECT':
                return (
                    <Box>
                        {question.optionsSelected && question.optionsSelected.map((option, idx) => (
                            <Chip 
                                key={idx}
                                label={option}
                                sx={{ 
                                    mr: 1, 
                                    mb: 1,
                                    backgroundColor: alpha(colors.primary, 0.1),
                                    color: colors.primary,
                                    fontWeight: 500
                                }}
                            />
                        ))}
                    </Box>
                );
            case 'TEXTAREA':
                return (
                    <Box sx={{ position: 'relative' }}>
                        <FormatQuote sx={{ 
                            position: 'absolute', 
                            top: -10, 
                            left: -10, 
                            opacity: 0.2,
                            fontSize: '1.5rem',
                            color: colors.primary
                        }} />
                        <Typography 
                            sx={{ 
                                pl: 3, 
                                pt: 1,
                                whiteSpace: 'pre-wrap',
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            }}
                        >
                            {question.answer}
                        </Typography>
                    </Box>
                );
            case 'TEXT':
            default:
                return (
                    <Typography 
                        sx={{ 
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}
                    >
                        {question.answer}
                    </Typography>
                );
        }
    };

    const renderScoreSection = (question) => {
        const questionScore = findQuestionScore(question.questionId);
        
        if (!questionScore) return null;
        
        return (
            <ScoreBox>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <ScoreLabel>Score</ScoreLabel>
                    <Tooltip title="Edit Score">
                        <IconButton 
                            size="small" 
                            onClick={() => handleEditScore(question.questionId, questionScore.score)}
                            sx={{ color: colors.primary }}
                        >
                            <Edit fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                    <ScoreValue>{questionScore.score}</ScoreValue>
                    <Typography variant="body2" color={colors.text.secondary}>
                        (Range: {questionScore.minScore} - {questionScore.maxScore})
                    </Typography>
                </Stack>
                {questionScore.eval?.question_eval_score_criteria_high && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color={colors.text.secondary} sx={{ fontWeight: 600 }}>
                            High Score Criteria:
                        </Typography>
                        <Typography variant="body2">
                            {questionScore.eval.question_eval_score_criteria_high}
                        </Typography>
                    </Box>
                )}
                {questionScore.eval?.question_eval_score_criteria_low && (
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color={colors.text.secondary} sx={{ fontWeight: 600 }}>
                            Low Score Criteria:
                        </Typography>
                        <Typography variant="body2">
                            {questionScore.eval.question_eval_score_criteria_low}
                        </Typography>
                    </Box>
                )}
            </ScoreBox>
        );
    };

    if (!metadata || !metadata.responses) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color={colors.text.secondary}>No response data available</Typography>
            </Box>
        );
    }

    return (
        <>
            {/* AI Evaluation Button */}
            <Paper 
                elevation={0}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: '12px',
                    border: `1px solid ${alpha(colors.primary, 0.2)}`,
                    backgroundColor: alpha(colors.primary, 0.05),
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Psychology sx={{ color: colors.primary }} />
                        AI Evaluation
                    </Typography>
                    <Typography variant="body2" color={colors.text.secondary} sx={{ mt: 0.5 }}>
                        Let AI analyze responses and generate insights, focus areas, and scoring
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AutoFixHigh />}
                    onClick={handleRunAIEvaluation}
                    disabled={runningAIEvaluation}
                    sx={{
                        backgroundColor: colors.primary,
                        '&:hover': {
                            backgroundColor: colors.primaryLight,
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
                        },
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        py: 1,
                        borderRadius: '8px'
                    }}
                >
                    {runningAIEvaluation ? 'Running Evaluation...' : 'Run AI Evaluation'}
                </Button>
            </Paper>

            {metadata.responses.map((page, pageIndex) => (
                <Box key={`page-${pageIndex}`} sx={{ mb: 4 }}>
                    <Typography 
                        sx={{ 
                            fontWeight: 600, 
                            color: colors.text.secondary,
                            mb: 2,
                            fontSize: '0.875rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}
                    >
                        Page {pageIndex + 1}
                    </Typography>
                    
                    {page.map((question, questionIndex) => (
                        <QuestionCard key={`question-${question.questionId || questionIndex}`}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box 
                                    sx={{ 
                                        backgroundColor: alpha(colors.primary, 0.1),
                                        borderRadius: '8px',
                                        width: 40,
                                        height: 40,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: colors.primary,
                                        flexShrink: 0
                                    }}
                                >
                                    {getQuestionIcon(question.type)}
                                </Box>
                                
                                <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        <QuestionTypeChip 
                                            questiontype={question.type}
                                            icon={getQuestionIcon(question.type)}
                                            label={question.type}
                                            size="small"
                                        />
                                        
                                        {question.eval?.focusAreas && question.eval.focusAreas.length > 0 && (
                                            <Chip 
                                                label="Focus Area" 
                                                size="small"
                                                sx={{ 
                                                    backgroundColor: alpha(colors.warning, 0.1),
                                                    color: colors.warning,
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    height: '24px'
                                                }}
                                            />
                                        )}
                                    </Stack>
                                    
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600, 
                                            mb: 2,
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        }}
                                    >
                                        {question.question}
                                    </Typography>
                                    
                                    <AnswerBox 
                                        answertype={question.type} 
                                        rating={question.type === 'RATING' ? question.rating : null}
                                    >
                                        {renderAnswerByType(question)}
                                    </AnswerBox>
                                    
                                    {/* Score Section */}
                                    {renderScoreSection(question)}
                                </Box>
                            </Stack>
                        </QuestionCard>
                    ))}
                </Box>
            ))}
            
            {/* Score Edit Dialog */}
            <Dialog open={scoreDialogOpen} onClose={() => setScoreDialogOpen(false)}>
                <DialogTitle>
                    Edit Question Score
                </DialogTitle>
                <DialogContent sx={{ minWidth: '400px', pt: 2 }}>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" gutterBottom>
                            Adjust the score for this question:
                        </Typography>
                        <Slider
                            value={currentScore}
                            onChange={(e, newValue) => setCurrentScore(newValue)}
                            step={0.5}
                            marks
                            min={0}
                            max={10}
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
                            if (value >= 0 && value <= 10) {
                                setCurrentScore(value);
                            }
                        }}
                        inputProps={{ min: 0, max: 10, step: 0.5 }}
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

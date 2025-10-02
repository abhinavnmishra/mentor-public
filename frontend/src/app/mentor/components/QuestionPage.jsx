import React from 'react';
import { 
    Card, 
    styled, 
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Checkbox,
    FormGroup,
    Slider,
    Box,
    Typography,
    Divider,
    alpha,
    useTheme,
    Stack,
    Chip
} from "@mui/material";
import { H5, H6, Paragraph } from "../../components/Typography.jsx";
import TextField from "@mui/material/TextField";
import useAuth from "../../hooks/useAuth.js";
import { QuestionMark, RadioButtonChecked, CheckBox, LinearScale, Description } from "@mui/icons-material";

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

const QuestionCard = styled(Card)(({ theme }) => ({
    padding: '32px',
    marginBottom: '32px',
    backgroundColor: colors.surface,
    borderRadius: '20px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
    border: `1px solid ${colors.border}`,
    transition: 'all 0.3s ease',
    position: 'relative',
    '&:hover': {
        boxShadow: '0 12px 35px rgba(0,0,0,0.12)',
        transform: 'translateY(-2px)',
    },
    '&:last-child': {
        marginBottom: 0
    }
}));

const QuestionNumber = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    fontWeight: 700,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    marginRight: theme.spacing(3),
    border: `2px solid ${alpha(colors.primary, 0.2)}`,
    transition: 'all 0.3s ease'
}));

const QuestionText = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 600,
    fontSize: '1.125rem',
    marginBottom: theme.spacing(3),
    color: colors.text.primary,
    display: 'flex',
    alignItems: 'flex-start',
    lineHeight: 1.5
}));

const QuestionTypeChip = styled(Chip)(({ theme, questionType }) => {
    const getTypeConfig = (type) => {
        switch (type?.toLowerCase()) {
            case 'descriptive':
                return { 
                    icon: <Description sx={{ fontSize: '16px' }} />, 
                    color: colors.success,
                    label: 'Text Response'
                };
            case 'rating':
                return { 
                    icon: <LinearScale sx={{ fontSize: '16px' }} />, 
                    color: colors.warning,
                    label: 'Rating Scale'
                };
            case 'mcq':
                return { 
                    icon: <RadioButtonChecked sx={{ fontSize: '16px' }} />, 
                    color: colors.primary,
                    label: 'Single Choice'
                };
            case 'mcq-multiselect':
                return { 
                    icon: <CheckBox sx={{ fontSize: '16px' }} />, 
                    color: colors.secondary,
                    label: 'Multiple Choice'
                };
            default:
                return { 
                    icon: <QuestionMark sx={{ fontSize: '16px' }} />, 
                    color: colors.text.disabled,
                    label: 'Question'
                };
        }
    };

    const config = getTypeConfig(questionType);
    
    return {
        position: 'absolute',
        top: '20px',
        right: '20px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 600,
        fontSize: '0.75rem',
        height: '32px',
        borderRadius: '16px',
        backgroundColor: alpha(config.color, 0.1),
        color: config.color,
        border: `1px solid ${alpha(config.color, 0.2)}`,
        '& .MuiChip-icon': {
            color: config.color
        }
    };
});

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 500,
        color: colors.text.secondary,
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: colors.primary,
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: alpha(colors.background, 0.5),
        transition: 'all 0.3s ease',
        '& fieldset': {
            borderColor: colors.border,
            borderWidth: '1.5px',
        },
        '&:hover': {
            backgroundColor: alpha(colors.background, 0.8),
            '& fieldset': {
                borderColor: colors.borderHover,
            }
        },
        '&.Mui-focused': {
            backgroundColor: colors.surface,
            boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
            '& fieldset': {
                borderColor: colors.primary,
                borderWidth: '2px',
            }
        }
    },
    '& .MuiInputBase-multiline': {
        padding: theme.spacing(1.5),
        alignItems: 'flex-start',
    },
    '& .MuiInputBase-input': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        color: colors.text.primary,
    }
}));

const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    color: colors.text.secondary,
    fontSize: '0.875rem',
    fontWeight: 600,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '&.Mui-focused': {
        color: colors.primary,
    }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    width: '100%',
    '& .MuiFormGroup-root': {
        marginTop: theme.spacing(1.5),
        gap: theme.spacing(1)
    }
}));

const StyledRadio = styled(Radio)(({ theme }) => ({
    color: alpha(colors.primary, 0.6),
    '&.Mui-checked': {
        color: colors.primary
    },
    padding: theme.spacing(1.5),
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.05),
    }
}));

const StyledCheckbox = styled(Checkbox)(({ theme }) => ({
    color: alpha(colors.primary, 0.6),
    '&.Mui-checked': {
        color: colors.primary
    },
    padding: theme.spacing(1.5),
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.05),
    }
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
    marginBottom: theme.spacing(0.5),
    marginLeft: 0,
    '& .MuiFormControlLabel-label': {
        fontSize: '0.875rem',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 500,
        color: colors.text.primary,
        lineHeight: 1.5
    },
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.05),
        borderColor: alpha(colors.primary, 0.1),
        borderRadius: '12px'
    },
    padding: theme.spacing(1, 1.5),
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    width: '100%',
    border: `1px solid transparent`
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
    height: 10,
    '& .MuiSlider-track': {
        border: 'none',
        height: 10,
        borderRadius: '5px'
    },
    '& .MuiSlider-thumb': {
        height: 28,
        width: 28,
        backgroundColor: colors.surface,
        border: `3px solid ${colors.primary}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: `0 0 0 8px ${alpha(colors.primary, 0.16)}`,
        },
        '&:before': {
            display: 'none',
        }
    },
    '& .MuiSlider-valueLabel': {
        backgroundColor: colors.primary,
        borderRadius: '8px',
        padding: theme.spacing(0.5, 1.5),
        fontSize: '0.875rem',
        fontWeight: 600,
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        '&:before': {
            display: 'none'
        }
    },
    '& .MuiSlider-rail': {
        height: 10,
        borderRadius: '5px',
        backgroundColor: alpha(colors.primary, 0.1)
    },
    '& .MuiSlider-mark': {
        backgroundColor: alpha(colors.primary, 0.3),
        height: 6,
        width: 2,
        borderRadius: '1px'
    },
    '& .MuiSlider-markActive': {
        backgroundColor: colors.primary,
    }
}));

const RatingContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    padding: theme.spacing(4, 3),
    backgroundColor: alpha(colors.primary, 0.02),
    borderRadius: '16px',
    border: `1px solid ${alpha(colors.primary, 0.1)}`,
    marginTop: theme.spacing(2)
}));

const RatingLabels = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
}));

const RatingLabel = styled(Typography)(({ theme, align }) => ({
    fontSize: '0.75rem',
    fontWeight: 600,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: colors.text.secondary,
    textAlign: align,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
}));

const AnswerHint = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    color: colors.text.disabled,
    marginTop: theme.spacing(1),
    fontStyle: 'italic',
    textAlign: 'right'
}));

const OptionsContainer = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: alpha(colors.background, 0.3),
    borderRadius: '16px',
    border: `1px solid ${colors.border}`
}));

const AnswerSection = ({ question, onAnswerChange }) => {
    const theme = useTheme();
    
    const handleTextChange = (event) => {
        onAnswerChange(question.questionId, {
            ...question,
            answer: event.target.value
        });
    };

    const handleMCQChange = (event) => {
        onAnswerChange(question.questionId, {
            ...question,
            optionsSelected: [event.target.value]
        });
    };

    const handleRatingChange = (event, newValue) => {
        onAnswerChange(question.questionId, {
            ...question,
            rating: newValue
        });
    };

    const handleMultiSelectChange = (option) => {
        const currentSelected = question.optionsSelected || [];
        let newSelected;
        
        if (currentSelected.includes(option)) {
            newSelected = currentSelected.filter(item => item !== option);
        } else {
            newSelected = [...currentSelected, option];
        }

        onAnswerChange(question.questionId, {
            ...question,
            optionsSelected: newSelected
        });
    };

    if (question.type.toLowerCase() === 'descriptive') {
        return (
            <Box sx={{ mt: 2 }}>
                <StyledTextField
                    fullWidth
                    multiline
                    rows={5}
                    value={question.answer || ''}
                    onChange={handleTextChange}
                    variant="outlined"
                    placeholder="Share your thoughts in detail..."
                    sx={{ 
                        '& .MuiOutlinedInput-root': {
                            minHeight: '140px'
                        }
                    }}
                />
                <AnswerHint>
                    You can save your progress by clicking on save button
                </AnswerHint>
            </Box>
        );
    } else if (question.type.toLowerCase() === 'rating') {
        return (
            <RatingContainer>
                <StyledFormLabel component="legend">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LinearScale sx={{ fontSize: '18px', color: colors.primary }} />
                        <span>Rate from 1 (Poor) to 10 (Excellent)</span>
                    </Stack>
                </StyledFormLabel>
                <StyledSlider
                    value={question.rating || 0}
                    onChange={handleRatingChange}
                    step={1}
                    marks
                    min={1}
                    max={10}
                    valueLabelDisplay="on"
                />
                <RatingLabels>
                    <RatingLabel align="left">Poor</RatingLabel>
                    <RatingLabel align="center">Average</RatingLabel>
                    <RatingLabel align="right">Excellent</RatingLabel>
                </RatingLabels>
            </RatingContainer>
        );
    } else if (question.type.toLowerCase() === 'mcq') {
        return (
            <StyledFormControl component="fieldset">
                <StyledFormLabel component="legend">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <RadioButtonChecked sx={{ fontSize: '18px', color: colors.primary }} />
                        <span>Select one option</span>
                    </Stack>
                </StyledFormLabel>
                <OptionsContainer>
                    <RadioGroup
                        value={question.optionsSelected?.[0] || ''}
                        onChange={handleMCQChange}
                    >
                        {question.options.map((option, idx) => (
                            <StyledFormControlLabel
                                key={idx}
                                value={option}
                                control={<StyledRadio />}
                                label={option}
                            />
                        ))}
                    </RadioGroup>
                </OptionsContainer>
            </StyledFormControl>
        );
    } else if (question.type.toLowerCase() === 'mcq-multiselect') {
        return (
            <StyledFormControl component="fieldset">
                <StyledFormLabel component="legend">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CheckBox sx={{ fontSize: '18px', color: colors.primary }} />
                        <span>Select all that apply</span>
                    </Stack>
                </StyledFormLabel>
                <OptionsContainer>
                    <FormGroup>
                        {question.options.map((option, idx) => (
                            <StyledFormControlLabel
                                key={idx}
                                control={
                                    <StyledCheckbox
                                        checked={question.optionsSelected?.includes(option)}
                                        onChange={() => handleMultiSelectChange(option)}
                                    />
                                }
                                label={option}
                            />
                        ))}
                    </FormGroup>
                </OptionsContainer>
            </StyledFormControl>
        );
    }
    return null;
};

function isSubstringInList(stringList, searchString) {
    return stringList.some(item => item.includes(searchString));
}

const getQuestionTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
        case 'descriptive':
            return { 
                icon: <Description sx={{ fontSize: '16px' }} />, 
                color: colors.success,
                label: 'Text Response'
            };
        case 'rating':
            return { 
                icon: <LinearScale sx={{ fontSize: '16px' }} />, 
                color: colors.warning,
                label: 'Rating Scale'
            };
        case 'mcq':
            return { 
                icon: <RadioButtonChecked sx={{ fontSize: '16px' }} />, 
                color: colors.primary,
                label: 'Single Choice'
            };
        case 'mcq-multiselect':
            return { 
                icon: <CheckBox sx={{ fontSize: '16px' }} />, 
                color: colors.secondary,
                label: 'Multiple Choice'
            };
        default:
            return { 
                icon: <QuestionMark sx={{ fontSize: '16px' }} />, 
                color: colors.text.disabled,
                label: 'Question'
            };
    }
};

export default function QuestionPage({ questions, pageNumber, onUpdateQuestion, clientIdentifier }) {
    return (
        <Box sx={{ 
            width: '100%',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {questions.filter(question => isSubstringInList(question.mentees, clientIdentifier)).map((question, index) => {
                const typeConfig = getQuestionTypeConfig(question.type);
                
                return (
                    <QuestionCard key={question.questionId}>
                        <Chip
                            icon={typeConfig.icon}
                            label={typeConfig.label}
                            sx={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: '32px',
                                borderRadius: '16px',
                                backgroundColor: alpha(typeConfig.color, 0.1),
                                color: typeConfig.color,
                                border: `1px solid ${alpha(typeConfig.color, 0.2)}`,
                                '& .MuiChip-icon': {
                                    color: typeConfig.color
                                }
                            }}
                        />
                        
                        <QuestionText>
                            <QuestionNumber>
                                {(pageNumber - 1) * questions.length + index + 1}
                            </QuestionNumber>
                            <Box sx={{ flex: 1, paddingRight: '80px' }}>
                                {question.question}
                            </Box>
                        </QuestionText>
                        
                        <Divider sx={{ 
                            my: 3, 
                            opacity: 0.6,
                            borderColor: alpha(colors.primary, 0.1)
                        }} />
                        
                        <AnswerSection
                            question={question} 
                            onAnswerChange={onUpdateQuestion}
                        />
                    </QuestionCard>
                );
            })}
        </Box>
    );
} 
import React, { useState, useMemo } from "react";
import { 
    Paper, 
    IconButton, 
    Box, 
    TextField, 
    Chip, 
    Stack, 
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    FormControl,
    Autocomplete,
    Divider,
    Typography,
    Switch,
    Slider,
    Tooltip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    alpha
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { 
    Delete, 
    Add, 
    Person, 
    PersonAdd, 
    ViewList, 
    Quiz, 
    KeyboardDoubleArrowLeft, 
    KeyboardDoubleArrowRight, 
    ExpandMore, 
    Score, 
    CategoryRounded,
    Edit,
    Check,
    Close
} from "@mui/icons-material";

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

// Styled Components
const ModernPaper = styled(Paper)(({ theme, isDragging }) => ({
    borderRadius: '16px',
    border: `1px solid ${isDragging ? colors.primary : colors.border}`,
    boxShadow: isDragging 
        ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    background: isDragging 
        ? `linear-gradient(135deg, ${alpha(colors.primary, 0.05)} 0%, ${colors.surface} 100%)`
        : colors.surface,
    transition: 'all 0.2s ease-in-out',
    padding: '24px',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        borderColor: colors.borderHover,
    }
}));

const DragHandle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    backgroundColor: alpha(colors.secondary, 0.1),
    color: colors.secondary,
    cursor: 'grab',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.secondary, 0.2),
        transform: 'scale(1.05)',
    },
    '&:active': {
        cursor: 'grabbing',
        transform: 'scale(0.95)',
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
        }
    },
    '& .MuiInputBase-input': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        color: colors.text.primary,
    }
}));

const SectionLabel = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '10px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.75rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '6px 12px',
    minWidth: 'auto',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-1px)',
    }
}));

const OptionChip = styled(Chip)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 500,
    borderRadius: '8px',
    height: '32px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.02)',
    }
}));

const MenteeChip = styled(Chip)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 500,
    borderRadius: '8px',
    height: '28px',
    backgroundColor: alpha(colors.success, 0.1),
    color: colors.success,
    border: `1px solid ${alpha(colors.success, 0.2)}`,
    '&:hover': {
        backgroundColor: alpha(colors.success, 0.15),
        transform: 'scale(1.02)',
    }
}));

const ActionIconButton = styled(IconButton)(({ theme, variant }) => ({
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.05)',
    }
}));

export default function QuestionItem({ 
    item, 
    provided, 
    snapshot, 
    currentPage, 
    totalPages, 
    onMoveItem, 
    onDeleteItem,
    onUpdateContent,
    onUpdateOptions,
    onUpdateMentees,
    onUpdateEval,
    mentees,
    focusAreas = []
}) {
    const [editingOptionIndex, setEditingOptionIndex] = useState(null);
    const [newOptionText, setNewOptionText] = useState("");
    const [isAddingOption, setIsAddingOption] = useState(false);
    const [editingOptionText, setEditingOptionText] = useState("");
    const [isAddingMentee, setIsAddingMentee] = useState(false);
    const [evalExpanded, setEvalExpanded] = useState(false);

    // Initialize eval object if it doesn't exist
    const questionEval = item.eval || {
        numericScoring: false,
        reverseScoring: false,
        question_eval_score_criteria_high: "",
        question_eval_score_criteria_low: "",
        weight: 1,
        options: [],
        focusAreas: []
    };

    // Create a map of mentee IDs to mentee objects for quick lookup
    const menteesMap = useMemo(() => {
        return mentees.reduce((acc, mentee) => {
            acc[mentee.id] = mentee;
            return acc;
        }, {});
    }, [mentees]);

    // Create a map of focus area IDs to focus area objects for quick lookup
    const focusAreasMap = useMemo(() => {
        return focusAreas.reduce((acc, focusArea) => {
            acc[focusArea.id] = focusArea;
            return acc;
        }, {});
    }, [focusAreas]);

    // Get selected focus areas as objects for the autocomplete component
    const selectedFocusAreas = useMemo(() => {
        return (questionEval.focusAreas || [])
            .map(id => focusAreasMap[id])
            .filter(Boolean);
    }, [questionEval.focusAreas, focusAreasMap]);

    // Filter mentees that are not already assigned to the question
    const availableMentees = useMemo(() => {
        return mentees.filter(mentee => !item.mentees.includes(mentee.id));
    }, [mentees, item.mentees]);

    const handleMenteeAdd = (event, newMentee) => {
        if (newMentee) {
            const newMentees = [...item.mentees, newMentee.id];
            onUpdateMentees(item.id, newMentees);
            setIsAddingMentee(false);
        }
    };

    const handleMenteeDelete = (menteeId) => {
        const newMentees = item.mentees.filter(id => id !== menteeId);
        onUpdateMentees(item.id, newMentees);
    };

    const handleContentChange = (event) => {
        onUpdateContent(item.id, event.target.value);
    };

    const handleTypeChange = (event) => {
        const newType = event.target.value;
        onUpdateOptions(item.id, item.options, newType);
    };

    const handleOptionEdit = (index, newValue) => {
        const newOptions = [...item.options];
        newOptions[index] = newValue;
        onUpdateOptions(item.id, newOptions);
        setEditingOptionIndex(null);
        setEditingOptionText("");
    };

    const handleStartEditing = (index, value) => {
        setEditingOptionIndex(index);
        setEditingOptionText(value);
    };

    const handleOptionEditChange = (e) => {
        setEditingOptionText(e.target.value);
    };

    const handleOptionEditComplete = (index) => {
        if (editingOptionText.trim()) {
            handleOptionEdit(index, editingOptionText.trim());
        }
        setEditingOptionIndex(null);
        setEditingOptionText("");
    };

    const handleOptionDelete = (indexToDelete) => {
        const newOptions = item.options.filter((_, index) => index !== indexToDelete);
        onUpdateOptions(item.id, newOptions);
    };

    const handleAddOption = () => {
        if (newOptionText.trim()) {
            const newOptions = [...item.options, newOptionText.trim()];
            onUpdateOptions(item.id, newOptions);
            setNewOptionText("");
            setIsAddingOption(false);
        }
    };

    // Handlers for eval object updates
    const handleEvalChange = (field, value) => {
        const updatedEval = {
            ...questionEval,
            [field]: value
        };
        onUpdateEval(item.id, updatedEval);
    };

    const handleEvalOptionScoreChange = (index, value) => {
        const updatedOptions = [...(questionEval.options || [])];
        while (updatedOptions.length < item.options.length) {
            updatedOptions.push(1);
        }
        updatedOptions[index] = value;
        
        const updatedEval = {
            ...questionEval,
            options: updatedOptions
        };
        onUpdateEval(item.id, updatedEval);
    };

    const handleFocusAreasChange = (event, newFocusAreas) => {
        const focusAreaIds = newFocusAreas.map(area => area.id);
        
        const updatedEval = {
            ...questionEval,
            focusAreas: focusAreaIds
        };
        onUpdateEval(item.id, updatedEval);
    };

    return (
        <ModernPaper
            ref={provided.innerRef}
            {...provided.draggableProps}
            isDragging={snapshot.isDragging}
        >
            {/* Drag Handle */}
            <DragHandle {...provided.dragHandleProps}>
                <DragIndicatorIcon sx={{ fontSize: '18px' }} />
            </DragHandle>

            {/* Main Content */}
            <Box sx={{ flex: 1 }}>
                {/* Question Content */}
                <StyledTextField
                    fullWidth
                    multiline
                    rows={2}
                    variant="outlined"
                    placeholder="Enter your question here..."
                    value={item.content}
                    onChange={handleContentChange}
                    sx={{ 
                        marginBottom: '24px',
                        '& .MuiInputBase-root': {
                            fontSize: '1rem',
                            fontWeight: 500,
                        }
                    }}
                />

                {/* Question Type Section */}
                <Box sx={{ marginBottom: '24px' }}>
                    <SectionLabel>
                        <Quiz sx={{ fontSize: '14px' }} />
                        Question Type
                    </SectionLabel>
                    <FormControl component="fieldset">
                        <RadioGroup
                            row
                            value={item.type.toLowerCase() || 'descriptive'}
                            onChange={handleTypeChange}
                            sx={{ gap: '16px' }}
                        >
                            <FormControlLabel 
                                value="descriptive"
                                control={<Radio size="small" sx={{ color: colors.primary }} />} 
                                label={
                                    <Typography sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: colors.text.primary
                                    }}>
                                        Descriptive
                                    </Typography>
                                }
                            />
                            <FormControlLabel 
                                value="mcq"
                                control={<Radio size="small" sx={{ color: colors.primary }} />} 
                                label={
                                    <Typography sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: colors.text.primary
                                    }}>
                                        MCQ
                                    </Typography>
                                }
                            />
                            <FormControlLabel 
                                value="mcq-multiselect"
                                control={<Radio size="small" sx={{ color: colors.primary }} />} 
                                label={
                                    <Typography sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: colors.text.primary
                                    }}>
                                        MCQ - Multiselect
                                    </Typography>
                                }
                            />
                            <FormControlLabel
                                value="rating"
                                control={<Radio size="small" sx={{ color: colors.primary }} />}
                                label={
                                    <Typography sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: colors.text.primary
                                    }}>
                                        Rating
                                    </Typography>
                                }
                            />
                        </RadioGroup>
                    </FormControl>
                </Box>

                {/* Options Management */}
                {(item.type.toLowerCase() !== 'descriptive' && item.type.toLowerCase() !== 'rating') && (
                    <Box sx={{ marginBottom: '24px' }}>
                        <SectionLabel>
                            <ViewList sx={{ fontSize: '14px' }} />
                            Answer Options
                        </SectionLabel>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: '8px' }}>
                            {item.options.map((option, index) => (
                                editingOptionIndex === index ? (
                                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <StyledTextField
                                            size="small"
                                            value={editingOptionText}
                                            autoFocus
                                            onChange={handleOptionEditChange}
                                            onBlur={() => handleOptionEditComplete(index)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleOptionEditComplete(index);
                                                }
                                            }}
                                            sx={{ minWidth: '150px' }}
                                        />
                                        <ActionIconButton 
                                            size="small" 
                                            onClick={() => handleOptionEditComplete(index)}
                                            sx={{ color: colors.success }}
                                        >
                                            <Check sx={{ fontSize: '16px' }} />
                                        </ActionIconButton>
                                        <ActionIconButton 
                                            size="small" 
                                            onClick={() => {
                                                setEditingOptionIndex(null);
                                                setEditingOptionText("");
                                            }}
                                            sx={{ color: colors.error }}
                                        >
                                            <Close sx={{ fontSize: '16px' }} />
                                        </ActionIconButton>
                                    </Box>
                                ) : (
                                    <OptionChip
                                        key={index}
                                        label={option}
                                        size="small"
                                        onDelete={() => handleOptionDelete(index)}
                                        onClick={() => handleStartEditing(index, option)}
                                        sx={{
                                            backgroundColor: alpha(colors.primary, 0.1),
                                            color: colors.primary,
                                            border: `1px solid ${alpha(colors.primary, 0.2)}`,
                                            '&:hover': {
                                                backgroundColor: alpha(colors.primary, 0.15),
                                            }
                                        }}
                                        deleteIcon={<Delete sx={{ fontSize: '16px' }} />}
                                    />
                                )
                            ))}
                            {isAddingOption ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <StyledTextField
                                        size="small"
                                        value={newOptionText}
                                        autoFocus
                                        placeholder="Enter option text..."
                                        onChange={(e) => setNewOptionText(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleAddOption();
                                            }
                                        }}
                                        sx={{ minWidth: '150px' }}
                                    />
                                    <ActionIconButton 
                                        size="small" 
                                        onClick={handleAddOption}
                                        sx={{ color: colors.success }}
                                    >
                                        <Check sx={{ fontSize: '16px' }} />
                                    </ActionIconButton>
                                    <ActionIconButton 
                                        size="small" 
                                        onClick={() => {
                                            setIsAddingOption(false);
                                            setNewOptionText("");
                                        }}
                                        sx={{ color: colors.error }}
                                    >
                                        <Close sx={{ fontSize: '16px' }} />
                                    </ActionIconButton>
                                </Box>
                            ) : (
                                <ActionButton
                                    size="small"
                                    startIcon={<Add sx={{ fontSize: '16px' }} />}
                                    onClick={() => setIsAddingOption(true)}
                                    sx={{
                                        color: colors.primary,
                                        backgroundColor: alpha(colors.primary, 0.1),
                                        border: `1px solid ${alpha(colors.primary, 0.2)}`,
                                        '&:hover': {
                                            backgroundColor: alpha(colors.primary, 0.15),
                                        }
                                    }}
                                >
                                    Add Option
                                </ActionButton>
                            )}
                        </Stack>
                    </Box>
                )}

                {/* Evaluation Settings Accordion */}
                <Accordion 
                    expanded={evalExpanded} 
                    onChange={() => setEvalExpanded(!evalExpanded)}
                    sx={{ 
                        marginBottom: '24px',
                        '&:before': { display: 'none' },
                        boxShadow: 'none',
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px !important',
                        overflow: 'hidden'
                    }}
                >
                    <AccordionSummary
                        expandIcon={<ExpandMore sx={{ color: colors.primary }} />}
                        sx={{ 
                            backgroundColor: alpha(colors.background, 0.5),
                            borderRadius: evalExpanded ? '12px 12px 0 0' : '12px',
                            '&:hover': {
                                backgroundColor: alpha(colors.background, 0.8),
                            }
                        }}
                    >
                        <SectionLabel sx={{ marginBottom: 0 }}>
                            <Score sx={{ fontSize: '14px' }} />
                            Evaluation Settings
                        </SectionLabel>
                    </AccordionSummary>
                    <AccordionDetails sx={{ padding: '24px' }}>
                        <Grid container spacing={3}>
                            {/* Focus Areas */}
                            <Grid item xs={12}>
                                <Typography 
                                    variant="body2" 
                                    gutterBottom 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 600,
                                        color: colors.text.primary,
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '6px',
                                        marginBottom: '12px'
                                    }}
                                >
                                    <CategoryRounded sx={{ fontSize: '16px' }} />
                                    Focus Areas
                                </Typography>
                                <Autocomplete
                                    multiple
                                    options={focusAreas}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedFocusAreas}
                                    onChange={handleFocusAreasChange}
                                    renderInput={(params) => (
                                        <StyledTextField
                                            {...params}
                                            variant="outlined"
                                            size="small"
                                            placeholder="Select focus areas..."
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                label={option.name}
                                                {...getTagProps({ index })}
                                                size="small"
                                                sx={{
                                                    backgroundColor: alpha(colors.warning, 0.1),
                                                    color: colors.warning,
                                                    border: `1px solid ${alpha(colors.warning, 0.2)}`,
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                }}
                                            />
                                        ))
                                    }
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            checked={questionEval.numericScoring || false}
                                            onChange={(e) => handleEvalChange('numericScoring', e.target.checked)}
                                            size="small"
                                            sx={{
                                                '& .MuiSwitch-switchBase.Mui-checked': {
                                                    color: colors.primary,
                                                },
                                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                    backgroundColor: colors.primary,
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography 
                                            variant="body2"
                                            sx={{
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontWeight: 500,
                                                color: colors.text.primary
                                            }}
                                        >
                                            Enable Numeric Scoring
                                        </Typography>
                                    }
                                />
                            </Grid>
                            
                            {questionEval.numericScoring && (
                                <>
                                    <Grid item xs={12}>
                                        <FormControlLabel
                                            control={
                                                <Switch 
                                                    checked={questionEval.reverseScoring || false}
                                                    onChange={(e) => handleEvalChange('reverseScoring', e.target.checked)}
                                                    size="small"
                                                    sx={{
                                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                                            color: colors.primary,
                                                        },
                                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                                            backgroundColor: colors.primary,
                                                        },
                                                    }}
                                                />
                                            }
                                            label={
                                                <Tooltip title="If enabled, lower values are considered better">
                                                    <Typography 
                                                        variant="body2"
                                                        sx={{
                                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                            fontWeight: 500,
                                                            color: colors.text.primary
                                                        }}
                                                    >
                                                        Reverse Scoring
                                                    </Typography>
                                                </Tooltip>
                                            }
                                        />
                                    </Grid>
                                
                                    <Grid item xs={12}>
                                        <Typography 
                                            variant="body2" 
                                            gutterBottom
                                            sx={{
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontWeight: 600,
                                                color: colors.text.primary
                                            }}
                                        >
                                            Question Weight
                                        </Typography>
                                        <Slider
                                            value={questionEval.weight || 1}
                                            onChange={(_, value) => handleEvalChange('weight', value)}
                                            step={1}
                                            marks
                                            min={1}
                                            max={10}
                                            valueLabelDisplay="auto"
                                            size="small"
                                            sx={{ 
                                                maxWidth: '200px',
                                                color: colors.primary,
                                                '& .MuiSlider-thumb': {
                                                    backgroundColor: colors.primary,
                                                },
                                                '& .MuiSlider-track': {
                                                    backgroundColor: colors.primary,
                                                },
                                                '& .MuiSlider-rail': {
                                                    backgroundColor: alpha(colors.primary, 0.2),
                                                }
                                            }}
                                        />
                                    </Grid>
                                
                                    {/* High Score Criteria */}
                                    <Grid item xs={12}>
                                        <StyledTextField
                                            label="High Score Criteria"
                                            value={questionEval.question_eval_score_criteria_high || ""}
                                            onChange={(e) => handleEvalChange('question_eval_score_criteria_high', e.target.value)}
                                            multiline
                                            rows={2}
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            placeholder="Describe what a high score means for this question"
                                        />
                                    </Grid>
                                
                                    {/* Low Score Criteria */}
                                    <Grid item xs={12}>
                                        <StyledTextField
                                            label="Low Score Criteria"
                                            value={questionEval.question_eval_score_criteria_low || ""}
                                            onChange={(e) => handleEvalChange('question_eval_score_criteria_low', e.target.value)}
                                            multiline
                                            rows={2}
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            placeholder="Describe what a low score means for this question"
                                        />
                                    </Grid>
                                
                                    {/* Option Scores */}
                                    {(item.type.toLowerCase() === 'mcq' || item.type.toLowerCase() === 'mcq-multiselect') && 
                                     item.options.length > 0 && (
                                        <Grid item xs={12}>
                                            <Typography 
                                                variant="body2" 
                                                gutterBottom
                                                sx={{
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                    fontWeight: 600,
                                                    color: colors.text.primary
                                                }}
                                            >
                                                Option Scores
                                            </Typography>
                                            {item.options.map((option, index) => (
                                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        sx={{ 
                                                            minWidth: '120px', 
                                                            marginRight: '16px',
                                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                            color: colors.text.primary
                                                        }}
                                                    >
                                                        {option}:
                                                    </Typography>
                                                    <Slider
                                                        value={questionEval.options && questionEval.options[index] !== undefined 
                                                            ? questionEval.options[index] 
                                                            : 1}
                                                        onChange={(_, value) => handleEvalOptionScoreChange(index, value)}
                                                        step={1}
                                                        marks
                                                        min={0}
                                                        max={10}
                                                        valueLabelDisplay="auto"
                                                        size="small"
                                                        sx={{ 
                                                            width: '150px',
                                                            color: colors.primary,
                                                            '& .MuiSlider-thumb': {
                                                                backgroundColor: colors.primary,
                                                            },
                                                            '& .MuiSlider-track': {
                                                                backgroundColor: colors.primary,
                                                            },
                                                            '& .MuiSlider-rail': {
                                                                backgroundColor: alpha(colors.primary, 0.2),
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            ))}
                                        </Grid>
                                    )}
                                </>
                            )}
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                {/* Mentees Section */}
                <Box>
                    <SectionLabel>
                        <Person sx={{ fontSize: '14px' }} />
                        Assigned Mentees
                    </SectionLabel>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: '8px' }}>
                        {item.mentees.map((menteeId) => (
                            <MenteeChip
                                key={menteeId}
                                label={menteesMap[menteeId]?.name || 'Unknown'}
                                size="small"
                                onDelete={() => handleMenteeDelete(menteeId)}
                                deleteIcon={<Delete sx={{ fontSize: '14px' }} />}
                            />
                        ))}
                        {isAddingMentee ? (
                            <Autocomplete
                                size="small"
                                options={availableMentees}
                                getOptionLabel={(option) => option.name}
                                filterOptions={(options, { inputValue }) => {
                                    const searchTerms = inputValue.toLowerCase().split(' ');
                                    return options.filter(option => 
                                        searchTerms.every(term => 
                                            option.keywords.toLowerCase().includes(term)
                                        )
                                    );
                                }}
                                onChange={handleMenteeAdd}
                                onClose={() => setIsAddingMentee(false)}
                                renderInput={(params) => (
                                    <StyledTextField
                                        {...params}
                                        autoFocus
                                        placeholder="Search mentees..."
                                        sx={{ width: 200 }}
                                    />
                                )}
                                sx={{ maxWidth: 200 }}
                            />
                        ) : (
                            <ActionButton
                                size="small"
                                startIcon={<PersonAdd sx={{ fontSize: '16px' }} />}
                                onClick={() => setIsAddingMentee(true)}
                                sx={{
                                    color: colors.success,
                                    backgroundColor: alpha(colors.success, 0.1),
                                    border: `1px solid ${alpha(colors.success, 0.2)}`,
                                    '&:hover': {
                                        backgroundColor: alpha(colors.success, 0.15),
                                    }
                                }}
                            >
                                Add Mentee
                            </ActionButton>
                        )}
                    </Stack>
                </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <Tooltip title="Delete question">
                    <ActionIconButton
                        onClick={() => onDeleteItem(item.id)}
                        sx={{
                            backgroundColor: alpha(colors.error, 0.1),
                            color: colors.error,
                            border: `1px solid ${alpha(colors.error, 0.2)}`,
                            '&:hover': {
                                backgroundColor: alpha(colors.error, 0.15),
                            }
                        }}
                    >
                        <Delete sx={{ fontSize: '18px' }} />
                    </ActionIconButton>
                </Tooltip>
                
                <Tooltip title="Move to previous page">
                    <ActionIconButton 
                        onClick={() => onMoveItem(item.id, 'prev')}
                        disabled={currentPage === 0}
                        sx={{ 
                            backgroundColor: currentPage === 0 ? alpha(colors.text.disabled, 0.1) : alpha(colors.primary, 0.1),
                            color: currentPage === 0 ? colors.text.disabled : colors.primary,
                            border: `1px solid ${currentPage === 0 ? alpha(colors.text.disabled, 0.2) : alpha(colors.primary, 0.2)}`,
                            '&:hover': {
                                backgroundColor: currentPage === 0 ? alpha(colors.text.disabled, 0.1) : alpha(colors.primary, 0.15),
                            }
                        }}
                    >
                        <KeyboardDoubleArrowLeft sx={{ fontSize: '18px' }} />
                    </ActionIconButton>
                </Tooltip>
                
                <Tooltip title="Move to next page">
                    <ActionIconButton 
                        onClick={() => onMoveItem(item.id, 'next')}
                        disabled={currentPage === (totalPages-1)}
                        sx={{
                            backgroundColor: currentPage === (totalPages-1) ? alpha(colors.text.disabled, 0.1) : alpha(colors.primary, 0.1),
                            color: currentPage === (totalPages-1) ? colors.text.disabled : colors.primary,
                            border: `1px solid ${currentPage === (totalPages-1) ? alpha(colors.text.disabled, 0.2) : alpha(colors.primary, 0.2)}`,
                            '&:hover': {
                                backgroundColor: currentPage === (totalPages-1) ? alpha(colors.text.disabled, 0.1) : alpha(colors.primary, 0.15),
                            }
                        }}
                    >
                        <KeyboardDoubleArrowRight sx={{ fontSize: '18px' }} />
                    </ActionIconButton>
                </Tooltip>
            </Box>
        </ModernPaper>
    );
} 
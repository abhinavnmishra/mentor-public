import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Card, 
    Divider, 
    IconButton, 
    OutlinedInput, 
    styled, 
    CardContent, 
    Button,
    Paper,
    Avatar,
    Tooltip,
    Fade,
    Badge,
    Chip,
    MenuItem,
    Select,
    useTheme,
    Typography,
    Stack,
    alpha
} from "@mui/material";
import TextField from "@mui/material/TextField";
import { H3 } from "../../components/Typography.jsx";
import { 
    Close, 
    Add, 
    Delete, 
    LightbulbOutlined, 
    ExpandMore, 
    ExpandLess,
    Psychology,
    Approval,
    FolderSpecial,
    AccountTree,
    ArrowForward,
    CheckCircleOutline,
    Info,
    Visibility
} from "@mui/icons-material";
import CreateFocusAreaForm from "./CreateFocusAreaForm.jsx";
import { useAxios } from "../../contexts/AxiosContext.jsx";
import { useAlert } from "../../contexts/AlertContext.jsx";
import EvaluationSettingsDialog from "./EvaluationSettingsDialog.jsx";

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
const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    transition: 'all 0.2s ease-in-out',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }
}));

const StyledParentCard = styled(ModernCard)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '20px',
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4px',
        background: `linear-gradient(90deg, ${colors.primary}, ${colors.success})`,
        zIndex: 1
    }
}));

const StyledChildCard = styled(ModernCard)(({ theme }) => ({
    position: 'relative',
    backgroundColor: alpha(colors.background, 0.5),
    marginLeft: '32px',
    marginBottom: '12px',
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '3px',
        background: `linear-gradient(90deg, ${colors.success}, #8BC34A)`,
        zIndex: 1
    }
}));

// Redesigned action button components with consistent styling
const ActionButton = styled(IconButton)(({ theme, variant = 'primary' }) => {
    const variantStyles = {
        primary: {
            backgroundColor: alpha(colors.primary, 0.08),
            color: colors.primary,
            border: `1px solid ${alpha(colors.primary, 0.2)}`,
            '&:hover': {
                backgroundColor: alpha(colors.primary, 0.12),
                borderColor: alpha(colors.primary, 0.3),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(colors.primary, 0.15)}`,
            },
        },
        secondary: {
            backgroundColor: alpha(colors.secondary, 0.06),
            color: colors.secondary,
            border: `1px solid ${alpha(colors.secondary, 0.15)}`,
            '&:hover': {
                backgroundColor: alpha(colors.secondary, 0.1),
                borderColor: alpha(colors.secondary, 0.25),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(colors.secondary, 0.1)}`,
            },
        },
        success: {
            backgroundColor: alpha(colors.success, 0.08),
            color: colors.success,
            border: `1px solid ${alpha(colors.success, 0.2)}`,
            '&:hover': {
                backgroundColor: alpha(colors.success, 0.12),
                borderColor: alpha(colors.success, 0.3),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(colors.success, 0.15)}`,
            },
        },
        warning: {
            backgroundColor: alpha(colors.warning, 0.08),
            color: colors.warning,
            border: `1px solid ${alpha(colors.warning, 0.2)}`,
            '&:hover': {
                backgroundColor: alpha(colors.warning, 0.12),
                borderColor: alpha(colors.warning, 0.3),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(colors.warning, 0.15)}`,
            },
        },
        error: {
            backgroundColor: alpha(colors.error, 0.08),
            color: colors.error,
            border: `1px solid ${alpha(colors.error, 0.2)}`,
            '&:hover': {
                backgroundColor: alpha(colors.error, 0.12),
                borderColor: alpha(colors.error, 0.3),
                transform: 'translateY(-1px)',
                boxShadow: `0 4px 12px ${alpha(colors.error, 0.15)}`,
            },
        },
    };

    return {
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        '&:active': {
            transform: 'translateY(0px)',
            transition: 'transform 0.1s ease',
        },
        '&:disabled': {
            opacity: 0.5,
            cursor: 'not-allowed',
        },
        ...variantStyles[variant],
    };
});

// Create a button group container for consistent spacing
const ActionButtonGroup = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
}));

const CardHeader = styled(Box)(({ theme }) => ({
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: `1px solid ${colors.border}`,
}));

const CardTitle = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
}));

const SubAreaContainer = styled(Box)(({ theme, expanded }) => ({
    transition: 'max-height 0.3s ease, opacity 0.3s ease',
    maxHeight: expanded ? '2000px' : '0px',
    opacity: expanded ? 1 : 0,
    overflow: expanded ? 'visible' : 'hidden',
}));

const FocusAreaChip = styled(Chip)(({ theme }) => ({
    background: `linear-gradient(90deg, ${colors.primary}, ${colors.success})`,
    color: 'white',
    fontWeight: 600,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    '& .MuiChip-deleteIcon': {
        color: 'white',
    },
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

const ReadOnlyField = styled(Box)(({ theme }) => ({
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.secondary, 0.05),
    border: `1.5px solid ${colors.border}`,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    color: colors.text.primary,
    minHeight: '80px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
}));

const CssSelectField = styled(Select)({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '& .MuiInputLabel-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
    },
});

function getStyles(id, focusAreas, theme) {
    return {
        fontWeight: focusAreas.some(item => item.id === id)
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
    };
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const SubAreaCard = ({ focusArea, parentId, onDelete, onOperation, programId, onEvaluationUpdate }) => {
    const [current, setCurrent] = useState(focusArea);
    const [expanded, setExpanded] = useState(false);
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();

    useEffect(() => {
        setCurrent(focusArea);
    }, [focusArea]);

    return (
        <StyledChildCard>
            <CardHeader>
                <CardTitle>
                    <Box sx={{ 
                        padding: '8px', 
                        borderRadius: '8px', 
                        backgroundColor: alpha(colors.success, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <LightbulbOutlined sx={{ color: colors.success, fontSize: '18px' }}/>
                    </Box>
                    <Typography 
                        variant="subtitle1" 
                        sx={{ 
                            fontWeight: 600,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            color: colors.text.primary,
                            fontSize: '1rem'
                        }}
                    >
                        {current.name}
                    </Typography>
                </CardTitle>
                <ActionButtonGroup>
                    <Tooltip title="Edit Sub Area" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <CreateFocusAreaForm
                            focusArea={current}
                            buttonType="icon"
                            onOperation={onOperation}
                            coachingProgramId={programId}
                            parentId={parentId}
                        />
                    </Tooltip>
                    <Tooltip title="Evaluation Settings" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <EvaluationSettingsDialog 
                            focusArea={current}
                            onSave={onEvaluationUpdate}
                            buttonType="icon"
                        />
                    </Tooltip>
                    <Tooltip 
                        title={expanded ? "Hide Details" : "Show Details"} 
                        arrow 
                        TransitionComponent={Fade} 
                        TransitionProps={{ timeout: 600 }}
                    >
                        <ActionButton
                            variant="secondary"
                            size="small"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? <ExpandLess fontSize="small"/> : <ExpandMore fontSize="small"/>}
                        </ActionButton>
                    </Tooltip>
                    <Tooltip title="Delete Sub Area" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <ActionButton
                            variant="error"
                            size="small"
                            onClick={() => onDelete(current.id)}
                        >
                            <Delete fontSize="small"/>
                        </ActionButton>
                    </Tooltip>
                </ActionButtonGroup>
            </CardHeader>
            
            <SubAreaContainer expanded={expanded}>
                <CardContent sx={{ pt: 2, pb: 3 }}>
                    <Stack spacing={3}>
                        {/* Objective Section */}
                        <Box>
                            <FieldLabel>
                                <Psychology sx={{ fontSize: '14px' }} /> 
                                Objective
                            </FieldLabel>
                            <ReadOnlyField>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Chip 
                                        label="View Only" 
                                        size="small" 
                                        sx={{ 
                                            backgroundColor: alpha(colors.secondary, 0.1),
                                            color: colors.text.secondary,
                                            fontSize: '0.7rem',
                                            height: '20px',
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        }} 
                                    />
                                </Box>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        lineHeight: 1.6,
                                        color: colors.text.primary
                                    }}
                                >
                                    {current.objective || "No objective provided"}
                                </Typography>
                            </ReadOnlyField>
                        </Box>

                        {/* Description Section */}
                        <Box>
                            <FieldLabel>
                                <Approval sx={{ fontSize: '14px' }} /> 
                                Description
                            </FieldLabel>
                            <ReadOnlyField>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Chip 
                                        label="View Only" 
                                        size="small" 
                                        sx={{ 
                                            backgroundColor: alpha(colors.secondary, 0.1),
                                            color: colors.text.secondary,
                                            fontSize: '0.7rem',
                                            height: '20px',
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        }} 
                                    />
                                </Box>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        lineHeight: 1.6,
                                        color: colors.text.primary
                                    }}
                                >
                                    {current.description || "No description provided"}
                                </Typography>
                            </ReadOnlyField>
                        </Box>

                        {/* Success Criteria Section */}
                        <Box>
                            <FieldLabel>
                                <CheckCircleOutline sx={{ fontSize: '14px' }} /> 
                                Success Criteria
                            </FieldLabel>
                            <ReadOnlyField>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <Chip 
                                        label="View Only" 
                                        size="small" 
                                        sx={{ 
                                            backgroundColor: alpha(colors.secondary, 0.1),
                                            color: colors.text.secondary,
                                            fontSize: '0.7rem',
                                            height: '20px',
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        }} 
                                    />
                                </Box>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        whiteSpace: 'pre-wrap',
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        lineHeight: 1.6,
                                        color: colors.text.primary
                                    }}
                                >
                                    {current.criteria || "No success criteria provided"}
                                </Typography>
                            </ReadOnlyField>
                        </Box>
                    </Stack>
                </CardContent>
            </SubAreaContainer>
        </StyledChildCard>
    );
};

const FocusAreaCard = ({ focusArea, handleRemoveFocusArea, onOperation, onDelete, programId, onEvaluationUpdate }) => {
    const [current, setCurrent] = useState(focusArea);
    const [expanded, setExpanded] = useState(false);
    const [showSubAreas, setShowSubAreas] = useState(true);
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();

    useEffect(() => {
        setCurrent(focusArea);
    }, [focusArea]);
    
    const hasChildren = current.children && current.children.length > 0;
    
    return (
        <StyledParentCard>
            <CardHeader>
                <CardTitle>
                    <FolderSpecial fontSize="small" sx={{ color: '#2196F3' }}/>
                    <Badge 
                        badgeContent={hasChildren ? current.children.length : 0}
                        color="primary"
                        invisible={!hasChildren}
                        sx={{ '.MuiBadge-badge': { fontSize: '10px', height: '18px', minWidth: '18px' } }}
                    >
                        <Typography variant="h6" fontWeight="500">
                            {current.name}
                        </Typography>
                    </Badge>
                </CardTitle>
                <ActionButtonGroup>
                    <Tooltip title="Edit Focus Area" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <CreateFocusAreaForm
                            focusArea={current}
                            buttonType="icon"
                            onOperation={onOperation}
                            coachingProgramId={programId}
                        />
                    </Tooltip>
                    <Tooltip title="Evaluation Settings" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <EvaluationSettingsDialog 
                            focusArea={current}
                            onSave={onEvaluationUpdate}
                            buttonType="icon"
                        />
                    </Tooltip>
                    <Tooltip 
                        title={expanded ? "Hide Details" : "Show Details"} 
                        arrow 
                        TransitionComponent={Fade} 
                        TransitionProps={{ timeout: 600 }}
                    >
                        <ActionButton
                            variant="secondary"
                            size="small"
                            onClick={() => setExpanded(!expanded)}
                        >
                            {expanded ? <ExpandLess fontSize="small"/> : <ExpandMore fontSize="small"/>}
                        </ActionButton>
                    </Tooltip>
                    <Tooltip title="Remove from Program" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <ActionButton
                            variant="warning"
                            size="small"
                            onClick={() => handleRemoveFocusArea(current.id)}
                        >
                            <Close fontSize="small"/>
                        </ActionButton>
                    </Tooltip>
                    <Tooltip title="Delete Permanently" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <ActionButton
                            variant="error"
                            size="small"
                            onClick={() => onDelete(current.id)}
                        >
                            <Delete fontSize="small"/>
                        </ActionButton>
                    </Tooltip>
                </ActionButtonGroup>
            </CardHeader>
            
            <SubAreaContainer expanded={expanded}>
                <CardContent sx={{ pt: 1, pb: 2 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                            <Psychology sx={{ mr: 1 }} /> Objective
                        </Typography>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 2, 
                                minHeight: '100px', 
                                backgroundColor: 'rgba(33, 150, 243, 0.05)', 
                                borderRadius: '8px',
                                border: '1px solid rgba(33, 150, 243, 0.2)' 
                            }}
                        >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {current.objective || "No objective provided"}
                            </Typography>
                        </Paper>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                            <Approval sx={{ mr: 1 }} /> Description
                        </Typography>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 2, 
                                minHeight: '100px', 
                                backgroundColor: 'rgba(33, 150, 243, 0.05)', 
                                borderRadius: '8px',
                                border: '1px solid rgba(33, 150, 243, 0.2)' 
                            }}
                        >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {current.description || "No description provided"}
                            </Typography>
                        </Paper>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                            <CheckCircleOutline sx={{ mr: 1 }} /> Success Criteria
                        </Typography>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 2, 
                                minHeight: '100px', 
                                backgroundColor: 'rgba(33, 150, 243, 0.05)', 
                                borderRadius: '8px',
                                border: '1px solid rgba(33, 150, 243, 0.2)' 
                            }}
                        >
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                {current.criteria || "No success criteria provided"}
                            </Typography>
                        </Paper>
                    </Box>
                </CardContent>
            </SubAreaContainer>
            
            {/* Sub-areas section */}
            <Box sx={{ mx: 3, mt: expanded ? 0 : 2, mb: 3 }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 1,
                    borderTop: expanded ? 'none' : '1px dashed rgba(0, 0, 0, 0.12)',
                    pt: expanded ? 0 : 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountTree fontSize="small" sx={{ color: '#8BC34A', mr: 1 }} />
                        <Typography variant="subtitle1" color="text.primary" fontWeight="medium">
                            Sub Focus Areas
                        </Typography>
                        {hasChildren && (
                            <ActionButton 
                                variant="secondary"
                                size="small" 
                                onClick={() => setShowSubAreas(!showSubAreas)}
                                sx={{ ml: 1 }}
                            >
                                {showSubAreas ? <ExpandLess fontSize="small"/> : <ExpandMore fontSize="small"/>}
                            </ActionButton>
                        )}
                    </Box>
                    <Tooltip title="Add Sub Area" arrow TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                        <CreateFocusAreaForm 
                            buttonType="icon" 
                            onOperation={onOperation}
                            coachingProgramId={programId} 
                            parentId={current.id} 
                        />
                    </Tooltip>
                </Box>
                
                <SubAreaContainer expanded={showSubAreas}>
                    {hasChildren ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {current.children.map((subArea) => (
                                <SubAreaCard
                                    key={subArea.id}
                                    focusArea={subArea}
                                    parentId={current.id}
                                    onDelete={onDelete}
                                    onOperation={onOperation}
                                    programId={programId}
                                    onEvaluationUpdate={onEvaluationUpdate}
                                />
                            ))}
                        </div>
                    ) : (
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 2, 
                                backgroundColor: 'rgba(0, 0, 0, 0.02)', 
                                borderRadius: '8px',
                                border: '1px dashed rgba(0, 0, 0, 0.12)',
                                textAlign: 'center',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                gap: 1,
                                my: 1
                            }}
                        >
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No sub-areas added yet
                            </Typography>
                            <CreateFocusAreaForm 
                                buttonType="custom" 
                                onOperation={onOperation}
                                coachingProgramId={programId} 
                                parentId={current.id} 
                                customButtonProps={{
                                    variant: "outlined",
                                    color: "primary",
                                    size: "small",
                                    startIcon: <Add />,
                                    children: "Add Sub Area"
                                }}
                            />
                        </Paper>
                    )}
                </SubAreaContainer>
            </Box>
        </StyledParentCard>
    );
};

export default function FocusAreas({ programId, selectedFocusAreas, loading, setLoading }) {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const theme = useTheme();
    const [selectedAreas, setSelectedAreas] = useState(selectedFocusAreas);
    const [focusAreas, setFocusAreas] = useState([]);

    const fetchFocusAreas = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/api/programs/focusAreas/${programId}`);
            
            // Add default eval object if not present
            const processedData = data.map(area => {
                if (!area.eval) {
                    area.eval = {
                        id: area.id,
                        minScore: -1,
                        maxScore: 10,
                        threshold1: 2,
                        threshold2: 4,
                        threshold3: 6
                    };
                }
                
                // Process children if present
                if (area.children && area.children.length > 0) {
                    area.children = area.children.map(child => {
                        if (!child.eval) {
                            child.eval = {
                                id: child.id,
                                minScore: -1,
                                maxScore: 10,
                                threshold1: 2,
                                threshold2: 4,
                                threshold3: 6
                            };
                        }
                        return child;
                    });
                }
                
                return area;
            });
            
            setFocusAreas(processedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching focus areas:', error);
            showAlert('Error fetching focus areas', 'error');
            setLoading(false);
        }
    };
    
    const refreshProgramFocusAreas = async () => {
        try {
            setLoading(true);
            // Fetch the updated program data to get the latest focus areas
            const { data } = await axiosInstance.get(`/api/programs/${programId}`);
            
            // Add default eval object if not present
            const processedData = data.focusAreas.map(area => {
                if (!area.eval) {
                    area.eval = {
                        id: area.id,
                        minScore: -1,
                        maxScore: 10,
                        threshold1: 2,
                        threshold2: 4,
                        threshold3: 6
                    };
                }
                
                // Process children if present
                if (area.children && area.children.length > 0) {
                    area.children = area.children.map(child => {
                        if (!child.eval) {
                            child.eval = {
                                id: child.id,
                                minScore: -1,
                                maxScore: 10,
                                threshold1: 2,
                                threshold2: 4,
                                threshold3: 6
                            };
                        }
                        return child;
                    });
                }
                
                return area;
            });
            
            // Update the selected areas with the latest data
            setSelectedAreas(processedData);
            setLoading(false);
        } catch (error) {
            console.error('Error refreshing program focus areas:', error);
            showAlert('Error refreshing focus areas', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFocusAreas();
    }, []); // Fetch when component mounts

    // Handler for when focus areas change from the selector
    const handleFocusAreaChange = (updatedAreas) => {
        handleFocusAreaSubmit(updatedAreas);
    };

    const handleFocusAreaSubmit = async (uniqueSelectedAreas) => {
        try {
            setLoading(true);
            const requestBody = {
                focusAreaIds: uniqueSelectedAreas.map(area => area.id)
            };

            const { data } = await axiosInstance.put(`/api/programs/focusAreas/${programId}`, requestBody);
            setSelectedAreas(data);
            showAlert('Focus Areas updated successfully', 'success');
        } catch (error) {
            console.error('Error updating Focus Area:', error);
            showAlert('Error updating Focus Area', 'error');
            setLoading(false);
        }
    };

    const handleRemoveFocusArea = (focusAreaId) => {
        const uniqueSelectedAreas = selectedAreas.filter(area => area.id !== focusAreaId);
        handleFocusAreaSubmit(uniqueSelectedAreas);
    };

    const handleDeleteFocusArea = async (areaId) => {
        try {
            const { data } = await axiosInstance.delete(`/api/programs/focusAreas/${areaId}`);
            setFocusAreas(data);
            await refreshProgramFocusAreas();
            showAlert('Focus area deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting focus area:', error);
            showAlert('Error deleting focus area', 'error');
        }
    };

    const OnFocusAreaUpdatedOrCreated = async () => {
        // Refresh the focus areas list
        await fetchFocusAreas();
        // Also refresh the selected areas from program data
        await refreshProgramFocusAreas();
    };
    
    // Handler for updating evaluation settings
    const handleEvaluationUpdate = async (focusAreaId, evalSettings) => {
        try {
            setLoading(true);
            // Make an API call to update the evaluation settings
            const { data } = await axiosInstance.put(`/api/programs/focusAreas/${focusAreaId}/eval`, evalSettings);
            
            // Update focusAreas with the returned data
            setFocusAreas(prevAreas => {
                return prevAreas.map(area => {
                    if (area.id === focusAreaId) {
                        return { ...area, eval: data };
                    } else if (area.children && area.children.length > 0) {
                        const updatedChildren = area.children.map(child => {
                            if (child.id === focusAreaId) {
                                return { ...child, eval: data };
                            }
                            return child;
                        });
                        return { ...area, children: updatedChildren };
                    }
                    return area;
                });
            });
            
            // Update selectedAreas
            setSelectedAreas(prevAreas => {
                return prevAreas.map(area => {
                    if (area.id === focusAreaId) {
                        return { ...area, eval: data };
                    } else if (area.children && area.children.length > 0) {
                        const updatedChildren = area.children.map(child => {
                            if (child.id === focusAreaId) {
                                return { ...child, eval: data };
                            }
                            return child;
                        });
                        return { ...area, children: updatedChildren };
                    }
                    return area;
                });
            });
            
            showAlert('Evaluation settings updated successfully', 'success');
            setLoading(false);
        } catch (error) {
            console.error('Error updating evaluation settings:', error);
            showAlert('Error updating evaluation settings', 'error');
            setLoading(false);
        }
    };

    // Filter to only show parent focus areas in dropdown
    const parentFocusAreas = focusAreas.filter(area => area.isParent);

    return (
        <Card 
            sx={{ 
                padding: '30px', 
                paddingTop: '20px',
                borderRadius: '16px',
                marginBottom: '120px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}
        >
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountTree sx={{ mr: 1, color: 'primary.main' }} />
                    <H3>Focus Areas</H3>
                </Box>
                <Tooltip 
                    title="Add New Parent Focus Area" 
                    arrow 
                    TransitionComponent={Fade} 
                    TransitionProps={{ timeout: 600 }}
                >
                    <CreateFocusAreaForm 
                        onOperation={OnFocusAreaUpdatedOrCreated}
                        coachingProgramId={programId} 
                        isParent={true}
                        customButtonProps={{
                            variant: "contained",
                            color: "primary",
                            size: "medium",
                            startIcon: <Add />,
                            children: "Add Focus Area"
                        }}
                    />
                </Tooltip>
            </Box>

            {/* Simplified Selection UI instead of FocusAreaSelector */}
            <Paper 
                elevation={0}
                sx={{ 
                    p: 2, 
                    mb: 3, 
                    backgroundColor: 'rgba(33, 150, 243, 0.05)', 
                    borderRadius: '8px',
                    border: '1px solid rgba(33, 150, 243, 0.2)' 
                }}
            >
                <Typography variant="body2" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                    <LightbulbOutlined sx={{ mr: 1, color: 'warning.main' }} />
                    Select parent focus areas for this program. You can add sub-areas to each parent focus area.
                </Typography>
                
                <CssSelectField
                    id="focus-areas"
                    multiple
                    sx={{ 
                        width: '100%', 
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                                borderWidth: '1px',
                                borderColor: 'rgba(33, 150, 243, 0.3)',
                            },
                            '&:hover fieldset': {
                                borderColor: 'primary.main',
                            }
                        }
                    }}
                    value={selectedAreas}
                    onChange={(event) => {
                        const {
                            target: { value },
                        } = event;
                        const selectedValues = Array.isArray(value) ? value : [value];
                        const uniqueSelectedAreas = selectedValues.filter((item, index, self) =>
                            index === self.findIndex((t) => t.id === item.id)
                        );
                        handleFocusAreaChange(uniqueSelectedAreas);
                    }}
                    input={<OutlinedInput id="select-multiple-chip" />}
                    renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                            {selected.map((item) => (
                                <FocusAreaChip 
                                    key={item.id} 
                                    label={item.name}
                                    deleteIcon={<Close />}
                                    onDelete={() => handleRemoveFocusArea(item.id)}
                                />
                            ))}
                        </Box>
                    )}
                    MenuProps={MenuProps}
                    placeholder="Select focus areas"
                >
                    {parentFocusAreas.map((item) => (
                        <MenuItem
                            key={item.id}
                            value={item}
                            style={getStyles(item.id, selectedAreas, theme)}
                            disabled={selectedAreas.some(selected => selected.id === item.id)}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <FolderSpecial fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                {item.name}
                                {item.children && item.children.length > 0 && (
                                    <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                                        ({item.children.length} sub-areas)
                                    </Typography>
                                )}
                            </Box>
                        </MenuItem>
                    ))}
                </CssSelectField>
            </Paper>

            {selectedAreas.length === 0 && (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        p: 4, 
                        backgroundColor: 'rgba(0, 0, 0, 0.02)', 
                        borderRadius: '8px',
                        border: '1px dashed rgba(0, 0, 0, 0.12)',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 2,
                        mt: 2,
                        mb: 2
                    }}
                >
                    <AccountTree sx={{ fontSize: 48, color: 'text.disabled' }} />
                    <Typography variant="h6" color="text.secondary">
                        No Focus Areas Selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '500px', mx: 'auto', mb: 2 }}>
                        Add parent focus areas to structure your coaching program and create sub-areas for more specific targets
                    </Typography>
                </Paper>
            )}

            {selectedAreas.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {selectedAreas.map((area) => (
                            <FocusAreaCard
                                key={area.id}
                                focusArea={area}
                                handleRemoveFocusArea={handleRemoveFocusArea}
                                onOperation={OnFocusAreaUpdatedOrCreated}
                                onDelete={handleDeleteFocusArea}
                                onEvaluationUpdate={handleEvaluationUpdate}
                                programId={programId}
                            />
                        ))}
                    </div>
                </Box>
            )}
        </Card>
    );
} 
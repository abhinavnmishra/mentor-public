import React from "react";
import {H3, H4} from "../../components/Typography.jsx";
import Grid from "@mui/material/Grid2";
import {
    Card, 
    CardActions, 
    CardContent, 
    Divider,
    Box,
    Typography,
    Stack,
    Chip,
    Tooltip,
    alpha,
    styled
} from "@mui/material";
import Button from "@mui/material/Button";
import {
    Launch,
    RateReview,
    QuestionAnswer,
    PendingActions,
    CheckCircle,
    Info,
    Groups
} from "@mui/icons-material";

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
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(-1px)',
    }
}));

const GradientCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    background: `linear-gradient(135deg, ${alpha(colors.warning, 0.05)} 0%, ${alpha(colors.primary, 0.05)} 100%)`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transform: 'translateY(-2px)',
    }
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '10px 20px',
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transform: 'translateY(-1px)',
    }
}));

const StatItem = ({ icon, label, value, color = colors.text.primary }) => (
    <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        backgroundColor: alpha(color, 0.05),
        border: `1px solid ${alpha(color, 0.1)}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: alpha(color, 0.08),
        }
    }}>
        <Box sx={{ 
            padding: '8px', 
            borderRadius: '8px', 
            backgroundColor: alpha(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {React.cloneElement(icon, { 
                sx: { color: color, fontSize: '18px' } 
            })}
        </Box>
        <Box sx={{ flex: 1 }}>
            <Typography sx={{ 
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: colors.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '2px'
            }}>
                {label}
            </Typography>
            <Typography sx={{ 
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: color
            }}>
                {value}
            </Typography>
        </Box>
    </Box>
);

const PeerReview = ({milestone}) => {
    const [survey, setSurvey] = React.useState(milestone.survey);

    React.useEffect(() => {
        setSurvey(milestone.survey);
    }, [milestone]);

    function countQuestions(listsOfObjects) {
        // Ensure that the input is an array of arrays
        if (!Array.isArray(listsOfObjects)) {
            console.error("Invalid input. Expected a list of lists.");
            return 0;
        }

        // Use reduce to calculate the total count of objects
        const totalCount = listsOfObjects.reduce((acc, innerList) => {
            if (Array.isArray(innerList)) {
                return acc + innerList.length;
            } else {
                console.warn("Skipping non-array inner list.");
                return acc;
            }
        }, 0);

        return totalCount;
    }

    const handleOpenSurvey = () => {
        window.open('/portal/survey/' + survey.id, '_blank');
    };

    const questionCount = countQuestions(survey?.template?.questions || [[]]);

    return (
        <Box sx={{ 
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            {/* Header Section */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '32px',
                paddingBottom: '16px',
                borderBottom: `1px solid ${colors.border}`
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Box sx={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        backgroundColor: alpha(colors.warning, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <RateReview sx={{ color: colors.warning, fontSize: '24px' }} />
                    </Box>
                    <Box>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontSize: '1.25rem',
                                marginBottom: '4px'
                            }}
                        >
                            Peer Review Configuration
                        </Typography>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                color: colors.text.secondary,
                                fontSize: '0.875rem'
                            }}
                        >
                            Manage peer review surveys and track participant responses
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Peer Review Information Card */}
            <GradientCard>
                <CardContent sx={{ padding: '24px' }}>
                    {/* Survey Title and Type */}
                    <Box sx={{ marginBottom: '24px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    fontSize: '1.125rem',
                                    flex: 1
                                }}
                            >
                                {survey?.title || 'Untitled Peer Review'}
                            </Typography>
                            <Chip 
                                label="Peer Review" 
                                icon={<Groups />}
                                sx={{ 
                                    backgroundColor: alpha(colors.warning, 0.1),
                                    color: colors.warning,
                                    fontWeight: 500,
                                    fontSize: '0.75rem',
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    '& .MuiChip-icon': {
                                        color: colors.warning
                                    }
                                }} 
                            />
                        </Box>
                        
                        {survey?.description && (
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.secondary,
                                    fontSize: '0.875rem',
                                    lineHeight: 1.5
                                }}
                            >
                                {survey.description}
                            </Typography>
                        )}
                    </Box>

                    <Divider sx={{ marginY: '24px' }} />

                    {/* Statistics Grid */}
                    <Box sx={{ marginBottom: '24px' }}>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: colors.text.secondary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Info sx={{ fontSize: '14px' }} />
                            Peer Review Statistics
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <StatItem
                                    icon={<QuestionAnswer />}
                                    label="Total Questions"
                                    value={questionCount.toString()}
                                    color={colors.primary}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <StatItem
                                    icon={<CheckCircle />}
                                    label="Completed Reviews"
                                    value={survey?.completedCount || '0'}
                                    color={colors.success}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <StatItem
                                    icon={<PendingActions />}
                                    label="Pending Reviews"
                                    value={survey?.pendingCount || '0'}
                                    color={colors.warning}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </CardContent>

                <CardActions sx={{ padding: '24px', paddingTop: '0' }}>
                    <Tooltip title="Open peer review survey in new tab to view and manage">
                        <ActionButton 
                            onClick={handleOpenSurvey}
                            variant="contained" 
                            startIcon={<Launch />}
                            sx={{
                                backgroundColor: colors.warning,
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: '#d97706',
                                }
                            }}
                        >
                            Open Survey Wizard
                        </ActionButton>
                    </Tooltip>
                </CardActions>
            </GradientCard>
        </Box>
    );
};

export default PeerReview;
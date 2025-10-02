import * as React from 'react';
import {
    Box, 
    Card, 
    styled, 
    alpha, 
    Tooltip, 
    Fade,
    Paper,
    Chip
} from "@mui/material";
import Typography from "@mui/material/Typography";
import {H3, H5, Small} from "../../components/Typography.jsx";
import {
    Add, 
    Assessment, 
    AutoAwesome, 
    Diversity3, 
    Flag, 
    Spoke,
    Timeline,
    CheckCircle,
    PlayArrow,
    Refresh,
    NavigateNext,
    NavigateBefore,
    Info
} from "@mui/icons-material";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import Avatar from "@mui/material/Avatar";
import Milestone from "./Milestone.jsx";
import CreateMilestoneForm from "./CreateMilestoneForm.jsx";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";
import {useEffect, useState} from "react";
import CircularProgress from "@mui/material/CircularProgress";

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

// Modern gradient colors for milestones
const modernGradients = {
    active: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
    completed: `linear-gradient(135deg, ${colors.success} 0%, #059669 100%)`,
    pending: `linear-gradient(135deg, ${colors.secondary} 0%, #475569 100%)`,
    current: `linear-gradient(135deg, ${colors.warning} 0%, #d97706 100%)`
};

const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    padding: '32px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }
}));

const ModernStepper = styled(Stepper)(({ theme }) => ({
    padding: '24px 0',
    '& .MuiStepConnector-root': {
        top: '30px',
        left: 'calc(-50% + 30px)',
        right: 'calc(50% + 30px)',
        '& .MuiStepConnector-line': {
            borderColor: colors.border,
            borderTopWidth: '2px',
            borderRadius: '1px',
        }
    },
    '& .MuiStepConnector-active .MuiStepConnector-line': {
        borderColor: colors.primary,
    },
    '& .MuiStepConnector-completed .MuiStepConnector-line': {
        borderColor: colors.success,
    }
}));

const ModernStepAvatar = styled(Avatar)(({ theme, stepType, isActive, isCompleted }) => ({
    width: '60px',
    height: '60px',
    background: isActive 
        ? modernGradients.current 
        : isCompleted 
            ? modernGradients.completed 
            : modernGradients.pending,
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    border: `3px solid ${isActive ? colors.warning : isCompleted ? colors.success : colors.border}`,
    boxShadow: isActive 
        ? `0 4px 12px ${alpha(colors.warning, 0.3)}` 
        : isCompleted 
            ? `0 4px 12px ${alpha(colors.success, 0.3)}` 
            : '0 2px 4px rgba(0, 0, 0, 0.1)',
    '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: isActive 
            ? `0 6px 16px ${alpha(colors.warning, 0.4)}` 
            : isCompleted 
                ? `0 6px 16px ${alpha(colors.success, 0.4)}` 
                : `0 4px 8px ${alpha(colors.primary, 0.3)}`,
    }
}));

const StepLabel = styled(Typography)(({ theme, isActive }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: isActive ? colors.warning : colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '8px',
    textAlign: 'center',
    transition: 'color 0.2s ease-in-out'
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

const ProgressSection = styled(Box)(({ theme }) => ({
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.03),
    border: `1px solid ${alpha(colors.primary, 0.1)}`,
    marginBottom: '24px',
}));

const MilestoneHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${colors.border}`
}));

const StatChip = styled(Chip)(({ theme, variant }) => {
    const getColors = () => {
        switch (variant) {
            case 'completed':
                return {
                    bg: alpha(colors.success, 0.1),
                    color: colors.success,
                    border: alpha(colors.success, 0.2)
                };
            case 'total':
                return {
                    bg: alpha(colors.primary, 0.1),
                    color: colors.primary,
                    border: alpha(colors.primary, 0.2)
                };
            default:
                return {
                    bg: alpha(colors.secondary, 0.1),
                    color: colors.secondary,
                    border: alpha(colors.secondary, 0.2)
                };
        }
    };
    
    const chipColors = getColors();
    
    return {
        backgroundColor: chipColors.bg,
        color: chipColors.color,
        border: `1px solid ${chipColors.border}`,
        fontWeight: 600,
        fontSize: '0.75rem',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        height: '28px',
    };
});

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    flexDirection: 'column',
    gap: '16px'
}));

export default function ProgramActivities({program}) {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [steps, setSteps] = useState([]);
    const [activeStep, setActiveStep] = React.useState(0);
    const [completed, setCompleted] = React.useState({});

    const fetchMilestones = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/api/programs/${program.id}/milestones`);
            setSteps(response.data);
            extractStatus(response.data);
        } catch (error) {
            showAlert('Failed to fetch milestones', 'error');
            console.error('Error fetching milestones:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMilestones();
    }, [program.id]);

    const extractStatus = (milestones) => {
        const result = {};

        milestones.forEach((item, index) => {
            result[index] = (item.status === 'COMPLETED'); // Use index as the key and status as the value
        });

        setCompleted(result);
    }

    const totalSteps = () => {
        return steps.length;
    };

    const completedSteps = () => {
        return Object.values(completed).filter((value) => value === true).length;
    };

    const isLastStep = () => {
        return activeStep === totalSteps() - 1;
    };

    const allStepsCompleted = () => {
        return completedSteps() === totalSteps();
    };

    const handleNext = () => {
        const newActiveStep =
            isLastStep() && !allStepsCompleted()
                ? steps.findIndex((step, i) => completed[i] === false)
                : activeStep + 1;
        setActiveStep(newActiveStep);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStep = (step) => () => {
        setActiveStep(step);
    };

    const handleDelete = async () => {
        try {
            const response = await axiosInstance.put(`/api/programs/milestones/${steps[activeStep].id}/status`, {status: "SUSPENDED"});
            setSteps(response.data);
            extractStatus(response.data);
            setActiveStep(0);
            showAlert('Successfully deleted milestone', 'success');
        } catch (error) {
            showAlert('Failed to delete milestone', 'error');
            console.error('Failed to delete milestone:', error);
        }
    };

    const handlePublish = async () => {
        try {
            const response = await axiosInstance.put(`/api/programs/milestones/${steps[activeStep].id}/status`, {status: "ACTIVE"});
            setSteps(response.data);
            extractStatus(response.data);
            showAlert('Successfully published milestone', 'success');
        } catch (error) {
            showAlert('Failed to publish milestone', 'error');
            console.error('Failed to publish milestone:', error);
        }
    };

    const handleComplete = async () => {
        try {
            const response = await axiosInstance.put(`/api/programs/milestones/${steps[activeStep].id}/status`, {status: "COMPLETED"});
            setSteps(response.data);
            extractStatus(response.data);
        } catch (error) {
            showAlert('Failed to update milestone status', 'error');
            console.error('Error fetching milestones:', error);
        }
        handleNext();
    };

    const handleReset = async () => {
        try {
            const response = await axiosInstance.get(`/api/programs/${program.id}/milestones/reset`);
            setSteps(response.data);
            extractStatus(response.data);
        } catch (error) {
            showAlert('Failed to reset milestone status', 'error');
            console.error('Error resetting milestones:', error);
        }
        setActiveStep(0);
    };

    const getMilestoneIcon = (type) => {
        switch (type) {
            case 'PEER_REVIEW':
                return <Diversity3 sx={{ fontSize: '28px' }} />;
            case 'SURVEY':
                return <Assessment sx={{ fontSize: '28px' }} />;
            case 'ACTIVITY':
                return <Spoke sx={{ fontSize: '28px' }} />;
            default:
                return <Flag sx={{ fontSize: '28px' }} />;
        }
    };

    if (loading) {
        return (
            <LoadingContainer>
                <CircularProgress size={40} sx={{ color: colors.primary }} />
                <Typography sx={{
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    color: colors.text.secondary,
                    fontSize: '0.875rem'
                }}>
                    Loading milestones...
                </Typography>
            </LoadingContainer>
        );
    }

    return (
        <Box sx={{ 
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            <ModernCard>
                {/* Header Section */}
                <MilestoneHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Box sx={{ 
                            padding: '12px', 
                            borderRadius: '12px', 
                            backgroundColor: alpha(colors.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Timeline sx={{ color: colors.primary, fontSize: '24px' }} />
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
                                Program Milestones
                            </Typography>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.secondary,
                                    fontSize: '0.875rem'
                                }}
                            >
                                Track and manage program milestone progression
                            </Typography>
                        </Box>
                    </Box>
                    
                    {/* Progress Stats */}
                    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <StatChip 
                            label={`${completedSteps()} Completed`}
                            variant="completed"
                            icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                        />
                        <StatChip 
                            label={`${totalSteps()} Total`}
                            variant="total"
                            icon={<Timeline sx={{ fontSize: '14px !important' }} />}
                        />
                    </Box>
                </MilestoneHeader>

                {/* Progress Information */}
                {totalSteps() > 0 && (
                    <ProgressSection>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                color: colors.text.secondary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Info sx={{ fontSize: '14px' }} />
                            Progress Overview
                        </Typography>
                        <Typography 
                            sx={{
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '0.875rem',
                                color: colors.text.primary,
                                lineHeight: 1.5
                            }}
                        >
                            {allStepsCompleted() 
                                ? 'All milestones have been completed! You can reset to start over or add new milestones.'
                                : `Progress: ${completedSteps()} of ${totalSteps()} milestones completed. Click on any milestone to view details.`
                            }
                        </Typography>
                    </ProgressSection>
                )}

                {/* Stepper Section */}
                <Box sx={{ marginBottom: '32px' }}>
                    <ModernStepper nonLinear activeStep={activeStep}>
                        {steps.map((milestone, index) => (
                            <Step 
                                key={milestone.id} 
                                completed={milestone.status === 'COMPLETED'} 
                                sx={{
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '8px'
                                }}
                            >
                                <Tooltip 
                                    title={`${milestone.title} - ${milestone.type}`} 
                                    arrow 
                                    TransitionComponent={Fade} 
                                    TransitionProps={{ timeout: 600 }}
                                >
                                    <ModernStepAvatar 
                                        onClick={handleStep(index)}
                                        stepType={milestone.type}
                                        isActive={activeStep === index}
                                        isCompleted={milestone.status === 'COMPLETED'}
                                    >
                                        {getMilestoneIcon(milestone.type)}
                                    </ModernStepAvatar>
                                </Tooltip>
                                <StepLabel isActive={activeStep === index}>
                                    {milestone.type.replace('_', ' ')}
                                </StepLabel>
                            </Step>
                        ))}

                        <Step>
                            <CreateMilestoneForm program={program} onMilestoneCreated={fetchMilestones}/>
                        </Step>
                    </ModernStepper>
                </Box>

                {/* Navigation and Actions */}
                <Box>
                    {allStepsCompleted() ? (
                        <Box>
                            <Paper 
                                elevation={0}
                                sx={{ 
                                    padding: '24px', 
                                    backgroundColor: alpha(colors.success, 0.05),
                                    borderRadius: '12px',
                                    border: `1px solid ${alpha(colors.success, 0.2)}`,
                                    textAlign: 'center',
                                    marginBottom: '16px'
                                }}
                            >
                                <CheckCircle sx={{ 
                                    fontSize: '48px', 
                                    color: colors.success, 
                                    marginBottom: '12px' 
                                }} />
                                <Typography 
                                    variant="h6"
                                    sx={{
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 600,
                                        color: colors.text.primary,
                                        marginBottom: '8px'
                                    }}
                                >
                                    {totalSteps() === 0 ? 'No Milestones Yet' : 'All Milestones Completed!'}
                                </Typography>
                                <Typography 
                                    sx={{
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        color: colors.text.secondary,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {totalSteps() === 0 
                                        ? 'Click the add button above to create your first milestone'
                                        : 'Congratulations! You have successfully completed all program milestones.'
                                    }
                                </Typography>
                            </Paper>
                            
                            {totalSteps() > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <ActionButton 
                                        onClick={handleReset}
                                        variant="outlined"
                                        startIcon={<Refresh />}
                                        sx={{
                                            borderColor: colors.border,
                                            color: colors.text.secondary,
                                            '&:hover': {
                                                borderColor: colors.primary,
                                                backgroundColor: alpha(colors.primary, 0.05),
                                                color: colors.primary,
                                            }
                                        }}
                                    >
                                        Reset Progress
                                    </ActionButton>
                                </Box>
                            )}
                        </Box>
                    ) : (
                        steps.length > 0 && (
                            <Box>
                                <Paper 
                                    elevation={0}
                                    sx={{ 
                                        padding: '20px', 
                                        backgroundColor: alpha(colors.warning, 0.05),
                                        borderRadius: '12px',
                                        border: `1px solid ${alpha(colors.warning, 0.2)}`,
                                        marginBottom: '20px'
                                    }}
                                >
                                    <Typography 
                                        variant="h6"
                                        sx={{
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontWeight: 600,
                                            color: colors.text.primary,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        Milestone {activeStep + 1}: {steps[activeStep].title}
                                    </Typography>
                                    <Typography 
                                        sx={{
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            color: colors.text.secondary,
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        {steps[activeStep].description || 'No description available'}
                                    </Typography>
                                </Paper>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <ActionButton
                                        variant="outlined"
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                        startIcon={<NavigateBefore />}
                                        sx={{
                                            borderColor: colors.border,
                                            color: colors.text.secondary,
                                            '&:hover': {
                                                borderColor: colors.primary,
                                                backgroundColor: alpha(colors.primary, 0.05),
                                                color: colors.primary,
                                            },
                                            '&:disabled': {
                                                borderColor: alpha(colors.border, 0.5),
                                                color: colors.text.disabled,
                                            }
                                        }}
                                    >
                                        Previous
                                    </ActionButton>
                                    
                                    <ActionButton 
                                        onClick={handleNext} 
                                        variant="outlined"
                                        endIcon={<NavigateNext />}
                                        sx={{
                                            borderColor: colors.border,
                                            color: colors.text.secondary,
                                            '&:hover': {
                                                borderColor: colors.primary,
                                                backgroundColor: alpha(colors.primary, 0.05),
                                                color: colors.primary,
                                            }
                                        }}
                                    >
                                        Next
                                    </ActionButton>
                                    
                                    <Box sx={{ flex: 1 }} />
                                    
                                    {activeStep !== steps.length &&
                                        (steps[activeStep].status === 'COMPLETED' ? (
                                            <Chip 
                                                label="Completed"
                                                icon={<CheckCircle />}
                                                sx={{
                                                    backgroundColor: alpha(colors.success, 0.1),
                                                    color: colors.success,
                                                    border: `1px solid ${alpha(colors.success, 0.2)}`,
                                                    fontWeight: 600,
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                    '& .MuiChip-icon': {
                                                        color: colors.success
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <ActionButton 
                                                onClick={handleComplete}
                                                variant="contained"
                                                startIcon={<CheckCircle />}
                                                sx={{
                                                    backgroundColor: colors.success,
                                                    color: 'white',
                                                    '&:hover': {
                                                        backgroundColor: '#059669',
                                                    }
                                                }}
                                            >
                                                {completedSteps() === totalSteps() - 1 ? 'Finish' : 'Mark Complete'}
                                            </ActionButton>
                                        ))}
                                </Box>
                            </Box>
                        )
                    )}
                </Box>
            </ModernCard>

            {/* Milestone Details */}
            {steps.length > 0 && (
                <Box sx={{ marginTop: '24px' }}>
                    <Milestone 
                        programFocusAreas={program.focusAreas} 
                        milestone={steps[activeStep]} 
                        handleDelete={handleDelete} 
                        handlePublish={handlePublish}
                    />
                </Box>
            )}
        </Box>
    );
}

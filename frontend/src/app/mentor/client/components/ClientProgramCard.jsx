import { 
    Box, 
    styled, 
    Typography,
    alpha,
    Card,
    CardContent,
    Chip,
    Avatar,
    IconButton,
    Button,
    Collapse,
    LinearProgress,
    Tooltip,
    Grid
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Person,
    Schedule,
    TrendingUp,
    AccessTime,
    CalendarToday,
    ExpandMore as ExpandMoreIcon,
    School,
    Flag,
    Timeline as TimelineIcon,
    CheckCircleOutline,
    Info as InfoIcon,
    ArrowForward
} from "@mui/icons-material";

// Modern color palette (consistent with other components)
const colors = {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
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

const gradientColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
];

const ProgramCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    transition: 'all 0.2s ease-in-out',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 25px 0 rgba(0, 0, 0, 0.1), 0 4px 6px 0 rgba(0, 0, 0, 0.05)',
        borderColor: colors.borderHover,
    }
}));

const CardHeader = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: '140px',
    overflow: 'hidden',
}));

const GradientOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
    zIndex: 2,
}));

const CoverImage = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: 1,
}));

const ProgramCardContent = styled(CardContent)(({ theme }) => ({
    padding: '20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    '&:last-child': {
        paddingBottom: '20px'
    }
}));

const ProgramTitle = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text.primary,
    lineHeight: 1.3,
    marginBottom: '8px'
}));

const ProgramDescription = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    color: colors.text.secondary,
    lineHeight: 1.5,
}));

const TrainerSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: alpha(colors.primary, 0.02),
    borderRadius: '12px',
    border: `1px solid ${alpha(colors.primary, 0.08)}`,
    marginTop: 'auto'
}));

const DateSection = styled(Grid)(({ theme }) => ({
    gap: '8px',
    marginTop: '8px'
}));

const DateItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    backgroundColor: alpha(colors.secondary, 0.05),
    borderRadius: '8px',
    border: `1px solid ${alpha(colors.secondary, 0.1)}`,
    height: '100%'
}));

const StatChip = styled(Box)(({ theme, color = colors.info }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 10px',
    backgroundColor: alpha(color, 0.05),
    borderRadius: '8px',
    border: `1px solid ${alpha(color, 0.1)}`,
    height: '100%'
}));

const ExpandButton = styled(IconButton)(({ theme, expanded }) => ({
    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: 'transform 0.2s',
    marginLeft: 'auto',
    padding: '4px',
    backgroundColor: alpha(colors.secondary, 0.05),
    '&:hover': {
        backgroundColor: alpha(colors.secondary, 0.1),
    }
}));

// Helper functions
const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE':
            return colors.success;
        case 'COMPLETED':
            return colors.info;
        case 'PAUSED':
            return colors.warning;
        case 'SUSPENDED':
            return colors.error;
        default:
            return colors.secondary;
    }
};

const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
        case 'ACTIVE':
            return <TrendingUp />;
        case 'COMPLETED':
            return <Schedule />;
        case 'PAUSED':
            return <AccessTime />;
        case 'SUSPENDED':
            return <AccessTime />;
        default:
            return <Schedule />;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return dateString;
    }
};

function getCharSum(str, max) {
    return ([...str].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % max;
}

function getGradientIndex(programId) {
    return getCharSum(programId || '', gradientColors.length);
}

export default function ClientProgramCard({ program }) {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);
    const coverImageIndex = getCharSum(program.programId?.toString() || '', 24) + 1;
    const gradientIndex = getGradientIndex(program.coachingSessionId?.toString());

    const handleViewMilestones = () => {
        navigate(`/client/milestones/${program.programId}`);
    };
    
    const handleCardClick = (e) => {
        // Navigate to milestones page regardless of where the user clicks
        // (unless it's on a button with stopPropagation)
        handleViewMilestones();
    };

    return (
        <ProgramCard onClick={handleCardClick} sx={{ cursor: 'pointer' }}>
            {/* Status indicator - positioned at top right corner for better visibility */}
            <Box sx={{ 
                position: 'absolute',
                top: '12px',
                right: '12px',
                zIndex: 10,
            }}>
                <Tooltip title={`Status: ${program.status || 'Unknown'}`}>
                    <Chip
                        icon={getStatusIcon(program.status)}
                        label={program.status || 'Unknown'}
                        size="small"
                        sx={{
                            backgroundColor: alpha(getStatusColor(program.status), 0.9),
                            color: '#fff',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            backdropFilter: 'blur(4px)',
                            '& .MuiChip-icon': {
                                color: '#fff'
                            }
                        }}
                    />
                </Tooltip>
            </Box>

            {/* Card Header with Cover Image */}
            <CardHeader>
                <CoverImage
                    sx={{
                        backgroundImage: `url('/assets/cover/cover-${coverImageIndex}.webp')`,
                    }}
                />
                <GradientOverlay/>
                
                {/* Status indicator overlaid on the header */}
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5 }}>
                    <Tooltip title={`Status: ${program.status || 'Unknown'}`}>
                        <LinearProgress 
                            variant="determinate" 
                            value={100} 
                            sx={{ 
                                height: 6, 
                                backgroundColor: alpha('#fff', 0.2),
                                '& .MuiLinearProgress-bar': {
                                    backgroundColor: getStatusColor(program.status)
                                }
                            }}
                        />
                    </Tooltip>
                </Box>
            </CardHeader>

            <ProgramCardContent>
                {/* Program Title */}
                <Box sx={{ mb: 1 }}>
                    <ProgramTitle>{program.title}</ProgramTitle>
                </Box>
                
                {/* Key Stats - Immediately visible important information */}
                <Grid container spacing={1} sx={{ mb: 1 }}>
                    <Grid item xs={6}>
                        <Tooltip title={`Program Status: ${program.status || 'Unknown'}`}>
                            <StatChip color={getStatusColor(program.status)}>
                                {getStatusIcon(program.status)}
                                <Box>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.75rem', 
                                            fontWeight: 600,
                                            color: colors.text.secondary 
                                        }}
                                    >
                                        STATUS
                                    </Typography>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: getStatusColor(program.status)
                                        }}
                                    >
                                        {program.status || 'Unknown'}
                                    </Typography>
                                </Box>
                            </StatChip>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={6}>
                        <Tooltip title="Program Milestones">
                            <StatChip color={colors.info}>
                                <Flag sx={{ fontSize: '18px', color: colors.info }} />
                                <Box>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.75rem', 
                                            fontWeight: 600,
                                            color: colors.text.secondary 
                                        }}
                                    >
                                        MILESTONES
                                    </Typography>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.875rem',
                                            fontWeight: 600,
                                            color: colors.info
                                        }}
                                    >
                                        {program.milestoneCount || 0}
                                    </Typography>
                                </Box>
                            </StatChip>
                        </Tooltip>
                    </Grid>
                </Grid>
                
                {/* Program Description with expand/collapse functionality */}
                <Box sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <ProgramDescription
                            sx={{
                                display: expanded ? 'block' : '-webkit-box',
                                WebkitLineClamp: expanded ? 'none' : 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                flex: 1
                            }}
                        >
                            {program.description || 'No description available'}
                        </ProgramDescription>
                        {program.description && (
                            <ExpandButton
                                expanded={expanded}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setExpanded(!expanded);
                                }}
                                size="small"
                                aria-label="show more"
                            >
                                <ExpandMoreIcon />
                            </ExpandButton>
                        )}
                    </Box>
                </Box>



                {/* Date Information - Organized in a grid for better layout */}
                <DateSection container spacing={1}>
                    <Grid item xs={5}>
                        <Tooltip title="Program Start Date">
                            <DateItem>
                                <CalendarToday sx={{ fontSize: '18px', color: colors.success }} />
                                <Box>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.75rem', 
                                            fontWeight: 600,
                                            color: colors.text.secondary 
                                        }}
                                    >
                                        START
                                    </Typography>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.75rem', 
                                            color: colors.text.primary 
                                        }}
                                    >
                                        {formatDate(program.startDate)}
                                    </Typography>
                                </Box>
                            </DateItem>
                        </Tooltip>
                    </Grid>

                    <Grid item xs={5}>
                        <Tooltip title="Program End Date">
                            <DateItem>
                                <AccessTime sx={{ fontSize: '18px', color: colors.warning }} />
                                <Box>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.75rem', 
                                            fontWeight: 600,
                                            color: colors.text.secondary 
                                        }}
                                    >
                                        END
                                    </Typography>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontSize: '0.75rem', 
                                            color: colors.text.primary 
                                        }}
                                    >
                                        {formatDate(program.endDate)}
                                    </Typography>
                                </Box>
                            </DateItem>
                        </Tooltip>
                    </Grid>
                </DateSection>

                {/* Trainer Information - Moved to bottom for better hierarchy */}
                {program.trainer && (
                    <TrainerSection>
                        <Avatar 
                            src={program.trainer.profileImageUrl} 
                            sx={{ 
                                width: 36, 
                                height: 36,
                                backgroundColor: alpha(colors.primary, 0.1),
                                color: colors.primary
                            }}
                        >
                            <Person />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 600, 
                                    fontSize: '0.875rem',
                                    color: colors.text.primary 
                                }}
                            >
                                {program.trainer.firstName} {program.trainer.lastName}
                            </Typography>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '0.75rem', 
                                    color: colors.text.secondary 
                                }}
                            >
                                Program Coach
                            </Typography>
                        </Box>
                    </TrainerSection>
                )}

                {/* Action Buttons - Clear call to action */}
                <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    startIcon={<TimelineIcon />}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleViewMilestones();
                    }}
                    fullWidth
                    sx={{
                        mt: 1,
                        mb: 1,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        backgroundColor: colors.primary,
                        '&:hover': {
                            backgroundColor: colors.primaryLight,
                        }
                    }}
                >
                    View Milestones
                </Button>
                
            </ProgramCardContent>
        </ProgramCard>
    );
}

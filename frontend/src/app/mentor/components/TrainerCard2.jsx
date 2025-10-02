import { 
    Box, 
    Card, 
    styled, 
    Typography,
    alpha,
    Tooltip
} from "@mui/material";
import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Grid from '@mui/material/Grid2';
import CreateTrainerForm from "./CreateTrainerForm.jsx";
import SendEmailForm from "./SendEmailForm.jsx";
import useAuth from "../../hooks/useAuth.js";
import {
    School,
    Groups,
    Email,
    ExpandMore,
    ExpandLess
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

// Modern gradient backgrounds instead of CSS classes
const gradients = [
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)',
    'linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)',
    'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
];

const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '20px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    transition: 'all 0.3s ease-in-out',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '400px',
    margin: '0 auto',
    height: 'fit-content',
    [theme.breakpoints.down('md')]: {
        maxWidth: '100%',
    },
    '&:hover': {
        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        transform: 'translateY(-2px)',
    }
}));

const GradientHeader = styled(Box)(({ gradient, theme }) => ({
    height: '120px',
    background: gradient,
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingBottom: '20px',
    [theme.breakpoints.down('sm')]: {
        height: '100px',
    },
}));

const AdminControls = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 2,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: '80px',
    height: '80px',
    border: `4px solid ${colors.surface}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    fontSize: '1.5rem',
    fontWeight: 600,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    position: 'absolute',
    bottom: '-40px',
    [theme.breakpoints.down('sm')]: {
        width: '70px',
        height: '70px',
        fontSize: '1.25rem',
        bottom: '-35px',
    },
}));

const TrainerName = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 600,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: '8px',
    lineHeight: 1.2,
    wordBreak: 'break-word',
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.1rem',
    },
}));

const TrainerEmail = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '16px',
    padding: '8px 16px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.05),
    border: `1px solid ${alpha(colors.primary, 0.1)}`,
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
        padding: '6px 12px',
        gap: '6px',
    },
}));

const EmailText = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    color: colors.text.secondary,
    fontWeight: 500,
    wordBreak: 'break-all',
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.8rem',
    },
}));

const DescriptionContainer = styled(Box)(({ theme }) => ({
    margin: '16px 20px',
    padding: '16px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.secondary, 0.03),
    border: `1px solid ${colors.border}`,
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
        margin: '12px 16px',
        padding: '12px',
    },
}));

const DescriptionText = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    color: colors.text.secondary,
    lineHeight: 1.5,
    textAlign: 'center',
    wordBreak: 'break-word',
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.8rem',
    },
}));

const StatsContainer = styled(Box)(({ theme }) => ({
    padding: '20px',
    paddingTop: '16px',
    [theme.breakpoints.down('sm')]: {
        padding: '16px',
        paddingTop: '12px',
    },
}));

const StatItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '16px 12px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.03),
    border: `1px solid ${alpha(colors.primary, 0.1)}`,
    transition: 'all 0.2s ease-in-out',
    minHeight: '80px',
    [theme.breakpoints.down('sm')]: {
        padding: '12px 8px',
        gap: '6px',
        minHeight: '70px',
    },
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.05),
        transform: 'translateY(-1px)',
    }
}));

const StatNumber = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.75rem',
    fontWeight: 700,
    color: colors.primary,
    lineHeight: 1,
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
    },
}));

const StatLabel = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.7rem',
        gap: '2px',
    },
}));

const ExpandButton = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    color: colors.text.secondary,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.1),
        color: colors.primary,
    }
}));

function getCharSum(str, max) {
    return ([...str].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % max;
}

const TrainerCard2 = ({ trainer, index, setUpdate }) => {
    const { user } = useAuth();
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    
    const gradientIndex = getCharSum(trainer.id, gradients.length);
    const selectedGradient = gradients[gradientIndex];
    
    const shouldShowExpandButton = trainer.shortDescription && trainer.shortDescription.length > 120;
    const displayDescription = shouldShowExpandButton && !isDescriptionExpanded 
        ? trainer.shortDescription.substring(0, 120) + '...'
        : trainer.shortDescription;

    return (
        <ModernCard>
            {/* Gradient Header with Avatar */}
            <GradientHeader gradient={selectedGradient}>
                {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MODERATOR') && (
                    <AdminControls>
                        <CreateTrainerForm trainer={trainer} setUpdate={setUpdate}/>
                    </AdminControls>
                )}
                <StyledAvatar 
                    alt={trainer.firstName?.charAt(0) || 'T'} 
                    src={trainer.profileImageUrl ? 
                        backendBaseUrl + trainer.profileImageUrl :
                        `/assets/avatar/avatar-${((gradientIndex%7)+1)}.webp`
                    }
                >
                    {!trainer.profileImageUrl && (trainer.firstName?.charAt(0) || 'T')}
                </StyledAvatar>
            </GradientHeader>

            {/* Trainer Information */}
            <Box sx={{ 
                padding: '45px 20px 0 20px',
                '@media (max-width: 600px)': {
                    padding: '35px 16px 0 16px',
                }
            }}>
                <TrainerName>
                    {trainer.firstName} {trainer.lastName}
                </TrainerName>

                <TrainerEmail>
                    <Email sx={{ fontSize: '16px', color: colors.primary }} />
                    <EmailText>{trainer.email}</EmailText>
                    <SendEmailForm 
                        toEmailAddress={trainer.email} 
                        direct={false} 
                        keyword={'email_body_trainer'} 
                        id={trainer.id} 
                    />
                </TrainerEmail>
            </Box>

            {/* Description */}
            {trainer.shortDescription && (
                <DescriptionContainer>
                    <DescriptionText>
                        {displayDescription}
                    </DescriptionText>
                    {shouldShowExpandButton && (
                        <Tooltip title={isDescriptionExpanded ? "Show less" : "Show more"}>
                            <ExpandButton 
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                sx={{ 
                                    position: 'absolute',
                                    bottom: '8px',
                                    right: '8px',
                                }}
                            >
                                {isDescriptionExpanded ? 
                                    <ExpandLess sx={{ fontSize: '18px' }} /> : 
                                    <ExpandMore sx={{ fontSize: '18px' }} />
                                }
                            </ExpandButton>
                        </Tooltip>
                    )}
                </DescriptionContainer>
            )}

            {/* Statistics */}
            <StatsContainer>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <StatItem>
                            <StatNumber>{trainer.programCount || 0}</StatNumber>
                            <StatLabel>
                                <School sx={{ fontSize: '12px' }} />
                                Programs
                            </StatLabel>
                        </StatItem>
                    </Grid>
                    <Grid size={6}>
                        <StatItem>
                            <StatNumber>{trainer.clientCount || 0}</StatNumber>
                            <StatLabel>
                                <Groups sx={{ fontSize: '12px' }} />
                                Mentees
                            </StatLabel>
                        </StatItem>
                    </Grid>
                </Grid>
            </StatsContainer>
        </ModernCard>
    );
};

export default TrainerCard2;
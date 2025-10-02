import { 
    Box, 
    Card, 
    styled, 
    Typography,
    alpha,
    Tooltip,
    Stack
} from "@mui/material";
import React from "react";
import Avatar from "@mui/material/Avatar";
import Grid from '@mui/material/Grid2';
import {
    Business,
    Groups,
    Email,
    Domain,
    Edit
} from "@mui/icons-material";
import CreateClientOrganisationForm from "./CreateClientOrganisationForm.jsx";
import SendEmailForm from "./SendEmailForm.jsx";
import useAuth from "../../hooks/useAuth.js";

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
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(135deg, #ff8a80 0%, #ea80fc 100%)',
    'linear-gradient(135deg, #8fd3f4 0%, #84fab0 100%)',
    'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'
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

const EditButton = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 2,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    width: '80px',
    height: '80px',
    border: `4px solid ${colors.surface}`,
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    position: 'absolute',
    bottom: '-40px',
    backgroundColor: colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    [theme.breakpoints.down('sm')]: {
        width: '70px',
        height: '70px',
        bottom: '-35px',
    },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: '60px',
    height: '60px',
    fontSize: '1.5rem',
    fontWeight: 600,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    [theme.breakpoints.down('sm')]: {
        width: '50px',
        height: '50px',
        fontSize: '1.25rem',
    },
}));

const ClientName = styled(Typography)(({ theme }) => ({
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

const ClientDomain = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '16px',
    padding: '8px 16px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.secondary, 0.05),
    border: `1px solid ${alpha(colors.secondary, 0.1)}`,
    flexWrap: 'wrap',
    [theme.breakpoints.down('sm')]: {
        padding: '6px 12px',
        gap: '6px',
    },
}));

const DomainText = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    color: colors.text.secondary,
    fontWeight: 500,
    textAlign: 'center',
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.8rem',
    },
}));

const ClientEmail = styled(Box)(({ theme }) => ({
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

function getCharSum(str, max) {
    return ([...str].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % max;
}

const ClientItem = ({ client, index, setUpdate }) => {
    const { user } = useAuth();
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
    
    const gradientIndex = getCharSum(client.id || client.name, gradients.length);
    const selectedGradient = gradients[gradientIndex];

    return (
        <ModernCard>
            {/* Gradient Header with Logo/Avatar */}
            <GradientHeader gradient={selectedGradient}>
                {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MODERATOR') && (
                    <EditButton>
                        <CreateClientOrganisationForm client={client} setUpdate={setUpdate} />
                    </EditButton>
                )}
                
                <LogoContainer>
                    {client.logoImageUrl ? (
                        <img
                            src={backendBaseUrl + client.logoImageUrl}
                            alt={`${client.name} logo`}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                padding: '8px'
                            }}
                        />
                    ) : (
                        <StyledAvatar>
                            {client.name?.charAt(0) || 'C'}
                        </StyledAvatar>
                    )}
                </LogoContainer>
            </GradientHeader>

            {/* Client Information */}
            <Box sx={{ 
                padding: '45px 20px 0 20px',
                '@media (max-width: 600px)': {
                    padding: '35px 16px 0 16px',
                }
            }}>
                <ClientName>
                    {client.name}
                </ClientName>

                {client.domain && (
                    <ClientDomain>
                        <Domain sx={{ fontSize: '16px', color: colors.secondary }} />
                        <DomainText>{client.domain}</DomainText>
                    </ClientDomain>
                )}

                {client.email && (
                    <ClientEmail>
                        <Email sx={{ fontSize: '16px', color: colors.primary }} />
                        <EmailText>{client.email}</EmailText>
                        <SendEmailForm 
                            toEmailAddress={client.email} 
                            direct={false} 
                            keyword={'email_body_client_org'} 
                            id={client.id} 
                        />
                    </ClientEmail>
                )}
            </Box>

            {/* Statistics */}
            <StatsContainer>
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <StatItem>
                            <StatNumber>{client.size || 0}</StatNumber>
                            <StatLabel>
                                <Business sx={{ fontSize: '12px' }} />
                                Company Size
                            </StatLabel>
                        </StatItem>
                    </Grid>
                    <Grid size={6}>
                        <StatItem>
                            <StatNumber>{client.menteeCount || 0}</StatNumber>
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

export default ClientItem;

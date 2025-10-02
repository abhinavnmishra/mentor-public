import { 
    Box, 
    styled, 
    Typography, 
    Container, 
    Stack, 
    alpha,
    Paper
} from "@mui/material";
import { Breadcrumb } from "app/components";
import * as React from "react";
import PersonalProfileCard from "../components/PersonalProfileCard.jsx";
import OrganisationProfileCard from "../components/OrganisationProfileCard.jsx";
import useAuth from "../../hooks/useAuth.js";
import { 
    Person, 
    Business, 
    Settings 
} from "@mui/icons-material";

// Modern color palette consistent with other components
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

// STYLED COMPONENTS
const ModernContainer = styled(Container)(({ theme }) => ({
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px 24px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    [theme.breakpoints.down("md")]: { 
        padding: "24px 16px" 
    },
    [theme.breakpoints.down("sm")]: { 
        padding: "16px 12px" 
    }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
    marginBottom: '40px',
    padding: '32px',
    borderRadius: '16px',
    background: `linear-gradient(135deg, ${alpha(colors.primary, 0.08)} 0%, ${alpha(colors.success, 0.05)} 100%)`,
    border: `1px solid ${colors.border}`,
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 20% 80%, ${alpha(colors.primary, 0.1)} 0%, transparent 50%), 
                     radial-gradient(circle at 80% 20%, ${alpha(colors.success, 0.08)} 0%, transparent 50%)`,
        pointerEvents: 'none',
    },
    [theme.breakpoints.down("md")]: { 
        padding: "24px",
        marginBottom: '32px'
    },
    [theme.breakpoints.down("sm")]: { 
        padding: "20px",
        marginBottom: '24px'
    }
}));

const BreadcrumbContainer = styled(Box)(({ theme }) => ({
    display: 'flex', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: '24px',
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down("md")]: { 
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '16px'
    }
}));

const PageTitle = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '2rem',
    fontWeight: 700,
    color: colors.text.primary,
    lineHeight: 1.2,
    marginBottom: '8px',
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down("md")]: { 
        fontSize: '1.75rem'
    },
    [theme.breakpoints.down("sm")]: { 
        fontSize: '1.5rem'
    }
}));

const PageSubtitle = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1rem',
    color: colors.text.secondary,
    lineHeight: 1.5,
    position: 'relative',
    zIndex: 1,
    [theme.breakpoints.down("sm")]: { 
        fontSize: '0.875rem'
    }
}));

const ContentSection = styled(Stack)(({ theme }) => ({
    gap: '32px',
    [theme.breakpoints.down("md")]: { 
        gap: '24px'
    },
    [theme.breakpoints.down("sm")]: { 
        gap: '20px'
    }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: `1px solid ${colors.border}`,
}));

const SectionWrapper = styled(Paper)(({ theme }) => ({
    padding: '0',
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    overflow: 'hidden',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    }
}));

const IconContainer = styled(Box)(({ theme }) => ({
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    height: '40px'
}));

export default function ProfileCustomisation() {
    const { user } = useAuth();

    return (
        <ModernContainer>
            <HeaderSection>
                <BreadcrumbContainer>
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Breadcrumb routeSegments={[{ name: "PROFILE" }]} />
                    </Box>
                </BreadcrumbContainer>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 1 }}>
                    <IconContainer sx={{ 
                        backgroundColor: alpha(colors.primary, 0.1),
                        border: `1px solid ${alpha(colors.primary, 0.2)}`
                    }}>
                        <Settings sx={{ color: colors.primary, fontSize: '24px' }} />
                    </IconContainer>
                    <Box>
                        <PageTitle>
                            Profile Customisation
                        </PageTitle>
                        <PageSubtitle>
                            Manage your personal and organization profile settings
                        </PageSubtitle>
                    </Box>
                </Box>
            </HeaderSection>

            <ContentSection>
                {/* Personal Profile Section */}
                <Box>
                    <SectionHeader>
                        <IconContainer sx={{ 
                            backgroundColor: alpha(colors.primary, 0.1),
                            border: `1px solid ${alpha(colors.primary, 0.2)}`
                        }}>
                            <Person sx={{ color: colors.primary, fontSize: '20px' }} />
                        </IconContainer>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                fontSize: '1.25rem'
                            }}
                        >
                            Personal Profile
                        </Typography>
                    </SectionHeader>

                    <SectionWrapper>
                        <PersonalProfileCard />
                    </SectionWrapper>
                </Box>

                {/* Organization Profile Section - Only for Admin/Moderator */}
                {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MODERATOR') && (
                    <Box>
                        <SectionHeader>
                            <IconContainer sx={{ 
                                backgroundColor: alpha(colors.secondary, 0.1),
                                border: `1px solid ${alpha(colors.secondary, 0.2)}`
                            }}>
                                <Business sx={{ color: colors.secondary, fontSize: '20px' }} />
                            </IconContainer>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 600,
                                    color: colors.text.primary,
                                    fontSize: '1.25rem'
                                }}
                            >
                                Organization Profile
                            </Typography>
                        </SectionHeader>

                        <SectionWrapper>
                            <OrganisationProfileCard />
                        </SectionWrapper>
                    </Box>
                )}
            </ContentSection>
        </ModernContainer>
    );
}

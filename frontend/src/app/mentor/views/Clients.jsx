import { 
    Box, 
    styled, 
    Typography,
    alpha,
    Paper,
    Stack
} from "@mui/material";
import { Breadcrumb } from "app/components";
import Grid from '@mui/material/Grid2';
import ClientItem from "../components/ClientItem.jsx";
import CreateClientOrganisationForm from "../components/CreateClientOrganisationForm.jsx";
import { useAxios } from "app/contexts/AxiosContext";
import { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth.js";
import {
    Business,
    Groups,
    Add
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

// Modern styled components
const Container = styled(Box)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: colors.background,
    minHeight: '100vh',
    [theme.breakpoints.down("sm")]: { 
        padding: "16px" 
    }
}));

const HeaderSection = styled(Paper)(({ theme }) => ({
    padding: '32px',
    borderRadius: '20px',
    width: '100%',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    marginBottom: '32px',
    [theme.breakpoints.down("sm")]: { 
        padding: "20px",
        marginBottom: "20px"
    }
}));

const PageTitle = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '2rem',
    fontWeight: 700,
    color: colors.text.primary,
    lineHeight: 1.2,
    marginBottom: '8px',
    [theme.breakpoints.down("sm")]: { 
        fontSize: "1.5rem" 
    }
}));

const PageDescription = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1rem',
    color: colors.text.secondary,
    lineHeight: 1.5,
    [theme.breakpoints.down("sm")]: { 
        fontSize: "0.875rem" 
    }
}));

const StatsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: '24px',
    marginTop: '24px',
    [theme.breakpoints.down("sm")]: { 
        flexDirection: 'column',
        gap: '16px'
    }
}));

const StatCard = styled(Box)(({ theme }) => ({
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: alpha(colors.primary, 0.05),
    border: `1px solid ${alpha(colors.primary, 0.1)}`,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    minWidth: '200px',
    [theme.breakpoints.down("sm")]: { 
        minWidth: 'auto',
        padding: '16px'
    }
}));

const StatNumber = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.75rem',
    fontWeight: 700,
    color: colors.primary,
    lineHeight: 1,
}));

const StatLabel = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
}));

const ClientsGrid = styled(Box)(({ theme }) => ({
    padding: '0',
    width: '100%'
}));

const EmptyState = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 32px',
    textAlign: 'center',
    backgroundColor: colors.surface,
    borderRadius: '20px',
    border: `1px solid ${colors.border}`,
    [theme.breakpoints.down("sm")]: { 
        padding: "32px 16px" 
    }
}));

const EmptyStateIcon = styled(Box)(({ theme }) => ({
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: alpha(colors.secondary, 0.1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
}));

export default function Clients() {
    const [clients, setClients] = useState([]);
    const axiosInstance = useAxios();
    const [update, setUpdate] = useState(0);
    const { user } = useAuth();

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axiosInstance.get('/api/clients/organisations');
                setClients(response.data);
            } catch (error) {
                console.error("Error fetching clients:", error);
            }
        };

        fetchClients();
    }, [update]);

    const totalMentees = clients.reduce((sum, client) => sum + (client.menteeCount || 0), 0);

    return (
        <Container>
            {/* Header Section */}
            <HeaderSection>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px'
                }}>
                    <Box sx={{ flex: 1, minWidth: '300px' }}>
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ marginBottom: '16px' }}>
                            <Box sx={{ 
                                padding: '12px', 
                                borderRadius: '12px', 
                                backgroundColor: alpha(colors.primary, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Business sx={{ color: colors.primary, fontSize: '24px' }} />
                            </Box>
                            <Box>
                                <PageTitle>Client Organizations</PageTitle>
                                <PageDescription>
                                    Manage and oversee all client organizations and their mentorship programs
                                </PageDescription>
                            </Box>
                        </Stack>

                        <StatsContainer>
                            <StatCard>
                                <Box sx={{ 
                                    padding: '8px', 
                                    borderRadius: '8px', 
                                    backgroundColor: alpha(colors.primary, 0.1) 
                                }}>
                                    <Business sx={{ color: colors.primary, fontSize: '20px' }} />
                                </Box>
                                <Box>
                                    <StatNumber>{clients.length}</StatNumber>
                                    <StatLabel>Organizations</StatLabel>
                                </Box>
                            </StatCard>
                            
                            <StatCard>
                                <Box sx={{ 
                                    padding: '8px', 
                                    borderRadius: '8px', 
                                    backgroundColor: alpha(colors.success, 0.1) 
                                }}>
                                    <Groups sx={{ color: colors.success, fontSize: '20px' }} />
                                </Box>
                                <Box>
                                    <StatNumber>{totalMentees}</StatNumber>
                                    <StatLabel>Total Mentees</StatLabel>
                                </Box>
                            </StatCard>
                        </StatsContainer>
                    </Box>

                    {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MODERATOR') && (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'flex-start',
                            marginTop: { xs: '16px', md: '0' }
                        }}>
                            <CreateClientOrganisationForm client={null} setUpdate={setUpdate} />
                        </Box>
                    )}
                </Box>
            </HeaderSection>

            {/* Clients Grid */}
            <ClientsGrid>
                {clients.length > 0 ? (
                    <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} style={{maxWidth: '2200px', margin: '0 auto'}}>
                        {clients.map((client, index) => (
                            <Grid key={client.id || client.name} size={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 3 }}>
                                <ClientItem client={client} index={index} setUpdate={setUpdate} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <EmptyState>
                        <EmptyStateIcon>
                            <Business sx={{ fontSize: '32px', color: colors.text.disabled }} />
                        </EmptyStateIcon>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary,
                                marginBottom: '8px'
                            }}
                        >
                            No Client Organizations Yet
                        </Typography>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                color: colors.text.secondary,
                                marginBottom: '24px',
                                maxWidth: '400px'
                            }}
                        >
                            Get started by adding your first client organization to begin managing mentorship programs.
                        </Typography>
                        {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MODERATOR') && (
                            <CreateClientOrganisationForm client={null} setUpdate={setUpdate} />
                        )}
                    </EmptyState>
                )}
            </ClientsGrid>
        </Container>
    );
}

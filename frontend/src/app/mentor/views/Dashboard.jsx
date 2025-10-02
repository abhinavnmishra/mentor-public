import { 
    Box, 
    styled, 
    Typography,
    alpha,
    Paper,
    Stack,
    CircularProgress
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {ProgramItem} from "../components/ProgramItem.jsx";
import CreateProgramForm from "../components/CreateProgramForm.jsx";
import useAuth from "../../hooks/useAuth.js";
import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useEffect, useState} from "react";
import {useAlert} from "../../contexts/AlertContext.jsx";
import {
    Dashboard as DashboardIcon,
    School,
    TrendingUp,
    CheckCircle,
    Schedule,
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
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: colors.background,
    minHeight: '100vh',
    [theme.breakpoints.down("sm")]: {
        padding: "16px" 
    }
}));

const HeaderSection = styled(Paper)(({ theme }) => ({
    padding: '32px',
    borderRadius: '20px',
    border: `1px solid ${colors.border}`,
    width: '100%',
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

const ProgramsGrid = styled(Box)(({ theme }) => ({
    width: '100%',
    padding: '0'
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '64px 32px',
    backgroundColor: colors.surface,
    borderRadius: '20px',
    border: `1px solid ${colors.border}`,
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

export default function Dashboard() {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const { user } = useAuth();
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [update, setUpdate] = useState(0);

    const fetchPrograms = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/api/programs/organisation`);
            setPrograms(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching programs:', error);
            showAlert('Error fetching programs', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrograms();
    }, [update]);

    // Calculate statistics
    const activePrograms = programs.filter(program => program.status === 'ACTIVE').length;
    const completedPrograms = programs.filter(program => program.status === 'COMPLETED').length;
    const totalPrograms = programs.length;

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
                                <DashboardIcon sx={{ color: colors.primary, fontSize: '24px' }} />
                            </Box>
                            <Box>
                                <PageTitle>Dashboard</PageTitle>
                                <PageDescription>
                                    Overview of your mentorship programs and organizational activities
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
                                    <School sx={{ color: colors.primary, fontSize: '20px' }} />
                                </Box>
                                <Box>
                                    <StatNumber>{totalPrograms}</StatNumber>
                                    <StatLabel>Total Programs</StatLabel>
                                </Box>
                            </StatCard>
                            
                            <StatCard>
                                <Box sx={{ 
                                    padding: '8px', 
                                    borderRadius: '8px', 
                                    backgroundColor: alpha(colors.success, 0.1) 
                                }}>
                                    <TrendingUp sx={{ color: colors.success, fontSize: '20px' }} />
                                </Box>
                                <Box>
                                    <StatNumber>{activePrograms}</StatNumber>
                                    <StatLabel>Active Programs</StatLabel>
                                </Box>
                            </StatCard>

                            <StatCard>
                                <Box sx={{ 
                                    padding: '8px', 
                                    borderRadius: '8px', 
                                    backgroundColor: alpha(colors.warning, 0.1) 
                                }}>
                                    <CheckCircle sx={{ color: colors.warning, fontSize: '20px' }} />
                                </Box>
                                <Box>
                                    <StatNumber>{completedPrograms}</StatNumber>
                                    <StatLabel>Completed</StatLabel>
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
                            <CreateProgramForm setUpdate={setUpdate} program={null} />
                        </Box>
                    )}
                </Box>
            </HeaderSection>

            {/* Programs Grid */}
            <ProgramsGrid>
                {loading ? (
                    <LoadingContainer>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <CircularProgress size={24} sx={{ color: colors.primary }} />
                            <Typography
                                sx={{
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.secondary
                                }}
                            >
                                Loading programs...
                            </Typography>
                        </Stack>
                    </LoadingContainer>
                ) : programs.length > 0 ? (
                    <Grid container spacing={3} style={{maxWidth: '2200px', margin: '0 auto'}}>
                        {programs.map((program, index) => (
                            <Grid key={program.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                <ProgramItem program={program} index={index} setUpdate={setUpdate} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <EmptyState>
                        <EmptyStateIcon>
                            <School sx={{ fontSize: '32px', color: colors.text.disabled }} />
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
                            No Programs Yet
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                color: colors.text.secondary,
                                marginBottom: '24px',
                                maxWidth: '400px'
                            }}
                        >
                            Get started by creating your first mentorship program to begin connecting mentors with mentees.
                        </Typography>
                        {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MODERATOR') && (
                            <CreateProgramForm setUpdate={setUpdate} program={null} />
                        )}
                    </EmptyState>
                )}
            </ProgramsGrid>

            {/* Pagination - Commented out but keeping for future use */}
            {/*<Pagination count={10} color="primary" sx={{ mt: 8, mx: 'auto' }} />*/}
        </Container>
    );
}

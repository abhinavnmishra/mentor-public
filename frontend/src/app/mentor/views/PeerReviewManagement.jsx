import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    styled,
    Chip,
    Alert,
    CircularProgress,
    Typography,
    Stack,
    alpha,
    Avatar,
    Tooltip
} from '@mui/material';
import {Add, Notifications, Email, Person, Business, CheckCircle, Schedule, PlayArrow, Group} from '@mui/icons-material';
import {H2} from '../../components/Typography';
import Grid from "@mui/material/Grid2";
import { useAxios } from "../../contexts/AxiosContext.jsx";
import { useAlert } from "../../contexts/AlertContext.jsx";
import LoadingButton from '@mui/lab/LoadingButton';

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

// Styled components
const Container = styled('div')(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: '0',
    padding: '32px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    [theme.breakpoints.down('sm')]: { 
        padding: '16px' 
    }
}));

const MainCard = styled(Card)(({ theme }) => ({
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    maxWidth: '1200px',
    margin: '0 auto',
    [theme.breakpoints.down('md')]: {
        padding: '24px',
        borderRadius: '16px'
    }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        gap: '16px',
        alignItems: 'stretch'
    }
}));

const PageTitle = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '2rem',
    fontWeight: 700,
    color: colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem'
    }
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '12px 24px',
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)',
        transform: 'translateY(-2px)',
    }
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    '& .MuiTable-root': {
        '& .MuiTableHead-root': {
            backgroundColor: alpha(colors.primary, 0.05),
            '& .MuiTableCell-root': {
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: colors.text.primary,
                borderBottom: `1px solid ${colors.border}`,
                padding: '20px 16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }
        },
        '& .MuiTableBody-root': {
            '& .MuiTableRow-root': {
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: alpha(colors.primary, 0.02),
                },
                '& .MuiTableCell-root': {
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontSize: '0.875rem',
                    color: colors.text.primary,
                    borderBottom: `1px solid ${alpha(colors.border, 0.5)}`,
                    padding: '20px 16px'
                }
            }
        }
    }
}));

const StyledChip = styled(Chip)(({ theme, status }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'COMPLETED':
                return {
                    color: colors.success,
                    backgroundColor: alpha(colors.success, 0.1),
                    icon: <CheckCircle sx={{ fontSize: '16px' }} />,
                    label: 'Completed'
                };
            case 'ACTIVE':
                return {
                    color: colors.warning,
                    backgroundColor: alpha(colors.warning, 0.1),
                    icon: <PlayArrow sx={{ fontSize: '16px' }} />,
                    label: 'In Progress'
                };
            case 'PAUSED':
                return {
                    color: colors.error,
                    backgroundColor: alpha(colors.error, 0.1),
                    icon: <Schedule sx={{ fontSize: '16px' }} />,
                    label: 'Not Started'
                };
            default:
                return {
                    color: colors.secondary,
                    backgroundColor: alpha(colors.secondary, 0.1),
                    icon: <Schedule sx={{ fontSize: '16px' }} />,
                    label: 'Unknown'
                };
        }
    };

    const config = getStatusConfig(status);

    return {
        color: config.color,
        backgroundColor: config.backgroundColor,
        border: `1px solid ${alpha(config.color, 0.2)}`,
        borderRadius: '20px',
        padding: '8px 16px',
        fontWeight: 600,
        fontSize: '0.75rem',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        height: '32px',
        '& .MuiChip-label': {
            padding: '0 8px'
        },
        '& .MuiChip-icon': {
            color: config.color,
            marginLeft: '8px'
        }
    };
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '20px',
        padding: '8px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
        border: `1px solid ${colors.border}`
    }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 500,
        color: colors.text.secondary,
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: colors.primary,
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: alpha(colors.background, 0.5),
        transition: 'all 0.3s ease',
        '& fieldset': {
            borderColor: colors.border,
            borderWidth: '1.5px',
        },
        '&:hover': {
            backgroundColor: alpha(colors.background, 0.8),
            '& fieldset': {
                borderColor: colors.borderHover,
            }
        },
        '&.Mui-focused': {
            backgroundColor: colors.surface,
            boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
            '& fieldset': {
                borderColor: colors.primary,
                borderWidth: '2px',
            }
        }
    },
    '& .MuiInputBase-input': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        color: colors.text.primary,
    }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}));

const LoadingCard = styled(Paper)(({ theme }) => ({
    padding: '48px',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
    backgroundColor: colors.surface,
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
    border: `1px solid ${colors.border}`
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
    width: '40px',
    height: '40px',
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
}));

const ActionButton = styled(LoadingButton)(({ theme }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.75rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '8px 16px',
    minWidth: '100px',
    '&.Mui-disabled': {
        backgroundColor: alpha(colors.text.disabled, 0.1),
        color: colors.text.disabled
    }
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
    borderRadius: '12px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '& .MuiAlert-message': {
        fontSize: '0.875rem'
    }
}));

const PeerReviewManagement = () => {
    const { peerReviewId } = useParams();
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [openInviteDialog, setOpenInviteDialog] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [designation, setDesignation] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [peers, setPeers] = useState([]);
    const [inviting, setInviting] = useState(false);
    const [remindingPeer, setRemindingPeer] = useState(null);

    useEffect(() => {
        fetchPeers();
    }, [peerReviewId]);

    const fetchPeers = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/api/surveys/peer/${peerReviewId}`);
            setPeers(data);
        } catch (error) {
            console.error('Error fetching peers:', error);
            showAlert('Failed to fetch peer list', 'error');
        } finally {
            setLoading(false);
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const handleInvite = async () => {
        // Reset error state
        setError('');

        // Validate required fields
        if (!name || !email || !designation) {
            setError('Please fill in all fields');
            return;
        }

        // Validate email format
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setInviting(true);
            const { data } = await axiosInstance.post(`/api/surveys/peer/${peerReviewId}`, {
                name,
                email,
                designation
            });
            setPeers(data);
            setSuccessMessage('Peer invited successfully');
            setOpenInviteDialog(false);
            resetForm();
        } catch (error) {
            console.error('Error inviting peer:', error);
            setError(error.response?.data || 'Failed to invite peer');
        } finally {
            setInviting(false);
        }
    };

    const handleReminder = async (surveyResponseId) => {
        try {
            setRemindingPeer(surveyResponseId);
            await axiosInstance.get(`/api/surveys/peer/remind/${surveyResponseId}`);
            setSuccessMessage('Reminder sent successfully');
        } catch (error) {
            console.error('Error sending reminder:', error);
            showAlert('Failed to send reminder', 'error');
        } finally {
            setRemindingPeer(null);
        }
    };

    const resetForm = () => {
        setName('');
        setEmail('');
        setDesignation('');
        setError('');
    };

    const handleClose = () => {
        setOpenInviteDialog(false);
        resetForm();
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <LoadingContainer>
                <LoadingCard>
                    <CircularProgress size={60} thickness={4} sx={{ color: colors.primary }} />
                    <Typography sx={{ 
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: colors.text.secondary,
                        fontSize: '1rem',
                        fontWeight: 500
                    }}>
                        Loading peer review data...
                    </Typography>
                </LoadingCard>
            </LoadingContainer>
        );
    }

    return (
        <Container>
            <MainCard>
                <HeaderSection>
                    <PageTitle>
                        <Group sx={{ fontSize: '2rem', color: colors.primary }} />
                        Peer Review Management
                    </PageTitle>
                    <StyledButton
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenInviteDialog(true)}
                        sx={{
                            backgroundColor: colors.primary,
                            '&:hover': {
                                backgroundColor: colors.primaryLight,
                            }
                        }}
                    >
                        Invite Peer
                    </StyledButton>
                </HeaderSection>

                {successMessage && (
                    <StyledAlert 
                        severity="success" 
                        sx={{ mb: 3 }} 
                        onClose={() => setSuccessMessage('')}
                    >
                        {successMessage}
                    </StyledAlert>
                )}

                <StyledTableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Peer</TableCell>
                                <TableCell>Contact</TableCell>
                                <TableCell>Designation</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {peers.map((peer) => (
                                <TableRow key={peer.id}>
                                    <TableCell>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <UserAvatar>
                                                {getInitials(peer.respondentName)}
                                            </UserAvatar>
                                            <Box>
                                                <Typography 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        fontSize: '0.875rem',
                                                        color: colors.text.primary,
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                    }}
                                                >
                                                    {peer.respondentName}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography 
                                            sx={{ 
                                                fontSize: '0.875rem',
                                                color: colors.text.secondary,
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                            }}
                                        >
                                            {peer.respondentEmail}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={<Business sx={{ fontSize: '14px' }} />}
                                            label={peer.respondentDesignation}
                                            size="small"
                                            sx={{
                                                backgroundColor: alpha(colors.secondary, 0.1),
                                                color: colors.secondary,
                                                border: `1px solid ${alpha(colors.secondary, 0.2)}`,
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontWeight: 500,
                                                '& .MuiChip-icon': {
                                                    color: colors.secondary
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <StyledChip
                                            icon={peer.status === 'COMPLETED' ? <CheckCircle sx={{ fontSize: '16px' }} /> : 
                                                  peer.status === 'ACTIVE' ? <PlayArrow sx={{ fontSize: '16px' }} /> : 
                                                  <Schedule sx={{ fontSize: '16px' }} />}
                                            label={peer.status === 'COMPLETED' ? 'Completed' : 
                                                   peer.status === 'ACTIVE' ? 'In Progress' : 'Not Started'}
                                            status={peer.status}
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title={peer.status === 'COMPLETED' ? 'Review already completed' : 'Send reminder email'}>
                                            <span>
                                                <ActionButton
                                                    loading={remindingPeer === peer.id}
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => handleReminder(peer.id)}
                                                    disabled={peer.status === 'COMPLETED'}
                                                    startIcon={<Notifications sx={{ fontSize: '16px' }} />}
                                                    sx={{
                                                        borderColor: peer.status === 'COMPLETED' ? colors.text.disabled : colors.primary,
                                                        color: peer.status === 'COMPLETED' ? colors.text.disabled : colors.primary,
                                                        '&:hover': {
                                                            backgroundColor: peer.status === 'COMPLETED' ? 'transparent' : alpha(colors.primary, 0.1),
                                                            borderColor: peer.status === 'COMPLETED' ? colors.text.disabled : colors.primary,
                                                        }
                                                    }}
                                                >
                                                    Remind
                                                </ActionButton>
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            </MainCard>

            <StyledDialog
                open={openInviteDialog}
                onClose={handleClose}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box sx={{ 
                            padding: '8px', 
                            borderRadius: '8px', 
                            backgroundColor: alpha(colors.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Email sx={{ color: colors.primary, fontSize: '20px' }} />
                        </Box>
                        <Typography 
                            variant="h6"
                            sx={{
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary
                            }}
                        >
                            Invite Peer Reviewer
                        </Typography>
                    </Stack>
                </DialogTitle>
                <Divider sx={{ borderColor: colors.border }} />
                <DialogContent sx={{ padding: '24px' }}>
                    <StyledAlert severity="info" sx={{ mb: 3 }}>
                        An email invitation will be sent to the peer with instructions to complete the review form.
                    </StyledAlert>
                    <Stack spacing={3}>
                        <StyledTextField
                            fullWidth
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <Person sx={{ color: colors.text.secondary, mr: 1, fontSize: '20px' }} />
                                )
                            }}
                        />
                        <StyledTextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <Email sx={{ color: colors.text.secondary, mr: 1, fontSize: '20px' }} />
                                )
                            }}
                        />
                        <StyledTextField
                            fullWidth
                            label="Job Title / Designation"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <Business sx={{ color: colors.text.secondary, mr: 1, fontSize: '20px' }} />
                                )
                            }}
                        />
                        {error && (
                            <StyledAlert severity="error">
                                {error}
                            </StyledAlert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px 24px' }}>
                    <Button 
                        onClick={handleClose}
                        sx={{
                            color: colors.text.secondary,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            padding: '10px 20px'
                        }}
                    >
                        Cancel
                    </Button>
                    <LoadingButton 
                        loading={inviting}
                        variant="contained"
                        onClick={handleInvite}
                        startIcon={<Email />}
                        sx={{
                            backgroundColor: colors.primary,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            padding: '10px 20px',
                            '&:hover': {
                                backgroundColor: colors.primaryLight,
                                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)',
                            }
                        }}
                    >
                        Send Invitation
                    </LoadingButton>
                </DialogActions>
            </StyledDialog>
        </Container>
    );
};

export default PeerReviewManagement; 
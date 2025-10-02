import React, { useState, useEffect, useRef } from "react";
import Grid from "@mui/material/Grid2";
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Paper, 
  Typography, 
  IconButton, 
  Alert, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Tooltip,
  useTheme,
  Fade,
  Zoom,
  Chip,
  Badge,
  Card,
  CardContent,
  Collapse,
  AppBar,
  Toolbar,
  Stack,
  LinearProgress,
  Skeleton,
  alpha,
  TextField,
  Menu,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  CircularProgress
} from "@mui/material";
import { styled } from '@mui/material/styles';
import { Editor } from '@tinymce/tinymce-react';
import { useAxios } from '../../contexts/AxiosContext';
import LoadingButton from '@mui/lab/LoadingButton';
import { 
  Add, 
  Save, 
  Publish, 
  Delete,
  Description, 
  ChevronLeft, 
  ChevronRight,
  History,
  CheckCircle,
  Pages,
  KeyboardArrowUp,
  KeyboardArrowDown,
  Visibility,
  Close,
  Article,
  Settings,
  Info,
  Palette,
  Preview,
  GetApp,
  Link,
  Refresh,
  Edit,
  MoreVert,
  CloudUpload,
  PictureAsPdf,
  Assignment,
  FileCopy,
  Schedule,
  Public,
  Lock,
  ExpandMore,
  Gavel,
  AccountBalance,
  Security,
  Business,
  VerifiedUser,
  Dashboard,
  Create,
  Visibility as VisibilityIcon,
  Download,
  Block,
  RestartAlt
} from "@mui/icons-material";
import { useAlert } from '../../contexts/AlertContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Breadcrumb } from "app/components";

const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

// Modern color palette - consistent with ReportView
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
const Container = styled("div")(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    minHeight: '100vh',
    margin: '0px',
    padding: '24px',
    overflow: 'auto',
    [theme.breakpoints.down("sm")]: { 
        padding: "16px" 
    },
    "& .breadcrumb": {
        marginBottom: "32px",
        [theme.breakpoints.down("sm")]: { marginBottom: "24px" }
    }
}));

const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    }
}));

const ActionButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '10px 20px',
    boxShadow: 'none',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: buttonVariant === 'contained' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
        transform: 'translateY(-1px)',
    }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${colors.border}`,
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
    let bgColor, textColor, borderColor;
    
    switch (status) {
        case 'PUBLISHED':
            bgColor = alpha(colors.success, 0.1);
            textColor = colors.success;
            borderColor = alpha(colors.success, 0.2);
            break;
        case 'RETIRED':
            bgColor = alpha(colors.error, 0.1);
            textColor = colors.error;
            borderColor = alpha(colors.error, 0.2);
            break;
        case 'DRAFT':
        default:
            bgColor = alpha(colors.warning, 0.1);
            textColor = colors.warning;
            borderColor = alpha(colors.warning, 0.2);
            break;
    }
    
    return ({
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 600,
        fontSize: '0.75rem',
        height: '28px',
        borderRadius: '14px',
        backgroundColor: bgColor,
        color: textColor,
        border: `1px solid ${borderColor}`,
    });
});

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

const AgreementCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    background: colors.surface,
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    '&:hover': {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        transform: 'translateY(-2px)',
        borderColor: colors.primary,
    }
}));

// Note: Agreement creation/editing is now handled by the separate AgreementEditor view

// Main Contracts View Component
const Contracts = () => {
    const [agreements, setAgreements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
    const [actionTarget, setActionTarget] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', target: null });
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    const axios = useAxios();
    const { showAlert } = useAlert();
    const navigate = useNavigate();

    useEffect(() => {
        fetchAgreements();
    }, []);

    const fetchAgreements = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/agreements');
            setAgreements(response.data || []);
        } catch (error) {
            console.error('Error fetching agreements:', error);
            showAlert('Failed to fetch agreements', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAgreement = () => {
        navigate('/portal/agreements/create');
    };

    const handleEditVersion = (agreement, version) => {
        navigate(`/portal/agreements/${agreement.id}/versions/${version.id}/edit`);
    };

    const handleNewVersion = (agreement) => {
        navigate(`/portal/agreements/${agreement.id}/new-version`);
    };

    // Note: Agreement saving is now handled in the AgreementEditor component

    const handlePublishVersion = async (versionId) => {
        try {
            const publishRequest = {
                versionId: versionId,
                effectiveAt: new Date().toISOString()
            };
            await axios.post(`/api/agreements/versions/${versionId}/publish`, publishRequest);
            showAlert('Version published successfully', 'success');
            await fetchAgreements();
        } catch (error) {
            console.error('Error publishing version:', error);
            showAlert('Failed to publish version', 'error');
        }
    };

    const handleRetireVersion = async (versionId) => {
        try {
            await axios.post(`/api/agreements/versions/${versionId}/retire`);
            showAlert('Version retired successfully', 'success');
            await fetchAgreements();
        } catch (error) {
            console.error('Error retiring version:', error);
            showAlert('Failed to retire version', 'error');
        }
    };

    const handleDownloadPdf = async (versionId) => {
        try {
            const response = await axios.get(`/api/agreements/versions/${versionId}/pdf`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `agreement-v${versionId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            showAlert('PDF downloaded successfully', 'success');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            showAlert('Failed to download PDF', 'error');
        }
    };

    const handleViewPdf = async (versionId) => {
        try {
            const response = await axios.get(`/api/agreements/versions/${versionId}/pdf/view`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            
            setTimeout(() => window.URL.revokeObjectURL(url), 10000);
        } catch (error) {
            console.error('Error viewing PDF:', error);
            showAlert('Failed to view PDF', 'error');
        }
    };

    const handleActionClick = (event, type, target) => {
        if (type === 'publish' || type === 'retire') {
            setConfirmDialog({ open: true, type, target });
        } else if (type === 'download') {
            handleDownloadPdf(target.id);
        } else if (type === 'view') {
            handleViewPdf(target.id);
        } else if (type === 'edit') {
            const agreement = agreements.find(a => 
                a.versions.some(v => v.id === target.id)
            );
            handleEditVersion(agreement, target);
        } else if (type === 'new-version') {
            handleNewVersion(target);
        }
        setActionMenuAnchor(null);
    };

    const filteredAgreements = agreements.filter(agreement => {
        const matchesSearch = agreement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             agreement.description?.toLowerCase().includes(searchQuery.toLowerCase());
        
        if (filterStatus === 'all') return matchesSearch;
        
        const hasStatus = agreement.versions.some(v => v.status === filterStatus);
        return matchesSearch && hasStatus;
    });

    const getAgreementStats = () => {
        const total = agreements.length;
        const published = agreements.filter(a => a.versions.some(v => v.status === 'PUBLISHED')).length;
        const draft = agreements.filter(a => a.versions.some(v => v.status === 'DRAFT')).length;
        const retired = agreements.filter(a => a.versions.some(v => v.status === 'RETIRED')).length;
        
        return { total, published, draft, retired };
    };

    const stats = getAgreementStats();

    return (
        <Container>
            <Box className="breadcrumb" sx={{
                display: 'flex', 
                flexDirection: 'row', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingRight: '24px', 
                color: 'white'
            }}>
                <Breadcrumb routeSegments={[{ 
                    name: (
                        <Typography sx={{ 
                            color: 'white',
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontWeight: 600,
                            fontSize: '1rem'
                        }}>
                            AGREEMENT MANAGEMENT
                        </Typography>
                    ) 
                }]} />
                <Stack direction="row" spacing={1}>
                    <Chip 
                        label={`${stats.total} Total`}
                        size="small"
                        sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)', 
                            color: 'white',
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                    />
                    <Chip 
                        label={`${stats.published} Published`}
                        size="small"
                        sx={{ 
                            bgcolor: 'rgba(16, 185, 129, 0.3)', 
                            color: 'white',
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }}
                    />
                </Stack>
            </Box>

            <Box sx={{ 
                flexGrow: 1, 
                minWidth: '1200px', 
                maxWidth: '2500px', 
                marginInline: 'auto' 
            }}>
                <Grid container spacing={3} sx={{p: 2}}>
                    {/* Header Section */}
                    <Grid size={{ xs: 12 }}>
                        <ModernCard sx={{ padding: '32px', marginBottom: '24px' }}>
                            <SectionHeader>
                                <Box sx={{ 
                                    padding: '12px', 
                                    borderRadius: '12px', 
                                    backgroundColor: alpha(colors.primary, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Gavel sx={{ color: colors.primary, fontSize: '24px' }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography 
                                        variant="h4" 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            fontWeight: 700,
                                            color: colors.text.primary,
                                            fontSize: '1.75rem',
                                            lineHeight: 1.2,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        Clickwrap Agreements
                                    </Typography>
                                    <Typography 
                                        sx={{ 
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            color: colors.text.secondary,
                                            fontSize: '0.875rem'
                                        }}
                                    >
                                        Create and manage legally binding clickwrap agreements with immutable audit trails
                                    </Typography>
                                </Box>
                                
                                <ActionButton
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleCreateAgreement}
                                    sx={{
                                        backgroundColor: colors.primary,
                                        px: 3,
                                        py: 1.5,
                                        '&:hover': {
                                            backgroundColor: colors.primaryLight,
                                            boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)',
                                        }
                                    }}
                                >
                                    Create New Agreement
                                </ActionButton>
                            </SectionHeader>

                            {/* Filters and Search */}
                            <Box sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                gap: 2,
                                mb: 3
                            }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <TextField
                                        size="small"
                                        placeholder="Search agreements..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        sx={{
                                            minWidth: 300,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px',
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            }
                                        }}
                                    />
                                    
                                    <FormControl size="small" sx={{ minWidth: 160 }}>
                                        <Select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                            sx={{
                                                borderRadius: '12px',
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            }}
                                        >
                                            <MenuItem value="all">All Status</MenuItem>
                                            <MenuItem value="DRAFT">Draft</MenuItem>
                                            <MenuItem value="PUBLISHED">Published</MenuItem>
                                            <MenuItem value="RETIRED">Retired</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>

                                {/* Stats Cards */}
                                <Stack direction="row" spacing={2}>
                                    <Card sx={{ px: 2, py: 1, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Dashboard sx={{ color: colors.primary, fontSize: '20px' }} />
                                            <Box>
                                                <Typography variant="h6" sx={{ 
                                                    fontWeight: 700, 
                                                    fontSize: '1.25rem',
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                }}>
                                                    {stats.total}
                                                </Typography>
                                                <Typography variant="caption" sx={{ 
                                                    color: colors.text.secondary,
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                }}>
                                                    Total
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Card>
                                    
                                    <Card sx={{ px: 2, py: 1, borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Public sx={{ color: colors.success, fontSize: '20px' }} />
                                            <Box>
                                                <Typography variant="h6" sx={{ 
                                                    fontWeight: 700, 
                                                    fontSize: '1.25rem',
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                }}>
                                                    {stats.published}
                                                </Typography>
                                                <Typography variant="caption" sx={{ 
                                                    color: colors.text.secondary,
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                }}>
                                                    Published
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Card>
                                </Stack>
                            </Box>
                        </ModernCard>
                    </Grid>

                    {/* Agreements List */}
                    <Grid size={{ xs: 12 }}>
                        {loading ? (
                            <ModernCard sx={{ padding: '32px' }}>
                                <LinearProgress sx={{ mb: 3, borderRadius: '4px', height: '6px' }} />
                                <Stack spacing={2}>
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: '12px' }} />
                                    ))}
                                </Stack>
                            </ModernCard>
                        ) : filteredAgreements.length === 0 ? (
                            <ModernCard sx={{ padding: '64px', textAlign: 'center' }}>
                                <Gavel sx={{ 
                                    fontSize: 64, 
                                    color: alpha(colors.primary, 0.2), 
                                    mb: 3 
                                }} />
                                <Typography 
                                    variant="h5" 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 600,
                                        color: colors.text.primary,
                                        mb: 2
                                    }}
                                >
                                    {searchQuery || filterStatus !== 'all' ? 'No Agreements Match Filters' : 'No Agreements Created'}
                                </Typography>
                                <Typography 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        color: colors.text.secondary,
                                        fontSize: '0.875rem',
                                        mb: 3
                                    }}
                                >
                                    {searchQuery || filterStatus !== 'all' 
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'Create your first clickwrap agreement to get started'
                                    }
                                </Typography>
                                {(!searchQuery && filterStatus === 'all') && (
                                    <ActionButton
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={handleCreateAgreement}
                                        sx={{
                                            backgroundColor: colors.primary,
                                            '&:hover': {
                                                backgroundColor: colors.primaryLight,
                                            }
                                        }}
                                    >
                                        Create First Agreement
                                    </ActionButton>
                                )}
                            </ModernCard>
                        ) : (
                            <Grid container spacing={3}>
                                {filteredAgreements.map((agreement) => (
                                    <Grid key={agreement.id} size={{ xs: 12, md: 6, lg: 4 }}>
                                        <AgreementCard>
                                            <CardContent sx={{ p: 3 }}>
                                                {/* Header */}
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Box sx={{ flex: 1, mr: 1 }}>
                                                        <Typography 
                                                            variant="h6" 
                                                            sx={{
                                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                                fontWeight: 600,
                                                                color: colors.text.primary,
                                                                fontSize: '1.125rem',
                                                                mb: 0.5,
                                                                lineHeight: 1.3
                                                            }}
                                                        >
                                                            {agreement.title}
                                                        </Typography>
                                                        {agreement.description && (
                                                            <Typography 
                                                                sx={{
                                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                                    color: colors.text.secondary,
                                                                    fontSize: '0.875rem',
                                                                    mb: 1
                                                                }}
                                                            >
                                                                {agreement.description}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <IconButton 
                                                        size="small"
                                                        onClick={(e) => {
                                                            setActionMenuAnchor(e.currentTarget);
                                                            setActionTarget(agreement);
                                                        }}
                                                    >
                                                        <MoreVert />
                                                    </IconButton>
                                                </Box>

                                                {/* Versions */}
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography 
                                                        variant="subtitle2" 
                                                        sx={{
                                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                            fontWeight: 600,
                                                            color: colors.text.secondary,
                                                            mb: 1,
                                                            fontSize: '0.75rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.05em'
                                                        }}
                                                    >
                                                        Versions ({agreement.versions?.length || 0})
                                                    </Typography>
                                                    <Stack spacing={1} sx={{ maxHeight: 150, overflowY: 'auto' }}>
                                                        {agreement.versions?.map((version) => (
                                                            <Box 
                                                                key={version.id}
                                                                sx={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'center',
                                                                    p: 1.5,
                                                                    bgcolor: alpha(colors.background, 0.5),
                                                                    borderRadius: '8px',
                                                                    border: `1px solid ${colors.border}`
                                                                }}
                                                            >
                                                                <Box sx={{ flex: 1 }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                                        <Typography 
                                                                            sx={{
                                                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                                                fontWeight: 600,
                                                                                fontSize: '0.875rem'
                                                                            }}
                                                                        >
                                                                            v{version.versionNumber}
                                                                        </Typography>
                                                                        <StatusChip 
                                                                            size="small" 
                                                                            label={version.status} 
                                                                            status={version.status}
                                                                        />
                                                                    </Box>
                                                                    <Typography 
                                                                        sx={{
                                                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                                            color: colors.text.secondary,
                                                                            fontSize: '0.75rem'
                                                                        }}
                                                                    >
                                                                        {new Date(version.createdAt).toLocaleDateString()}
                                                                    </Typography>
                                                                </Box>
                                                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                                    {version.status === 'PUBLISHED' && (
                                                                        <>
                                                                            <Tooltip title="View PDF">
                                                                                <IconButton 
                                                                                    size="small"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleActionClick(e, 'view', version);
                                                                                    }}
                                                                                >
                                                                                    <VisibilityIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                            <Tooltip title="Download PDF">
                                                                                <IconButton 
                                                                                    size="small"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleActionClick(e, 'download', version);
                                                                                    }}
                                                                                >
                                                                                    <Download fontSize="small" />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </>
                                                                    )}
                                                                    {version.status === 'DRAFT' && (
                                                                        <Tooltip title="Edit Version">
                                                                            <IconButton 
                                                                                size="small"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleActionClick(e, 'edit', version);
                                                                                }}
                                                                            >
                                                                                <Edit fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                    <IconButton 
                                                                        size="small"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setActionMenuAnchor(e.currentTarget);
                                                                            setActionTarget(version);
                                                                        }}
                                                                    >
                                                                        <MoreVert fontSize="small" />
                                                                    </IconButton>
                                                                </Box>
                                                            </Box>
                                                        ))}
                                                    </Stack>
                                                </Box>

                                                {/* Actions */}
                                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                    <ActionButton
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() => handleNewVersion(agreement)}
                                                        startIcon={<Add />}
                                                        sx={{
                                                            borderColor: alpha(colors.primary, 0.5),
                                                            color: colors.primary,
                                                            '&:hover': {
                                                                borderColor: colors.primary,
                                                                bgcolor: alpha(colors.primary, 0.05)
                                                            }
                                                        }}
                                                    >
                                                        New Version
                                                    </ActionButton>
                                                </Box>

                                                {/* Footer Info */}
                                                <Box sx={{ 
                                                    mt: 2, 
                                                    pt: 2, 
                                                    borderTop: `1px solid ${colors.border}`,
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <Typography 
                                                        sx={{
                                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                            color: colors.text.secondary,
                                                            fontSize: '0.75rem'
                                                        }}
                                                    >
                                                        Created {new Date(agreement.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                    {agreement.currentPublishedVersion && (
                                                        <Chip 
                                                            size="small"
                                                            label={`Active: v${agreement.currentPublishedVersion.versionNumber}`}
                                                            color="success"
                                                            variant="outlined"
                                                            sx={{
                                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                                fontSize: '0.75rem'
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </AgreementCard>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Box>

            {/* Action Menu */}
            <Menu
                anchorEl={actionMenuAnchor}
                open={Boolean(actionMenuAnchor)}
                onClose={() => setActionMenuAnchor(null)}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                        border: `1px solid ${colors.border}`
                    }
                }}
            >
                {actionTarget?.versions ? (
                    // Agreement menu
                    [
                        <MenuItem key="new-version" onClick={(e) => handleActionClick(e, 'new-version', actionTarget)}>
                            <ListItemIcon><Add fontSize="small" /></ListItemIcon>
                            <ListItemText>Create New Version</ListItemText>
                        </MenuItem>
                    ]
                ) : (
                    // Version menu
                    [
                        ...(actionTarget?.status === 'DRAFT' ? [
                            <MenuItem key="edit" onClick={(e) => handleActionClick(e, 'edit', actionTarget)}>
                                <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                                <ListItemText>Edit Version</ListItemText>
                            </MenuItem>,
                            <MenuItem key="publish" onClick={(e) => handleActionClick(e, 'publish', actionTarget)}>
                                <ListItemIcon><Publish fontSize="small" /></ListItemIcon>
                                <ListItemText>Publish Version</ListItemText>
                            </MenuItem>
                        ] : []),
                        ...(actionTarget?.status === 'PUBLISHED' ? [
                            <MenuItem key="view" onClick={(e) => handleActionClick(e, 'view', actionTarget)}>
                                <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
                                <ListItemText>View PDF</ListItemText>
                            </MenuItem>,
                            <MenuItem key="download" onClick={(e) => handleActionClick(e, 'download', actionTarget)}>
                                <ListItemIcon><Download fontSize="small" /></ListItemIcon>
                                <ListItemText>Download PDF</ListItemText>
                            </MenuItem>,
                            <MenuItem key="retire" onClick={(e) => handleActionClick(e, 'retire', actionTarget)}>
                                <ListItemIcon><Block fontSize="small" /></ListItemIcon>
                                <ListItemText>Retire Version</ListItemText>
                            </MenuItem>
                        ] : [])
                    ]
                )}
            </Menu>

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, type: '', target: null })}
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    }
                }}
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {confirmDialog.type === 'publish' ? (
                            <Publish color="primary" sx={{ mr: 1 }} />
                        ) : (
                            <Block color="error" sx={{ mr: 1 }} />
                        )}
                        <Typography sx={{
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontWeight: 600
                        }}>
                            {confirmDialog.type === 'publish' ? 'Publish Version' : 'Retire Version'}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: '0.875rem',
                        color: colors.text.primary
                    }}>
                        {confirmDialog.type === 'publish' 
                            ? 'Publishing this version will make it available for user acceptance and generate a PDF with immutable hash. This action cannot be undone.'
                            : 'Retiring this version will prevent future acceptances. Existing acceptances will remain valid. This action cannot be undone.'
                        }
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <ActionButton 
                        onClick={() => setConfirmDialog({ open: false, type: '', target: null })}
                        variant="outlined"
                        sx={{ 
                            borderColor: colors.border,
                            color: colors.text.secondary
                        }}
                    >
                        Cancel
                    </ActionButton>
                    <ActionButton 
                        onClick={() => {
                            if (confirmDialog.type === 'publish') {
                                handlePublishVersion(confirmDialog.target.id);
                            } else {
                                handleRetireVersion(confirmDialog.target.id);
                            }
                            setConfirmDialog({ open: false, type: '', target: null });
                        }}
                        variant="contained"
                        sx={{
                            backgroundColor: confirmDialog.type === 'publish' ? colors.primary : colors.error,
                            '&:hover': {
                                backgroundColor: confirmDialog.type === 'publish' ? colors.primaryLight : '#dc2626',
                            }
                        }}
                    >
                        {confirmDialog.type === 'publish' ? 'Publish' : 'Retire'}
                    </ActionButton>
                </DialogActions>
            </Dialog>

            {/* Note: Agreement creation/editing now handled by separate AgreementEditor view */}
        </Container>
    );
};

export default Contracts;

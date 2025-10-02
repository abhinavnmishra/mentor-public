import { 
    Box, 
    styled, 
    Typography,
    alpha,
    Paper,
    Stack,
    CircularProgress,
    Button,
    Chip,
    Card,
    CardContent,
    CardActions,
    Divider,
    IconButton,
    Tooltip,
    Tabs,
    Tab,
    Badge,
    LinearProgress,
    Avatar,
    Fade,
    Zoom,
    Slide,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import { useAxios } from "../../../contexts/AxiosContext.jsx";
import { useAlert } from "../../../contexts/AlertContext.jsx";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    Assignment as AssignmentIcon,
    PeopleAlt as PeopleIcon,
    EmojiEvents as ActivityIcon,
    CalendarToday as CalendarIcon,
    AccessTime as TimeIcon,
    Folder as FolderIcon,
    Description as ReportIcon,
    Visibility as ViewIcon,
    Flag as FlagIcon,
    Task as TaskIcon,
    Timeline as TimelineIcon,
    VideoCall as VideoCallIcon,
    Schedule as ScheduleIcon,
    Person as PersonIcon,
    TrendingUp as TrendingUpIcon,
    CheckCircle as CheckCircleIcon,
    RadioButtonUnchecked as RadioButtonUncheckedIcon,
    PlayArrow as PlayArrowIcon,
    Comment as CommentIcon,
    Close as CloseIcon,
    AttachFile as AttachFileIcon,
    PictureAsPdf as PictureAsPdfIcon,
    InsertDriveFile as InsertDriveFileIcon,
    FileOpen as FileOpenIcon
} from "@mui/icons-material";
import { format } from 'date-fns';
import TaskInstance from '../components/TaskInstance.jsx';

// Modern color palette with enhanced accessibility
const colors = {
    primary: '#3b82f6',
    primaryLight: '#60a5fa',
    primaryDark: '#1d4ed8',
    secondary: '#64748b',
    success: '#059669',
    successLight: '#10b981',
    warning: '#d97706',
    warningLight: '#f59e0b',
    error: '#dc2626',
    errorLight: '#ef4444',
    background: '#f8fafc',
    backgroundSecondary: '#f1f5f9',
    surface: '#ffffff',
    surfaceSecondary: '#f8fafc',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    borderHover: '#cbd5e1',
    text: {
        primary: '#0f172a',
        secondary: '#64748b',
        tertiary: '#94a3b8',
        disabled: '#cbd5e1'
    },
    gradient: {
        primary: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
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

const MilestoneCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    overflow: 'visible',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    }
}));

const MilestoneIconWrapper = styled(Box)(({ theme, milestoneType }) => {
    let bgColor = alpha(colors.primary, 0.1);
    let iconColor = colors.primary;
    
    if (milestoneType === 'PEER_REVIEW') {
        bgColor = alpha(colors.warning, 0.1);
        iconColor = colors.warning;
    } else if (milestoneType === 'ACTIVITY') {
        bgColor = alpha(colors.success, 0.1);
        iconColor = colors.success;
    }
    
    return {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px',
        color: iconColor
    };
});

// Helper function to get status display text
const getStatusDisplayText = (status) => {
    switch(status) {
        case 'ACTIVE':
            return 'IN PROGRESS';
        case 'PAUSED':
            return 'NOT STARTED';
        case 'COMPLETED':
            return 'FINISHED';
        case 'SUSPENDED':
            return 'CANCELLED';
        default:
            return status;
    }
};

const StatusChip = styled(Chip)(({ theme, status }) => {
    let chipColor;
    switch(status) {
        case 'ACTIVE':
            chipColor = colors.primary;
            break;
        case 'COMPLETED':
            chipColor = colors.success;
            break;
        case 'PAUSED':
            chipColor = colors.warning;
            break;
        case 'SUSPENDED':
            chipColor = colors.error;
            break;
        default:
            chipColor = colors.secondary;
    }
    
    return {
        backgroundColor: alpha(chipColor, 0.1),
        color: chipColor,
        fontWeight: 600,
        borderRadius: '8px',
        '& .MuiChip-label': {
            padding: '0 12px'
        }
    };
});

const DateInfoContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '8px',
    [theme.breakpoints.down("sm")]: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px'
    }
}));

const DateInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: colors.text.secondary,
    fontSize: '0.875rem'
}));

const ResourcesSection = styled(Box)(({ theme }) => ({
    marginTop: '16px',
    padding: '12px',
    backgroundColor: alpha(colors.secondary, 0.05),
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
}));

const TrainerNotesButton = styled(Button)(({ theme }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    fontWeight: 600,
    color: colors.primaryDark,
    backgroundColor: alpha(colors.primary, 0.1),
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.2)
    },
    padding: '8px 16px',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
}));

const NotesDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%'
    }
}));

const NotesDialogTitle = styled(DialogTitle)(({ theme }) => ({
    background: colors.gradient.primary,
    color: 'white',
    padding: '24px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.25rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
}));

const NotesContent = styled(DialogContent)(({ theme }) => ({
    padding: '24px',
    backgroundColor: colors.surface,
    '& p': {
        marginBottom: '16px',
        lineHeight: 1.6,
        color: colors.text.primary,
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '1rem'
    }
}));

const FilesSection = styled(Box)(({ theme }) => ({
    marginTop: '16px',
    padding: '16px',
    backgroundColor: alpha(colors.primary, 0.05),
    borderRadius: '12px',
    border: `1px solid ${alpha(colors.primary, 0.1)}`,
}));

const FileItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease-in-out',
    cursor: 'pointer',
    marginBottom: '8px',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.05),
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    '&:last-child': {
        marginBottom: 0
    }
}));

const ActionButton = styled(Button)(({ theme, buttonType }) => {
    let btnColor = colors.primary;
    
    if (buttonType === 'report') {
        btnColor = colors.success;
    } else if (buttonType === 'activity') {
        btnColor = colors.warning;
    }
    
    return {
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 600,
        color: btnColor,
        borderColor: alpha(btnColor, 0.5),
        '&:hover': {
            borderColor: btnColor,
            backgroundColor: alpha(btnColor, 0.05)
        }
    };
});

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '64px 32px',
    backgroundColor: colors.surface,
    borderRadius: '20px',
    border: `1px solid ${colors.border}`,
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
    width: '100%',
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

const ModernTabs = styled(Tabs)(({ theme }) => ({
    backgroundColor: alpha(colors.secondary, 0.05),
    borderRadius: '12px',
    padding: '4px',
    minHeight: 'auto',
    marginBottom: '24px',
    '& .MuiTabs-indicator': {
        display: 'none',
    },
    [theme.breakpoints.down('sm')]: {
        marginBottom: '16px'
    }
}));

const ModernTab = styled(Tab)(({ theme }) => ({
    fontSize: '0.875rem',
    fontWeight: 600,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textTransform: 'none',
    color: colors.text.secondary,
    minHeight: '44px',
    padding: '10px 20px',
    borderRadius: '8px',
    margin: '0 2px',
    transition: 'all 0.2s ease-in-out',
    '&.Mui-selected': {
        color: colors.primary,
        backgroundColor: colors.surface,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    },
    '&:hover': {
        backgroundColor: alpha(colors.secondary, 0.05),
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.75rem',
        padding: '8px 12px',
    }
}));

// New styled components for enhanced UX
const CoachCard = styled(Card)(({ theme }) => ({
    borderRadius: '20px',
    border: `1px solid ${colors.border}`,
    background: colors.gradient.primary,
    color: 'white',
    boxShadow: '0 10px 25px -3px rgba(59, 130, 246, 0.15), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
    overflow: 'hidden',
    position: 'relative',
    '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none'
    }
}));

const ProgressCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    background: colors.surface,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s ease-in-out',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    }
}));

const AnimatedButton = styled(Button)(({ theme, variant: buttonVariant = 'primary' }) => {
    const getButtonColors = () => {
        switch(buttonVariant) {
            case 'success':
                return {
                    bg: colors.success,
                    hover: colors.successLight,
                    text: 'white'
                };
            case 'warning':
                return {
                    bg: colors.warning,
                    hover: colors.warningLight,
                    text: 'white'
                };
            case 'schedule':
                return {
                    bg: colors.gradient.primary,
                    hover: colors.primaryLight,
                    text: 'white'
                };
            default:
                return {
                    bg: colors.primary,
                    hover: colors.primaryLight,
                    text: 'white'
                };
        }
    };

    const buttonColors = getButtonColors();
    
    return {
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: 600,
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '12px 24px',
        background: buttonColors.bg,
        color: buttonColors.text,
        border: 'none',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            background: buttonColors.hover,
            transform: 'translateY(-1px)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        '&:active': {
            transform: 'translateY(0)',
        }
    };
});

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
    height: '8px',
    borderRadius: '4px',
    backgroundColor: alpha(colors.primary, 0.1),
    '& .MuiLinearProgress-bar': {
        borderRadius: '4px',
        background: colors.gradient.primary,
    }
}));

const MetricCard = styled(Box)(({ theme, metricType }) => {
    let bgColor = alpha(colors.primary, 0.1);
    let iconColor = colors.primary;
    
    if (metricType === 'success') {
        bgColor = alpha(colors.success, 0.1);
        iconColor = colors.success;
    } else if (metricType === 'warning') {
        bgColor = alpha(colors.warning, 0.1);
        iconColor = colors.warning;
    } else if (metricType === 'error') {
        bgColor = alpha(colors.error, 0.1);
        iconColor = colors.error;
    }
    
    return {
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: bgColor,
        border: `1px solid ${alpha(iconColor, 0.2)}`,
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            transform: 'scale(1.02)',
            backgroundColor: alpha(iconColor, 0.15),
        }
    };
});

const ProgressSummary = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
    [theme.breakpoints.down('sm')]: {
        flexDirection: 'column',
        gap: '12px',
        marginBottom: '16px'
    }
}));

const SummaryCard = styled(Paper)(({ theme }) => ({
    padding: '20px',
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    }
}));

export default function Milestones() {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const { programId } = useParams();
    const [milestones, setMilestones] = useState([]);
    const [taskInstances, setTaskInstances] = useState([]);
    const [programData, setProgramData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [taskLoading, setTaskLoading] = useState(true);
    const [programLoading, setProgramLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [openNotesDialog, setOpenNotesDialog] = useState(false);
    const [currentNotes, setCurrentNotes] = useState('');
    const [currentMilestoneTitle, setCurrentMilestoneTitle] = useState('');
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

    const fetchMilestones = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/api/client/portal/milestones/${programId}`);
            // Sort by index in descending order
            const sortedData = [...data].sort((a, b) => b.index - a.index);
            setMilestones(sortedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching milestones:', error);
            showAlert('Error fetching milestones', 'error');
            setLoading(false);
        }
    };

    const fetchTaskInstances = async () => {
        try {
            setTaskLoading(true);
            const { data } = await axiosInstance.get(`/api/tasks/instances/${programId}`);
            // Sort by due date, with overdue tasks first
            const sortedData = [...data].sort((a, b) => {
                const dateA = a.taskDto?.dueDate ? new Date(a.taskDto.dueDate) : new Date(9999, 0, 1);
                const dateB = b.taskDto?.dueDate ? new Date(b.taskDto.dueDate) : new Date(9999, 0, 1);
                
                // Show incomplete tasks first, then completed
                if (a.completed !== b.completed) {
                    return a.completed ? 1 : -1;
                }
                
                return dateA - dateB;
            });
            setTaskInstances(sortedData);
            setTaskLoading(false);
        } catch (error) {
            console.error('Error fetching task instances:', error);
            showAlert('Error fetching tasks', 'error');
            setTaskLoading(false);
        }
    };

    const fetchProgramData = async () => {
        try {
            setProgramLoading(true);
            const { data } = await axiosInstance.get(`/api/client/portal/program/${programId}`);
            setProgramData(data);
            setProgramLoading(false);
        } catch (error) {
            console.error('Error fetching program data:', error);
            showAlert('Error fetching program details', 'error');
            setProgramLoading(false);
        }
    };

    useEffect(() => {
        if (programId) {
            fetchMilestones();
            fetchTaskInstances();
            fetchProgramData();
        }
    }, [programId]);

    const getMilestoneTypeIcon = (type) => {
        switch(type) {
            case 'SURVEY':
                return <AssignmentIcon fontSize="medium" />;
            case 'PEER_REVIEW':
                return <PeopleIcon fontSize="medium" />;
            case 'ACTIVITY':
                return <ActivityIcon fontSize="medium" />;
            default:
                return <FlagIcon fontSize="medium" />;
        }
    };

    const getMilestoneTypeLabel = (type) => {
        switch(type) {
            case 'SURVEY':
                return 'Assessment';
            case 'PEER_REVIEW':
                return 'Peer Review';
            case 'ACTIVITY':
                return 'Activity';
            default:
                return 'Milestone';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return format(date, 'MMM dd, yyyy');
    };

    const renderActionButtons = (milestone) => {
        const { type, trackerStatus } = milestone;
        
        if (type === 'SURVEY') {
            if (trackerStatus === 'COMPLETED') {
                return (
                    <AnimatedButton 
                        variant="success"
                        startIcon={<ReportIcon />}
                        disabled={!milestone.reportUrl}
                        onClick={() => window.open(backendBaseUrl + '/public/' + milestone.reportUrl, '_blank')}
                    >
                        {'View Report'}
                    </AnimatedButton>
                );
            } else if (trackerStatus === 'ACTIVE' || trackerStatus === 'PAUSED') {
                return (
                    <AnimatedButton 
                        variant="primary"
                        onClick={() => window.open('/survey/' + milestone.surveyId, '_blank')}
                        startIcon={<PlayArrowIcon />}
                    >
                        Start Assessment
                    </AnimatedButton>
                );
            }
        } else if (type === 'ACTIVITY') {
            if (trackerStatus === 'COMPLETED') {
                return (<>
                    {milestone.reportUrl && <AnimatedButton
                        variant="success"
                        startIcon={<ReportIcon/>}
                        onClick={() => window.open(backendBaseUrl + '/public/' + milestone.reportUrl, '_blank')}
                        sx={{ marginLeft: '8px' }}
                    >
                        View Report
                    </AnimatedButton>}
                </>);
            } else if (trackerStatus === 'ACTIVE' || trackerStatus === 'PAUSED') {
                return (<>
                    {milestone.exerciseResponseId && <AnimatedButton
                        variant="warning"
                        startIcon={<ActivityIcon/>}
                        onClick={() => window.open('/client/exercise/' + milestone.exerciseResponseId, '_blank')}
                    >
                        View Exercise
                    </AnimatedButton>}
                </>);
            }
        } else if (type === 'PEER_REVIEW') {
            if (trackerStatus === 'COMPLETED') {
                return (<>
                    {milestone.reportUrl && <AnimatedButton
                        variant="success"
                        startIcon={<ReportIcon/>}
                        onClick={() => window.open(backendBaseUrl + '/public/' + milestone.reportUrl, '_blank')}
                        sx={{ marginLeft: '8px' }}
                    >
                        View Report
                    </AnimatedButton>}
                </>);
            } else if (trackerStatus === 'ACTIVE' || trackerStatus === 'PAUSED') {
                return (<>
                    {milestone.peerReviewId && <AnimatedButton
                        variant="warning"
                        startIcon={<ActivityIcon/>}
                        onClick={() => window.open('/peer-review/' + milestone.peerReviewId, '_blank')}
                    >
                        Manage Peer Review
                    </AnimatedButton>}
                </>);
            }
        }
        
        return null;
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleTaskAction = (taskInstance, action) => {
        if (action === 'complete-form') {
            // This would need to be implemented based on your form system
            // For now, we'll show an alert
            showAlert('Form completion feature needs to be implemented', 'info');
        }
    };

    const handleScheduleSession = () => {
        if (programData?.calendlyEventTypeUrl) {
            window.open(programData.calendlyEventTypeUrl, '_blank');
        } else {
            showAlert('Scheduling link not available. Please contact your coach.', 'info');
        }
    };
    
    const handleOpenNotesDialog = (notes, title) => {
        setCurrentNotes(notes);
        setCurrentMilestoneTitle(title);
        setOpenNotesDialog(true);
    };
    
    const handleCloseNotesDialog = () => {
        setOpenNotesDialog(false);
    };
    
    const getFileIcon = (contentType) => {
        if (!contentType) return <InsertDriveFileIcon />;
        
        if (contentType.includes('pdf')) {
            return <PictureAsPdfIcon sx={{ color: colors.error }} />;
        } else if (contentType.includes('image')) {
            return <InsertDriveFileIcon sx={{ color: colors.secondary }} />;
        } else if (contentType.includes('word') || contentType.includes('document')) {
            return <InsertDriveFileIcon sx={{ color: colors.primary }} />;
        } else if (contentType.includes('spreadsheet') || contentType.includes('excel')) {
            return <InsertDriveFileIcon sx={{ color: colors.success }} />;
        } else if (contentType.includes('presentation') || contentType.includes('powerpoint')) {
            return <InsertDriveFileIcon sx={{ color: colors.warning }} />;
        }
        
        return <InsertDriveFileIcon sx={{ color: colors.text.secondary }} />;
    };
    
    const handleOpenFile = (file) => {
        if (file && file.entityId) {
            window.open(`${backendBaseUrl}/public/${file.entityId}`, '_blank');
        } else {
            showAlert('Unable to open file', 'error');
        }
    };

    const getProgressStats = () => {
        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter(m => m.trackerStatus === 'COMPLETED').length;
        
        const totalTasks = taskInstances.length;
        const completedTasks = taskInstances.filter(t => t.completed).length;
        const overdueTasks = taskInstances.filter(t => {
            if (t.completed || !t.taskDto?.dueDate) return false;
            return new Date(t.taskDto.dueDate) < new Date();
        }).length;

        return {
            milestones: { total: totalMilestones, completed: completedMilestones },
            tasks: { total: totalTasks, completed: completedTasks, overdue: overdueTasks }
        };
    };

    const stats = getProgressStats();

    return (
        <Container>
            {/* Header Section */}
            <HeaderSection>
                <Fade in={true} timeout={800}>
                    <Box>
                        {/* Program Title and Coach Info */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: '24px',
                            marginBottom: '32px'
                        }}>
                            <Box sx={{ flex: 1, minWidth: '300px' }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ marginBottom: '16px' }}>
                                    <Box sx={{ 
                                        padding: '16px', 
                                        borderRadius: '16px', 
                                        background: colors.gradient.primary,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
                                    }}>
                                        <TrendingUpIcon sx={{ color: 'white', fontSize: '28px' }} />
                                    </Box>
                                    <Box>
                                        <PageTitle>
                                            {programData?.title || 'Program Progress'}
                                        </PageTitle>
                                        <PageDescription>
                                            {programData?.description || 'Track your milestones and complete assigned tasks'}
                                        </PageDescription>
                                    </Box>
                                </Stack>
                            </Box>

                            {/* Coach Card */}
                            {programData?.trainer && !programLoading && (
                                <Zoom in={true} timeout={1000}>
                                    <CoachCard sx={{ minWidth: '280px', maxWidth: '350px' }}>
                                        <CardContent sx={{ padding: '24px' }}>
                                            <Stack direction="row" spacing={2} alignItems="center" sx={{ marginBottom: '16px' }}>
                                                <Avatar 
                                                    sx={{ 
                                                        width: 48, 
                                                        height: 48, 
                                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                                        color: 'white',
                                                        fontSize: '1.2rem',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    {programData.trainer.firstName?.charAt(0)}{programData.trainer.lastName?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" sx={{ 
                                                        color: 'white', 
                                                        fontWeight: 600,
                                                        fontSize: '1.1rem',
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                    }}>
                                                        {programData.trainer.firstName} {programData.trainer.lastName}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ 
                                                        color: 'rgba(255,255,255,0.8)',
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                    }}>
                                                        Your Coach
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            
                                            {programData.calendlyEventTypeUrl && (
                                                <AnimatedButton
                                                    variant="schedule"
                                                    fullWidth
                                                    startIcon={<ScheduleIcon />}
                                                    onClick={handleScheduleSession}
                                                    sx={{ 
                                                        background: 'rgba(255,255,255,0.2)',
                                                        backdropFilter: 'blur(10px)',
                                                        border: '1px solid rgba(255,255,255,0.3)',
                                                        '&:hover': {
                                                            background: 'rgba(255,255,255,0.3)',
                                                            transform: 'translateY(-1px)',
                                                        }
                                                    }}
                                                >
                                                    Schedule Session
                                                </AnimatedButton>
                                            )}
                                        </CardContent>
                                    </CoachCard>
                                </Zoom>
                            )}
                        </Box>
                    </Box>
                </Fade>

                {/* Progress Summary */}
                <Slide direction="up" in={true} timeout={1200}>
                    <ProgressSummary>
                        <MetricCard metricType="primary">
                            <Box sx={{ 
                                padding: '16px', 
                                borderRadius: '12px', 
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                <FlagIcon sx={{ color: colors.primary, fontSize: '24px' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ 
                                    fontWeight: 700, 
                                    color: colors.text.primary,
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    lineHeight: 1.2
                                }}>
                                    {stats.milestones.completed}/{stats.milestones.total}
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    color: colors.text.secondary,
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 500
                                }}>
                                    Milestones Completed
                                </Typography>
                                {stats.milestones.total > 0 && (
                                    <ProgressBar 
                                        variant="determinate" 
                                        value={(stats.milestones.completed / stats.milestones.total) * 100}
                                        sx={{ marginTop: '8px' }}
                                    />
                                )}
                            </Box>
                        </MetricCard>

                        <MetricCard metricType="success">
                            <Box sx={{ 
                                padding: '16px', 
                                borderRadius: '12px', 
                                backgroundColor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                            }}>
                                <CheckCircleIcon sx={{ color: colors.success, fontSize: '24px' }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ 
                                    fontWeight: 700, 
                                    color: colors.text.primary,
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    lineHeight: 1.2
                                }}>
                                    {stats.tasks.completed}/{stats.tasks.total}
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    color: colors.text.secondary,
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 500
                                }}>
                                    Tasks Completed
                                </Typography>
                                {stats.tasks.total > 0 && (
                                    <ProgressBar 
                                        variant="determinate" 
                                        value={(stats.tasks.completed / stats.tasks.total) * 100}
                                        sx={{ 
                                            marginTop: '8px',
                                            '& .MuiLinearProgress-bar': {
                                                background: colors.gradient.success,
                                            }
                                        }}
                                    />
                                )}
                            </Box>
                        </MetricCard>

                        {stats.tasks.overdue > 0 && (
                            <MetricCard metricType="error">
                                <Box sx={{ 
                                    padding: '16px', 
                                    borderRadius: '12px', 
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <CalendarIcon sx={{ color: colors.error, fontSize: '24px' }} />
                                </Box>
                                <Box>
                                    <Typography variant="h4" sx={{ 
                                        fontWeight: 700, 
                                        color: colors.error,
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        lineHeight: 1.2
                                    }}>
                                        {stats.tasks.overdue}
                                    </Typography>
                                    <Typography variant="body1" sx={{ 
                                        color: colors.text.secondary,
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 500
                                    }}>
                                        Overdue Tasks
                                    </Typography>
                                </Box>
                            </MetricCard>
                        )}
                    </ProgressSummary>
                </Slide>

                {/* Tab Navigation */}
                <ModernTabs value={activeTab} onChange={handleTabChange} centered>
                    <ModernTab 
                        icon={<FlagIcon />}
                        iconPosition="start"
                        label="Milestones" 
                    />
                    <ModernTab
                        icon={
                            <Badge badgeContent={stats.tasks.overdue > 0 ? stats.tasks.overdue : null} color="error">
                                <TaskIcon />
                            </Badge>
                        }
                        iconPosition="start"
                        label="Tasks"
                    />
                </ModernTabs>
            </HeaderSection>

            {/* Tab Content */}
            {activeTab === 1 && (
                // Tasks Tab
                taskLoading ? (
                    <LoadingContainer>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <CircularProgress size={24} sx={{ color: colors.primary }} />
                            <Typography
                                sx={{
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.secondary
                                }}
                            >
                                Loading tasks...
                            </Typography>
                        </Stack>
                    </LoadingContainer>
                ) : taskInstances.length > 0 ? (
                    <Grid container spacing={3} style={{margin: '0 auto', width: '100%'}}>
                        {taskInstances.map((taskInstance) => (
                            <Box key={taskInstance.id} sx={{ width: '100%' }}>
                                <TaskInstance 
                                    taskInstance={taskInstance} 
                                    onTaskAction={handleTaskAction}
                                />
                            </Box>
                        ))}
                    </Grid>
                ) : (
                    <EmptyState>
                        <EmptyStateIcon>
                            <TaskIcon sx={{ fontSize: '32px', color: colors.text.disabled }} />
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
                            No Tasks Assigned
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                color: colors.text.secondary,
                                marginBottom: '24px',
                                maxWidth: '400px'
                            }}
                        >
                            You have no tasks assigned for this program yet. Tasks will appear here when they are assigned by your coach.
                        </Typography>
                    </EmptyState>
                )
            )}

            {activeTab === 0 && (
                // Milestones Tab
                loading ? (
                    <LoadingContainer>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <CircularProgress size={24} sx={{ color: colors.primary }} />
                            <Typography
                                sx={{
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.secondary
                                }}
                            >
                                Loading milestones...
                            </Typography>
                        </Stack>
                    </LoadingContainer>
                ) : milestones.length > 0 ? (
                    <Grid container spacing={4} style={{margin: '0 auto', width: '100%'}}>
                        {milestones.map((milestone, index) => (
                            <Fade in={true} timeout={800 + (index * 200)} key={milestone.trackerId}>
                                <ProgressCard sx={{ width: '100%' }}>
                                    <CardContent sx={{ padding: '32px' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: '300px' }}>
                                                <MilestoneIconWrapper milestoneType={milestone.type} sx={{ 
                                                    width: '64px', 
                                                    height: '64px',
                                                    marginRight: '20px'
                                                }}>
                                                    {getMilestoneTypeIcon(milestone.type)}
                                                </MilestoneIconWrapper>
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                                        <Typography variant="h5" sx={{
                                                            fontWeight: 700,
                                                            color: colors.text.primary,
                                                            fontSize: '1.25rem',
                                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                        }}>
                                                            {milestone.title}
                                                        </Typography>
                                                        <StatusChip
                                                            label={getStatusDisplayText(milestone.trackerStatus)}
                                                            size="medium"
                                                            status={milestone.trackerStatus}
                                                        />
                                                    </Box>
                                                    
                                                    <Box sx={{ 
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        backgroundColor: alpha(colors.secondary, 0.1),
                                                        padding: '6px 12px',
                                                        borderRadius: '8px',
                                                        marginBottom: '16px'
                                                    }}>
                                                        <Typography variant="body2" sx={{
                                                            color: colors.text.secondary,
                                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                            fontWeight: 600
                                                        }}>
                                                            {getMilestoneTypeLabel(milestone.type)}
                                                        </Typography>
                                                    </Box>

                                                    {milestone.description && (
                                                        <Typography variant="body1" sx={{
                                                            color: colors.text.secondary,
                                                            marginBottom: '20px',
                                                            lineHeight: 1.6,
                                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                        }}>
                                                            {milestone.description}
                                                        </Typography>
                                                    )}

                                                    <DateInfoContainer>
                                                        <DateInfo>
                                                            <CalendarIcon fontSize="small" sx={{ color: colors.success }} />
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                Start: {formatDate(milestone.startDate)}
                                                            </Typography>
                                                        </DateInfo>
                                                        <DateInfo>
                                                            <TimeIcon fontSize="small" sx={{ color: colors.warning }} />
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                Due: {formatDate(milestone.dueDate)}
                                                            </Typography>
                                                        </DateInfo>
                                                    </DateInfoContainer>
                                                    
                                                    {/* Files Display Section */}
                                                    {milestone.files && milestone.files.length > 0 && (
                                                        <FilesSection>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                                <AttachFileIcon sx={{ color: colors.primary, fontSize: '18px' }} />
                                                                <Typography 
                                                                    sx={{ 
                                                                        fontWeight: 600, 
                                                                        color: colors.text.primary,
                                                                        fontSize: '0.875rem',
                                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                                    }}
                                                                >
                                                                    Resource Files ({milestone.files.length})
                                                                </Typography>
                                                            </Box>
                                                            <Stack spacing={1}>
                                                                {milestone.files.map((file, fileIndex) => (
                                                                    <FileItem 
                                                                        key={fileIndex} 
                                                                        onClick={() => handleOpenFile(file)}
                                                                    >
                                                                        <Box sx={{
                                                                            width: '36px',
                                                                            height: '36px',
                                                                            borderRadius: '8px',
                                                                            backgroundColor: alpha(colors.primary, 0.1),
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                            {getFileIcon(file.contentType)}
                                                                        </Box>
                                                                        <Box sx={{ flex: 1 }}>
                                                                            <Typography 
                                                                                sx={{ 
                                                                                    fontWeight: 600, 
                                                                                    color: colors.text.primary,
                                                                                    fontSize: '0.875rem',
                                                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                                                    marginBottom: '2px'
                                                                                }}
                                                                            >
                                                                                {file.fileName || `File ${fileIndex + 1}`}
                                                                            </Typography>
                                                                            <Typography 
                                                                                sx={{ 
                                                                                    color: colors.text.secondary,
                                                                                    fontSize: '0.75rem',
                                                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                                                                                }}
                                                                            >
                                                                                Click to open
                                                                            </Typography>
                                                                        </Box>
                                                                        <FileOpenIcon sx={{ color: colors.primary, fontSize: '18px' }} />
                                                                    </FileItem>
                                                                ))}
                                                            </Stack>
                                                        </FilesSection>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Action Buttons */}
                                        {(renderActionButtons(milestone) || (milestone.isTrainerNotesVisible && milestone.trainerNotes)) && (
                                            <Box sx={{ 
                                                marginTop: '24px', 
                                                paddingTop: '24px',
                                                borderTop: `1px solid ${colors.borderLight}`,
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                gap: '12px',
                                                flexWrap: 'wrap'
                                            }}>
                                                <Box>
                                                    {milestone.isTrainerNotesVisible && milestone.trainerNotes && (
                                                        <TrainerNotesButton
                                                            onClick={() => handleOpenNotesDialog(milestone.trainerNotes, milestone.title)}
                                                            startIcon={<CommentIcon />}
                                                        >
                                                            View Coach Notes
                                                        </TrainerNotesButton>
                                                    )}
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                    {renderActionButtons(milestone)}
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>
                                </ProgressCard>
                            </Fade>
                        ))}
                    </Grid>
                ) : (
                    <EmptyState>
                        <EmptyStateIcon>
                            <FlagIcon sx={{ fontSize: '32px', color: colors.text.disabled }} />
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
                            No Milestones Available
                        </Typography>
                        <Typography
                            sx={{
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                color: colors.text.secondary,
                                marginBottom: '24px',
                                maxWidth: '400px'
                            }}
                        >
                            There are currently no milestones associated with this program. Check back later for updates.
                        </Typography>
                    </EmptyState>
                )
            )}
            
            {/* Trainer Notes Dialog */}
            <NotesDialog
                open={openNotesDialog}
                onClose={handleCloseNotesDialog}
                aria-labelledby="trainer-notes-dialog-title"
            >
                <NotesDialogTitle id="trainer-notes-dialog-title">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CommentIcon />
                        Coach Notes: {currentMilestoneTitle}
                    </Box>
                    <IconButton
                        edge="end"
                        color="inherit"
                        onClick={handleCloseNotesDialog}
                        aria-label="close"
                        sx={{ color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </NotesDialogTitle>
                <NotesContent dividers>
                    <Typography component="div" dangerouslySetInnerHTML={{ __html: currentNotes }} />
                </NotesContent>
                <DialogActions sx={{ padding: '16px' }}>
                    <Button
                        onClick={handleCloseNotesDialog}
                        variant="contained"
                        sx={{
                            background: colors.gradient.primary,
                            color: 'white',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            padding: '8px 24px'
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </NotesDialog>
        </Container>
    );
}

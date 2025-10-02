import * as React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Collapse,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    Card,
    Typography,
    Stack,
    styled,
    alpha,
    Tooltip,
    Paper,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    KeyboardArrowDown,
    KeyboardArrowUp,
    Insights,
    Edit,
    Person,
    Business,
    Email,
    Assignment,
    CalendarToday,
    CheckCircle,
    Schedule,
    Add,
    TaskAlt,
    Description,
    Download,
    Visibility,
    VisibilityOff,
    Comment,
    Save,
    AutoAwesome
} from '@mui/icons-material';
import {blue, green, orange, pink, purple, red, teal, yellow} from '@mui/material/colors';
import {H3} from '../../components/Typography.jsx';
import CreateClientForm from './CreateClientForm.jsx';
import ViewClientMilestone from './ViewClientMilestone.jsx';
import SendEmailForm from './SendEmailForm.jsx';
import ScheduleSessionForm from './ScheduleSessionForm.jsx';
import {useAxios} from '../../contexts/AxiosContext.jsx';
import {useAlert} from '../../contexts/AlertContext.jsx';
import CircularProgress from '@mui/material/CircularProgress';
import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {fDate} from '../utils/format-time.jsx';
import { Editor } from '@tinymce/tinymce-react';
import LoadingButton from '@mui/lab/LoadingButton';

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

const colors_avatar = [pink[500], green[500], orange[500], yellow[700], blue[500], purple[500], red[500], teal[500]];

const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    transition: 'all 0.2s ease-in-out',
    overflow: 'hidden',
    marginBottom: '120px',
}));

const HeaderSection = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '32px',
    borderBottom: `1px solid ${colors.border}`,
    background: `linear-gradient(135deg, ${alpha(colors.primary, 0.02)} 0%, ${alpha(colors.primaryLight, 0.05)} 100%)`,
}));

const StyledTable = styled(Table)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    '& .MuiTableCell-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        borderBottom: `1px solid ${colors.border}`,
        padding: '16px',
    }
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    backgroundColor: alpha(colors.secondary, 0.03),
    '& .MuiTableCell-root': {
        fontWeight: 600,
        color: colors.text.secondary,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderBottom: `2px solid ${colors.border}`,
    }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.02),
    },
    '& .MuiTableCell-root': {
        borderBottom: `1px solid ${alpha(colors.border, 0.5)}`,
    }
}));

const ExpandableRow = styled(TableRow)(({ theme }) => ({
    '& .MuiTableCell-root': {
        borderBottom: 'none',
        padding: 0,
    }
}));

const CollapseContent = styled(Box)(({ theme }) => ({
    margin: '16px 24px 24px 24px',
    padding: '24px',
    background: colors.surface,
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
}));

const ProgressHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${colors.border}`,
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 500,
    height: '24px',
    borderRadius: '8px',
    ...(status === 'COMPLETED' ? {
        backgroundColor: alpha(colors.success, 0.1),
        color: colors.success,
        border: `1px solid ${alpha(colors.success, 0.2)}`,
    } : {
        backgroundColor: alpha(colors.warning, 0.1),
        color: colors.warning,
        border: `1px solid ${alpha(colors.warning, 0.2)}`,
    })
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.1),
        transform: 'scale(1.05)',
    }
}));

const ExpandButton = styled(IconButton)(({ theme }) => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.15),
        transform: 'scale(1.05)',
    }
}));

const UserInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

const TypeChip = styled(Chip)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 500,
    height: '22px',
    borderRadius: '6px',
    backgroundColor: alpha(colors.secondary, 0.1),
    color: colors.text.secondary,
    textTransform: 'capitalize',
}));

function Row(props) {
    const { row, index, openIndex, setOpenIndex, program, setUpdate } = props;
    const isOpen = index === openIndex;
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [notesDialogOpen, setNotesDialogOpen] = useState(false);

    const getTypeIcon = (type) => {
        switch(type) {
            case 'ACTIVITY': return <Assignment sx={{ fontSize: '14px' }} />;
            case 'SURVEY': return <Edit sx={{ fontSize: '14px' }} />;
            case 'PEER_REVIEW': return <Insights sx={{ fontSize: '14px' }} />;
            default: return <Assignment sx={{ fontSize: '14px' }} />;
        }
    };
    
    const getTaskTypeIcon = (type) => {
        switch(type) {
            case 'FORM': return <Description sx={{ fontSize: '14px' }} />;
            case 'AGREEMENT': return <Description sx={{ fontSize: '14px' }} />;
            default: return <TaskAlt sx={{ fontSize: '14px' }} />;
        }
    };
    
    const fetchTasks = async () => {
        setLoadingTasks(true);
        try {
            const { data } = await axiosInstance.get(`/api/tasks/instances/${program.id}/${row.user.id}`);
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            showAlert('Error fetching tasks for mentee', 'error');
        } finally {
            setLoadingTasks(false);
        }
    };
    
    // Calculate how many tasks have notes
    const tasksWithNotesCount = tasks.filter(task => task.trainerNotes && task.trainerNotes.trim() !== '').length;
    
    const handleViewForm = (resourceInstanceId) => {
        window.open(`/portal/form/view/${resourceInstanceId}`, '_blank');
    };
    
    const handleDownloadAgreement = async (resourceInstanceId) => {
        try {
            const response = await axiosInstance.get(`/api/agreements/user-copies/${resourceInstanceId}/pdf`, {
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `agreement-document.pdf`;
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
    
    const handleOpenNotesDialog = (task) => {
        setSelectedTask(task);
        setNotesDialogOpen(true);
    };
    
    const handleCloseNotesDialog = () => {
        setNotesDialogOpen(false);
        setSelectedTask(null);
    };
    
    const handleSaveNotes = (updatedTask) => {
        // Update the task in the tasks array
        const updatedTasks = tasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
        );
        setTasks(updatedTasks);
    };
    
    useEffect(() => {
        fetchTasks();
    }, [row.userId, program.id]);

    return (
        <React.Fragment>
            <StyledTableRow>
                <TableCell>
                    <UserInfo>
                        <ExpandButton
                            onClick={() => {
                                if(index === openIndex){
                                    setOpenIndex(-1);
                                } else {
                                    setOpenIndex(index);
                                }
                            }}
                        >
                            {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </ExpandButton>
                        <Avatar 
                            sx={{
                                bgcolor: colors_avatar[index%8],
                                width: 40,
                                height: 40,
                                fontSize: '1rem',
                                fontWeight: 600,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            }}
                        >
                            {row.firstName.charAt(0)}
                        </Avatar>
                    </UserInfo>
                </TableCell>
                <TableCell>
                    <Typography 
                        sx={{ 
                            fontWeight: 600,
                            color: colors.text.primary,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}
                    >
                        {row.firstName + ' ' + row.lastName}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Business sx={{ fontSize: '16px', color: colors.text.secondary }} />
                        <Typography 
                            sx={{ 
                                color: colors.text.primary,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            }}
                        >
                            {row.clientOrganisation.name}
                        </Typography>
                    </Box>
                </TableCell>
                <TableCell>
                    <Typography 
                        sx={{ 
                            color: colors.text.primary,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}
                    >
                        {row.designation}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Chip 
                        label={row.gender}
                        size="small"
                        sx={{
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '0.7rem',
                            height: '22px',
                            backgroundColor: alpha(colors.secondary, 0.1),
                            color: colors.text.secondary,
                        }}
                    />
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Email sx={{ fontSize: '16px', color: colors.text.secondary }} />
                        <Typography 
                            sx={{ 
                                color: colors.text.primary,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '0.875rem'
                            }}
                        >
                            {row.email}
                        </Typography>
                    </Box>
                </TableCell>
                <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Send Email">
                            <ActionButton color="primary">
                                <SendEmailForm 
                                    toEmailAddress={row.email} 
                                    direct={true} 
                                    keyword={'email_body_client'} 
                                    id={row.sessionId}
                                />
                            </ActionButton>
                        </Tooltip>
                        <Tooltip title="Schedule Session">
                            <ActionButton color="primary">
                                <ScheduleSessionForm 
                                    client={row}
                                    program={program}
                                    sessionId={row.sessionId}
                                    direct={true}
                                />
                            </ActionButton>
                        </Tooltip>
                        <CreateClientForm program={program} client={row} setUpdate={setUpdate}/>
                    </Stack>
                </TableCell>
            </StyledTableRow>
            <ExpandableRow>
                <TableCell 
                    style={{ 
                        background: alpha(colors.background, 0.5), 
                        padding: '0' 
                    }} 
                    colSpan={7}
                >
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <CollapseContent>
                            {/* Progress Tracking Section */}
                            <ProgressHeader>
                                <Box sx={{ 
                                    padding: '8px', 
                                    borderRadius: '8px', 
                                    backgroundColor: alpha(colors.primary, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <Insights sx={{ color: colors.primary, fontSize: '20px' }} />
                                </Box>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                        fontWeight: 700,
                                        color: colors.text.primary,
                                        fontSize: '1.125rem'
                                    }}
                                >
                                    Progress Tracking
                                </Typography>
                            </ProgressHeader>
                            
                            <StyledTable size="small">
                                <StyledTableHead>
                                    <TableRow>
                                        <TableCell>Milestone</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Start Date</TableCell>
                                        <TableCell>Due Date</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </StyledTableHead>
                                <TableBody>
                                    {row.milestoneStatusList.map((task) => (
                                        <StyledTableRow key={task.title}>
                                            <TableCell>
                                                <Typography 
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        color: colors.text.primary,
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                    }}
                                                >
                                                    {task.title}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {getTypeIcon(task.type)}
                                                    <TypeChip 
                                                        label={task.type.replaceAll('_', ' ')}
                                                        size="small"
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <CalendarToday sx={{ fontSize: '14px', color: colors.text.secondary }} />
                                                    <Typography 
                                                        sx={{ 
                                                            fontSize: '0.8rem',
                                                            color: colors.text.primary,
                                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                        }}
                                                    >
                                                        {task.startDate == null ? 'Not Set' : fDate(task.startDate)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    <CalendarToday sx={{ fontSize: '14px', color: colors.text.secondary }} />
                                                    <Typography 
                                                        sx={{ 
                                                            fontSize: '0.8rem',
                                                            color: colors.text.primary,
                                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                        }}
                                                    >
                                                        {task.dueDate == null ? 'Not Set' : fDate(task.dueDate)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <StatusChip
                                                    icon={task.status === 'COMPLETED' ? <CheckCircle sx={{ fontSize: '14px' }} /> : <Schedule sx={{ fontSize: '14px' }} />}
                                                    label={task.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                                                    status={task.status}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <ViewClientMilestone milestone={task} />
                                            </TableCell>
                                        </StyledTableRow>
                                    ))}
                                </TableBody>
                            </StyledTable>
                            
                            {/* Tasks Section */}
                            <Box sx={{ mt: 4 }}>
                                <ProgressHeader>
                                    <Box sx={{ 
                                        padding: '8px', 
                                        borderRadius: '8px', 
                                        backgroundColor: alpha(colors.secondary, 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <TaskAlt sx={{ color: colors.secondary, fontSize: '20px' }} />
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Typography 
                                            variant="h6" 
                                            sx={{ 
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontWeight: 700,
                                                color: colors.text.primary,
                                                fontSize: '1.125rem'
                                            }}
                                        >
                                            Assigned Tasks
                                        </Typography>
                                        {tasksWithNotesCount > 0 && (
                                            <Chip
                                                label={`${tasksWithNotesCount} ${tasksWithNotesCount === 1 ? 'note' : 'notes'}`}
                                                size="small"
                                                sx={{
                                                    height: '20px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 500,
                                                    backgroundColor: alpha(colors.primary, 0.1),
                                                    color: colors.primary,
                                                    border: `1px solid ${alpha(colors.primary, 0.2)}`,
                                                }}
                                            />
                                        )}
                                    </Box>
                                </ProgressHeader>
                                
                                {loadingTasks ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                        <CircularProgress size={30} sx={{ color: colors.primary }} />
                                    </Box>
                                ) : tasks.length > 0 ? (
                                    <StyledTable size="small">
                                        <StyledTableHead>
                                            <TableRow>
                                                <TableCell>Task</TableCell>
                                                <TableCell>Type</TableCell>
                                                <TableCell>Status</TableCell>
                                                <TableCell align="center">Actions</TableCell>
                                            </TableRow>
                                        </StyledTableHead>
                                        <TableBody>
                                            {tasks.map((task) => (
                                                <StyledTableRow key={task.id}>
                                                    <TableCell>
                                                        <Typography 
                                                            sx={{ 
                                                                fontWeight: 600,
                                                                color: colors.text.primary,
                                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                            }}
                                                        >
                                                            {task.taskDto?.title || 'Untitled Task'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            {getTaskTypeIcon(task.taskType)}
                                                            <TypeChip 
                                                                label={task.taskType || 'Unknown'}
                                                                size="small"
                                                            />
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusChip
                                                            icon={task.completed ? <CheckCircle sx={{ fontSize: '14px' }} /> : <Schedule sx={{ fontSize: '14px' }} />}
                                                            label={task.completed ? 'Completed' : 'Pending'}
                                                            status={task.completed ? 'COMPLETED' : 'PENDING'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Stack direction="row" spacing={1} justifyContent="center">
                                                            <Tooltip title={task.trainerNotes ? "View/Edit Task Notes" : "Add Task Notes"}>
                                                                <ActionButton 
                                                                    color="primary" 
                                                                    onClick={() => handleOpenNotesDialog(task)}
                                                                    sx={{
                                                                        backgroundColor: task.trainerNotes ? alpha(colors.primary, 0.1) : 'transparent',
                                                                        position: 'relative'
                                                                    }}
                                                                >
                                                                    <Comment sx={{ fontSize: '18px' }} />
                                                                    {task.trainerNotes && (
                                                                        <Box 
                                                                            sx={{ 
                                                                                position: 'absolute', 
                                                                                width: '8px', 
                                                                                height: '8px', 
                                                                                borderRadius: '50%', 
                                                                                backgroundColor: task.isTrainerNotesVisible ? colors.success : colors.warning,
                                                                                top: '4px',
                                                                                right: '4px',
                                                                                border: '1px solid #fff'
                                                                            }} 
                                                                        />
                                                                    )}
                                                                </ActionButton>
                                                            </Tooltip>
                                                            {task.taskType === 'FORM' && (
                                                                <Tooltip title="View Form Response">
                                                                    <ActionButton color="primary" onClick={() => handleViewForm(task.resourceInstanceId)}>
                                                                        <Visibility sx={{ fontSize: '18px' }} />
                                                                    </ActionButton>
                                                                </Tooltip>
                                                            )}
                                                            {task.taskType === 'AGREEMENT' && (
                                                                <Tooltip title="Download Agreement">
                                                                    <ActionButton color="primary" onClick={() => handleDownloadAgreement(task.resourceInstanceId)}>
                                                                        <Download sx={{ fontSize: '18px' }} />
                                                                    </ActionButton>
                                                                </Tooltip>
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </StyledTable>
                                ) : (
                                    <Box sx={{ 
                                        py: 4, 
                                        textAlign: 'center', 
                                        backgroundColor: alpha(colors.background, 0.5),
                                        borderRadius: '8px',
                                        border: `1px dashed ${colors.border}`
                                    }}>
                                        <Typography sx={{
                                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                            color: colors.text.secondary,
                                            fontSize: '0.875rem'
                                        }}>
                                            No tasks assigned to this mentee yet
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CollapseContent>
                    </Collapse>
                </TableCell>
            </ExpandableRow>
            
            {/* Task Notes Dialog */}
            {selectedTask && (
                <TaskNotesDialog
                    open={notesDialogOpen}
                    onClose={handleCloseNotesDialog}
                    task={selectedTask}
                    onSave={handleSaveNotes}
                />
            )}
        </React.Fragment>
    );
}

// Task Notes Dialog Component
const TaskNotesDialog = ({ open, onClose, task, onSave }) => {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(false);
    const [enhancingNotes, setEnhancingNotes] = useState(false);
    
    const [formData, setFormData] = useState({
        trainerNotes: task?.trainerNotes || '',
        isTrainerNotesVisible: task?.isTrainerNotesVisible || false
    });

    useEffect(() => {
        setFormData({
            trainerNotes: task?.trainerNotes || '',
            isTrainerNotesVisible: task?.isTrainerNotesVisible || false
        });
    }, [task]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.put(`/api/tasks/instances/notes/${task.id}`, {
                trainerNotes: formData.trainerNotes,
                isTrainerNotesVisible: formData.isTrainerNotesVisible
            });
            
            // Update the task object with new values from the response
            if (response.data) {
                task.trainerNotes = response.data.trainerNotes;
                task.isTrainerNotesVisible = response.data.isTrainerNotesVisible;
            } else {
                // Fallback to local values if response doesn't contain updated data
                task.trainerNotes = formData.trainerNotes;
                task.isTrainerNotesVisible = formData.isTrainerNotesVisible;
            }
            
            showAlert('Notes saved successfully', 'success');
            onSave(task);
            onClose();
        } catch (error) {
            console.error('Error saving notes:', error);
            showAlert('Failed to save notes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAutoAwesomeNotes = async () => {
        if (!task.id) {
            showAlert('Cannot enhance notes for this task', 'error');
            return;
        }

        setEnhancingNotes(true);
        try {
            const response = await axiosInstance.post('/api/ai/completion', {
                keyword: 'trainer_notes_task',
                id: task.id,
                currentText: formData.trainerNotes
            });

            setFormData(prev => ({
                ...prev,
                trainerNotes: response.data
            }));
            showAlert('Notes enhanced successfully', 'success');
        } catch (error) {
            console.error('Error enhancing notes:', error);
            showAlert('Failed to enhance notes', 'error');
        } finally {
            setEnhancingNotes(false);
        }
    };


    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            sx={{
                '& .MuiDialog-paper': {
                    borderRadius: '16px',
                    overflow: 'hidden',
                    height: '80vh'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: `1px solid ${colors.border}`,
                backgroundColor: alpha(colors.background, 0.5),
                padding: '16px 24px'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Comment sx={{ color: colors.primary }} />
                    <Typography variant="h6" sx={{ 
                        fontWeight: 600,
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    }}>
                        Task Notes: {task?.taskDto?.title || 'Untitled Task'}
                    </Typography>
                </Box>
                <FormControlLabel
                    control={
                        <Switch
                            checked={formData.isTrainerNotesVisible}
                            onChange={(e) => setFormData(prev => ({ ...prev, isTrainerNotesVisible: e.target.checked }))}
                            color="primary"
                            size="small"
                        />
                    }
                    label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {formData.isTrainerNotesVisible ?
                                <Visibility sx={{ fontSize: '16px', color: colors.primary }} /> : 
                                <VisibilityOff sx={{ fontSize: '16px', color: colors.text.secondary }} />
                            }
                            <Typography sx={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 500,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            }}>
                                {formData.isTrainerNotesVisible ? 'Visible to client' : 'Hidden from client'}
                            </Typography>
                        </Box>
                    }
                />
            </DialogTitle>
            <DialogContent sx={{ padding: '24px' }}>
                <Box sx={{ position: 'relative', width: '100%', border: `1px solid ${colors.border}`, borderRadius: '12px', overflow: 'hidden' }}>
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        p: 1, 
                        borderBottom: `1px solid ${colors.border}`,
                        backgroundColor: alpha(colors.background, 0.5)
                    }}>
                        <Tooltip title="Enhance with AI">
                            <IconButton
                                size="small"
                                onClick={handleAutoAwesomeNotes}
                                disabled={enhancingNotes}
                            >
                                <AutoAwesome sx={{ fontSize: '20px', color: colors.warning }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Editor
                        tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                        value={formData.trainerNotes}
                        onEditorChange={(content) => {
                            setFormData(prev => ({
                                ...prev,
                                trainerNotes: content
                            }));
                        }}
                        init={{
                            height: 500,
                            menubar: true,
                            plugins: [
                                'lists', 'link', 'image', 'table', 'code', 'fullscreen',
                                'autolink', 'autoresize', 'wordcount'
                            ],
                            toolbar: 'undo redo | formatselect | ' +
                                'bold italic underline strikethrough | ' +
                                'bullist numlist | table link image | ' +
                                'alignleft aligncenter alignright | ' +
                                'removeformat code fullscreen',
                            formats: {
                                h1: { block: 'h1' },
                                h2: { block: 'h2' },
                                h3: { block: 'h3' },
                                p: { block: 'p' }
                            },
                            content_style: 'body { font-family:"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size:14px; line-height: 1.6; padding: 16px; }',
                            branding: false,
                            promotion: false,
                            resize: 'vertical',
                            autoresize_min_height: 650,
                            autoresize_max_height: 1200,
                            statusbar: true,
                            elementpath: false,
                            placeholder: 'Enter your task notes and observations...'
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}` }}>
                <Button 
                    onClick={onClose}
                    sx={{ 
                        color: colors.text.secondary,
                        borderColor: colors.border,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 500,
                        '&:hover': {
                            backgroundColor: alpha(colors.secondary, 0.05),
                            borderColor: colors.borderHover,
                        }
                    }}
                    variant="outlined"
                >
                    Cancel
                </Button>
                <LoadingButton
                    onClick={handleSubmit}
                    variant="contained"
                    startIcon={<Save />}
                    loading={loading}
                    sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        padding: '12px 24px',
                        backgroundColor: colors.success,
                        minWidth: '120px',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            backgroundColor: '#059669',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        }
                    }}
                >
                    Save Notes
                </LoadingButton>
            </DialogActions>
        </Dialog>
    );
};

export default function MenteeTable({program}) {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [openIndex, setOpenIndex] = React.useState(-1);
    const [clients, setClients] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [update, setUpdate] = useState(0);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/api/programs/${program.id}/clients`);
            setClients(data);
        } catch (error) {
            console.error('Error fetching clients:', error);
            showAlert('Error fetching clients', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [update]);

    if (loading) {
        return (
            <LoadingContainer>
                <Stack alignItems="center" spacing={2}>
                    <CircularProgress size="3rem" sx={{ color: colors.primary }} />
                    <Typography 
                        sx={{ 
                            color: colors.text.secondary,
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '0.875rem'
                        }}
                    >
                        Loading mentees...
                    </Typography>
                </Stack>
            </LoadingContainer>
        );
    }

    return (
        <ModernCard>
            <HeaderSection>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Box sx={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        backgroundColor: alpha(colors.primary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Person sx={{ color: colors.primary, fontSize: '24px' }} />
                    </Box>
                    <Box>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 700,
                                color: colors.text.primary,
                                fontSize: '1.5rem',
                                lineHeight: 1.2,
                                marginBottom: '4px'
                            }}
                        >
                            Program Mentees
                        </Typography>
                        <Typography 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                color: colors.text.secondary,
                                fontSize: '0.875rem'
                            }}
                        >
                            Manage and track mentee progress
                        </Typography>
                    </Box>
                </Box>
                <CreateClientForm program={program} client={null} setUpdate={setUpdate}/>
            </HeaderSection>
            
            <Box sx={{ overflow: 'auto' }}>
                <StyledTable sx={{ minWidth: '1000px' }}>
                    <StyledTableHead>
                        <TableRow>
                            <TableCell>Mentee</TableCell>
                            <TableCell>Full Name</TableCell>
                            <TableCell>Organisation</TableCell>
                            <TableCell>Designation</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </StyledTableHead>
                    <TableBody>
                        {clients.map((row, index) => (
                            <Row 
                                key={row.email} 
                                row={row} 
                                index={index} 
                                openIndex={openIndex} 
                                setOpenIndex={setOpenIndex} 
                                program={program} 
                                setUpdate={setUpdate} 
                            />
                        ))}
                    </TableBody>
                </StyledTable>
            </Box>
        </ModernCard>
    );
}

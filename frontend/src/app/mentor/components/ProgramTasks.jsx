import {useAxios} from "../../contexts/AxiosContext.jsx";
import {useAlert} from "../../contexts/AlertContext.jsx";
import useAuth from "../../hooks/useAuth";
import * as React from "react";
import {useEffect, useState} from "react";
import {
    Box, 
    Stack, 
    styled, 
    Typography, 
    Card,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Chip,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    alpha,
    Fade
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Assignment,
    Description,
    AccountBalance,
    CalendarToday,
    CheckCircle,
    RadioButtonUnchecked,
    Close as CloseIcon
} from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

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

const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    overflow: 'hidden',
    transition: 'all 0.2s ease-in-out',
}));

const HeaderSection = styled(Box)(({ theme }) => ({
    padding: '24px',
    borderBottom: `1px solid ${colors.border}`,
    background: `linear-gradient(135deg, ${alpha(colors.primary, 0.05)} 0%, ${alpha(colors.primaryLight, 0.02)} 100%)`,
}));

const StyledTable = styled(Table)(({ theme }) => ({
    '& .MuiTableCell-root': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        borderBottom: `1px solid ${colors.border}`,
    }
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    '& .MuiTableCell-head': {
        backgroundColor: alpha(colors.secondary, 0.03),
        fontWeight: 600,
        fontSize: '0.875rem',
        color: colors.text.primary,
        padding: '16px',
        borderBottom: `2px solid ${colors.border}`,
    }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.02),
    },
    '& .MuiTableCell-root': {
        padding: '16px',
        fontSize: '0.875rem',
    }
}));

const ActionButton = styled(IconButton)(({ theme, variant = 'primary' }) => {
    const getVariantStyles = () => {
        switch (variant) {
            case 'edit':
                return {
                    color: colors.warning,
                    backgroundColor: alpha(colors.warning, 0.1),
                    '&:hover': {
                        backgroundColor: alpha(colors.warning, 0.2),
                    }
                };
            case 'delete':
                return {
                    color: colors.error,
                    backgroundColor: alpha(colors.error, 0.1),
                    '&:hover': {
                        backgroundColor: alpha(colors.error, 0.2),
                    }
                };
            default:
                return {
                    color: colors.primary,
                    backgroundColor: alpha(colors.primary, 0.1),
                    '&:hover': {
                        backgroundColor: alpha(colors.primary, 0.2),
                    }
                };
        }
    };

    return {
        ...getVariantStyles(),
        borderRadius: '8px',
        padding: '8px',
        transition: 'all 0.2s ease-in-out',
        '& .MuiSvgIcon-root': {
            fontSize: '18px',
        }
    };
});

const LoadingContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '300px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

const TypeChip = styled(Chip)(({ theme, tasktype }) => {
    const getTypeColor = () => {
        switch (tasktype) {
            case 'AGREEMENT':
                return {
                    backgroundColor: alpha(colors.primary, 0.1),
                    color: colors.primary,
                    border: `1px solid ${alpha(colors.primary, 0.2)}`,
                };
            case 'FORM':
                return {
                    backgroundColor: alpha(colors.success, 0.1),
                    color: colors.success,
                    border: `1px solid ${alpha(colors.success, 0.2)}`,
                };
            default:
                return {
                    backgroundColor: alpha(colors.secondary, 0.1),
                    color: colors.secondary,
                    border: `1px solid ${alpha(colors.secondary, 0.2)}`,
                };
        }
    };

    return {
        ...getTypeColor(),
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.75rem',
        fontWeight: 500,
        height: '24px',
        borderRadius: '6px',
        '& .MuiChip-icon': {
            fontSize: '14px',
            marginLeft: '4px',
        }
    };
});

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '16px',
        padding: 0,
        minWidth: '500px',
        maxWidth: '600px',
        [theme.breakpoints.down('sm')]: {
            minWidth: 'auto',
            margin: '16px',
            width: 'calc(100% - 32px)',
        }
    }
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
    padding: '24px 24px 0 24px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 600,
    color: colors.text.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
}));

const StyledButton = styled(Button)(({ theme, variant: buttonVariant = 'primary' }) => {
    const getVariantStyles = () => {
        switch (buttonVariant) {
            case 'secondary':
                return {
                    backgroundColor: alpha(colors.secondary, 0.1),
                    color: colors.secondary,
                    '&:hover': {
                        backgroundColor: alpha(colors.secondary, 0.2),
                    }
                };
            default:
                return {
                    backgroundColor: colors.primary,
                    color: '#ffffff',
                    '&:hover': {
                        backgroundColor: colors.primaryLight,
                    }
                };
        }
    };

    return {
        ...getVariantStyles(),
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 500,
        borderRadius: '8px',
        textTransform: 'none',
        padding: '10px 20px',
        boxShadow: 'none',
        '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }
    };
});

// Task Form Dialog Component
function TaskFormDialog({ open, onClose, onSubmit, task, programId, loading = false }) {
    const { user } = useAuth();
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [agreements, setAgreements] = useState([]);
    const [forms, setForms] = useState([]);
    const [loadingAgreements, setLoadingAgreements] = useState(false);
    const [loadingForms, setLoadingForms] = useState(false);
    const isEditMode = !!task;
    
    const [formData, setFormData] = useState({
        title: task?.title || '',
        instructions: task?.instructions || '',
        taskType: task?.taskType || 'FORM',
        dueDate: task?.dueDate ? dayjs(task.dueDate) : null,
        resourceId: task?.resourceId || ''
    });
    
    const [errors, setErrors] = useState({});

    // Fetch agreements when task type is AGREEMENT
    useEffect(() => {
        setFormData({
            title: task?.title || '',
            instructions: task?.instructions || '',
            taskType: task?.taskType || 'FORM',
            dueDate: task?.dueDate ? dayjs(task.dueDate) : null,
            resourceId: task?.resourceId || ''
        });
    }, [task]);

    // Fetch resources based on task type
    useEffect(() => {
        if (!open) return;

        if (formData.taskType === 'AGREEMENT') {
            fetchAgreements();
        } else if (formData.taskType === 'FORM') {
            fetchForms();
        }
    }, [formData.taskType, open]);

    const fetchAgreements = async () => {
        try {
            setLoadingAgreements(true);
            const { data } = await axiosInstance.get('/api/agreements');
            setAgreements(data);
        } catch (error) {
            console.error('Error fetching agreements:', error);
            showAlert('Error fetching agreements', 'error');
        } finally {
            setLoadingAgreements(false);
        }
    };

    const fetchForms = async () => {
        try {
            setLoadingForms(true);
            const { data } = await axiosInstance.get(`/api/forms/organisation/${user.organisationId}`);
            setForms(data);
        } catch (error) {
            console.error('Error fetching forms:', error);
            showAlert('Error fetching forms', 'error');
        } finally {
            setLoadingForms(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.instructions.trim()) {
            newErrors.instructions = 'Instructions are required';
        }
        if (!formData.taskType) {
            newErrors.taskType = 'Task type is required';
        }
        if (formData.taskType === 'AGREEMENT' && !formData.resourceId) {
            newErrors.resourceId = 'Please select an agreement';
        }
        if (formData.taskType === 'FORM' && !formData.resourceId) {
            newErrors.resourceId = 'Please select a form';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        const submitData = {
            ...formData,
            id: task?.id || null,
            coachingProgramId: programId,
            dueDate: formData.dueDate ? formData.dueDate.format('YYYY-MM-DD') : null,
            resourceId: formData.resourceId
        };

        onSubmit(submitData);
    };

    const handleClose = () => {
        setFormData({
            title: '',
            instructions: '',
            taskType: 'FORM',
            dueDate: null,
            resourceId: ''
        });
        setErrors({});
        onClose();
    };

    const getPublishedAgreements = () => {
        return agreements.filter(agreement => 
            agreement.currentPublishedVersion !== null
        );
    };

    const getVisibleForms = () => {
        return forms.filter(form => form.isVisible);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitleStyled>
                    {isEditMode ? 'Edit Task' : 'Create New Task'}
                    <IconButton onClick={handleClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitleStyled>
                
                <DialogContent sx={{ padding: '24px', paddingTop: '16px' }}>
                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            error={!!errors.title}
                            helperText={errors.title}
                            variant="outlined"
                        />
                        
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Instructions"
                            value={formData.instructions}
                            onChange={(e) => handleInputChange('instructions', e.target.value)}
                            error={!!errors.instructions}
                            helperText={errors.instructions}
                            variant="outlined"
                        />
                        
                        <FormControl fullWidth error={!!errors.taskType}>
                            <InputLabel>Task Type</InputLabel>
                            <Select
                                value={formData.taskType}
                                label="Task Type"
                                onChange={(e) => handleInputChange('taskType', e.target.value)}
                            >
                                <MenuItem value="FORM">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Description fontSize="small" />
                                        Form
                                    </Box>
                                </MenuItem>
                                <MenuItem value="AGREEMENT">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccountBalance fontSize="small" />
                                        Agreement
                                    </Box>
                                </MenuItem>
                            </Select>
                            {errors.taskType && <FormHelperText>{errors.taskType}</FormHelperText>}
                        </FormControl>

                        {(formData.taskType === 'AGREEMENT' || formData.taskType === 'FORM') && (
                            <FormControl fullWidth error={!!errors.resourceId}>
                                <InputLabel>
                                    {formData.taskType === 'AGREEMENT' ? 'Select Agreement' : 'Select Form'}
                                </InputLabel>
                                <Select
                                    value={formData.resourceId}
                                    label={formData.taskType === 'AGREEMENT' ? 'Select Agreement' : 'Select Form'}
                                    onChange={(e) => handleInputChange('resourceId', e.target.value)}
                                    disabled={formData.taskType === 'AGREEMENT' ? loadingAgreements : loadingForms}
                                >
                                    {formData.taskType === 'AGREEMENT' ? (
                                        // Agreement options
                                        loadingAgreements ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Loading agreements...
                                            </MenuItem>
                                        ) : getPublishedAgreements().length === 0 ? (
                                            <MenuItem disabled>No published agreements available</MenuItem>
                                        ) : (
                                            getPublishedAgreements().map((agreement) => (
                                                <MenuItem 
                                                    key={agreement.currentPublishedVersion.id} 
                                                    value={agreement.currentPublishedVersion.id}
                                                >
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {agreement.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Version {agreement.currentPublishedVersion.version} • 
                                                            Published {new Date(agreement.currentPublishedVersion.publishedAt).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>
                                            ))
                                        )
                                    ) : (
                                        // Form options
                                        loadingForms ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                                Loading forms...
                                            </MenuItem>
                                        ) : getVisibleForms().length === 0 ? (
                                            <MenuItem disabled>No published forms available</MenuItem>
                                        ) : (
                                            getVisibleForms().map((form) => (
                                                <MenuItem 
                                                    key={form.id} 
                                                    value={form.id}
                                                >
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {form.title}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Created {new Date(form.createdAt).toLocaleDateString()} • 
                                                            {form.pages?.length || 0} pages
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>
                                            ))
                                        )
                                    )}
                                </Select>
                                {errors.resourceId && <FormHelperText>{errors.resourceId}</FormHelperText>}
                            </FormControl>
                        )}
                        
                        <DatePicker
                            label="Due Date"
                            value={formData.dueDate}
                            onChange={(value) => handleInputChange('dueDate', value)}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            minDate={dayjs()}
                        />
                    </Stack>
                </DialogContent>
                
                <DialogActions sx={{ padding: '16px 24px 24px 24px' }}>
                    <StyledButton 
                        buttonVariant="secondary" 
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancel
                    </StyledButton>
                    <StyledButton 
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={loading && <CircularProgress size={16} />}
                    >
                        {loading ? 'Saving...' : (isEditMode ? 'Update Task' : 'Create Task')}
                    </StyledButton>
                </DialogActions>
            </StyledDialog>
        </LocalizationProvider>
    );
}

export default function ProgramTasks({program}) {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(`/api/tasks/program/${program.id}`);
            setTasks(data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            showAlert('Error fetching tasks', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [program.id]);

    const handleCreateTask = () => {
        setEditingTask(null);
        setDialogOpen(true);
    };

    const handleEditTask = (task) => {
        setEditingTask(task);
        setDialogOpen(true);
    };

    const handleTaskSubmit = async (taskData) => {
        try {
            setSubmitting(true);
            
            if (editingTask) {
                await axiosInstance.put('/api/tasks', taskData);
                showAlert('Task updated successfully', 'success');
            } else {
                await axiosInstance.post('/api/tasks', taskData);
                showAlert('Task created successfully', 'success');
            }
            
            setDialogOpen(false);
            fetchTasks();
        } catch (error) {
            console.error('Error saving task:', error);
            showAlert('Error saving task: ' + (error?.response?.data?.message || error.message), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getTaskIcon = (taskType) => {
        switch (taskType) {
            case 'AGREEMENT':
                return <AccountBalance fontSize="small" />;
            case 'FORM':
                return <Description fontSize="small" />;
            default:
                return <Assignment fontSize="small" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

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
                        Loading tasks...
                    </Typography>
                </Stack>
            </LoadingContainer>
        );
    }

    return (
        <>
            <ModernCard>
                <HeaderSection>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 700,
                                    color: colors.text.primary,
                                    fontSize: '1.5rem',
                                    marginBottom: '8px'
                                }}
                            >
                                Program Tasks
                            </Typography>
                            <Typography 
                                sx={{ 
                                    color: colors.text.secondary,
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '0.875rem'
                                }}
                            >
                                Manage tasks and assignments for this coaching program
                            </Typography>
                        </Box>
                        <StyledButton
                            onClick={handleCreateTask}
                            startIcon={<Add />}
                        >
                            Create Task
                        </StyledButton>
                    </Box>
                </HeaderSection>

                {tasks.length === 0 ? (
                    <Box sx={{ padding: '48px 24px', textAlign: 'center' }}>
                        <Assignment sx={{ fontSize: '64px', color: colors.text.disabled, marginBottom: '16px' }} />
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: colors.text.primary,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                marginBottom: '8px'
                            }}
                        >
                            No tasks yet
                        </Typography>
                        <Typography 
                            sx={{ 
                                color: colors.text.secondary,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '0.875rem',
                                marginBottom: '24px'
                            }}
                        >
                            Create your first task to get started with program assignments.
                        </Typography>
                        <StyledButton
                            onClick={handleCreateTask}
                            startIcon={<Add />}
                        >
                            Create First Task
                        </StyledButton>
                    </Box>
                ) : (
                    <Box sx={{ overflow: 'auto' }}>
                        <StyledTable>
                            <StyledTableHead>
                                <TableRow>
                                    <TableCell>Title</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Instructions</TableCell>
                                    <TableCell>Due Date</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </StyledTableHead>
                            <TableBody>
                                {tasks.map((task) => (
                                    <StyledTableRow key={task.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                {getTaskIcon(task.taskType)}
                                                <Typography 
                                                    sx={{ 
                                                        fontWeight: 500,
                                                        color: colors.text.primary,
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                    }}
                                                >
                                                    {task.title}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <TypeChip 
                                                tasktype={task.taskType}
                                                icon={getTaskIcon(task.taskType)}
                                                label={task.taskType === 'AGREEMENT' ? 'Agreement' : 'Form'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography 
                                                sx={{ 
                                                    color: colors.text.secondary,
                                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                    fontSize: '0.875rem',
                                                    maxWidth: '300px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                                title={task.instructions}
                                            >
                                                {task.instructions}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <CalendarToday sx={{ fontSize: '16px', color: colors.text.secondary }} />
                                                <Typography 
                                                    sx={{ 
                                                        color: colors.text.primary,
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                        fontSize: '0.875rem'
                                                    }}
                                                >
                                                    {formatDate(task.dueDate)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Edit Task" TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                                                    <ActionButton 
                                                        variant="edit" 
                                                        onClick={() => handleEditTask(task)}
                                                    >
                                                        <Edit />
                                                    </ActionButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </StyledTable>
                    </Box>
                )}
            </ModernCard>

            <TaskFormDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleTaskSubmit}
                task={editingTask}
                programId={program.id}
                loading={submitting}
            />
        </>
    );
}
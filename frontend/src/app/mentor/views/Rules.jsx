import { useAxios } from "../../contexts/AxiosContext.jsx";
import { useAlert } from "../../contexts/AlertContext.jsx";
import useAuth from "../../hooks/useAuth";
import * as React from "react";
import { useEffect, useState } from "react";
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
    Switch,
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
    Fade,
    CircularProgress,
    Paper,
    Divider,
    Grid,
    Chip,
    useTheme,
    InputAdornment
} from "@mui/material";
import {
    Add,
    Edit,
    Delete,
    Assignment,
    Description,
    AccountBalance,
    Settings,
    CheckCircle,
    RadioButtonUnchecked,
    Close as CloseIcon,
    Search as SearchIcon,
    AutoAwesome as AutoAwesomeIcon,
    FilterList as FilterListIcon,
    ToggleOn as ToggleOnIcon,
    ToggleOff as ToggleOffIcon,
    Info as InfoIcon,
    Tune as TuneIcon
} from "@mui/icons-material";

// Modern color palette consistent with other components
const colors = {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    primaryDark: '#1e40af',
    secondary: '#64748b',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    background: '#f8fafc',
    backgroundAlt: '#f1f5f9',
    surface: '#ffffff',
    border: '#e2e8f0',
    borderHover: '#cbd5e1',
    text: {
        primary: '#1e293b',
        secondary: '#64748b',
        disabled: '#94a3b8'
    }
};

const Container = styled(Box)(({ theme }) => ({
    padding: '24px',
    maxWidth: '1600px',
    margin: '0 auto',
    [theme.breakpoints.down('sm')]: {
        padding: '16px',
    },
}));

const PageHeader = styled(Box)(({ theme }) => ({
    marginBottom: '24px',
}));

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

const EntityChip = styled(Chip)(({ theme, entityType }) => {
    const getTypeColor = () => {
        switch (entityType) {
            case 'AGREEMENT':
                return {
                    backgroundColor: alpha(colors.primary, 0.1),
                    color: colors.primary,
                    borderColor: alpha(colors.primary, 0.3),
                };
            case 'FORM':
                return {
                    backgroundColor: alpha(colors.success, 0.1),
                    color: colors.success,
                    borderColor: alpha(colors.success, 0.3),
                };
            default:
                return {
                    backgroundColor: alpha(colors.secondary, 0.1),
                    color: colors.secondary,
                    borderColor: alpha(colors.secondary, 0.3),
                };
        }
    };

    return {
        ...getTypeColor(),
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 500,
        height: '28px',
        '& .MuiChip-icon': {
            color: 'inherit',
        },
        '& .MuiChip-label': {
            paddingLeft: entityType ? '6px' : '12px',
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

const StyledButton = styled(Button)(({ theme, variant: buttonVariant = 'primary', size = 'medium' }) => {
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
            case 'outlined':
                return {
                    backgroundColor: 'transparent',
                    color: colors.primary,
                    border: `1px solid ${alpha(colors.primary, 0.5)}`,
                    '&:hover': {
                        backgroundColor: alpha(colors.primary, 0.05),
                        border: `1px solid ${colors.primary}`,
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

    const getSizeStyles = () => {
        switch (size) {
            case 'small':
                return {
                    padding: '6px 16px',
                    fontSize: '0.8125rem',
                };
            case 'large':
                return {
                    padding: '12px 24px',
                    fontSize: '1rem',
                };
            default:
                return {
                    padding: '10px 20px',
                    fontSize: '0.875rem',
                };
        }
    };

    return {
        ...getVariantStyles(),
        ...getSizeStyles(),
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 500,
        borderRadius: '8px',
        textTransform: 'none',
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }
    };
});

const RuleCard = styled(Card)(({ theme }) => ({
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        borderColor: colors.borderHover,
    },
}));

const StatusBadge = styled(Box)(({ theme, enabled }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    backgroundColor: enabled ? alpha(colors.success, 0.1) : alpha(colors.secondary, 0.1),
    color: enabled ? colors.success : colors.secondary,
    border: `1px solid ${enabled ? alpha(colors.success, 0.3) : alpha(colors.secondary, 0.3)}`,
}));

const SearchField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: colors.surface,
        transition: 'all 0.2s',
        '&:hover': {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        },
        '&.Mui-focused': {
            boxShadow: `0 0 0 2px ${alpha(colors.primary, 0.2)}`,
        },
    },
}));

// Rule Form Dialog Component
function RuleFormDialog({ open, onClose, onSubmit, rule, loading = false }) {
    const { user } = useAuth();
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [agreements, setAgreements] = useState([]);
    const [forms, setForms] = useState([]);
    const [loadingAgreements, setLoadingAgreements] = useState(false);
    const [loadingForms, setLoadingForms] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    
    const isEditMode = !!rule;
    
    const [formData, setFormData] = useState({
        id: rule?.id || null,
        ruleTemplateId: rule?.ruleTemplate?.id || '',
        enabled: rule?.enabled !== undefined ? rule?.enabled : true, // Default to true for new rules
        entityId: rule?.entityId || ''
    });
    
    const [errors, setErrors] = useState({});

    // Reset form data when rule changes
    useEffect(() => {
        if (rule) {
            setFormData({
                id: rule.id || null,
                ruleTemplateId: rule.ruleTemplate?.id || '',
                enabled: rule.enabled !== undefined ? rule.enabled : true,
                entityId: rule.entityId || ''
            });
            setSelectedTemplate(rule.ruleTemplate || null);
        } else {
            setFormData({
                id: null,
                ruleTemplateId: '',
                enabled: true, // Default to true for new rules
                entityId: ''
            });
            setSelectedTemplate(null);
        }
    }, [rule]);

    // Fetch resources based on selected template's entity type
    useEffect(() => {
        if (!open || !selectedTemplate) return;

        if (selectedTemplate.entityType === 'AGREEMENT') {
            fetchAgreements();
        } else if (selectedTemplate.entityType === 'FORM') {
            fetchForms();
        }
    }, [selectedTemplate, open]);

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

    const handleTemplateChange = (templateId) => {
        const template = templates.find(t => t.id === templateId);
        setSelectedTemplate(template);
        setFormData(prev => ({
            ...prev,
            ruleTemplateId: templateId,
            entityId: '' // Reset entity when template changes
        }));
        
        // Clear errors
        if (errors.ruleTemplateId) {
            setErrors(prev => ({
                ...prev,
                ruleTemplateId: ''
            }));
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
        
        if (!formData.ruleTemplateId) {
            newErrors.ruleTemplateId = 'Rule template is required';
        }
        
        if (selectedTemplate && !formData.entityId) {
            newErrors.entityId = `Please select a ${selectedTemplate.entityType.toLowerCase()}`;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }

        // Get the entity display name based on the selected entity
        let entityDisplayName = '';
        if (formData.entityId && selectedTemplate) {
            if (selectedTemplate.entityType === 'AGREEMENT') {
                const agreement = agreements.find(a => a.currentPublishedVersion && a.currentPublishedVersion.id === formData.entityId);
                if (agreement) {
                    entityDisplayName = agreement.title;
                }
            } else if (selectedTemplate.entityType === 'FORM') {
                const form = forms.find(f => f.id === formData.entityId);
                if (form) {
                    entityDisplayName = form.title;
                }
            }
        }
        
        // Add entityDisplayName to the request
        const submitData = {
            ...formData,
            entityDisplayName
        };

        onSubmit(submitData);
    };

    const handleClose = () => {
        setFormData({
                id: null,
                ruleTemplateId: '',
                enabled: true, // Default to true for new rules
                entityId: ''
        });
        setSelectedTemplate(null);
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

    // Get templates from parent component
    const { templates = [] } = open ? window.ruleTemplates || {} : {};

    return (
        <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitleStyled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ 
                        backgroundColor: alpha(colors.primary, 0.1), 
                        borderRadius: '8px', 
                        p: 1, 
                        display: 'flex' 
                    }}>
                        {isEditMode ? <Edit sx={{ color: colors.primary }} /> : <AutoAwesomeIcon sx={{ color: colors.primary }} />}
                    </Box>
                    {isEditMode ? 'Edit Rule' : 'Create New Rule'}
                </Box>
                <IconButton onClick={handleClose} size="small" sx={{ 
                    borderRadius: '8px', 
                    backgroundColor: alpha(colors.secondary, 0.1),
                    '&:hover': { backgroundColor: alpha(colors.secondary, 0.2) }
                }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitleStyled>
            
            <DialogContent sx={{ padding: '24px', paddingTop: '16px', marginTop: '6px' }}>
                <Stack spacing={3}>
                    {selectedTemplate && (
                        <Box sx={{ 
                            p: 2, 
                            borderRadius: '8px', 
                            backgroundColor: alpha(colors.primary, 0.05),
                            mb: 2
                        }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5, color: colors.primary }}>
                                {selectedTemplate.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {selectedTemplate.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <EntityChip 
                                    size="small" 
                                    entityType={selectedTemplate.entityType} 
                                    label={selectedTemplate.entityType} 
                                    icon={selectedTemplate.entityType === 'AGREEMENT' ? <AccountBalance fontSize="small" /> : <Description fontSize="small" />}
                                />
                            </Box>
                        </Box>
                    )}

                    {!isEditMode && (
                        <FormControl fullWidth error={!!errors.ruleTemplateId}>
                            <InputLabel>Select Rule Template</InputLabel>
                            <Select
                                value={formData.ruleTemplateId}
                                label="Select Rule Template"
                                onChange={(e) => handleTemplateChange(e.target.value)}
                            >
                                {templates.map((template) => (
                                    <MenuItem key={template.id} value={template.id}>
                                        <Box sx={{ py: 0.5 }}>
                                            <Typography variant="body2" fontWeight={500}>
                                                {template.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {template.description}
                                            </Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <EntityChip 
                                                    size="small" 
                                                    entityType={template.entityType} 
                                                    label={template.entityType} 
                                                    icon={template.entityType === 'AGREEMENT' ? <AccountBalance fontSize="small" /> : <Description fontSize="small" />}
                                                />
                                            </Box>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.ruleTemplateId && (
                                <FormHelperText error>{errors.ruleTemplateId}</FormHelperText>
                            )}
                        </FormControl>
                    )}

                    {selectedTemplate && (
                        <FormControl fullWidth error={!!errors.entityId}>
                            <InputLabel>
                                {selectedTemplate.entityType === 'AGREEMENT' ? 'Select Agreement' : 'Select Form'}
                            </InputLabel>
                            <Select
                                value={formData.entityId}
                                label={selectedTemplate.entityType === 'AGREEMENT' ? 'Select Agreement' : 'Select Form'}
                                onChange={(e) => handleInputChange('entityId', e.target.value)}
                                disabled={(selectedTemplate.entityType === 'AGREEMENT' ? loadingAgreements : loadingForms)}
                                startAdornment={
                                    <InputAdornment position="start">
                                        {selectedTemplate.entityType === 'AGREEMENT' ? 
                                            <AccountBalance fontSize="small" sx={{ color: colors.primary }} /> : 
                                            <Description fontSize="small" sx={{ color: colors.success }} />
                                        }
                                    </InputAdornment>
                                }
                            >
                                {selectedTemplate.entityType === 'AGREEMENT' ? (
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
                            {errors.entityId && (
                                <FormHelperText error>{errors.entityId}</FormHelperText>
                            )}
                        </FormControl>
                    )}
                </Stack>
            </DialogContent>
            
            <DialogActions sx={{ padding: '16px 24px 24px 24px', gap: 1 }}>
                <StyledButton 
                    variant="outlined" 
                    onClick={handleClose}
                    disabled={loading}
                >
                    Cancel
                </StyledButton>
                <StyledButton 
                    onClick={handleSubmit}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={16} /> : isEditMode ? <Edit /> : <Add />}
                >
                    {loading ? 'Saving...' : (isEditMode ? 'Update Rule' : 'Create Rule')}
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
}

export default function Rules() {
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const { user } = useAuth();
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [ruleTemplates, setRuleTemplates] = useState([]);
    const [ruleInstances, setRuleInstances] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRule, setEditingRule] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [entityTypeFilter, setEntityTypeFilter] = useState('all');
    const [viewMode, setViewMode] = useState('table'); // 'grid' or 'table'

    const fetchRuleTemplates = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/api/rules/templates');
            setRuleTemplates(data);
            // Make templates available to dialog component
            window.ruleTemplates = { templates: data };
        } catch (error) {
            console.error('Error fetching rule templates:', error);
            showAlert('Error fetching rule templates', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchRuleInstances = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/api/rules/');
            setRuleInstances(data);
        } catch (error) {
            console.error('Error fetching rule instances:', error);
            showAlert('Error fetching rule instances', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.all([fetchRuleTemplates(), fetchRuleInstances()]);
    }, []);

    const handleCreateRule = () => {
        setEditingRule(null);
        setDialogOpen(true);
    };

    const handleEditRule = (rule) => {
        setEditingRule(rule);
        setDialogOpen(true);
    };

    const handleRuleSubmit = async (ruleData) => {
        try {
            setSubmitting(true);
            
            if (editingRule) {
                await axiosInstance.put('/api/rules/', ruleData);
                showAlert('Rule updated successfully', 'success');
            } else {
                await axiosInstance.post('/api/rules/', ruleData);
                showAlert('Rule created successfully', 'success');
            }
            
            setDialogOpen(false);
            fetchRuleInstances();
        } catch (error) {
            console.error('Error saving rule:', error);
            showAlert('Error saving rule: ' + (error?.response?.data?.message || error.message), 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleRule = async (rule) => {
        try {
            const updatedRule = {
                id: rule.id,
                ruleTemplateId: rule.ruleTemplate.id,
                enabled: !rule.enabled,
                entityId: rule.entityId,
                entityDisplayName: rule.entityDisplayName
            };
            
            await axiosInstance.put('/api/rules/', updatedRule);
            
            // Update local state
            setRuleInstances(ruleInstances.map(r => 
                r.id === rule.id ? { ...r, enabled: !rule.enabled } : r
            ));
            
            showAlert(`Rule ${!rule.enabled ? 'enabled' : 'disabled'} successfully`, 'success');
        } catch (error) {
            console.error('Error toggling rule:', error);
            showAlert('Error toggling rule: ' + (error?.response?.data?.message || error.message), 'error');
        }
    };

    const getEntityTypeIcon = (entityType) => {
        switch (entityType) {
            case 'AGREEMENT':
                return <AccountBalance fontSize="small" />;
            case 'FORM':
                return <Description fontSize="small" />;
            default:
                return <Settings fontSize="small" />;
        }
    };
    
    // Filter and search rules
    const filteredRules = ruleInstances.filter(rule => {
        // Search filter
        const matchesSearch = !searchQuery || 
            rule.ruleTemplate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (rule.entityDisplayName && rule.entityDisplayName.toLowerCase().includes(searchQuery.toLowerCase()));
        
        // Entity type filter
        const matchesEntityType = entityTypeFilter === 'all' || 
            rule.ruleTemplate.entityType === entityTypeFilter;
        
        return matchesSearch && matchesEntityType;
    });
    
    // Get stats for the dashboard
    const getStats = () => {
        const total = ruleInstances.length;
        const enabled = ruleInstances.filter(rule => rule.enabled).length;

        return { total, enabled};
    };
    
    const stats = getStats();

    if (loading && (!ruleTemplates.length || !ruleInstances.length)) {
        return (
            <Container>
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
                            Loading automation rules...
                        </Typography>
                    </Stack>
                </LoadingContainer>
            </Container>
        );
    }

    return (
        <Container>
            {/* Page Header */}
            <PageHeader>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography 
                            variant="h4" 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 700,
                                color: colors.text.primary,
                                fontSize: '1.75rem',
                                marginBottom: '8px'
                            }}
                        >
                            Automation Rules
                        </Typography>
                        <Typography 
                            sx={{ 
                                color: colors.text.secondary,
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontSize: '0.9rem',
                                maxWidth: '600px'
                            }}
                        >
                            Configure rules to perform actions when specific events occur in your organization
                        </Typography>
                    </Box>
                    <StyledButton
                        onClick={handleCreateRule}
                        startIcon={<Add />}
                        size="large"
                    >
                        Create Rule
                    </StyledButton>
                </Box>
            </PageHeader>

            {/* Stats Dashboard */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ 
                        p: 2.5, 
                        borderRadius: '16px', 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        border: `1px solid ${colors.border}`
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            mb: 1
                        }}>
                            <Box sx={{ 
                                p: 1, 
                                borderRadius: '8px', 
                                bgcolor: alpha(colors.primary, 0.1),
                                display: 'flex'
                            }}>
                                <Settings sx={{ color: colors.primary }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Total Rules
                            </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={700} sx={{ mt: 'auto' }}>
                            {stats.total}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ 
                        p: 2.5, 
                        borderRadius: '16px', 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        border: `1px solid ${colors.border}`
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5,
                            mb: 1
                        }}>
                            <Box sx={{ 
                                p: 1, 
                                borderRadius: '8px', 
                                bgcolor: alpha(colors.success, 0.1),
                                display: 'flex'
                            }}>
                                <ToggleOnIcon sx={{ color: colors.success }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Enabled Rules
                            </Typography>
                        </Box>
                        <Typography variant="h4" fontWeight={700} sx={{ mt: 'auto' }}>
                            {stats.enabled}
                        </Typography>
                    </Paper>
                </Grid>

            </Grid>

            {/* Search and Filter Bar */}
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
            }}>
                <Box sx={{ display: 'flex', gap: 2, flexGrow: 1, maxWidth: '500px' }}>
                    <SearchField
                        placeholder="Search rules..."
                        fullWidth
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: colors.text.secondary }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                        <Select
                            value={entityTypeFilter}
                            onChange={(e) => setEntityTypeFilter(e.target.value)}
                            displayEmpty
                            sx={{ borderRadius: '12px' }}
                            startAdornment={
                                <InputAdornment position="start">
                                    <FilterListIcon sx={{ color: colors.text.secondary, fontSize: '1.2rem' }} />
                                </InputAdornment>
                            }
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            <MenuItem value="AGREEMENT">Agreements</MenuItem>
                            <MenuItem value="FORM">Forms</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Table View">
                        <IconButton 
                            onClick={() => setViewMode('table')}
                            sx={{ 
                                bgcolor: viewMode === 'table' ? alpha(colors.primary, 0.1) : 'transparent',
                                color: viewMode === 'table' ? colors.primary : colors.text.secondary,
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha(colors.primary, 0.1) }
                            }}
                        >
                            <Assignment />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Grid View">
                        <IconButton 
                            onClick={() => setViewMode('grid')}
                            sx={{ 
                                bgcolor: viewMode === 'grid' ? alpha(colors.primary, 0.1) : 'transparent',
                                color: viewMode === 'grid' ? colors.primary : colors.text.secondary,
                                borderRadius: '8px',
                                '&:hover': { bgcolor: alpha(colors.primary, 0.1) }
                            }}
                        >
                            <TuneIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Rules Content */}
            {filteredRules.length === 0 ? (
                <ModernCard sx={{ p: 6, textAlign: 'center' }}>
                    <Box sx={{ maxWidth: '400px', mx: 'auto' }}>
                        <Box sx={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            bgcolor: alpha(colors.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3
                        }}>
                            <Settings sx={{ fontSize: '40px', color: colors.primary }} />
                        </Box>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 600,
                                mb: 1.5
                            }}
                        >
                            {searchQuery || entityTypeFilter !== 'all' ? 
                                'No matching rules found' : 
                                'No automation rules configured'}
                        </Typography>
                        <Typography 
                            sx={{ 
                                color: colors.text.secondary,
                                mb: 4,
                                fontSize: '0.95rem'
                            }}
                        >
                            {searchQuery || entityTypeFilter !== 'all' ? 
                                'Try adjusting your search criteria or filters to find what you\'re looking for.' : 
                                'Create your first automation rule to streamline your workflows and save time.'}
                        </Typography>
                        {(!searchQuery && entityTypeFilter === 'all') && (
                            <StyledButton
                                onClick={handleCreateRule}
                                startIcon={<Add />}
                                size="large"
                            >
                                Create First Rule
                            </StyledButton>
                        )}
                    </Box>
                </ModernCard>
            ) : viewMode === 'table' ? (
                <ModernCard>
                    <Box sx={{ overflow: 'auto' }}>
                        <StyledTable>
                            <StyledTableHead>
                                <TableRow>
                                    <TableCell>Rule</TableCell>
                                    <TableCell>Entity Type</TableCell>
                                    <TableCell>Entity</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </StyledTableHead>
                            <TableBody>
                                {filteredRules.map((rule) => (
                                    <StyledTableRow key={rule.id}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <Box sx={{ 
                                                    p: 0.75, 
                                                    borderRadius: '8px', 
                                                    bgcolor: alpha(colors.primary, 0.1),
                                                    display: 'flex'
                                                }}>
                                                    <Settings fontSize="small" sx={{ color: colors.primary }} />
                                                </Box>
                                                <Box>
                                                    <Typography 
                                                        sx={{ 
                                                            fontWeight: 600,
                                                            color: colors.text.primary,
                                                            fontSize: '0.9rem',
                                                            mb: 0.5
                                                        }}
                                                    >
                                                        {rule.ruleTemplate.title}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {rule.ruleTemplate.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <EntityChip 
                                                entityType={rule.ruleTemplate.entityType}
                                                label={rule.ruleTemplate.entityType}
                                                icon={getEntityTypeIcon(rule.ruleTemplate.entityType)}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {rule.entityId ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {rule.ruleTemplate.entityType === 'AGREEMENT' ? 
                                                        <AccountBalance fontSize="small" sx={{ color: colors.primary }} /> : 
                                                        <Description fontSize="small" sx={{ color: colors.success }} />
                                                    }
                                                    <Typography 
                                                        sx={{ 
                                                            color: colors.text.primary,
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {rule.entityDisplayName || rule.entityId}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography 
                                                    sx={{ 
                                                        color: colors.text.disabled,
                                                        fontStyle: 'italic',
                                                    }}
                                                >
                                                    Not configured
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <StatusBadge enabled={rule.enabled}>
                                                {rule.enabled ? (
                                                    <>
                                                        <CheckCircle fontSize="small" sx={{ mr: 0.5 }} />
                                                        Enabled
                                                    </>
                                                ) : (
                                                    <>
                                                        <RadioButtonUnchecked fontSize="small" sx={{ mr: 0.5 }} />
                                                        Disabled
                                                    </>
                                                )}
                                            </StatusBadge>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <Tooltip title="Edit Rule" TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                                                    <ActionButton 
                                                        variant="edit" 
                                                        onClick={() => handleEditRule(rule)}
                                                    >
                                                        <Edit />
                                                    </ActionButton>
                                                </Tooltip>
                                                <Tooltip title={rule.enabled ? "Disable Rule" : "Enable Rule"} TransitionComponent={Fade} TransitionProps={{ timeout: 600 }}>
                                                    <ActionButton 
                                                        variant={rule.enabled ? "delete" : "primary"} 
                                                        onClick={() => handleToggleRule(rule)}
                                                        disabled={!rule.entityId}
                                                    >
                                                        {rule.enabled ? <ToggleOffIcon /> : <ToggleOnIcon />}
                                                    </ActionButton>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                    </StyledTableRow>
                                ))}
                            </TableBody>
                        </StyledTable>
                    </Box>
                </ModernCard>
            ) : (
                <Grid container spacing={3}>
                    {filteredRules.map((rule) => (
                        <Grid item xs={12} sm={6} md={4} key={rule.id}>
                            <RuleCard>
                                <Box sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 1.5,
                                        }}>
                                            <Box sx={{ 
                                                p: 0.75, 
                                                borderRadius: '8px', 
                                                bgcolor: alpha(colors.primary, 0.1),
                                                display: 'flex'
                                            }}>
                                                <Settings fontSize="small" sx={{ color: colors.primary }} />
                                            </Box>
                                            <EntityChip 
                                                entityType={rule.ruleTemplate.entityType}
                                                label={rule.ruleTemplate.entityType}
                                                icon={getEntityTypeIcon(rule.ruleTemplate.entityType)}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </Box>
                                        <StatusBadge enabled={rule.enabled}>
                                            {rule.enabled ? (
                                                <>
                                                    <CheckCircle fontSize="small" sx={{ mr: 0.5 }} />
                                                    Enabled
                                                </>
                                            ) : (
                                                <>
                                                    <RadioButtonUnchecked fontSize="small" sx={{ mr: 0.5 }} />
                                                    Disabled
                                                </>
                                            )}
                                        </StatusBadge>
                                    </Box>
                                    
                                    <Typography 
                                        variant="h6" 
                                        sx={{ 
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            mb: 1
                                        }}
                                    >
                                        {rule.ruleTemplate.title}
                                    </Typography>
                                    
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ mb: 3, height: '40px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    >
                                        {rule.ruleTemplate.description}
                                    </Typography>
                                    
                                    <Box sx={{ 
                                        p: 2, 
                                        borderRadius: '8px', 
                                        bgcolor: alpha(colors.backgroundAlt, 0.5),
                                        border: `1px solid ${colors.border}`,
                                        mb: 3
                                    }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                            ASSIGNED {rule.ruleTemplate.entityType}
                                        </Typography>
                                        {rule.entityId ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                {rule.ruleTemplate.entityType === 'AGREEMENT' ? 
                                                    <AccountBalance fontSize="small" sx={{ color: colors.primary }} /> : 
                                                    <Description fontSize="small" sx={{ color: colors.success }} />
                                                }
                                                <Typography 
                                                    sx={{ 
                                                        color: colors.text.primary,
                                                        fontWeight: 500,
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {rule.entityDisplayName || rule.entityId}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography 
                                                sx={{ 
                                                    color: colors.text.disabled,
                                                    fontStyle: 'italic',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                Not configured
                                            </Typography>
                                        )}
                                    </Box>
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <StyledButton
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Edit />}
                                            onClick={() => handleEditRule(rule)}
                                        >
                                            Edit
                                        </StyledButton>
                                        <StyledButton
                                            variant={rule.enabled ? "secondary" : "primary"}
                                            size="small"
                                            disabled={!rule.entityId}
                                            onClick={() => handleToggleRule(rule)}
                                        >
                                            {rule.enabled ? "Disable" : "Enable"}
                                        </StyledButton>
                                    </Box>
                                </Box>
                            </RuleCard>
                        </Grid>
                    ))}
                </Grid>
            )}

            <RuleFormDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                onSubmit={handleRuleSubmit}
                rule={editingRule}
                loading={submitting}
            />
        </Container>
    );
}

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
  alpha,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Stack,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Select,
  FormControl,
  InputLabel,
  Button
} from "@mui/material";
import { Breadcrumb } from "app/components";
import { 
  Assignment,
  Schedule,
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  MoreVert,
  ViewList,
  ViewModule,
  Preview,
  Share,
  ContentCopy
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import useAuth from "app/hooks/useAuth";
import { useAxios } from "app/contexts/AxiosContext";
import { useAlert } from "app/contexts/AlertContext";

// Styled components following ExerciseWizard pattern
const colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#fafbfc',
  surface: '#ffffff',
  border: '#e5e7eb',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    inverse: '#ffffff'
  }
};

const Container = styled(Box)(({ theme }) => ({
  padding: '32px',
  minHeight: '100vh',
  backgroundColor: colors.background,
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

const FormHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  borderRadius: '20px',
  padding: '32px',
  marginBottom: '32px',
  color: colors.text.inverse,
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '200px',
    height: '200px',
    background: `radial-gradient(circle, ${alpha(colors.text.inverse, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
    transform: 'translate(50%, -50%)',
  }
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${colors.border}`,
  transition: 'all 0.3s ease-in-out',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.12)',
  }
}));

const FormCard = styled(ModernCard)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
  position: 'relative',
  
  '&:hover': {
    borderColor: colors.primary,
  }
}));

const StatusBadge = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  fontSize: '0.75rem',
  height: '24px',
  borderRadius: '12px',
  textTransform: 'capitalize',
  ...(status === 'visible' && {
    backgroundColor: alpha(colors.success, 0.1),
    color: colors.success,
    border: `1px solid ${alpha(colors.success, 0.3)}`,
  }),
  ...(status === 'hidden' && {
    backgroundColor: alpha(colors.warning, 0.1),
    color: colors.warning,
    border: `1px solid ${alpha(colors.warning, 0.3)}`,
  }),
  ...(status === 'draft' && {
    backgroundColor: alpha(colors.info, 0.1),
    color: colors.info,
    border: `1px solid ${alpha(colors.info, 0.3)}`,
  }),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '10px 20px',
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: colors.surface,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: colors.primary,
    },
  },
}));

export default function FormWizard() {
  const navigate = useNavigate();
  const axiosInstance = useAxios();
  const { showAlert } = useAlert();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFormForMenu, setSelectedFormForMenu] = useState(null);

  // Effects
  useEffect(() => {
    fetchForms();
  }, []);

  // API calls
  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/forms/organisation/${user.organisationId}`);
      setForms(response.data);
    } catch (error) {
      console.error('Error fetching forms:', error);
      showAlert('Failed to load forms', 'error');
    } finally {
      setLoading(false);
    }
  };


  const handleToggleVisibility = async (form, newVisibility) => {
    try {
      await axiosInstance.put(`/api/forms/${form.id}/visibility?isVisible=${newVisibility}`);
      showAlert(`Form ${newVisibility ? 'published' : 'hidden'} successfully`, 'success');
      fetchForms();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      showAlert('Failed to update form visibility', 'error');
    }
  };

  // Filter and search
  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.instruction?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'visible' && form.isVisible) ||
                         (filterStatus === 'hidden' && !form.isVisible);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Box mb={4}>
        <Breadcrumb routeSegments={[
          { name: 'Portal', path: '/portal/dashboard' },
          { name: 'Form Builder' }
        ]} />
      </Box>

      {/* Enhanced Header */}
      <FormHeader>
        <Box position="relative" zIndex={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.75rem',
                  mb: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Assignment sx={{ fontSize: '2rem' }} />
                Form Builder
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '1rem'
                }}
              >
                Create and manage interactive forms for data collection
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                icon={<Assignment />}
                label={`${forms.length} Forms`}
                size="small"
                sx={{
                  backgroundColor: alpha(colors.text.inverse, 0.15),
                  color: colors.text.inverse,
                  fontWeight: 600,
                  border: `1px solid ${alpha(colors.text.inverse, 0.3)}`
                }}
              />
              <Chip
                icon={<Visibility />}
                label={`${forms.filter(f => f.isVisible).length} Published`}
                size="small"
                sx={{
                  backgroundColor: alpha(colors.text.inverse, 0.15),
                  color: colors.text.inverse,
                  fontWeight: 600,
                  border: `1px solid ${alpha(colors.text.inverse, 0.3)}`
                }}
              />
            </Stack>
          </Stack>
        </Box>
      </FormHeader>

      {/* Main Content */}
      <ModernCard elevation={2}>
          <Box p={4}>
            {/* Toolbar */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
              <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                <SearchField
                  placeholder="Search forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: 300 }}
                />
                
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Filter</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Filter"
                  >
                    <MenuItem value="all">All Forms</MenuItem>
                    <MenuItem value="visible">Published</MenuItem>
                    <MenuItem value="hidden">Hidden</MenuItem>
                  </Select>
                </FormControl>
                

              </Stack>
              
              <ActionButton
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => navigate('/portal/form/create')}
              >
                Create Form
              </ActionButton>
            </Stack>

            {/* Forms Grid/List */}
            {filteredForms.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Assignment sx={{ fontSize: 64, color: colors.text.secondary, mb: 2 }} />
                <Typography variant="h6" color="text.secondary" mb={1}>
                  {forms.length === 0 ? 'No forms created yet' : 'No forms match your search'}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  {forms.length === 0 
                    ? 'Create your first form to start collecting responses'
                    : 'Try adjusting your search terms or filters'
                  }
                </Typography>
                {forms.length === 0 && (
                  <ActionButton
                    variant="contained"
                    color="primary"
                    startIcon={<Add />}
                    onClick={() => navigate('/portal/form/create')}
                  >
                    Create Your First Form
                  </ActionButton>
                )}
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredForms.map((form) => (
                  <Grid item xs={12} sm={6} md={4} key={form.id}>
                    <FormCard onClick={() => navigate(`/portal/form/edit/${form.id}`)}>
                      <CardContent sx={{ flex: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <StatusBadge 
                            status={form.isVisible ? 'visible' : 'hidden'}
                            label={form.isVisible ? 'Published' : 'Hidden'}
                            size="small"
                          />
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFormForMenu(form);
                              setAnchorEl(e.currentTarget);
                            }}
                          >
                            <MoreVert />
                          </IconButton>
                        </Stack>
                        
                        <Typography variant="h6" fontWeight={600} mb={1} noWrap>
                          {form.title || 'Untitled Form'}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            mb: 2,
                            minHeight: 40
                          }}
                        >
                          <div dangerouslySetInnerHTML={{ __html: form.instruction || 'No description provided' }} />
                        </Typography>
                        
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          <Chip
                            icon={<Assignment />}
                            label={`${form.pages?.length || 0} Pages`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            icon={<Schedule />}
                            label={new Date(form.createdAt).toLocaleDateString()}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      </CardContent>
                      
                      <CardActions onClick={(e) => e.stopPropagation()} >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                          <Stack direction="row" spacing={1}>
                            <Tooltip title={form.isVisible ? "Published" : "Hidden"}>
                              <Switch
                                checked={form.isVisible}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleToggleVisibility(form, e.target.checked);
                                }}
                                size="small"
                              />
                            </Tooltip>
                          </Stack>
                          
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Edit Form">
                              <IconButton 
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/portal/form/edit/${form.id}`);
                                }}
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>
                      </CardActions>
                    </FormCard>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
      </ModernCard>


      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          navigate(`/portal/form/edit/${selectedFormForMenu.id}`);
          setAnchorEl(null);
        }}>
          <ListItemIcon><Edit /></ListItemIcon>
          <ListItemText>Edit Form</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleToggleVisibility(selectedFormForMenu, !selectedFormForMenu.isVisible);
          setAnchorEl(null);
        }}>
          <ListItemIcon>
            {selectedFormForMenu?.isVisible ? <VisibilityOff /> : <Visibility />}
          </ListItemIcon>
          <ListItemText>
            {selectedFormForMenu?.isVisible ? 'Hide Form' : 'Publish Form'}
          </ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon><ContentCopy /></ListItemIcon>
          <ListItemText>Duplicate Form</ListItemText>
        </MenuItem>
      </Menu>

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => navigate('/portal/form/create')}
      >
        <Add />
      </Fab>
    </Container>
  );
}

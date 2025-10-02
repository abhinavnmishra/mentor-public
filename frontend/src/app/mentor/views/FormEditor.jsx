import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Grid,
  alpha,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  TextField,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Paper,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  FormControl,
  InputLabel,
  Popover,
  List,
  ListItem
} from "@mui/material";
import { Breadcrumb } from "app/components";
import { 
  Save, 
  Assignment,
  DashboardCustomize,
  AutoAwesome,
  Add,
  Edit,
  Delete,
  MoreVert,
  ExpandMore,
  DragIndicator,
  SwapVert,
  Preview,
  Analytics,
  ArrowBack
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "app/hooks/useAuth";
import { useAxios } from "app/contexts/AxiosContext";
import { useAlert } from "app/contexts/AlertContext";
import { v4 as uuidv4 } from "uuid";
import { Editor } from '@tinymce/tinymce-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Styled components - reuse from FormWizard
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

const EditorContainer = styled(Box)(({ theme }) => ({
  border: `1px solid ${colors.border}`,
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: colors.surface,
  transition: 'all 0.2s ease-in-out',
  
  '&:focus-within': {
    borderColor: colors.primary,
    boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
  },
  
  '& .tox-tinymce': {
    border: 'none !important',
  },
  '& .tox-statusbar__resize-handle': {
    display: 'block !important',
  },
  '& .tox-statusbar': {
    border: 'none !important',
    backgroundColor: colors.background,
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
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

const QuestionTypeCard = styled(Card)(({ theme, selected }) => ({
  borderRadius: '12px',
  border: `2px solid ${selected ? colors.primary : colors.border}`,
  backgroundColor: selected ? alpha(colors.primary, 0.05) : colors.surface,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  }
}));

const DragHandle = styled(Box)(({ theme }) => ({
  cursor: 'grab',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: colors.text.secondary,
  padding: '8px',
  borderRadius: '10px',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(colors.primary, 0)}, ${alpha(colors.primary, 0.1)})`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  
  '&:hover': {
    color: colors.primary,
    
    '&::before': {
      opacity: 1,
    },
    
    '& svg': {
      transform: 'scale(1.1)',
    }
  },
  
  '&:active': {
    cursor: 'grabbing',
    
    '& svg': {
      transform: 'scale(0.95)',
    }
  },
  
  '& svg': {
    transition: 'transform 0.2s ease',
  }
}));

const ActionIconButton = styled(IconButton)(({ theme, color = 'primary' }) => {
  const getColor = () => {
    switch(color) {
      case 'error': return colors.error;
      case 'warning': return colors.warning;
      case 'success': return colors.success;
      case 'info': return colors.info;
      default: return colors.primary;
    }
  };
  
  return {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    color: getColor(),
    backgroundColor: alpha(getColor(), 0.1),
    border: `1px solid ${alpha(getColor(), 0.2)}`,
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: alpha(getColor(), 0.15),
      transform: 'translateY(-2px)',
    },
    
    '&:active': {
      transform: 'translateY(0px)',
    }
  };
});

const QuestionNumber = styled(Box)(({ theme }) => ({
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  backgroundColor: alpha(colors.primary, 0.1),
  color: colors.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 600,
  fontSize: '0.875rem',
  marginRight: '12px',
  border: `1px solid ${alpha(colors.primary, 0.2)}`,
}));

const DraggableAccordion = styled(Box)(({ theme, isDragging }) => ({
  marginBottom: '20px',
  borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  position: 'relative',
  boxShadow: isDragging 
    ? '0 15px 35px rgba(50, 50, 93, 0.25), 0 5px 15px rgba(0, 0, 0, 0.07)' 
    : '0 4px 12px rgba(0, 0, 0, 0.05)',
  transform: isDragging ? 'scale(1.02)' : 'scale(1)',
  zIndex: isDragging ? 10 : 1,
  overflow: 'hidden',
  
  '&:hover': {
    boxShadow: '0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08)',
  },
  
  '&::before': isDragging ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '16px',
    border: `2px solid ${colors.primary}`,
    boxShadow: `0 0 0 4px ${alpha(colors.primary, 0.2)}`,
    pointerEvents: 'none',
    zIndex: 0
  } : {},
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '3px',
    background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
    opacity: isDragging ? 1 : 0.7,
    transition: 'opacity 0.3s ease'
  }
}));

const FuturisticAccordion = styled(Accordion)(({ theme }) => ({
  borderRadius: '16px !important',
  border: 'none',
  backgroundColor: alpha(colors.surface, 0.8),
  backdropFilter: 'blur(10px)',
  overflow: 'hidden',
  
  '& .MuiAccordionSummary-root': {
    minHeight: '64px',
    padding: '0 16px',
    
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.03),
    }
  },
  
  '& .MuiAccordionDetails-root': {
    padding: '16px 24px 24px',
    backgroundColor: alpha(colors.background, 0.5),
    borderTop: `1px solid ${alpha(colors.border, 0.5)}`,
  }
}));

const QuestionTypeIcon = styled(Box)(({ theme, questionType }) => {
  const getTypeColor = () => {
    switch(questionType) {
      case 'SHORT_TEXT': return '#3b82f6'; // blue
      case 'LONG_TEXT': return '#8b5cf6'; // purple
      case 'MULTIPLE_CHOICE': return '#10b981'; // green
      case 'MULTI_SELECT': return '#f59e0b'; // amber
      case 'RATING': return '#ef4444'; // red
      default: return colors.primary;
    }
  };
  
  return {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: alpha(getTypeColor(), 0.1),
    border: `1px solid ${alpha(getTypeColor(), 0.2)}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: getTypeColor(),
    fontSize: '18px',
    fontWeight: 'bold',
    marginRight: '12px',
  };
});

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

export default function FormEditor() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const axiosInstance = useAxios();
  const { showAlert } = useAlert();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentForm, setCurrentForm] = useState(null);
  
  // Form builder state
  const [formBuilder, setFormBuilder] = useState({
    title: '',
    instruction: '',
    pages: [{
      pageId: uuidv4(),
      pageTitle: 'Page 1',
      questions: []
    }]
  });
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [addQuestionDialogOpen, setAddQuestionDialogOpen] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] = useState('SHORT_TEXT');
  const [moveQuestionAnchorEl, setMoveQuestionAnchorEl] = useState(null);
  const [questionToMove, setQuestionToMove] = useState(null);

  const questionTypes = [
    { value: 'SHORT_TEXT', label: 'Short Text', description: 'Single line text input', icon: '📝' },
    { value: 'LONG_TEXT', label: 'Long Text', description: 'Multi-line text area', icon: '📄' },
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', description: 'Single selection from options', icon: '⚪' },
    { value: 'MULTI_SELECT', label: 'Multi-Select', description: 'Multiple selections allowed', icon: '☑️' },
    { value: 'RATING', label: 'Rating', description: 'Star or number rating', icon: '⭐' }
  ];

  // Effects
  useEffect(() => {
    if (formId && formId !== 'new') {
      fetchForm(formId);
    } else {
      setCurrentForm({
        id: null,
        title: '',
        instruction: '',
        pages: [{
          pageId: uuidv4(),
          pageTitle: 'Page 1',
          questions: []
        }],
        isVisible: false
      });
      setLoading(false);
    }
  }, [formId]);

  // API calls
  const fetchForm = async (id) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/forms/${id}`);
      setCurrentForm(response.data);
      setFormBuilder(response.data);
    } catch (error) {
      console.error('Error fetching form:', error);
      showAlert('Failed to load form', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForm = async () => {
    try {
      setSaving(true);
      let response;
      
      if (currentForm?.id) {
        response = await axiosInstance.put('/api/forms', formBuilder);
      } else {
        response = await axiosInstance.post('/api/forms', formBuilder);
      }
      
      setCurrentForm(response.data);
      setFormBuilder(response.data);
      showAlert('Form saved successfully', 'success');
      
      if (!currentForm?.id) {
        navigate(`/portal/form/edit/${response.data.id}`);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      showAlert('Failed to save form', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Form builder handlers
  const handleAddPage = () => {
    const newPages = [...formBuilder.pages];
    newPages.push({
      pageId: uuidv4(),
      pageTitle: `Page ${newPages.length + 1}`,
      questions: []
    });
    setFormBuilder({ ...formBuilder, pages: newPages });
    setCurrentPageIndex(newPages.length - 1);
  };

  const handleDeletePage = (pageIndex) => {
    if (formBuilder.pages.length <= 1) {
      showAlert('Form must have at least one page', 'warning');
      return;
    }
    
    const newPages = formBuilder.pages.filter((_, index) => index !== pageIndex);
    setFormBuilder({ ...formBuilder, pages: newPages });
    
    if (currentPageIndex >= newPages.length) {
      setCurrentPageIndex(Math.max(0, newPages.length - 1));
    }
  };

  const handleAddQuestion = () => {
    const newQuestion = {
      questionId: uuidv4(),
      questionText: '',
      questionType: selectedQuestionType,
      required: false,
      options: selectedQuestionType === 'MULTIPLE_CHOICE' || selectedQuestionType === 'MULTI_SELECT' 
        ? ['Option 1', 'Option 2'] : []
    };
    
    const newPages = [...formBuilder.pages];
    newPages[currentPageIndex].questions.push(newQuestion);
    setFormBuilder({ ...formBuilder, pages: newPages });
    setAddQuestionDialogOpen(false);
  };

  const handleUpdateQuestion = (questionIndex, field, value) => {
    const newPages = [...formBuilder.pages];
    newPages[currentPageIndex].questions[questionIndex][field] = value;
    setFormBuilder({ ...formBuilder, pages: newPages });
  };

  const handleDeleteQuestion = (questionIndex) => {
    const newPages = [...formBuilder.pages];
    newPages[currentPageIndex].questions.splice(questionIndex, 1);
    setFormBuilder({ ...formBuilder, pages: newPages });
  };
  
  // Drag and drop handlers
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;
    
    // Dropped outside the list
    if (!destination) return;
    
    // Same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Handle question reordering within the same page
    if (type === 'question' && source.droppableId === destination.droppableId) {
      const pageIndex = parseInt(source.droppableId.split('-')[1]);
      const newPages = [...formBuilder.pages];
      const questions = [...newPages[pageIndex].questions];
      
      const [movedQuestion] = questions.splice(source.index, 1);
      questions.splice(destination.index, 0, movedQuestion);
      
      newPages[pageIndex].questions = questions;
      setFormBuilder({ ...formBuilder, pages: newPages });
      return;
    }
    
    // Handle question moving between pages
    if (type === 'question' && source.droppableId !== destination.droppableId) {
      const sourcePageIndex = parseInt(source.droppableId.split('-')[1]);
      const destPageIndex = parseInt(destination.droppableId.split('-')[1]);
      
      const newPages = [...formBuilder.pages];
      const sourceQuestions = [...newPages[sourcePageIndex].questions];
      const destQuestions = [...newPages[destPageIndex].questions];
      
      const [movedQuestion] = sourceQuestions.splice(source.index, 1);
      destQuestions.splice(destination.index, 0, movedQuestion);
      
      newPages[sourcePageIndex].questions = sourceQuestions;
      newPages[destPageIndex].questions = destQuestions;
      
      setFormBuilder({ ...formBuilder, pages: newPages });
      showAlert(`Question moved to ${newPages[destPageIndex].pageTitle}`, 'success');
      return;
    }
  };
  
  // Move question to another page
  const handleOpenMoveMenu = (event, questionIndex) => {
    setQuestionToMove(questionIndex);
    setMoveQuestionAnchorEl(event.currentTarget);
  };
  
  const handleCloseMoveMenu = () => {
    setMoveQuestionAnchorEl(null);
    setQuestionToMove(null);
  };
  
  const handleMoveQuestionToPage = (targetPageIndex) => {
    if (targetPageIndex === currentPageIndex) {
      handleCloseMoveMenu();
      return;
    }
    
    const newPages = [...formBuilder.pages];
    const question = { ...newPages[currentPageIndex].questions[questionToMove] };
    
    // Remove from current page
    newPages[currentPageIndex].questions.splice(questionToMove, 1);
    
    // Add to target page
    newPages[targetPageIndex].questions.push(question);
    
    setFormBuilder({ ...formBuilder, pages: newPages });
    showAlert(`Question moved to ${newPages[targetPageIndex].pageTitle}`, 'success');
    handleCloseMoveMenu();
  };

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
          { name: 'Forms', path: '/portal/form' },
          { name: formId === 'new' ? 'Create Form' : 'Edit Form' }
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
                <Edit sx={{ fontSize: '2rem' }} />
                {formId === 'new' ? 'Create New Form' : 'Edit Form'}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '1rem'
                }}
              >
                {formId === 'new' ? 'Build an interactive form for data collection' : 'Modify your form structure and content'}
              </Typography>
            </Box>
            <ActionButton
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/portal/form')}
              sx={{
                color: colors.text.inverse,
                borderColor: alpha(colors.text.inverse, 0.3),
                '&:hover': {
                  borderColor: colors.text.inverse,
                  backgroundColor: alpha(colors.text.inverse, 0.1)
                }
              }}
            >
              Back to Forms
            </ActionButton>
          </Stack>
        </Box>
      </FormHeader>

      {/* Main Content */}
      <ModernCard elevation={2}>
        <Box p={4}>
          {/* Form Builder Toolbar */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesome sx={{ color: colors.primary }} />
              Form Configuration
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <ActionButton
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/portal/form')}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="contained"
                color="primary"
                onClick={handleSaveForm}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
              >
                {saving ? 'Saving...' : 'Save Form'}
              </ActionButton>
            </Stack>
          </Stack>

          {/* Form Basic Details */}
          <Grid container spacing={4} mb={4}>
            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label="Form Title"
                value={formBuilder.title}
                onChange={(e) => setFormBuilder({ ...formBuilder, title: e.target.value })}
                placeholder="Enter form title..."
                sx={{ mb: 3 }}
              />
              
              <Typography variant="subtitle2" fontWeight={600} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assignment />
                Form Instructions
              </Typography>
              <EditorContainer>
                <Editor
                  tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                  value={formBuilder.instruction || ''}
                  onEditorChange={(content) => setFormBuilder({...formBuilder, instruction: content})}
                  init={{
                    height: 200,
                    menubar: false,
                    plugins: ['lists', 'link', 'autolink', 'autoresize'],
                    toolbar: 'undo redo | formatselect | bold italic | bullist numlist | removeformat',
                    content_style: 'body { font-family:"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size:14px; line-height: 1.6; padding: 16px; }',
                    branding: false,
                    promotion: false,
                    placeholder: 'Provide instructions for form respondents...'
                  }}
                />
              </EditorContainer>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 3, backgroundColor: alpha(colors.info, 0.05), borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={600} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Analytics sx={{ color: colors.info }} />
                  Form Statistics
                </Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Total Pages:</Typography>
                    <Chip label={formBuilder.pages?.length || 0} size="small" />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Total Questions:</Typography>
                    <Chip 
                      label={formBuilder.pages?.reduce((total, page) => total + (page.questions?.length || 0), 0) || 0} 
                      size="small" 
                    />
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2">Status:</Typography>
                    <StatusBadge 
                      status={currentForm?.isVisible ? 'visible' : 'hidden'}
                      label={currentForm?.isVisible ? 'Published' : 'Hidden'}
                      size="small"
                    />
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Page Management */}
          <Box mb={4}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600}>
                Form Pages
              </Typography>
              <ActionButton
                variant="outlined"
                startIcon={<Add />}
                onClick={handleAddPage}
              >
                Add Page
              </ActionButton>
            </Stack>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Box sx={{ position: 'relative' }}>
                <Tabs 
                  value={currentPageIndex} 
                  onChange={(e, newValue) => setCurrentPageIndex(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {formBuilder.pages?.map((page, index) => (
                    <Tab 
                      key={page.pageId}
                      label={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <span>{page.pageTitle}</span>
                          <Chip 
                            label={page.questions?.length || 0} 
                            size="small" 
                            color={page.questions?.length ? "primary" : "default"}
                          />
                          {formBuilder.pages.length > 1 && (
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePage(index);
                              }}
                            >
                              <Delete sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </Stack>
                      }
                      sx={{ textTransform: 'none' }}
                    />
                  ))}
                </Tabs>
                
                {/* Drop zones for each page */}
                <Box sx={{
                  display: 'flex',
                  position: 'absolute',
                  bottom: -8,
                  left: 0,
                  right: 0,
                  px: 2
                }}>
                  {formBuilder.pages?.map((page, index) => (
                    <Droppable
                      key={`page-drop-${page.pageId}`}
                      droppableId={`page-${index}`}
                      type="question"
                      direction="horizontal"
                      isDropDisabled={index === currentPageIndex}
                    >
                      {(provided, snapshot) => (
                        <Box
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          sx={{
                            flex: 1,
                            height: '4px',
                            mx: 0.5,
                            backgroundColor: snapshot.isDraggingOver
                              ? colors.primary
                              : index === currentPageIndex
                                ? alpha(colors.primary, 0)
                                : alpha(colors.primary, 0),
                            borderRadius: '2px',
                            transition: 'all 0.2s ease',
                            opacity: snapshot.isDraggingOver ? 1 : 0.6,
                            transform: snapshot.isDraggingOver ? 'scaleY(2)' : 'scaleY(1)'
                          }}
                        >
                          {provided.placeholder}
                        </Box>
                      )}
                    </Droppable>
                  ))}
                </Box>
              </Box>
            </DragDropContext>
          </Box>

          {/* Current Page Editor */}
          {formBuilder.pages?.[currentPageIndex] && (
            <Box>
              <Paper elevation={0} sx={{ p: 3, backgroundColor: colors.background, borderRadius: 2, mb: 3 }}>
                <StyledTextField
                  fullWidth
                  label="Page Title"
                  value={formBuilder.pages[currentPageIndex].pageTitle}
                  onChange={(e) => {
                    const newPages = [...formBuilder.pages];
                    newPages[currentPageIndex].pageTitle = e.target.value;
                    setFormBuilder({ ...formBuilder, pages: newPages });
                  }}
                  sx={{ mb: 2 }}
                />
              </Paper>

              {/* Questions - Drag and Drop Container */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`page-${currentPageIndex}`} type="question">
                  {(provided, snapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: '100px',
                        backgroundColor: snapshot.isDraggingOver ? alpha(colors.primary, 0.05) : 'transparent',
                        borderRadius: '12px',
                        transition: 'background-color 0.2s ease',
                        padding: snapshot.isDraggingOver ? '16px' : 0
                      }}
                    >
                      {formBuilder.pages[currentPageIndex].questions?.map((question, questionIndex) => (
                        <Draggable
                          key={question.questionId}
                          draggableId={question.questionId}
                          index={questionIndex}
                        >
                          {(provided, snapshot) => (
                            <DraggableAccordion
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              isDragging={snapshot.isDragging}
                            >
                              <FuturisticAccordion defaultExpanded>
                                <AccordionSummary 
                                  expandIcon={
                                    <Box 
                                      sx={{ 
                                        width: 28, 
                                        height: 28, 
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: alpha(colors.primary, 0.08),
                                        color: colors.primary,
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      <ExpandMore fontSize="small" />
                                    </Box>
                                  }
                                  sx={{ 
                                    '& .MuiAccordionSummary-content': {
                                      margin: 0
                                    }
                                  }}
                                >
                                  <Stack direction="row" alignItems="center" spacing={1} width="100%">
                                    <DragHandle {...provided.dragHandleProps}>
                                      <DragIndicator />
                                    </DragHandle>
                                    
                                    <QuestionNumber>
                                      {questionIndex + 1}
                                    </QuestionNumber>
                                    
                                    <QuestionTypeIcon questionType={question.questionType}>
                                      {questionTypes.find(t => t.value === question.questionType)?.icon || '?'}
                                    </QuestionTypeIcon>
                                    
                                    <Box flex={1}>
                                      <Typography 
                                        fontWeight={600} 
                                        sx={{ 
                                          fontSize: '0.95rem',
                                          color: colors.text.primary,
                                          mb: 0.5
                                        }}
                                      >
                                        {question.questionText || 'Untitled Question'}
                                      </Typography>
                                      <Typography 
                                        variant="caption" 
                                        sx={{ 
                                          color: colors.text.secondary,
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 1
                                        }}
                                      >
                                        <Box component="span" sx={{ 
                                          fontSize: '0.75rem',
                                          fontWeight: 600,
                                          color: question.questionType === 'SHORT_TEXT' ? '#3b82f6' : 
                                                question.questionType === 'LONG_TEXT' ? '#8b5cf6' :
                                                question.questionType === 'MULTIPLE_CHOICE' ? '#10b981' :
                                                question.questionType === 'MULTI_SELECT' ? '#f59e0b' : '#ef4444'
                                        }}>
                                          {questionTypes.find(t => t.value === question.questionType)?.label || question.questionType}
                                        </Box>
                                        {question.required && (
                                          <Chip 
                                            label="Required" 
                                            size="small" 
                                            sx={{ 
                                              height: 20, 
                                              fontSize: '0.65rem',
                                              backgroundColor: alpha(colors.error, 0.1),
                                              color: colors.error,
                                              fontWeight: 600
                                            }} 
                                          />
                                        )}
                                      </Typography>
                                    </Box>
                                    
                                    <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>

                                      <Tooltip title="Move to another page">
                                        <ActionIconButton 
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenMoveMenu(e, questionIndex);
                                          }}
                                        >
                                          <SwapVert fontSize="small" />
                                        </ActionIconButton>
                                      </Tooltip>
                                      
                                      <Tooltip title="Delete question">
                                        <ActionIconButton 
                                          size="small"
                                          color="error"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteQuestion(questionIndex);
                                          }}
                                        >
                                          <Delete fontSize="small" />
                                        </ActionIconButton>
                                      </Tooltip>
                                    </Stack>
                                  </Stack>
                                </AccordionSummary>
                                
                                <AccordionDetails>
                                  <Box sx={{ position: 'relative' }}>
                                    {/* Decorative elements */}
                                    <Box 
                                      sx={{ 
                                        position: 'absolute', 
                                        top: -10, 
                                        left: 20, 
                                        right: 20,
                                        height: '1px',
                                        background: `linear-gradient(90deg, ${alpha(colors.primary, 0)}, ${alpha(colors.primary, 0.2)}, ${alpha(colors.primary, 0)})`
                                      }}
                                    />
                                    
                                    <Grid container spacing={3}>
                                      <Grid item xs={12} md={8}>
                                        <Box sx={{ mb: 3 }}>
                                          <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                              mb: 1, 
                                              display: 'flex', 
                                              alignItems: 'center',
                                              gap: 1,
                                              color: colors.primary,
                                              fontWeight: 600
                                            }}
                                          >
                                            <Edit fontSize="small" />
                                            Question Text
                                          </Typography>
                                          <StyledTextField
                                            fullWidth
                                            placeholder="Enter your question here..."
                                            value={question.questionText}
                                            onChange={(e) => handleUpdateQuestion(questionIndex, 'questionText', e.target.value)}
                                            multiline
                                            rows={2}
                                            InputProps={{
                                              sx: {
                                                borderRadius: '12px',
                                                backgroundColor: alpha(colors.surface, 0.8),
                                                backdropFilter: 'blur(8px)',
                                                '&:focus-within': {
                                                  boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.2)}`
                                                }
                                              }
                                            }}
                                          />
                                        </Box>
                                        
                                        {/* Question preview */}
                                        <Box 
                                          sx={{ 
                                            p: 2, 
                                            borderRadius: '12px',
                                            border: `1px dashed ${alpha(colors.info, 0.3)}`,
                                            backgroundColor: alpha(colors.info, 0.05),
                                            mb: 2
                                          }}
                                        >
                                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1, color: colors.info }}>
                                            <Preview fontSize="small" />
                                            Preview
                                          </Typography>
                                          <Typography variant="body2" fontWeight={500} mb={1}>
                                            {question.questionText || 'Your question will appear here'}
                                          </Typography>
                                          
                                          {question.questionType === 'SHORT_TEXT' && (
                                            <TextField 
                                              variant="outlined" 
                                              fullWidth 
                                              size="small" 
                                              disabled 
                                              placeholder="Short answer text field"
                                              sx={{ 
                                                pointerEvents: 'none',
                                                opacity: 0.7
                                              }}
                                            />
                                          )}
                                          
                                          {question.questionType === 'LONG_TEXT' && (
                                            <TextField 
                                              variant="outlined" 
                                              fullWidth 
                                              multiline
                                              rows={2}
                                              disabled 
                                              placeholder="Long answer text area"
                                              sx={{ 
                                                pointerEvents: 'none',
                                                opacity: 0.7
                                              }}
                                            />
                                          )}
                                          
                                          {question.questionType === 'MULTIPLE_CHOICE' && question.options?.length > 0 && (
                                            <Box sx={{ pl: 1 }}>
                                              {question.options.map((option, idx) => (
                                                <FormControlLabel
                                                  key={idx}
                                                  control={<Box sx={{ 
                                                    width: 16, 
                                                    height: 16, 
                                                    borderRadius: '50%', 
                                                    border: `2px solid ${alpha(colors.text.secondary, 0.5)}`,
                                                    mr: 1
                                                  }}/>}
                                                  label={<Typography variant="body2">{option}</Typography>}
                                                  sx={{ 
                                                    opacity: 0.7,
                                                    pointerEvents: 'none',
                                                    mb: 0.5
                                                  }}
                                                />
                                              ))}
                                            </Box>
                                          )}
                                          
                                          {question.questionType === 'MULTI_SELECT' && question.options?.length > 0 && (
                                            <Box sx={{ pl: 1 }}>
                                              {question.options.map((option, idx) => (
                                                <FormControlLabel
                                                  key={idx}
                                                  control={<Box sx={{ 
                                                    width: 16, 
                                                    height: 16, 
                                                    borderRadius: 2, 
                                                    border: `2px solid ${alpha(colors.text.secondary, 0.5)}`,
                                                    mr: 1
                                                  }}/>}
                                                  label={<Typography variant="body2">{option}</Typography>}
                                                  sx={{ 
                                                    opacity: 0.7,
                                                    pointerEvents: 'none',
                                                    mb: 0.5
                                                  }}
                                                />
                                              ))}
                                            </Box>
                                          )}
                                          
                                          {question.questionType === 'RATING' && (
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                              {[1, 2, 3, 4, 5].map(rating => (
                                                <Box 
                                                  key={rating}
                                                  sx={{
                                                    width: 32,
                                                    height: 32,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '50%',
                                                    border: `1px solid ${alpha(colors.text.secondary, 0.3)}`,
                                                    opacity: 0.7,
                                                    color: colors.text.secondary
                                                  }}
                                                >
                                                  {rating}
                                                </Box>
                                              ))}
                                            </Box>
                                          )}
                                        </Box>
                                      </Grid>
                                      
                                      <Grid item xs={12} md={4}>
                                        <Box sx={{ 
                                          p: 2, 
                                          borderRadius: '12px',
                                          backgroundColor: alpha(colors.background, 0.7),
                                          border: `1px solid ${alpha(colors.border, 0.7)}`,
                                          mb: 3
                                        }}>
                                          <Typography 
                                            variant="subtitle2" 
                                            sx={{ 
                                              mb: 2, 
                                              display: 'flex', 
                                              alignItems: 'center',
                                              gap: 1,
                                              color: colors.secondary,
                                              fontWeight: 600
                                            }}
                                          >
                                            <DashboardCustomize fontSize="small" />
                                            Question Settings
                                          </Typography>
                                          
                                          <FormControl fullWidth sx={{ mb: 2 }}>
                                            <InputLabel>Question Type</InputLabel>
                                            <Select
                                              value={question.questionType}
                                              onChange={(e) => handleUpdateQuestion(questionIndex, 'questionType', e.target.value)}
                                              label="Question Type"
                                              sx={{
                                                borderRadius: '10px',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                  borderColor: alpha(colors.border, 0.8)
                                                }
                                              }}
                                            >
                                              {questionTypes.map((type) => (
                                                <MenuItem key={type.value} value={type.value}>
                                                  <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Box sx={{ 
                                                      width: 24, 
                                                      height: 24, 
                                                      borderRadius: '6px',
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      backgroundColor: type.value === 'SHORT_TEXT' ? alpha('#3b82f6', 0.1) : 
                                                                      type.value === 'LONG_TEXT' ? alpha('#8b5cf6', 0.1) :
                                                                      type.value === 'MULTIPLE_CHOICE' ? alpha('#10b981', 0.1) :
                                                                      type.value === 'MULTI_SELECT' ? alpha('#f59e0b', 0.1) : alpha('#ef4444', 0.1),
                                                      color: type.value === 'SHORT_TEXT' ? '#3b82f6' : 
                                                              type.value === 'LONG_TEXT' ? '#8b5cf6' :
                                                              type.value === 'MULTIPLE_CHOICE' ? '#10b981' :
                                                              type.value === 'MULTI_SELECT' ? '#f59e0b' : '#ef4444'
                                                    }}>
                                                      {type.icon}
                                                    </Box>
                                                    <Typography variant="body2">{type.label}</Typography>
                                                  </Stack>
                                                </MenuItem>
                                              ))}
                                            </Select>
                                          </FormControl>
                                          
                                          <Box sx={{ 
                                            p: 2, 
                                            borderRadius: '10px',
                                            backgroundColor: alpha(colors.surface, 0.8),
                                            border: `1px solid ${alpha(colors.border, 0.5)}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                          }}>
                                            <Typography variant="body2" fontWeight={500}>
                                              Required Question
                                            </Typography>
                                            <Switch
                                              checked={question.required}
                                              onChange={(e) => handleUpdateQuestion(questionIndex, 'required', e.target.checked)}
                                              color="primary"
                                              size="small"
                                            />
                                          </Box>
                                        </Box>
                                      </Grid>
                                      
                                      {(question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'MULTI_SELECT') && (
                                        <Grid item xs={12}>
                                          <Box sx={{ 
                                            p: 3, 
                                            borderRadius: '12px',
                                            backgroundColor: alpha(colors.background, 0.7),
                                            border: `1px solid ${alpha(colors.border, 0.7)}`,
                                          }}>
                                            <Typography 
                                              variant="subtitle2" 
                                              sx={{ 
                                                mb: 2, 
                                                display: 'flex', 
                                                alignItems: 'center',
                                                gap: 1,
                                                color: question.questionType === 'MULTIPLE_CHOICE' ? '#10b981' : '#f59e0b',
                                                fontWeight: 600
                                              }}
                                            >
                                              {question.questionType === 'MULTIPLE_CHOICE' ? (
                                                <Box component="span" sx={{ fontSize: '1.2rem' }}>⚪</Box>
                                              ) : (
                                                <Box component="span" sx={{ fontSize: '1.2rem' }}>☑️</Box>
                                              )}
                                              Answer Options
                                            </Typography>
                                            
                                            <Stack spacing={2}>
                                              {question.options?.map((option, optionIndex) => (
                                                <Box
                                                  key={optionIndex}
                                                  sx={{
                                                    p: 0.5,
                                                    borderRadius: '10px',
                                                    backgroundColor: alpha(colors.surface, 0.8),
                                                    border: `1px solid ${alpha(colors.border, 0.5)}`,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    
                                                    '&::before': {
                                                      content: '""',
                                                      position: 'absolute',
                                                      left: 0,
                                                      top: 0,
                                                      bottom: 0,
                                                      width: '3px',
                                                      backgroundColor: question.questionType === 'MULTIPLE_CHOICE' ? '#10b981' : '#f59e0b',
                                                      opacity: 0.7
                                                    }
                                                  }}
                                                >
                                                  <Stack direction="row" spacing={1} alignItems="center">
                                                    <Box sx={{ 
                                                      width: 28, 
                                                      height: 28, 
                                                      display: 'flex',
                                                      alignItems: 'center',
                                                      justifyContent: 'center',
                                                      backgroundColor: alpha(question.questionType === 'MULTIPLE_CHOICE' ? '#10b981' : '#f59e0b', 0.1),
                                                      color: question.questionType === 'MULTIPLE_CHOICE' ? '#10b981' : '#f59e0b',
                                                      borderRadius: question.questionType === 'MULTIPLE_CHOICE' ? '50%' : '6px',
                                                      fontSize: '0.75rem',
                                                      fontWeight: 600,
                                                      ml: 1
                                                    }}>
                                                      {optionIndex + 1}
                                                    </Box>
                                                    
                                                    <StyledTextField
                                                      fullWidth
                                                      placeholder={`Option ${optionIndex + 1}`}
                                                      value={option}
                                                      onChange={(e) => {
                                                        const newOptions = [...question.options];
                                                        newOptions[optionIndex] = e.target.value;
                                                        handleUpdateQuestion(questionIndex, 'options', newOptions);
                                                      }}
                                                      variant="standard"
                                                      InputProps={{
                                                        disableUnderline: true,
                                                        sx: { px: 1 }
                                                      }}
                                                    />
                                                    
                                                    <ActionIconButton
                                                      color="error"
                                                      onClick={() => {
                                                        const newOptions = question.options.filter((_, i) => i !== optionIndex);
                                                        handleUpdateQuestion(questionIndex, 'options', newOptions);
                                                      }}
                                                      disabled={question.options.length <= 1}
                                                      size="small"
                                                      sx={{ mr: 1 }}
                                                    >
                                                      <Delete fontSize="small" />
                                                    </ActionIconButton>
                                                  </Stack>
                                                </Box>
                                              ))}
                                              
                                              <ActionButton
                                                variant="outlined"
                                                startIcon={<Add />}
                                                onClick={() => {
                                                  const newOptions = [...(question.options || []), `Option ${question.options.length + 1}`];
                                                  handleUpdateQuestion(questionIndex, 'options', newOptions);
                                                }}
                                                size="small"
                                                sx={{
                                                  borderStyle: 'dashed',
                                                  borderColor: alpha(question.questionType === 'MULTIPLE_CHOICE' ? '#10b981' : '#f59e0b', 0.5),
                                                  color: question.questionType === 'MULTIPLE_CHOICE' ? '#10b981' : '#f59e0b',
                                                  backgroundColor: alpha(question.questionType === 'MULTIPLE_CHOICE' ? '#10b981' : '#f59e0b', 0.05),
                                                  
                                                  '&:hover': {
                                                    backgroundColor: alpha(question.questionType === 'MULTIPLE_CHOICE' ? '#10b981' : '#f59e0b', 0.1),
                                                    borderColor: alpha(question.questionType === 'MULTIPLE_CHOICE' ? '#10b981' : '#f59e0b', 0.7),
                                                  }
                                                }}
                                              >
                                                Add Option
                                              </ActionButton>
                                            </Stack>
                                          </Box>
                                        </Grid>
                                      )}
                                    </Grid>
                                  </Box>
                                </AccordionDetails>
                              </FuturisticAccordion>
                            </DraggableAccordion>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Empty state when no questions */}
                      {formBuilder.pages[currentPageIndex].questions.length === 0 && (
                        <Box 
                          sx={{ 
                            p: 4, 
                            textAlign: 'center',
                            border: `1px dashed ${colors.border}`,
                            borderRadius: '12px',
                            backgroundColor: alpha(colors.background, 0.5)
                          }}
                        >
                          <Typography color="text.secondary" mb={2}>
                            Drag questions here or add a new question
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}
                </Droppable>
              </DragDropContext>
              
              {/* Add Question Button */}
              <Box textAlign="center" py={3}>
                <ActionButton
                  variant="outlined"
                  size="large"
                  startIcon={<Add />}
                  onClick={() => setAddQuestionDialogOpen(true)}
                >
                  Add Question
                </ActionButton>
              </Box>
              
              {/* Move to Page Popover */}
              <Popover
                open={Boolean(moveQuestionAnchorEl)}
                anchorEl={moveQuestionAnchorEl}
                onClose={handleCloseMoveMenu}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                PaperProps={{
                  sx: {
                    p: 1,
                    width: 250,
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
                  }
                }}
              >
                <Typography variant="subtitle2" sx={{ p: 2, pb: 1 }}>
                  Move to page:
                </Typography>
                <List sx={{ p: 0 }}>
                  {formBuilder.pages.map((page, pageIndex) => (
                    pageIndex !== currentPageIndex && (
                      <ListItem 
                        key={page.pageId}
                        button
                        onClick={() => handleMoveQuestionToPage(pageIndex)}
                        sx={{
                          borderRadius: '8px',
                          mb: 0.5,
                          '&:hover': {
                            backgroundColor: alpha(colors.primary, 0.1)
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Assignment fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={page.pageTitle} 
                          secondary={`${page.questions?.length || 0} questions`}
                          primaryTypographyProps={{
                            variant: 'body2',
                            fontWeight: 600
                          }}
                          secondaryTypographyProps={{
                            variant: 'caption'
                          }}
                        />
                      </ListItem>
                    )
                  ))}
                </List>
              </Popover>
            </Box>
          )}
        </Box>
      </ModernCard>

      {/* Add Question Dialog */}
      <Dialog 
        open={addQuestionDialogOpen} 
        onClose={() => setAddQuestionDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '20px', overflow: 'hidden' }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          color: colors.text.inverse,
          fontWeight: 700,
          p: 3
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Add />
            <Typography variant="h6" fontWeight={700}>
              Add New Question
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="body1" mb={3}>
            Choose a question type to add to your form:
          </Typography>
          <Grid container spacing={2}>
            {questionTypes.map((type) => (
              <Grid item xs={12} sm={6} key={type.value}>
                <QuestionTypeCard 
                  selected={selectedQuestionType === type.value}
                  onClick={() => setSelectedQuestionType(type.value)}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Typography variant="h4">{type.icon}</Typography>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {type.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {type.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </QuestionTypeCard>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <ActionButton 
            onClick={() => setAddQuestionDialogOpen(false)}
            variant="outlined"
            color="secondary"
          >
            Cancel
          </ActionButton>
          <ActionButton 
            onClick={handleAddQuestion}
            variant="contained"
            color="primary"
            startIcon={<Add />}
          >
            Add Question
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

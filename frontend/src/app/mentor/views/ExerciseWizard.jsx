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
  DialogContentText,
  DialogActions,
  Alert,
  Chip,
  Stack
} from "@mui/material";
import { Breadcrumb } from "app/components";
import { H4 } from "app/components/Typography";
import { 
  Save, 
  Lock, 
  LockOpen, 
  Warning, 
  Assignment,
  Schedule,
  DashboardCustomize,
  AutoAwesome 
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import useAuth from "app/hooks/useAuth";
import { useAxios } from "app/contexts/AxiosContext";
import { useAlert } from "app/contexts/AlertContext";
import { v4 as uuidv4 } from "uuid";
import ExercisePageManager from "../components/ExercisePageManager";
import ExerciseToolManager from "../components/ExerciseToolManager";
import { 
  ActionButton, 
  StyledTextField, 
  SectionTitle, 
  ModernCard, 
  Container,
  StatusBadge,
  colors 
} from "../components/ExerciseStyledComponents";
import { Editor } from '@tinymce/tinymce-react';

// Header component for better visual hierarchy
const ExerciseHeader = styled(Box)(({ theme }) => ({
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

const EditorLabel = styled(Typography)(({ theme }) => ({
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: colors.text.secondary,
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const ActionBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 0',
  borderBottom: `1px solid ${colors.border}`,
  marginBottom: '32px',
  
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'stretch',
  }
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
  
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    width: '100%',
  }
}));

export default function ExerciseWizard() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const axiosInstance = useAxios();
  const { showAlert } = useAlert();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locking, setLocking] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
  const [unlockConfirmOpen, setUnlockConfirmOpen] = useState(false);
  const [exercise, setExercise] = useState({
    id: null,
    pages: [{
      index: 0,
      tools: [],
      displayImages: [],
      displayImageDescriptions: [],
      files: [],
      displayText: "",
      timerSeconds: 0,
      extractionPrompt: ""
    }],
    activityId: null,
    extractionPrompt: "",
    isLocked: false
  });

  // Get activityId from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const activityId = urlParams.get('activityId');

  // Effects
  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);

        if (exerciseId === 'new') {
          // Create new exercise
          if (!activityId) {
            showAlert('Activity ID is required to create a new exercise', 'error');
            navigate(-1);
            return;
          }

          const response = await axiosInstance.post(`/api/exercise/${activityId}`);
          setExercise(response.data);
        } else {
          // Fetch existing exercise
          const response = await axiosInstance.get(`/api/exercise/${exerciseId}`);
          setExercise(response.data);
        }
      } catch (error) {
        console.error('Error fetching exercise:', error);
        showAlert('Failed to load exercise data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, []);

  // Handlers
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await axiosInstance.put('/api/exercise', exercise);
      setExercise(response.data);
      showAlert('Exercise saved successfully', 'success');
    } catch (error) {
      console.error('Error saving exercise:', error);
      showAlert('Failed to save exercise', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLock = () => {
    setLockConfirmOpen(true);
  };

  const handleLockConfirm = async () => {
    setLockConfirmOpen(false);
    try {
      setLocking(true);
      const response = await axiosInstance.get(`/api/exercise/lock/${exercise.id}`);
      if (response.data) {
        setExercise(prev => ({ ...prev, isLocked: true }));
        showAlert('Exercise locked successfully. It is now shared with coachees/respondents.', 'success');
      } else {
        showAlert('Failed to lock exercise', 'error');
      }
    } catch (error) {
      console.error('Error locking exercise:', error);
      showAlert('Failed to lock exercise', 'error');
    } finally {
      setLocking(false);
    }
  };

  const handleLockCancel = () => {
    setLockConfirmOpen(false);
  };

  const handleUnlock = () => {
    setUnlockConfirmOpen(true);
  };

  const handleUnlockConfirm = async () => {
    setUnlockConfirmOpen(false);
    try {
      setUnlocking(true);
      const response = await axiosInstance.get(`/api/exercise/unlock/${exercise.id}`);
      if (response.data) {
        setExercise(prev => ({ ...prev, isLocked: false }));
        showAlert('Exercise unlocked successfully. Warning: All coachee progress will be lost.', 'warning');
      } else {
        showAlert('Failed to unlock exercise', 'error');
      }
    } catch (error) {
      console.error('Error unlocking exercise:', error);
      showAlert('Failed to unlock exercise', 'error');
    } finally {
      setUnlocking(false);
    }
  };

  const handleUnlockCancel = () => {
    setUnlockConfirmOpen(false);
  };

  const handleAddPage = () => {
    const newPages = [...exercise.pages];
    newPages.push({
      index: newPages.length,
      tools: [],
      displayImages: [],
      displayImageDescriptions: [],
      files: [],
      displayText: "",
      timerSeconds: 0,
      extractionPrompt: ""
    });

    setExercise({
      ...exercise,
      pages: newPages
    });

    setCurrentPage(newPages.length - 1);
  };

  const handleDeletePage = (pageIndex) => {
    if (exercise.pages.length <= 1) {
      showAlert('Exercise must have at least one page', 'warning');
      return;
    }

    const newPages = exercise.pages.filter((_, index) => index !== pageIndex);
    newPages.forEach((page, idx) => {
      page.index = idx;
    });

    setExercise({
      ...exercise,
      pages: newPages
    });

    if (currentPage >= newPages.length) {
      setCurrentPage(Math.max(0, newPages.length - 1));
    }
  };

  const handleUpdatePage = (pageIndex, updatedPage) => {
    console.log('Updating page:', pageIndex, updatedPage);
    const newPages = [...exercise.pages];
    newPages[pageIndex] = updatedPage;

    setExercise({
      ...exercise,
      pages: newPages
    });
  };

  const handleAddTool = (toolType) => {
    const newPages = [...exercise.pages];
    const currentPageTools = newPages[currentPage].tools;

    const newTool = {
      index: currentPageTools.length,
      toolType: toolType,
      chatBotInstructions: toolType === 'CHAT_BOT' ? "Ask me anything about this topic..." : "",
      maxChatCount: toolType === 'CHAT_BOT' ? null : null,
      placeholderText: "Enter your response here...",
      uniqueName: `${toolType.toLowerCase()}_${uuidv4().substring(0, 8)}`,
      options: (toolType === 'MCQ_SINGLE' || toolType === 'MCQ_MULTISELECT') ? ['Option 1', 'Option 2'] : []
    };

    currentPageTools.push(newTool);

    setExercise({
      ...exercise,
      pages: newPages
    });
  };

  const handleDeleteTool = (toolIndex) => {
    const newPages = [...exercise.pages];
    const currentPageTools = newPages[currentPage].tools.filter((_, index) => index !== toolIndex);

    currentPageTools.forEach((tool, idx) => {
      tool.index = idx;
    });

    newPages[currentPage].tools = currentPageTools;

    setExercise({
      ...exercise,
      pages: newPages
    });
  };

  const handleUpdateTool = (toolIndex, field, value) => {
    const newPages = [...exercise.pages];
    newPages[currentPage].tools[toolIndex][field] = value;

    setExercise({
      ...exercise,
      pages: newPages
    });
  };

  const handleReorderTools = (sourceIndex, destinationIndex) => {
    const newPages = [...exercise.pages];
    const currentPageTools = [...newPages[currentPage].tools];

    const [movedTool] = currentPageTools.splice(sourceIndex, 1);
    currentPageTools.splice(destinationIndex, 0, movedTool);

    currentPageTools.forEach((tool, idx) => {
      tool.index = idx;
    });

    newPages[currentPage].tools = currentPageTools;

    setExercise({
      ...exercise,
      pages: newPages
    });
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
          { name: 'Exercise Builder' }
        ]} />
      </Box>

      {/* Enhanced Header */}
      <ExerciseHeader>
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
                Exercise Builder
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  opacity: 0.9,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSize: '1rem'
                }}
              >
                Create engaging exercises with interactive tools and content
              </Typography>
            </Box>
            <StatusBadge status={exercise.isLocked ? 'locked' : 'draft'}>
              {exercise.isLocked ? (
                <>
                  <Lock sx={{ fontSize: '14px' }} />
                  Locked
                </>
              ) : (
                <>
                  <DashboardCustomize sx={{ fontSize: '14px' }} />
                  Draft
                </>
              )}
            </StatusBadge>
          </Stack>
          
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip
              icon={<Schedule />}
              label={`${exercise.pages?.length || 1} ${exercise.pages?.length === 1 ? 'Page' : 'Pages'}`}
              size="small"
              sx={{
                backgroundColor: alpha(colors.text.inverse, 0.15),
                color: colors.text.inverse,
                fontWeight: 600,
                border: `1px solid ${alpha(colors.text.inverse, 0.3)}`
              }}
            />
            <Chip
              icon={<DashboardCustomize />}
              label={`${exercise.pages?.[currentPage]?.tools?.length || 0} Tools`}
              size="small"
              sx={{
                backgroundColor: alpha(colors.text.inverse, 0.15),
                color: colors.text.inverse,
                fontWeight: 600,
                border: `1px solid ${alpha(colors.text.inverse, 0.3)}`
              }}
            />
          </Stack>
        </Box>
      </ExerciseHeader>

      <ModernCard elevation={2} sx={{ overflow: 'visible' }}>
        <Box p={4}>
          {/* Action Bar */}
          <ActionBar>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 600,
                color: colors.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <AutoAwesome sx={{ color: colors.primary }} />
              Exercise Configuration
            </Typography>
            
            <ButtonGroup>
              <ActionButton
                variant="outlined"
                color="secondary"
                onClick={() => navigate(-1)}
              >
                Cancel
              </ActionButton>
              <ActionButton
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving || exercise.isLocked}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
              >
                {saving ? 'Saving...' : 'Save Exercise'}
              </ActionButton>
              {exercise.isLocked ? (
                <ActionButton
                  variant="contained"
                  color="warning"
                  onClick={handleUnlock}
                  disabled={unlocking}
                  startIcon={unlocking ? <CircularProgress size={18} color="inherit" /> : <LockOpen />}
                >
                  {unlocking ? 'Unlocking...' : 'Unlock Exercise'}
                </ActionButton>
              ) : (
                <ActionButton
                  variant="contained"
                  color="secondary"
                  onClick={handleLock}
                  disabled={locking || !exercise.id || exercise.isLocked}
                  startIcon={locking ? <CircularProgress size={18} color="inherit" /> : <Lock />}
                >
                  {locking ? 'Locking...' : 'Lock Exercise'}
                </ActionButton>
              )}
            </ButtonGroup>
          </ActionBar>

          {exercise.isLocked && (
            <Alert 
              severity="warning" 
              icon={<Lock />}
              sx={{ 
                mb: 4,
                borderRadius: '12px',
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                backgroundColor: alpha(colors.warning, 0.05),
                borderColor: alpha(colors.warning, 0.2),
                '& .MuiAlert-icon': {
                  color: colors.warning
                }
              }}
            >
              <Typography variant="body2" fontWeight={600}>
                Exercise is locked and live with respondents
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.8 }}>
                No edits can be made while locked. Unlock to make changes (all progress will be lost).
              </Typography>
            </Alert>
          )}

          {/* Exercise Details Section */}
          <Grid container spacing={4}>
            <Grid item xs={12} lg={12}>
              <Box mb={4}>
                <SectionTitle variant="h6">
                  <Assignment sx={{ fontSize: '1.2rem', mr: 1, color: colors.primary }} />
                  Exercise Details
                </SectionTitle>
                <EditorLabel>
                  <Assignment />
                  Details and outline for respondents
                </EditorLabel>
                <EditorContainer>
                  <Editor
                    tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                    value={exercise.details || ''}
                    onEditorChange={(content) => setExercise({...exercise, details: content})}
                    disabled={exercise.isLocked}
                    init={{
                      height: 220,
                      menubar: false,
                      plugins: [
                        'lists', 'link', 'autolink', 'autoresize'
                      ],
                      toolbar: 'undo redo | formatselect | ' +
                        'bold italic | bullist numlist | ' +
                        'removeformat',
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
                      autoresize_min_height: 220,
                      autoresize_max_height: 400,
                      statusbar: true,
                      elementpath: false,
                      placeholder: 'Provide exercise details and outline for respondents...'
                    }}
                  />
                </EditorContainer>
              </Box>
            </Grid>

            <Grid item xs={12} lg={12}>
              <Box mb={4}>
                <SectionTitle variant="h6">
                  <AutoAwesome sx={{ fontSize: '1.2rem', mr: 1, color: colors.secondary }} />
                  AI Evaluation Instructions
                </SectionTitle>
                <EditorLabel>
                  <AutoAwesome />
                  Instructions for the LLM evaluation
                </EditorLabel>
                <EditorContainer>
                  <Editor
                    tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                    value={exercise.extractionPrompt || ''}
                    onEditorChange={(content) => setExercise({...exercise, extractionPrompt: content})}
                    disabled={exercise.isLocked}
                    init={{
                      height: 220,
                      menubar: false,
                      plugins: [
                        'lists', 'link', 'autolink', 'autoresize'
                      ],
                      toolbar: 'undo redo | formatselect | ' +
                        'bold italic | bullist numlist | ' +
                        'removeformat',
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
                      autoresize_min_height: 220,
                      autoresize_max_height: 400,
                      statusbar: true,
                      elementpath: false,
                      placeholder: 'Provide instructions for the LLM on how to evaluate this exercise...'
                    }}
                  />
                </EditorContainer>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <ExercisePageManager
            pages={exercise.pages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
            onUpdatePage={handleUpdatePage}
            disabled={exercise.isLocked}
          />

          <ExerciseToolManager
            tools={exercise.pages[currentPage].tools}
            onAddTool={handleAddTool}
            onDeleteTool={handleDeleteTool}
            onUpdateTool={handleUpdateTool}
            onReorderTools={handleReorderTools}
            disabled={exercise.isLocked}
          />
        </Box>
      </ModernCard>

      {/* Enhanced Lock Confirmation Dialog */}
      <Dialog
        open={lockConfirmOpen}
        onClose={handleLockCancel}
        aria-labelledby="lock-dialog-title"
        aria-describedby="lock-dialog-description"
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle id="lock-dialog-title" sx={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
          color: colors.text.inverse,
          fontWeight: 700,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '1.25rem',
          p: 3
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              backgroundColor: alpha(colors.text.inverse, 0.2),
              borderRadius: '12px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock sx={{ fontSize: '1.5rem' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Lock Exercise
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Share with respondents and prevent further edits
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="body1" paragraph sx={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: colors.text.primary,
            fontSize: '1rem',
            mb: 3
          }}>
            You are about to lock this exercise. This action will:
          </Typography>
          <Box sx={{ 
            backgroundColor: alpha(colors.primary, 0.05),
            borderRadius: '12px',
            p: 3,
            mb: 3,
            borderLeft: `4px solid ${colors.primary}`
          }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: colors.success
                }} />
                <Typography variant="body2" sx={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: colors.text.primary
                }}>
                  Share the exercise with all coachees/respondents
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: colors.warning
                }} />
                <Typography variant="body2" sx={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: colors.text.primary
                }}>
                  Prevent any further editing of the exercise
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: colors.info
                }} />
                <Typography variant="body2" sx={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: colors.text.primary
                }}>
                  Allow coachees to start working on the exercise
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Typography variant="body1" fontWeight="600" sx={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: colors.text.primary
          }}>
            Are you sure you want to proceed?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <ActionButton 
            onClick={handleLockCancel} 
            variant="outlined"
            color="secondary"
            sx={{ mr: 2 }}
          >
            Cancel
          </ActionButton>
          <ActionButton 
            onClick={handleLockConfirm}
            disabled={locking}
            variant="contained"
            color="primary"
            autoFocus
            startIcon={locking ? <CircularProgress size={18} color="inherit" /> : <Lock />}
          >
            {locking ? 'Locking...' : 'Lock Exercise'}
          </ActionButton>
        </DialogActions>
      </Dialog>

      {/* Enhanced Unlock Confirmation Dialog */}
      <Dialog
        open={unlockConfirmOpen}
        onClose={handleUnlockCancel}
        aria-labelledby="unlock-dialog-title"
        aria-describedby="unlock-dialog-description"
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle id="unlock-dialog-title" sx={{ 
          background: `linear-gradient(135deg, ${colors.warning} 0%, ${colors.error} 100%)`,
          color: colors.text.inverse,
          fontWeight: 700,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: '1.25rem',
          p: 3
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{
              backgroundColor: alpha(colors.text.inverse, 0.2),
              borderRadius: '12px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Warning sx={{ fontSize: '1.5rem' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                Unlock Exercise
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Remove from respondents and enable editing
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Typography variant="body1" paragraph sx={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: colors.text.primary,
            fontSize: '1rem',
            mb: 3
          }}>
            You are about to unlock this exercise. This action will:
          </Typography>
          <Box sx={{ 
            backgroundColor: alpha(colors.error, 0.05),
            borderRadius: '12px',
            p: 3,
            mb: 3,
            borderLeft: `4px solid ${colors.error}`
          }}>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: colors.error
                }} />
                <Typography variant="body2" sx={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: colors.text.primary,
                  fontWeight: 600
                }}>
                  DELETE ALL COACHEE PROGRESS - This cannot be undone
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: colors.warning
                }} />
                <Typography variant="body2" sx={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: colors.text.primary
                }}>
                  Remove the exercise from coachees/respondents
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: colors.success
                }} />
                <Typography variant="body2" sx={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  color: colors.text.primary
                }}>
                  Allow you to edit the exercise again
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              backgroundColor: alpha(colors.error, 0.1),
              border: `1px solid ${alpha(colors.error, 0.2)}`,
              '& .MuiAlert-icon': {
                color: colors.error
              }
            }}
          >
            <Typography variant="body2" fontWeight="bold" sx={{
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
              Critical Warning: All coachee responses and progress will be permanently lost!
            </Typography>
          </Alert>
          <Typography variant="body1" fontWeight="600" sx={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: colors.text.primary
          }}>
            Are you sure you want to proceed?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 0 }}>
          <ActionButton 
            onClick={handleUnlockCancel} 
            variant="outlined"
            color="secondary"
            sx={{ mr: 2 }}
          >
            Cancel
          </ActionButton>
          <ActionButton 
            onClick={handleUnlockConfirm}
            disabled={unlocking}
            variant="contained"
            color="error"
            autoFocus
            startIcon={unlocking ? <CircularProgress size={18} color="inherit" /> : <LockOpen />}
          >
            {unlocking ? 'Unlocking...' : 'Unlock Exercise'}
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
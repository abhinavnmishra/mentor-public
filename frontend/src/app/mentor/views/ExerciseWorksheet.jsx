import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
  styled,
  LinearProgress,
  Chip,
  Fade,
  Tooltip,
  Avatar,
  Badge,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Breadcrumb } from 'app/components';
import { H4 } from 'app/components/Typography';
import {
  Save,
  Send,
  NavigateNext,
  NavigateBefore,
  Description,
  CheckCircle,
  Warning,
  Timer,
  OpenInNew,
  Assignment,
  PlayCircle,
  PauseCircle,
  Image as ImageIcon,
  Folder,
  Task,
  Schedule,
  Done,
  InsertDriveFile,
  AutoAwesome,
  AutoFixHigh
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from 'app/hooks/useAuth';
import { useAxios } from 'app/contexts/AxiosContext';
import { useAlert } from 'app/contexts/AlertContext';
import ToolFactory from '../components/exercise-tools/ToolFactory';
import ExerciseTimer from '../components/exercise-tools/ExerciseTimer';
import { 
  colors, 
  ActionButton, 
  ModernCard, 
  Container, 
  SectionTitle,
  StatusBadge 
} from '../components/ExerciseStyledComponents';

// Enhanced styled components with better visual hierarchy
const ExerciseHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
  borderRadius: '20px',
  padding: '32px',
  marginBottom: '32px',
  color: colors.text.inverse,
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    right: '-20%',
    width: '200px',
    height: '200px',
    background: `radial-gradient(circle, ${alpha(colors.text.inverse, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
  }
}));

const ProgressCard = styled(ModernCard)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.surface} 0%, ${alpha(colors.primary, 0.02)} 100%)`,
  border: `1px solid ${alpha(colors.primary, 0.1)}`,
  marginBottom: '24px',
}));

const ContentSection = styled(Box)(({ theme }) => ({
  background: colors.surface,
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  marginBottom: '24px',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    borderColor: colors.borderHover,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  padding: '20px 24px',
  borderBottom: `1px solid ${colors.border}`,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: alpha(colors.background, 0.3),
}));

const SectionContent = styled(Box)(({ theme }) => ({
  padding: '24px',
}));

const ResourceCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
  marginBottom: '12px',
  background: colors.surface,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  
  '&:hover': {
    backgroundColor: alpha(colors.primary, 0.02),
    borderColor: colors.primary,
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${alpha(colors.primary, 0.1)}`,
  }
}));

const ImageGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '16px',
  marginBottom: '16px',
}));

const ImageCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `2px solid ${colors.border}`,
  
  '&:hover': {
    borderColor: colors.primary,
    transform: 'scale(1.02)',
    boxShadow: `0 8px 25px ${alpha(colors.primary, 0.15)}`,
  },
  
  '& img': {
    width: '100%',
    height: '150px',
    objectFit: 'cover',
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(45deg, transparent 60%, ${alpha(colors.primary, 0.1)} 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  
  '&:hover::after': {
    opacity: 1,
  }
}));

const NavigationFooter = styled(Box)(({ theme }) => ({
  background: colors.surface,
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  padding: '24px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: '32px',
  position: 'sticky',
  bottom: '24px',
  zIndex: 10,
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
}));

export default function ExerciseWorksheet() {
  const { exerciseResponseId } = useParams();
  const navigate = useNavigate();
  const axiosInstance = useAxios();
  const { showAlert } = useAlert();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [exerciseResponse, setExerciseResponse] = useState({
    id: null,
    milestoneTrackerId: null,
    exerciseId: null,
    evaluationText: '',
    details: '',
    status: 'PAUSED',
    pages: []
  });
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveTimerRef = useRef(null);
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  // Fetch exercise response data
  useEffect(() => {
    const fetchExerciseResponse = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/exercise/response/${exerciseResponseId}`);
        setExerciseResponse(response.data);
      } catch (error) {
        console.error('Error fetching exercise response:', error);
        showAlert('Failed to load exercise data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseResponse();
  }, [exerciseResponseId]);

  // Handle tool response change
  const handleToolResponseChange = useCallback((pageIndex, toolName, value, isChatBot = false) => {
    setExerciseResponse(prev => {
      const updatedPages = [...prev.pages];
      const page = { ...updatedPages[pageIndex] };
      const toolIndex = page.tools.findIndex(tool => tool.uniqueName === toolName);
      
      if (toolIndex !== -1) {
        const updatedTools = [...page.tools];
        
        // Handle chat bot tool differently
        if (isChatBot) {
          console.log('Updating chat bot messages for tool:', toolName);
          updatedTools[toolIndex] = {
            ...updatedTools[toolIndex],
            messages: value,
            chatInitiated: true
          };
        } else {
          console.log('Updating tool response for tool:', toolName, 'with value:', value);
          updatedTools[toolIndex] = {
            ...updatedTools[toolIndex],
            response: value
          };
        }
        
        page.tools = updatedTools;
        updatedPages[pageIndex] = page;
      }
      
      return {
        ...prev,
        pages: updatedPages
      };
    });
  }, []);

  // Navigation handlers
  const handleNext = () => {
    setActiveStep(prevStep => Math.min(prevStep + 1, exerciseResponse.pages.length - 1));
  };

  const handleBack = () => {
    setActiveStep(prevStep => Math.max(prevStep - 1, 0));
  };

  // Auto-save functionality
  useEffect(() => {
    // Clear existing timer when component unmounts or autoSaveEnabled changes
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, []);

  // Set up auto-save timer when enabled
  useEffect(() => {
    if (autoSaveEnabled && !loading) {
      // Clear any existing timer
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
      
      // Set new timer for auto-save every 10 seconds
      autoSaveTimerRef.current = setInterval(async () => {
        try {
          const response = await axiosInstance.put('/api/exercise/response/save', exerciseResponse);
          // Update state with the returned response object
          if (response && response.data) {
            setExerciseResponse(response.data);
          }
          const now = new Date();
          setLastSaved(now);
          console.log('Auto-saved at', now.toLocaleTimeString());
        } catch (error) {
          console.error('Error auto-saving progress:', error);
          // Don't show alerts for auto-save failures to avoid disrupting the user
        }
      }, 10000); // 10 seconds
    } else if (!autoSaveEnabled && autoSaveTimerRef.current) {
      // Clear timer when auto-save is disabled
      clearInterval(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [autoSaveEnabled, exerciseResponse, loading, axiosInstance]);
  
  // Toggle auto-save
  const handleToggleAutoSave = () => {
    setAutoSaveEnabled(prev => !prev);
  };

  // Save progress
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await axiosInstance.put('/api/exercise/response/save', exerciseResponse);
      // Update state with the returned response object
      if (response && response.data) {
        setExerciseResponse(response.data);
      }
      const now = new Date();
      setLastSaved(now);
      showAlert('Progress saved successfully', 'success');
    } catch (error) {
      console.error('Error saving progress:', error);
      showAlert('Failed to save progress', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Submit exercise
  const handleSubmit = async () => {
    // Prevent submission if already completed
    if (exerciseResponse.status === 'COMPLETED') {
      showAlert('This exercise has already been submitted', 'warning');
      setSubmitDialogOpen(false);
      return;
    }
    
    try {
      setSubmitting(true);
      const response = await axiosInstance.put('/api/exercise/response/submit', exerciseResponse);
      // Update state with the returned response object
      if (response && response.data) {
        setExerciseResponse(response.data);
      }
      showAlert('Exercise submitted successfully', 'success');
      setSubmitDialogOpen(false);
      // Navigate back to milestone tracker or dashboard
      navigate(-1);
    } catch (error) {
      console.error('Error submitting exercise:', error);
      showAlert('Failed to submit exercise', 'error');
      setSubmitDialogOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Image preview handlers
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setImageDialogOpen(true);
  };

  const handleImageDialogClose = () => {
    setImageDialogOpen(false);
  };

  // File open handler
  const handleFileOpen = (fileUrl) => {
    // Open the file in a new tab
    window.open(fileUrl, '_blank');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const currentPage = exerciseResponse.pages[activeStep];
  const isLastPage = activeStep === exerciseResponse.pages.length - 1;

  return (
    <Container>
      <Box mb={4}>
        <Breadcrumb routeSegments={[
          { name: 'Portal', path: '/portal/dashboard' },
          { name: 'Exercise Worksheet' }
        ]} />
      </Box>

      {/* Exercise Header */}
      <ExerciseHeader>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box flex={1} pr={3}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                mb: 2,
                color: colors.text.inverse
              }}
            >
              Exercise Worksheet
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: alpha(colors.text.inverse, 0.9),
                lineHeight: 1.6
              }}
              dangerouslySetInnerHTML={{ __html: exerciseResponse.details || 'Complete this exercise to track your progress' }}
            />
            
            {/* Auto-save toggle */}
            <Box mt={2} display="flex" alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSaveEnabled}
                    onChange={handleToggleAutoSave}
                    size="small"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: colors.text.inverse,
                        '&:hover': {
                          backgroundColor: alpha(colors.text.inverse, 0.1),
                        },
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: alpha(colors.text.inverse, 0.5),
                      },
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <AutoFixHigh sx={{ fontSize: '1rem', color: colors.text.inverse }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text.inverse,
                        fontWeight: 500,
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    >
                      Auto-save
                    </Typography>
                  </Box>
                }
                sx={{ mr: 2 }}
              />
              {lastSaved && (
                <Typography
                  variant="caption"
                  sx={{
                    color: alpha(colors.text.inverse, 0.8),
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  Last saved: {lastSaved.toLocaleTimeString()}
                </Typography>
              )}
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Tooltip title="Save your progress">
              <ActionButton
                variant="outlined"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                sx={{
                  backgroundColor: alpha(colors.text.inverse, 0.1),
                  borderColor: alpha(colors.text.inverse, 0.3),
                  color: colors.text.inverse,
                  '&:hover': {
                    backgroundColor: alpha(colors.text.inverse, 0.2),
                    borderColor: colors.text.inverse,
                  }
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </ActionButton>
            </Tooltip>
            <Tooltip title={exerciseResponse.status === 'COMPLETED' ? 'Exercise already submitted' : 'Submit completed exercise'}>
              <span>
                <ActionButton
                  variant="contained"
                  onClick={() => setSubmitDialogOpen(true)}
                  disabled={submitting || exerciseResponse.status === 'COMPLETED'}
                  startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                  sx={{
                    backgroundColor: colors.text.inverse,
                    color: colors.primary,
                    '&:hover': {
                      backgroundColor: alpha(colors.text.inverse, 0.9),
                    },
                    '&.Mui-disabled': {
                      backgroundColor: alpha(colors.text.inverse, 0.5),
                      color: alpha(colors.primary, 0.7),
                    }
                  }}
                >
                  {submitting ? 'Submitting...' : exerciseResponse.status === 'COMPLETED' ? 'Submitted' : 'Submit'}
                </ActionButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {/* Status Badge */}
        <Box display="flex" alignItems="center" gap={2}>
          <StatusBadge status={exerciseResponse.status?.toLowerCase() || 'active'}>
            {exerciseResponse.status === 'COMPLETED' ? <CheckCircle sx={{ fontSize: '1rem' }} /> : <Schedule sx={{ fontSize: '1rem' }} />}
            {exerciseResponse.status || 'In Progress'}
          </StatusBadge>
          <Typography variant="body2" sx={{ color: alpha(colors.text.inverse, 0.8) }}>
            Page {activeStep + 1} of {exerciseResponse.pages.length}
          </Typography>
        </Box>
      </ExerciseHeader>

      {/* Progress Indicator */}
      <ProgressCard sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: colors.text.primary
            }}
          >
            Exercise Progress
          </Typography>
          <Chip
            label={`${Math.round(((activeStep + 1) / exerciseResponse.pages.length) * 100)}% Complete`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={(activeStep + 1) / exerciseResponse.pages.length * 100}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: alpha(colors.primary, 0.1),
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            }
          }}
        />
        
        <Box mt={2}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {exerciseResponse.pages.map((page, index) => (
              <Step key={index}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: completed ? colors.success : active ? colors.primary : colors.border,
                        color: completed || active ? colors.text.inverse : colors.text.secondary,
                        fontSize: '0.875rem',
                        fontWeight: 600
                      }}
                    >
                      {completed ? <Done /> : index + 1}
                    </Avatar>
                  )}
                >
                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                    Page {index + 1}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </ProgressCard>

      {/* Current Page Content */}
      <Fade in={true} timeout={300}>
        <Box>
          {/* Timer Section */}
          {currentPage.timerSeconds > 0 && (
            <ContentSection>
              <SectionHeader>
                <Timer sx={{ color: colors.warning }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Exercise Timer
                </Typography>
              </SectionHeader>
              <SectionContent>
                <Box display="flex" justifyContent="center">
                  <ExerciseTimer 
                    seconds={currentPage.timerSeconds} 
                    onComplete={() => {
                      showAlert('Time is up! Please complete your responses.', 'warning');
                    }}
                  />
                </Box>
              </SectionContent>
            </ContentSection>
          )}

          {/* Exercise Instructions */}
          <ContentSection>
            <SectionHeader>
              <Assignment sx={{ color: colors.info }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
                Instructions
              </Typography>
            </SectionHeader>
            <SectionContent>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  lineHeight: 1.7,
                  color: colors.text.primary
                }}
                dangerouslySetInnerHTML={{ __html: currentPage.displayText || 'Follow the instructions below to complete this exercise.' }}
              />
            </SectionContent>
          </ContentSection>

          {/* Display Images */}
          {currentPage.displayImages && currentPage.displayImages.length > 0 && (
            <ContentSection>
              <SectionHeader>
                <ImageIcon sx={{ color: colors.tools.media }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Reference Images
                </Typography>
                <Chip
                  label={`${currentPage.displayImages.length} image${currentPage.displayImages.length > 1 ? 's' : ''}`}
                  size="small"
                  variant="outlined"
                />
              </SectionHeader>
              <SectionContent>
                <ImageGrid>
                  {currentPage.displayImages.map((image, index) => (
                    <ImageCard
                      key={index}
                      onClick={() => handleImageClick(`${backendBaseUrl}/public/${image}`)}
                    >
                      <img
                        src={`${backendBaseUrl}/public/${image}`}
                        alt={`Reference ${index + 1}`}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          right: 8,
                          background: alpha(colors.surface, 0.9),
                          borderRadius: '6px',
                          padding: '4px 8px',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {index + 1}
                        </Typography>
                      </Box>
                    </ImageCard>
                  ))}
                </ImageGrid>
              </SectionContent>
            </ContentSection>
          )}

          {/* Resource Files */}
          {currentPage.files && currentPage.files.length > 0 && (
            <ContentSection>
              <SectionHeader>
                <Folder sx={{ color: colors.tools.interactive }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Resource Files
                </Typography>
                <Chip
                  label={`${currentPage.files.length} file${currentPage.files.length > 1 ? 's' : ''}`}
                  size="small"
                  variant="outlined"
                />
              </SectionHeader>
              <SectionContent>
                {currentPage.files.map((file, index) => (
                  <ResourceCard
                    key={index}
                    onClick={() => handleFileOpen(`${backendBaseUrl}/public/${file}`)}
                  >
                    <Avatar sx={{ backgroundColor: alpha(colors.primary, 0.1) }}>
                      <InsertDriveFile sx={{ color: colors.primary }} />
                    </Avatar>
                    <Box flex={1}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          color: colors.text.primary
                        }}
                      >
                        Resource File {index + 1}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.text.secondary,
                          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        }}
                      >
                        Click to open in new tab
                      </Typography>
                    </Box>
                    <OpenInNew sx={{ color: colors.text.secondary }} />
                  </ResourceCard>
                ))}
              </SectionContent>
            </ContentSection>
          )}

          {/* Tools/Response Section */}
          {currentPage.tools && currentPage.tools.length > 0 && (
            <ContentSection>
              <SectionHeader>
                <Task sx={{ color: colors.tools.assessment }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: colors.text.primary }}>
                  Your Response
                </Typography>
                {exerciseResponse.status === 'COMPLETED' && (
                  <Chip
                    label="Completed"
                    color="success"
                    size="small"
                    icon={<CheckCircle />}
                  />
                )}
              </SectionHeader>
              <SectionContent>
                {currentPage.tools.map((tool) => (
                  <Box key={tool.uniqueName} mb={2}>
                    <ToolFactory
                      tool={tool}
                      onChange={(toolName, value, isChatBot = false) => handleToolResponseChange(activeStep, toolName, value, isChatBot)}
                      readOnly={exerciseResponse.status === 'COMPLETED'}
                    />
                  </Box>
                ))}
              </SectionContent>
            </ContentSection>
          )}
        </Box>
      </Fade>

      {/* Navigation Footer */}
      <NavigationFooter>
        <ActionButton
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<NavigateBefore />}
          sx={{ minWidth: '120px' }}
        >
          Previous
        </ActionButton>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            {activeStep + 1} of {exerciseResponse.pages.length}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(activeStep + 1) / exerciseResponse.pages.length * 100}
            sx={{
              width: 100,
              height: 4,
              borderRadius: 2,
              backgroundColor: alpha(colors.primary, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
              }
            }}
          />
        </Box>
        
        <ActionButton
          variant="contained"
          onClick={isLastPage && exerciseResponse.status !== 'COMPLETED' ? () => setSubmitDialogOpen(true) : handleNext}
          disabled={activeStep === exerciseResponse.pages.length || (isLastPage && exerciseResponse.status === 'COMPLETED')}
          endIcon={isLastPage && exerciseResponse.status !== 'COMPLETED' ? <Send /> : <NavigateNext />}
          sx={{ 
            minWidth: '120px',
            '&.Mui-disabled': {
              backgroundColor: alpha(colors.primary, 0.5),
              color: alpha(colors.text.inverse, 0.7),
            }
          }}
        >
          {isLastPage ? (exerciseResponse.status === 'COMPLETED' ? 'Submitted' : 'Submit') : 'Next'}
        </ActionButton>
      </NavigationFooter>

      {/* Submit Confirmation Dialog */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        aria-labelledby="submit-dialog-title"
        aria-describedby="submit-dialog-description"
      >
        <DialogTitle id="submit-dialog-title" sx={{ fontWeight: 600 }}>
          Submit Exercise
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="submit-dialog-description">
            Are you sure you want to submit this exercise? Once submitted, you will not be able to make further changes.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSubmitDialogOpen(false)} 
            sx={{ textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary" 
            sx={{ textTransform: 'none' }}
            disabled={submitting}
            startIcon={submitting && <CircularProgress size={16} />}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={handleImageDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 2 }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Preview"
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImageDialogClose} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

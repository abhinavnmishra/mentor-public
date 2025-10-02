import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Container,
  Grid,
  TextField,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  FormControl,
  FormLabel,
  FormGroup,
  FormHelperText,
  Rating,
  Divider,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  CardActions,
  Alert,
  IconButton,
  Tooltip,
  alpha,
  styled,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Snackbar
} from "@mui/material";
import {
  Save,
  Send,
  ArrowBack,
  ArrowForward,
  CheckCircle,
  Warning,
  Info,
  NavigateNext,
  NavigateBefore,
  Home
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useAxios } from "app/contexts/AxiosContext";
import { useAlert } from "app/contexts/AlertContext";
import useAuth from "app/hooks/useAuth";
import { Breadcrumb } from "app/components";

// Modern color palette
const colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    inverse: '#ffffff'
  }
};

// Styled components
const FormContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const FormCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${colors.border}`,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
}));

const FormHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
  padding: theme.spacing(4),
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

const PageContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const QuestionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
  border: `1px solid ${colors.border}`,
  transition: 'all 0.2s ease',
  
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
    borderColor: alpha(colors.primary, 0.3),
  },
}));

const RequiredLabel = styled(Box)(({ theme }) => ({
  color: colors.error,
  marginLeft: theme.spacing(0.5),
  display: 'inline',
}));

const NavigationButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
  },
}));

const ProgressIndicator = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: alpha(colors.primary, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
}));

const FormResponse = () => {
  const { formResponseId } = useParams();
  const navigate = useNavigate();
  const axiosInstance = useAxios();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formResponse, setFormResponse] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);
  const [saveSnackbar, setSaveSnackbar] = useState(false);
  
  // Fetch form response data
  useEffect(() => {
    const fetchFormResponse = async () => {
      try {
        setLoading(true);
        const { data } = await axiosInstance.get(`/api/forms/response/${formResponseId}`);
        setFormResponse(data);
        calculateProgress(data);
      } catch (error) {
        console.error('Error fetching form response:', error);
        showAlert('Failed to load form', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormResponse();
  }, [formResponseId]);
  
  // Calculate completion progress
  const calculateProgress = (data) => {
    if (!data || !data.pages) return 0;
    
    let answeredQuestions = 0;
    let totalQuestions = 0;
    
    data.pages.forEach(page => {
      page.responses.forEach(response => {
        totalQuestions++;
        
        if ((response.questionType === 'SHORT_TEXT' || response.questionType === 'LONG_TEXT') && 
            response.answerText && response.answerText.trim() !== '') {
          answeredQuestions++;
        } else if ((response.questionType === 'MULTIPLE_CHOICE' || response.questionType === 'MULTI_SELECT') && 
                  response.selectedOptions && response.selectedOptions.length > 0) {
          answeredQuestions++;
        } else if (response.questionType === 'RATING' && response.answerText && response.answerText !== '') {
          answeredQuestions++;
        }
      });
    });
    
    const calculatedProgress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    setProgress(calculatedProgress);
    return calculatedProgress;
  };
  
  // Handle response changes
  const handleResponseChange = (pageIndex, responseIndex, field, value) => {
    const updatedFormResponse = { ...formResponse };
    
    if (field === 'selectedOptions') {
      // For multi-select questions
      updatedFormResponse.pages[pageIndex].responses[responseIndex][field] = value;
    } else if (field === 'selectedOption') {
      // For multiple choice questions
      updatedFormResponse.pages[pageIndex].responses[responseIndex].selectedOptions = [value];
    } else {
      // For text and rating questions
      updatedFormResponse.pages[pageIndex].responses[responseIndex][field] = value;
    }
    
    setFormResponse(updatedFormResponse);
    calculateProgress(updatedFormResponse);
    
    // Clear error for this question if any
    if (errors[`${pageIndex}-${responseIndex}`]) {
      const newErrors = { ...errors };
      delete newErrors[`${pageIndex}-${responseIndex}`];
      setErrors(newErrors);
    }
  };
  
  // Navigation handlers
  const handleNextPage = () => {
    if (validateCurrentPage()) {
      setCurrentPageIndex(prev => Math.min(prev + 1, formResponse.pages.length - 1));
      window.scrollTo(0, 0);
    }
  };
  
  const handlePreviousPage = () => {
    setCurrentPageIndex(prev => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };
  
  const handleGoToPage = (pageIndex) => {
    setCurrentPageIndex(pageIndex);
    window.scrollTo(0, 0);
  };
  
  // Validation
  const validateCurrentPage = () => {
    const currentPage = formResponse.pages[currentPageIndex];
    const newErrors = { ...errors };
    let isValid = true;
    
    currentPage.responses.forEach((response, responseIndex) => {
      if (response.required) {
        const errorKey = `${currentPageIndex}-${responseIndex}`;
        
        if ((response.questionType === 'SHORT_TEXT' || response.questionType === 'LONG_TEXT') && 
            (!response.answerText || response.answerText.trim() === '')) {
          newErrors[errorKey] = 'This question requires an answer';
          isValid = false;
        } else if ((response.questionType === 'MULTIPLE_CHOICE' || response.questionType === 'MULTI_SELECT') && 
                  (!response.selectedOptions || response.selectedOptions.length === 0)) {
          newErrors[errorKey] = 'Please select at least one option';
          isValid = false;
        } else if (response.questionType === 'RATING' && (!response.answerText || response.answerText === '')) {
          newErrors[errorKey] = 'Please provide a rating';
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  const validateAllPages = () => {
    const newErrors = {};
    let isValid = true;
    
    formResponse.pages.forEach((page, pageIndex) => {
      page.responses.forEach((response, responseIndex) => {
        if (response.required) {
          const errorKey = `${pageIndex}-${responseIndex}`;
          
          if ((response.questionType === 'SHORT_TEXT' || response.questionType === 'LONG_TEXT') && 
              (!response.answerText || response.answerText.trim() === '')) {
            newErrors[errorKey] = 'This question requires an answer';
            isValid = false;
          } else if ((response.questionType === 'MULTIPLE_CHOICE' || response.questionType === 'MULTI_SELECT') && 
                    (!response.selectedOptions || response.selectedOptions.length === 0)) {
            newErrors[errorKey] = 'Please select at least one option';
            isValid = false;
          } else if (response.questionType === 'RATING' && (!response.answerText || response.answerText === '')) {
            newErrors[errorKey] = 'Please provide a rating';
            isValid = false;
          }
        }
      });
    });
    
    setErrors(newErrors);
    
    if (!isValid) {
      // Find the first page with errors and navigate to it
      for (let i = 0; i < formResponse.pages.length; i++) {
        const pageHasError = Object.keys(newErrors).some(key => key.startsWith(`${i}-`));
        if (pageHasError) {
          setCurrentPageIndex(i);
          break;
        }
      }
    }
    
    return isValid;
  };
  
  // Save and submit handlers
  const handleSaveProgress = async () => {
    try {
      setSaving(true);
      await axiosInstance.put('/api/forms/response', formResponse);
      setSaveSnackbar(true);
    } catch (error) {
      console.error('Error saving form response:', error);
      showAlert('Failed to save your progress', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSubmitForm = async () => {
    if (!validateAllPages()) {
      showAlert('Please complete all required questions before submitting', 'warning');
      return;
    }
    
    try {
      setSubmitting(true);
      const updatedFormResponse = { ...formResponse, isSubmitted: true };
      await axiosInstance.post('/api/forms/response', updatedFormResponse);
      showAlert('Form submitted successfully', 'success');
      navigate('/client/dashboard'); // Navigate to appropriate page after submission
    } catch (error) {
      console.error('Error submitting form response:', error);
      showAlert('Failed to submit form', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render question based on type
  const renderQuestion = (response, pageIndex, responseIndex) => {
    const errorKey = `${pageIndex}-${responseIndex}`;
    const hasError = !!errors[errorKey];
    
    switch (response.questionType) {
      case 'SHORT_TEXT':
        return (
          <TextField
            fullWidth
            variant="outlined"
            label="Your answer"
            value={response.answerText || ''}
            onChange={(e) => handleResponseChange(pageIndex, responseIndex, 'answerText', e.target.value)}
            error={hasError}
            helperText={hasError ? errors[errorKey] : ''}
            disabled={formResponse.isSubmitted}
            sx={{ mt: 2 }}
          />
        );
        
      case 'LONG_TEXT':
        return (
          <TextField
            fullWidth
            variant="outlined"
            label="Your answer"
            value={response.answerText || ''}
            onChange={(e) => handleResponseChange(pageIndex, responseIndex, 'answerText', e.target.value)}
            multiline
            rows={4}
            error={hasError}
            helperText={hasError ? errors[errorKey] : ''}
            disabled={formResponse.isSubmitted}
            sx={{ mt: 2 }}
          />
        );
        
      case 'MULTIPLE_CHOICE':
        return (
          <FormControl component="fieldset" error={hasError} sx={{ mt: 2, width: '100%' }}>
            <RadioGroup
              value={response.selectedOptions && response.selectedOptions.length > 0 ? response.selectedOptions[0] : ''}
              onChange={(e) => handleResponseChange(pageIndex, responseIndex, 'selectedOption', e.target.value)}
            >
              {response.options && response.options.map((option, optionIndex) => (
                <FormControlLabel
                  key={optionIndex}
                  value={option}
                  control={<Radio disabled={formResponse.isSubmitted} />}
                  label={option}
                  sx={{ 
                    mb: 1, 
                    p: 1, 
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: alpha(colors.primary, 0.05)
                    }
                  }}
                />
              ))}
            </RadioGroup>
            {hasError && <FormHelperText>{errors[errorKey]}</FormHelperText>}
          </FormControl>
        );
        
      case 'MULTI_SELECT':
        return (
          <FormControl component="fieldset" error={hasError} sx={{ mt: 2, width: '100%' }}>
            <FormGroup>
              {response.options && response.options.map((option, optionIndex) => (
                <FormControlLabel
                  key={optionIndex}
                  control={
                    <Checkbox
                      checked={response.selectedOptions ? response.selectedOptions.includes(option) : false}
                      onChange={(e) => {
                        const currentSelected = response.selectedOptions || [];
                        let newSelected;
                        
                        if (e.target.checked) {
                          newSelected = [...currentSelected, option];
                        } else {
                          newSelected = currentSelected.filter(item => item !== option);
                        }
                        
                        handleResponseChange(pageIndex, responseIndex, 'selectedOptions', newSelected);
                      }}
                      disabled={formResponse.isSubmitted}
                    />
                  }
                  label={option}
                  sx={{ 
                    mb: 1, 
                    p: 1, 
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: alpha(colors.primary, 0.05)
                    }
                  }}
                />
              ))}
            </FormGroup>
            {hasError && <FormHelperText>{errors[errorKey]}</FormHelperText>}
          </FormControl>
        );
        
      case 'RATING':
        return (
          <Box sx={{ mt: 2 }}>
            <Rating
              name={`rating-${pageIndex}-${responseIndex}`}
              value={response.answerText ? parseInt(response.answerText) : 0}
              onChange={(_, newValue) => handleResponseChange(pageIndex, responseIndex, 'answerText', newValue ? newValue.toString() : '')}
              size="large"
              disabled={formResponse.isSubmitted}
              sx={{ 
                fontSize: '2rem',
                '& .MuiRating-iconFilled': {
                  color: colors.warning,
                }
              }}
            />
            {hasError && (
              <FormHelperText error>{errors[errorKey]}</FormHelperText>
            )}
          </Box>
        );
        
      default:
        return <Typography color="error">Unknown question type</Typography>;
    }
  };
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  if (!formResponse) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Warning sx={{ fontSize: 64, color: colors.warning, mb: 2 }} />
        <Typography variant="h4" gutterBottom>Form Not Found</Typography>
        <Typography variant="body1" paragraph>
          The form you're looking for doesn't exist or you don't have permission to access it.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Home />}
          onClick={() => navigate('/client/dashboard')}
        >
          Return to Dashboard
        </Button>
      </Container>
    );
  }
  
  const currentPage = formResponse.pages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === formResponse.pages.length - 1;
  
  return (
    <FormContainer maxWidth="lg">
      <Breadcrumb routeSegments={[
        { name: 'Dashboard', path: '/client/dashboard' },
        { name: 'Forms', path: '/client/dashboard' },
        { name: formResponse.title || 'Form Response' }
      ]} />
      
      <FormCard>
        <FormHeader>
          <Box position="relative" zIndex={1}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1
              }}
            >
              {formResponse.title}
            </Typography>
            
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {formResponse.instruction && (
                <div dangerouslySetInnerHTML={{ __html: formResponse.instruction }} />
              )}
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Your progress: {progress}%
              </Typography>
              <ProgressIndicator variant="determinate" value={progress} />
            </Box>
          </Box>
        </FormHeader>
        
        {formResponse.isSubmitted ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 64, color: colors.success, mb: 2 }} />
            <Typography variant="h5" gutterBottom>Form Already Submitted</Typography>
            <Typography variant="body1" paragraph>
              Thank you for your responses. This form has already been submitted.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Home />}
              onClick={() => navigate('/client/dashboard')}
            >
              Return to Dashboard
            </Button>
          </Box>
        ) : (
          <>
            {/* Page Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, overflowX: 'auto' }}>
              <Box sx={{ display: 'flex', my: 1 }}>
                {formResponse.pages.map((page, index) => (
                  <Button
                    key={index}
                    variant={currentPageIndex === index ? "contained" : "text"}
                    color={currentPageIndex === index ? "primary" : "inherit"}
                    onClick={() => handleGoToPage(index)}
                    sx={{
                      minWidth: 'auto',
                      borderRadius: '20px',
                      mx: 0.5,
                      px: 2,
                      py: 0.5,
                      fontSize: '0.875rem'
                    }}
                  >
                    {page.pageTitle || `Page ${index + 1}`}
                  </Button>
                ))}
              </Box>
            </Box>
            
            <PageContainer>
              {/* Current Page Title */}
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {currentPage.pageTitle || `Page ${currentPageIndex + 1}`}
              </Typography>
              
              {/* Questions */}
              {currentPage.responses.map((response, responseIndex) => (
                <QuestionCard key={responseIndex} elevation={0}>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {response.questionText}
                    {response.required && <RequiredLabel component="span">*</RequiredLabel>}
                  </Typography>
                  
                  {renderQuestion(response, currentPageIndex, responseIndex)}
                </QuestionCard>
              ))}
              
              {/* Navigation and Action Buttons */}
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                  {!isFirstPage && (
                    <NavigationButton
                      variant="outlined"
                      color="primary"
                      onClick={handlePreviousPage}
                      startIcon={<NavigateBefore />}
                      disabled={saving || submitting}
                    >
                      Previous
                    </NavigationButton>
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <NavigationButton
                    variant="outlined"
                    color="primary"
                    onClick={handleSaveProgress}
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                    disabled={saving || submitting}
                  >
                    Save Progress
                  </NavigationButton>
                  
                  {isLastPage ? (
                    <NavigationButton
                      variant="contained"
                      color="primary"
                      onClick={handleSubmitForm}
                      startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                      disabled={saving || submitting}
                    >
                      Submit
                    </NavigationButton>
                  ) : (
                    <NavigationButton
                      variant="contained"
                      color="primary"
                      onClick={handleNextPage}
                      endIcon={<NavigateNext />}
                      disabled={saving || submitting}
                    >
                      Next
                    </NavigationButton>
                  )}
                </Box>
              </Box>
            </PageContainer>
          </>
        )}
      </FormCard>
      
      {/* Save Progress Snackbar */}
      <Snackbar
        open={saveSnackbar}
        autoHideDuration={3000}
        onClose={() => setSaveSnackbar(false)}
        message="Progress saved successfully"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </FormContainer>
  );
};

export default FormResponse;

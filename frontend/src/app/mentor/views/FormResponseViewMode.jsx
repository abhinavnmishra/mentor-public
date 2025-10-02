import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Paper,
  Container,
  Grid,
  Divider,
  Card,
  CardContent,
  Alert,
  IconButton,
  Tooltip,
  alpha,
  styled,
  useTheme,
  useMediaQuery,
  Chip,
  LinearProgress,
  Tabs,
  Tab
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Warning,
  Info,
  NavigateNext,
  NavigateBefore,
  Home,
  Print,
  Download,
  Person
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

const AnswerDisplay = styled(Box)(({ theme }) => ({
  backgroundColor: alpha(colors.background, 0.5),
  padding: theme.spacing(2),
  borderRadius: '8px',
  border: `1px solid ${colors.border}`,
  marginTop: theme.spacing(2),
}));

const RespondentInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const FormResponseViewMode = () => {
  const { formResponseId } = useParams();
  const navigate = useNavigate();
  const axiosInstance = useAxios();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // State
  const [loading, setLoading] = useState(true);
  const [formResponse, setFormResponse] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

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
        showAlert('Failed to load form response', 'error');
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
  
  // Navigation handlers
  const handleNextPage = () => {
    setCurrentPageIndex(prev => Math.min(prev + 1, formResponse.pages.length - 1));
    window.scrollTo(0, 0);
  };
  
  const handlePreviousPage = () => {
    setCurrentPageIndex(prev => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };
  
  const handleGoToPage = (pageIndex) => {
    setCurrentPageIndex(pageIndex);
    window.scrollTo(0, 0);
  };

  // Export to PDF functionality
  const handleExportToPdf = () => {
    // Implementation for PDF export would go here
    showAlert('PDF export functionality will be implemented soon', 'info');
  };
  
  // Render answer based on question type
  const renderAnswer = (response) => {
    switch (response.questionType) {
      case 'SHORT_TEXT':
      case 'LONG_TEXT':
        return (
          <AnswerDisplay>
            {response.answerText ? (
              <Typography variant="body1">{response.answerText}</Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No answer provided
              </Typography>
            )}
          </AnswerDisplay>
        );
        
      case 'MULTIPLE_CHOICE':
        return (
          <AnswerDisplay>
            {response.selectedOptions && response.selectedOptions.length > 0 ? (
              <Typography variant="body1">{response.selectedOptions[0]}</Typography>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No option selected
              </Typography>
            )}
          </AnswerDisplay>
        );
        
      case 'MULTI_SELECT':
        return (
          <AnswerDisplay>
            {response.selectedOptions && response.selectedOptions.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {response.selectedOptions.map((option, index) => (
                  <Chip key={index} label={option} size="medium" />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No options selected
              </Typography>
            )}
          </AnswerDisplay>
        );
        
      case 'RATING':
        return (
          <AnswerDisplay>
            {response.answerText ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: colors.warning }}>
                  {response.answerText}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  out of 5
                </Typography>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                No rating provided
              </Typography>
            )}
          </AnswerDisplay>
        );
        
      default:
        return (
          <Typography color="error">Unknown question type</Typography>
        );
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
        <Typography variant="h4" gutterBottom>Form Response Not Found</Typography>
        <Typography variant="body1" paragraph>
          The form response you're looking for doesn't exist or you don't have permission to access it.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Home />}
          onClick={() => navigate('/portal/dashboard')}
        >
          Return to Dashboard
        </Button>
      </Container>
    );
  }
  
  const currentPage = formResponse.pages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === formResponse.pages.length - 1;
  const submissionDate = formResponse.submittedAt ? new Date(formResponse.submittedAt).toLocaleString() : 'Not submitted yet';
  
  return (
    <FormContainer maxWidth="lg">
      <Breadcrumb routeSegments={[
        { name: 'Dashboard', path: '/portal/dashboard' },
        { name: 'Forms', path: '/portal/form' },
        { name: 'Response View' }
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
            
            {formResponse.instruction && (
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                <div dangerouslySetInnerHTML={{ __html: formResponse.instruction }} />
              </Typography>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Completion: {progress}%
                </Typography>
                <ProgressIndicator variant="determinate" value={progress} sx={{ width: '200px' }} />
              </Box>
              
              <Chip 
                label={formResponse.isSubmitted ? "Submitted" : "In Progress"} 
                color={formResponse.isSubmitted ? "success" : "warning"}
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Box>
        </FormHeader>
        
        <Box sx={{ p: 3, bgcolor: alpha(colors.info, 0.05), borderBottom: `1px solid ${colors.border}` }}>
          <RespondentInfo>
            <Person sx={{ color: colors.secondary }} />
            <Typography variant="subtitle1" fontWeight="medium">
              Respondent: {formResponse ? formResponse.userName : 'Unknown User'}
            </Typography>
          </RespondentInfo>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Email:</strong> {formResponse ? formResponse.userEmail : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                <strong>Submitted:</strong> {submissionDate}
              </Typography>
            </Grid>
          </Grid>
        </Box>
        
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
          
          {/* Questions and Answers */}
          {currentPage.responses.map((response, responseIndex) => (
            <QuestionCard key={responseIndex} elevation={0}>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                {response.questionText}
                {response.required && <RequiredLabel component="span">*</RequiredLabel>}
              </Typography>
              
              {renderAnswer(response)}
            </QuestionCard>
          ))}
          
          {/* Navigation Buttons */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              {!isFirstPage && (
                <NavigationButton
                  variant="outlined"
                  color="primary"
                  onClick={handlePreviousPage}
                  startIcon={<NavigateBefore />}
                >
                  Previous Page
                </NavigationButton>
              )}
            </Box>
            
            <Box>
              {!isLastPage && (
                <NavigationButton
                  variant="contained"
                  color="primary"
                  onClick={handleNextPage}
                  endIcon={<NavigateNext />}
                >
                  Next Page
                </NavigationButton>
              )}
            </Box>
          </Box>
        </PageContainer>
      </FormCard>
    </FormContainer>
  );
};

export default FormResponseViewMode;

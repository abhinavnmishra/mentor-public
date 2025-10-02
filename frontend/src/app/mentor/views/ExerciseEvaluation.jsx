import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
  styled,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import { Breadcrumb } from 'app/components';
import { H4 } from 'app/components/Typography';
import {
  Save,
  AutoAwesome,
  Description,
  NavigateNext,
  NavigateBefore,
  Preview,
  Add,
  Refresh,
  CheckCircle,
  Warning
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from 'app/hooks/useAuth';
import { useAxios } from 'app/contexts/AxiosContext';
import { useAlert } from 'app/contexts/AlertContext';
import ExerciseResponseViewer from '../components/evaluation/ExerciseResponseViewer';
import ReportPagesEditor from '../components/evaluation/ReportPagesEditor';

// Modern color palette
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

const Container = styled(Box)(({ theme }) => ({
  padding: '24px',
  maxWidth: '1400px',
  margin: '0 auto',
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${colors.border}`,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  background: colors.surface,
  transition: 'all 0.2s ease-in-out',
  overflow: 'visible',
  '&:hover': {
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  }
}));

const ActionButton = styled(Button)(({ theme, variant: buttonVariant }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '10px 20px',
  boxShadow: 'none',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: buttonVariant === 'contained' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
    transform: 'translateY(-1px)',
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${colors.border}`,
  '& .MuiTabs-indicator': {
    backgroundColor: colors.primary,
    height: '3px',
    borderRadius: '1.5px',
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.875rem',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  color: colors.text.secondary,
  '&.Mui-selected': {
    color: colors.primary,
  }
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`evaluation-tabpanel-${index}`}
      aria-labelledby={`evaluation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ExerciseEvaluation() {
  const { exerciseResponseId } = useParams();
  const navigate = useNavigate();
  const axiosInstance = useAxios();
  const { showAlert } = useAlert();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingEvaluation, setGeneratingEvaluation] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [hasReportPages, setHasReportPages] = useState(false);
  const [exerciseResponse, setExerciseResponse] = useState({
    id: null,
    milestoneTrackerId: null,
    exerciseId: null,
    details: '',
    status: 'COMPLETED',
    pages: [],
    reportPages: []
  });
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  // Fetch exercise response data
  useEffect(() => {
    const fetchExerciseResponse = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/exercise/response/${exerciseResponseId}`);
        setExerciseResponse(response.data);
        setHasReportPages(response.data.reportPages && response.data.reportPages.length > 0);
      } catch (error) {
        console.error('Error fetching exercise response:', error);
        showAlert('Failed to load exercise response data', 'error');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchExerciseResponse();
  }, [exerciseResponseId]);


  useEffect(() => {
    setHasReportPages(exerciseResponse.reportPages && exerciseResponse.reportPages.length > 0);
  }, [exerciseResponse]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Generate AI evaluation
  const handleGenerateEvaluation = async () => {
    try {
      setGeneratingEvaluation(true);
      setGenerateDialogOpen(false);
      
      const response = await axiosInstance.get(`/api/exercise/response/evaluate/${exerciseResponseId}`);
      
      // Update the exercise response with the generated report pages
      setExerciseResponse(prev => ({
        ...prev,
        reportPages: response.data.reportPages || []
      }));
      setHasReportPages(response.data.reportPages && response.data.reportPages.length > 0);
      showAlert('AI evaluation generated successfully', 'success');
      setActiveTab(1); // Switch to evaluation tab
    } catch (error) {
      console.error('Error generating evaluation:', error);
      showAlert('Failed to generate AI evaluation', 'error');
    } finally {
      setGeneratingEvaluation(false);
    }
  };

  // Save evaluation
  const handleSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put('/api/exercise/response/evaluate/save', exerciseResponse);
      showAlert('Evaluation saved successfully', 'success');
    } catch (error) {
      console.error('Error saving evaluation:', error);
      showAlert('Failed to save evaluation', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Update report pages
  const handleUpdateReportPages = (updatedReportPages) => {
    setExerciseResponse(prev => ({
      ...prev,
      reportPages: updatedReportPages
    }));
  };

  // Finalize report
  const handleFinalizeReport = () => {
    navigate(`/portal/report-view/${exerciseResponseId}?type=exercise-response`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // const hasReportPages = exerciseResponse.reportPages && exerciseResponse.reportPages.length > 0;

  return (
    <Container>
      <Box mb={4}>
        <Breadcrumb routeSegments={[
          { name: 'Portal', path: '/portal/dashboard' },
          { name: 'Exercise Evaluation' }
        ]} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ModernCard sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <H4>Exercise Evaluation & Report Builder</H4>
              <Box>
                <ActionButton
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(-1)}
                  sx={{ mr: 2 }}
                >
                  Back
                </ActionButton>
                
                {!hasReportPages && (
                  <ActionButton
                    variant="contained"
                    color="secondary"
                    onClick={() => setGenerateDialogOpen(true)}
                    disabled={generatingEvaluation}
                    startIcon={generatingEvaluation ? <CircularProgress size={20} /> : <AutoAwesome />}
                    sx={{ mr: 2 }}
                  >
                    {generatingEvaluation ? 'Generating...' : 'Generate AI Evaluation'}
                  </ActionButton>
                )}
                
                <ActionButton
                  variant="outlined"
                  color="primary"
                  onClick={handleSave}
                  disabled={saving || !hasReportPages}
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  sx={{ mr: 2 }}
                >
                  {saving ? 'Saving...' : 'Save Evaluation'}
                </ActionButton>
                
                <ActionButton
                  variant="contained"
                  color="primary"
                  onClick={handleFinalizeReport}
                  disabled={!hasReportPages}
                  startIcon={<Description />}
                >
                  Finalize Report
                </ActionButton>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Status Alert */}
            {exerciseResponse.status !== 'COMPLETED' && (
              <Alert 
                severity="warning" 
                icon={<Warning />}
                sx={{ 
                  mb: 3,
                  borderRadius: '12px',
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }}
              >
                This exercise response is not yet completed. The evaluation may be incomplete.
              </Alert>
            )}

            {/* Tabs */}
            <StyledTabs value={activeTab} onChange={handleTabChange} aria-label="evaluation tabs">
              <StyledTab 
                label="Exercise Response" 
                icon={<Description />} 
                iconPosition="start"
              />
              <StyledTab 
                label={hasReportPages ? "AI Evaluation & Report" : "Generate Evaluation"} 
                icon={hasReportPages ? <CheckCircle /> : <AutoAwesome />} 
                iconPosition="start"
                // disabled={!hasReportPages && !generatingEvaluation}
              />
            </StyledTabs>

            {/* Tab Content */}
            <TabPanel value={activeTab} index={0}>
              <ExerciseResponseViewer exerciseResponse={exerciseResponse} />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              {hasReportPages ? (
                <ReportPagesEditor
                    exerciseResponse={exerciseResponse}
                  onUpdateReportPages={handleUpdateReportPages}
                />
              ) : (
                <Box 
                  sx={{ 
                    p: 6, 
                    textAlign: 'center',
                    border: `2px dashed ${colors.border}`,
                    borderRadius: '16px',
                    backgroundColor: alpha(colors.background, 0.5)
                  }}
                >
                  <AutoAwesome sx={{ fontSize: 48, color: colors.text.disabled, mb: 2 }} />
                  <Typography 
                    variant="h6" 
                    color={colors.text.secondary}
                    sx={{ 
                      mb: 1,
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    No AI Evaluation Generated Yet
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color={colors.text.disabled}
                    sx={{ 
                      mb: 3,
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    Generate an AI evaluation to create a comprehensive report based on the exercise response.
                  </Typography>
                  <ActionButton
                    variant="contained"
                    color="primary"
                    onClick={() => setGenerateDialogOpen(true)}
                    disabled={generatingEvaluation}
                    startIcon={generatingEvaluation ? <CircularProgress size={20} /> : <AutoAwesome />}
                    size="large"
                  >
                    {generatingEvaluation ? 'Generating...' : 'Generate AI Evaluation'}
                  </ActionButton>
                </Box>
              )}
            </TabPanel>
          </ModernCard>
        </Grid>
      </Grid>

      {/* Generate Evaluation Confirmation Dialog */}
      <Dialog
        open={generateDialogOpen}
        onClose={() => setGenerateDialogOpen(false)}
        aria-labelledby="generate-dialog-title"
        aria-describedby="generate-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle id="generate-dialog-title" sx={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
          color: 'white',
          fontWeight: 600,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome />
            Generate AI Evaluation
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText id="generate-dialog-description">
            <Typography variant="body1" paragraph sx={{
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: colors.text.primary
            }}>
              The AI will analyze the exercise response and generate a comprehensive evaluation report. This process will:
            </Typography>
            <Typography component="div" variant="body1" sx={{ 
              mb: 2,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: colors.text.primary
            }}>
              <ul style={{ paddingLeft: '20px' }}>
                <li>Analyze all exercise responses and submissions</li>
                <li>Generate structured evaluation content</li>
                <li>Create report pages that you can edit and customize</li>
                <li>Provide insights and recommendations</li>
              </ul>
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: colors.text.primary
            }}>
              This may take a few moments to complete. Continue?
            </Typography>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <ActionButton 
            onClick={() => setGenerateDialogOpen(false)} 
            variant="outlined"
            sx={{ 
              borderColor: colors.border,
              color: colors.text.secondary
            }}
          >
            Cancel
          </ActionButton>
          <ActionButton 
            onClick={handleGenerateEvaluation}
            disabled={generatingEvaluation}
            variant="contained"
            color="primary"
            autoFocus
          >
            Generate Evaluation
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

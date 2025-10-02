import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  alpha,
  styled,
  Chip,
  Divider
} from '@mui/material';
import {
  NavigateNext,
  NavigateBefore,
  Description,
  Image,
  Timer,
  CheckCircle,
  OpenInNew
} from '@mui/icons-material';
import ToolFactory from '../exercise-tools/ToolFactory';

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

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '1.125rem',
  fontWeight: 700,
  color: colors.text.primary,
  marginBottom: '16px',
}));

const ResourceCard = styled(Paper)(({ theme }) => ({
  padding: '16px',
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '12px',
  transition: 'all 0.2s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: alpha(colors.background, 0.5),
    borderColor: colors.borderHover,
  }
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontWeight: 600,
  fontSize: '0.75rem',
}));

export default function ExerciseResponseViewer({ exerciseResponse }) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

  // Navigation handlers
  const handleNext = () => {
    setActiveStep(prevStep => Math.min(prevStep + 1, exerciseResponse.pages.length - 1));
  };

  const handleBack = () => {
    setActiveStep(prevStep => Math.max(prevStep - 1, 0));
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
    window.open(fileUrl, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PAUSED':
        return 'warning';
      case 'SUBMITTED':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'SUBMITTED':
        return <CheckCircle />;
      case 'PAUSED':
        return <Timer />;
      default:
        return null;
    }
  };

  if (!exerciseResponse.pages || exerciseResponse.pages.length === 0) {
    return (
      <Box 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          border: `1px dashed ${colors.border}`,
          borderRadius: '12px',
          backgroundColor: alpha(colors.background, 0.5)
        }}
      >
        <Description sx={{ fontSize: 48, color: colors.text.disabled, mb: 2 }} />
        <Typography 
          variant="h6" 
          color={colors.text.secondary}
          sx={{ 
            mb: 1,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          No Exercise Response Data
        </Typography>
        <Typography 
          variant="body2" 
          color={colors.text.disabled}
          sx={{ 
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          This exercise response appears to be empty or incomplete.
        </Typography>
      </Box>
    );
  }

  const currentPage = exerciseResponse.pages[activeStep];
  const isLastPage = activeStep === exerciseResponse.pages.length - 1;

  return (
    <Box>
      {/* Exercise Details and Status */}
      <Box mb={4}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <SectionTitle>Exercise Response Overview</SectionTitle>
          <StatusChip 
            label={exerciseResponse.status}
            color={getStatusColor(exerciseResponse.status)}
            icon={getStatusIcon(exerciseResponse.status)}
            variant="filled"
          />
        </Box>
        
        {exerciseResponse.details && (
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              p: 3,
              backgroundColor: alpha(colors.background, 0.5),
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            dangerouslySetInnerHTML={{ __html: exerciseResponse.details }}
          />
        )}
      </Box>

      {/* Page Navigation */}
      <Box mb={4}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {exerciseResponse.pages.map((page, index) => (
            <Step key={index}>
              <StepLabel>Page {index + 1}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Current Page Content */}
      <Box mb={4}>
        {/* Timer Display */}
        {currentPage.timerSeconds > 0 && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              mb: 3,
              p: 2,
              backgroundColor: alpha(colors.warning, 0.1),
              borderRadius: '8px',
              border: `1px solid ${alpha(colors.warning, 0.3)}`
            }}
          >
            <Timer sx={{ color: colors.warning }} />
            <Typography
              variant="body2"
              sx={{
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: colors.warning,
                fontWeight: 600
              }}
            >
              Timer: {Math.floor(currentPage.timerSeconds / 60)}:{(currentPage.timerSeconds % 60).toString().padStart(2, '0')} minutes
            </Typography>
          </Box>
        )}

        {/* Page Content */}
        {currentPage.displayText && (
          <Typography
            variant="body1"
            sx={{
              mb: 4,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            dangerouslySetInnerHTML={{ __html: currentPage.displayText }}
          />
        )}

        {/* Display Images */}
        {currentPage.displayImages && currentPage.displayImages.length > 0 && (
          <Box mb={4}>
            <SectionTitle>Images</SectionTitle>
            <Grid container spacing={2}>
              {currentPage.displayImages.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Box
                    sx={{
                      cursor: 'pointer',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: `1px solid ${colors.border}`,
                      '&:hover': {
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }
                    }}
                    onClick={() => handleImageClick(`${backendBaseUrl}/public/${image}`)}
                  >
                    <img
                      src={`${backendBaseUrl}/public/${image}`}
                      alt={`Display ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                  {/* Show image description if available */}
                  {/*{currentPage.displayImageDescriptions && currentPage.displayImageDescriptions[index] && (*/}
                  {/*  <Typography*/}
                  {/*    variant="caption"*/}
                  {/*    sx={{*/}
                  {/*      display: 'block',*/}
                  {/*      mt: 1,*/}
                  {/*      fontStyle: 'italic',*/}
                  {/*      color: colors.text.secondary,*/}
                  {/*      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'*/}
                  {/*    }}*/}
                  {/*  >*/}
                  {/*    {currentPage.displayImageDescriptions[index]}*/}
                  {/*  </Typography>*/}
                  {/*)}*/}
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Resource Files */}
        {currentPage.files && currentPage.files.length > 0 && (
          <Box mb={4}>
            <SectionTitle>Resources</SectionTitle>
            {currentPage.files.map((file, index) => (
              <ResourceCard
                key={index}
                onClick={() => handleFileOpen(`${backendBaseUrl}/public/${file}`)}
              >
                <Box display="flex" alignItems="center">
                  <Description sx={{ color: colors.primary, mr: 1 }} />
                  <OpenInNew sx={{ color: colors.secondary, fontSize: '0.875rem' }} />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    flex: 1,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {`File ${index + 1} (${file.substring(0, 8)}...)`}
                </Typography>
              </ResourceCard>
            ))}
          </Box>
        )}

        {/* Tools and Responses */}
        {currentPage.tools && currentPage.tools.length > 0 && (
          <Box>
            <SectionTitle>User Responses</SectionTitle>
            {currentPage.tools.map((tool) => (
              <Box key={tool.uniqueName} mb={3}>
                <ToolFactory
                  tool={tool}
                  onChange={() => {}} // Read-only, no changes needed
                  readOnly={true}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <ActionButton
          variant="outlined"
          color="primary"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<NavigateBefore />}
        >
          Previous Page
        </ActionButton>
        
        <Typography 
          variant="body2" 
          sx={{ 
            alignSelf: 'center',
            color: colors.text.secondary,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Page {activeStep + 1} of {exerciseResponse.pages.length}
        </Typography>
        
        <ActionButton
          variant="outlined"
          color="primary"
          onClick={handleNext}
          disabled={isLastPage}
          endIcon={<NavigateNext />}
        >
          Next Page
        </ActionButton>
      </Box>

      {/* Image Preview Dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={handleImageDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontWeight: 600
        }}>
          Image Preview
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
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
          <Button 
            onClick={handleImageDialogClose} 
            sx={{ 
              textTransform: 'none',
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

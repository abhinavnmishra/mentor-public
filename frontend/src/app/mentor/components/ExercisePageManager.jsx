import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Grid,
  Tabs,
  Tab,
  alpha,
  styled,
  Stack,
  Chip,
  Divider
} from "@mui/material";
import { 
  Add, 
  Close, 
  Description,
  Schedule,
  AutoAwesome,
  AttachFile,
  Image as ImageIcon
} from "@mui/icons-material";
import { 
  ActionButton, 
  StyledTextField, 
  SectionTitle, 
  ModernCard,
  colors 
} from "./ExerciseStyledComponents";
import ExerciseFileUploadSection from "./ExerciseFileUploadSection.jsx";
import { Editor } from '@tinymce/tinymce-react';

// Enhanced tab component with better visual indicators
const PageTab = styled(Tab)(({ theme, pageIndex, isActive }) => ({
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '0.875rem',
  fontWeight: 600,
  minWidth: '120px',
  textTransform: 'none',
  borderRadius: '12px 12px 0 0',
  margin: '0 4px',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&.Mui-selected': {
    color: colors.primary,
    fontWeight: 700,
    backgroundColor: alpha(colors.primary, 0.08),
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '3px',
      backgroundColor: colors.primary,
      borderRadius: '2px 2px 0 0',
    }
  },
  
  '&:hover:not(.Mui-selected)': {
    backgroundColor: alpha(colors.primary, 0.04),
    color: colors.primaryLight,
  }
}));

const TabContainer = styled(Box)(({ theme }) => ({
  borderBottom: `1px solid ${colors.border}`,
  marginBottom: '24px',
  background: colors.surface,
  borderRadius: '16px 16px 0 0',
  overflow: 'hidden',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
}));

const PageHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(colors.primary, 0.1)} 0%, ${alpha(colors.secondary, 0.05)} 100%)`,
  borderRadius: '16px',
  padding: '24px',
  marginBottom: '24px',
  border: `1px solid ${alpha(colors.primary, 0.15)}`,
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100px',
    height: '100px',
    background: `radial-gradient(circle, ${alpha(colors.primary, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
    transform: 'translate(30%, -30%)',
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

const ContentSection = styled(ModernCard)(({ theme }) => ({
  marginBottom: '24px',
  overflow: 'visible',
}));

const StatsChip = styled(Chip)(({ theme, variant }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'files':
        return {
          backgroundColor: alpha(colors.info, 0.1),
          color: colors.info,
          border: `1px solid ${alpha(colors.info, 0.2)}`,
        };
      case 'images':
        return {
          backgroundColor: alpha(colors.secondary, 0.1),
          color: colors.secondary,
          border: `1px solid ${alpha(colors.secondary, 0.2)}`,
        };
      case 'timer':
        return {
          backgroundColor: alpha(colors.warning, 0.1),
          color: colors.warning,
          border: `1px solid ${alpha(colors.warning, 0.2)}`,
        };
      default:
        return {
          backgroundColor: alpha(colors.primary, 0.1),
          color: colors.primary,
          border: `1px solid ${alpha(colors.primary, 0.2)}`,
        };
    }
  };
  
  return {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    ...getVariantStyles(),
  };
});

const ExercisePageManager = ({
  pages,
  currentPage,
  onPageChange,
  onAddPage,
  onDeletePage,
  onUpdatePage,
  disabled = false
}) => {
  const handlePageChange = (event, newValue) => {
    onPageChange(newValue);
  };

  const handleUpdatePageText = (value) => {
    onUpdatePage(currentPage, {
      ...pages[currentPage],
      displayText: value
    });
  };

  const handleUpdateExtractionPrompt = (value) => {
    onUpdatePage(currentPage, {
      ...pages[currentPage],
      extractionPrompt: value
    });
  };

  const handleUpdateTimer = (value) => {
    onUpdatePage(currentPage, {
      ...pages[currentPage],
      timerSeconds: parseInt(value) || 0
    });
  };

  const currentPageData = pages[currentPage] || {};
  const fileCount = currentPageData.files?.length || 0;
  const imageCount = currentPageData.displayImages?.length || 0;
  const hasTimer = currentPageData.timerSeconds > 0;

  return (
    <>
      {/* Enhanced Page Header */}
      <PageHeader>
        <Box position="relative" zIndex={1}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <SectionTitle variant="h6" sx={{ mb: 1, '&::after': { display: 'none' } }}>
                <Description sx={{ fontSize: '1.2rem', mr: 1, color: colors.primary }} />
                Exercise Pages
              </SectionTitle>
              <Typography
                variant="body2"
                sx={{
                  color: colors.text.secondary,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Organize your exercise content across multiple pages
              </Typography>
            </Box>
            <ActionButton
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={onAddPage}
              size="small"
              disabled={disabled}
            >
              Add Page
            </ActionButton>
          </Stack>
          
          {/* Page Stats */}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <StatsChip
              icon={<Description />}
              label={`${pages.length} ${pages.length === 1 ? 'Page' : 'Pages'}`}
              size="small"
            />
            {fileCount > 0 && (
              <StatsChip
                icon={<AttachFile />}
                label={`${fileCount} ${fileCount === 1 ? 'File' : 'Files'}`}
                size="small"
                variant="files"
              />
            )}
            {imageCount > 0 && (
              <StatsChip
                icon={<ImageIcon />}
                label={`${imageCount} ${imageCount === 1 ? 'Image' : 'Images'}`}
                size="small"
                variant="images"
              />
            )}
            {hasTimer && (
              <StatsChip
                icon={<Schedule />}
                label={`${currentPageData.timerSeconds}s Timer`}
                size="small"
                variant="timer"
              />
            )}
          </Stack>
        </Box>
      </PageHeader>

      {/* Enhanced Tabs */}
      <TabContainer>
        <Tabs
          value={currentPage}
          onChange={handlePageChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTabs-indicator': {
              display: 'none', // We use custom indicator
            },
            '& .MuiTabs-scroller': {
              backgroundColor: colors.surface,
            }
          }}
        >
          {pages.map((page, index) => (
            <PageTab 
              key={index} 
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" fontWeight="inherit">
                    Page {index + 1}
                  </Typography>
                  {pages.length > 1 && !disabled && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(index);
                      }}
                      sx={{ 
                        ml: 1, 
                        p: 0.5,
                        color: colors.text.secondary,
                        '&:hover': {
                          color: colors.error,
                          backgroundColor: alpha(colors.error, 0.1),
                        }
                      }}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              } 
            />
          ))}
        </Tabs>
      </TabContainer>

      {/* Page Content Sections */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ContentSection elevation={1}>
            <Box p={3}>
              <SectionTitle variant="h6" sx={{ mb: 3 }}>
                <Description sx={{ fontSize: '1.1rem', mr: 1, color: colors.primary }} />
                Page Instructions
              </SectionTitle>
              <EditorLabel>
                <Description />
                Instructions for respondents
              </EditorLabel>
              <EditorContainer>
                <Editor
                  tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                  value={pages[currentPage].displayText || ''}
                  onEditorChange={(content) => handleUpdatePageText(content)}
                  disabled={disabled}
                  init={{
                    height: 180,
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
                    autoresize_min_height: 180,
                    autoresize_max_height: 400,
                    statusbar: true,
                    elementpath: false,
                    placeholder: 'Provide clear instructions for what respondents should do on this page...'
                  }}
                />
              </EditorContainer>
            </Box>
          </ContentSection>
        </Grid>

        <Grid item xs={12} md={4}>
          <ContentSection elevation={1}>
            <Box p={3}>
              <SectionTitle variant="h6" sx={{ mb: 3 }}>
                <Schedule sx={{ fontSize: '1.1rem', mr: 1, color: colors.warning }} />
                Page Settings
              </SectionTitle>
              <StyledTextField
                label="Timer (seconds)"
                type="number"
                fullWidth
                value={pages[currentPage].timerSeconds}
                onChange={(e) => handleUpdateTimer(e.target.value)}
                placeholder="0 (no timer)"
                InputProps={{ 
                  inputProps: { min: 0 },
                  startAdornment: (
                    <Schedule sx={{ color: colors.text.secondary, mr: 1 }} />
                  )
                }}
                disabled={disabled}
                helperText="Set a time limit for this page (optional)"
              />
            </Box>
          </ContentSection>
        </Grid>

        <Grid item xs={12}>
          <ContentSection elevation={1}>
            <Box p={3}>
              <SectionTitle variant="h6" sx={{ mb: 3 }}>
                <AutoAwesome sx={{ fontSize: '1.1rem', mr: 1, color: colors.secondary }} />
                AI Evaluation Prompt
              </SectionTitle>
              <EditorLabel>
                <AutoAwesome />
                Instructions for AI to evaluate responses from this page
              </EditorLabel>
              <EditorContainer>
                <Editor
                  tinymceScriptSrc={'/tinymce/tinymce.min.js'}
                  value={pages[currentPage].extractionPrompt || ''}
                  onEditorChange={(content) => handleUpdateExtractionPrompt(content)}
                  disabled={disabled}
                  init={{
                    height: 180,
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
                    autoresize_min_height: 180,
                    autoresize_max_height: 400,
                    statusbar: true,
                    elementpath: false,
                    placeholder: 'Provide specific instructions for AI to evaluate responses from this page...'
                  }}
                />
              </EditorContainer>
            </Box>
          </ContentSection>
        </Grid>

        <Grid item xs={12}>
          <ContentSection elevation={1}>
            <Box p={3}>
              <SectionTitle variant="h6" sx={{ mb: 3 }}>
                <AttachFile sx={{ fontSize: '1.1rem', mr: 1, color: colors.info }} />
                Resource Files & Images
              </SectionTitle>
              <ExerciseFileUploadSection
                files={pages[currentPage].files} 
                displayImages={pages[currentPage].displayImages}
                displayImageDescriptions={pages[currentPage].displayImageDescriptions || []}
                onUpdateFiles={(files) => {
                  onUpdatePage(currentPage, {
                    ...pages[currentPage],
                    files
                  });
                }}
                onUpdateImages={(images, descriptions) => {
                  onUpdatePage(currentPage, {
                    ...pages[currentPage],
                    displayImages: images,
                    displayImageDescriptions: descriptions
                  });
                }}
                disabled={disabled}
              />
            </Box>
          </ContentSection>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />
    </>
  );
};

export default ExercisePageManager;

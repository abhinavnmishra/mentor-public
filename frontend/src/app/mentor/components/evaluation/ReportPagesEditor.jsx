import React, {useEffect, useState} from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  alpha,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Add,
  Delete,
  DragIndicator,
  Article,
  NavigateNext,
  NavigateBefore,
  Warning
} from '@mui/icons-material';
// Note: Drag and drop functionality can be enhanced with react-beautiful-dnd if needed
import ReportPageFrame from './ReportPageFrame';
import ReportSectionEditor from './ReportSectionEditor';

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
  fontSize: '1.25rem',
  fontWeight: 700,
  color: colors.text.primary,
  marginBottom: '16px',
}));

const PageCard = styled(Paper)(({ theme, isSelected }) => ({
  minHeight: '120px',
  borderRadius: '12px',
  border: `2px solid ${isSelected ? colors.primary : colors.border}`,
  backgroundColor: isSelected ? alpha(colors.primary, 0.05) : colors.surface,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  '&:hover': {
    borderColor: colors.primary,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  }
}));

const PageSidebar = styled(Box)(({ theme }) => ({
  width: '280px',
  height: '70vh',
  overflowY: 'auto',
  padding: '16px',
  backgroundColor: colors.background,
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
}));

const PageEditor = styled(Box)(({ theme }) => ({
  flex: 1,
  marginLeft: '24px',
  height: '70vh',
  overflowY: 'auto',
  padding: '24px',
  backgroundColor: colors.surface,
  borderRadius: '12px',
  border: `1px solid ${colors.border}`,
}));

export default function ReportPagesEditor({ exerciseResponse, onUpdateReportPages }) {
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [pages, setPages] = useState(exerciseResponse.reportPages || [{
    title: 'Report Page 1',
    sections: [{
      title: 'Introduction',
      content: 'This is an auto-generated evaluation report.',
      imageUrl: null,
      imageTitle: ''
    }]
  }]);
  const [selectedPage, setSelectedPage] = useState(pages[selectedPageIndex] || pages[0]);

  useEffect(() => {

    setPages(exerciseResponse.reportPages || [{
      title: 'Report Page 1',
      sections: [{
        title: 'Introduction',
        content: 'This is an auto-generated evaluation report.',
        imageUrl: null,
        imageTitle: ''
      }]
    }]);

  }, [exerciseResponse]);

  useEffect(() => {
    console.log('Pages updated:');
    setSelectedPage(pages[selectedPageIndex] || pages[0]);
  }, [selectedPageIndex]);


  // Add new page
  const handleAddPage = () => {
    const newPages = [...pages];
    newPages.push({
      title: `Report Page ${newPages.length + 1}`,
      sections: [{
        title: 'New Section',
        content: 'Enter your content here...',
        imageUrl: null,
        imageTitle: ''
      }]
    });
    onUpdateReportPages(newPages);
  };

  // Delete page
  const handleDeletePage = (pageIndex) => {
    if (pages.length <= 1) {
      return; // Don't delete the last page
    }
    
    setPageToDelete(pageIndex);
    setDeleteConfirmOpen(true);
  };

  const confirmDeletePage = () => {
    if (pageToDelete !== null) {
      const newPages = pages.filter((_, index) => index !== pageToDelete);
      onUpdateReportPages(newPages);
      
      // Adjust selected page if necessary
      if (selectedPageIndex >= newPages.length) {
        setSelectedPageIndex(Math.max(0, newPages.length - 1));
      } else if (selectedPageIndex > pageToDelete) {
        setSelectedPageIndex(selectedPageIndex - 1);
      }
    }
    setDeleteConfirmOpen(false);
    setPageToDelete(null);
  };

  // Update page
  const handleUpdatePage = (pageIndex, updatedPage) => {
    console.log('Updating page at index', pageIndex, 'with data', updatedPage);
    const newPages = [...pages];
    newPages[pageIndex] = updatedPage;
    onUpdateReportPages(newPages);
  };

  // Update page title
  const handleUpdatePageTitle = (pageIndex, newTitle) => {
    const updatedPage = {
      ...pages[pageIndex],
      title: newTitle
    };
    handleUpdatePage(pageIndex, updatedPage);
  };

  // Add section to page
  const handleAddSection = (pageIndex) => {
    const newSection = {
      title: 'New Section',
      content: 'Enter your content here...',
      imageUrl: null,
      imageTitle: ''
    };
    
    const updatedPage = {
      ...pages[pageIndex],
      sections: [...pages[pageIndex].sections, newSection]
    };
    
    handleUpdatePage(pageIndex, updatedPage);
  };

  // Delete section from page
  const handleDeleteSection = (pageIndex, sectionIndex) => {
    const updatedPage = {
      ...pages[pageIndex],
      sections: pages[pageIndex].sections.filter((_, index) => index !== sectionIndex)
    };
    
    handleUpdatePage(pageIndex, updatedPage);
  };

  // Update section
  const handleUpdateSection = (pageIndex, sectionIndex, updatedSection) => {
    const updatedSections = [...pages[pageIndex].sections];
    updatedSections[sectionIndex] = updatedSection;
    
    const updatedPage = {
      ...pages[pageIndex],
      sections: updatedSections
    };
    console.log('#Updating section at index', sectionIndex, 'on page', pageIndex, 'with data', updatedSection);
    
    handleUpdatePage(pageIndex, updatedPage);
  };

  // Move section between pages
  const handleMoveSectionToPage = (fromPageIndex, sectionIndex, toPageIndex) => {
    if (fromPageIndex === toPageIndex) return;
    
    const sectionToMove = pages[fromPageIndex].sections[sectionIndex];
    
    // Remove from source page
    const updatedFromPage = {
      ...pages[fromPageIndex],
      sections: pages[fromPageIndex].sections.filter((_, index) => index !== sectionIndex)
    };
    
    // Add to target page
    const updatedToPage = {
      ...pages[toPageIndex],
      sections: [...pages[toPageIndex].sections, sectionToMove]
    };
    
    const newPages = [...pages];
    newPages[fromPageIndex] = updatedFromPage;
    newPages[toPageIndex] = updatedToPage;
    
    onUpdateReportPages(newPages);
  };

  // Handle section reordering within a page
  const handleSectionReorder = (pageIndex, startIndex, endIndex) => {
    const sections = [...pages[pageIndex].sections];
    const [movedSection] = sections.splice(startIndex, 1);
    sections.splice(endIndex, 0, movedSection);
    
    const updatedPage = {
      ...pages[pageIndex],
      sections
    };
    
    handleUpdatePage(pageIndex, updatedPage);
  };


  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <SectionTitle>Report Pages Editor</SectionTitle>
        <ActionButton
          variant="contained"
          color="primary"
          onClick={handleAddPage}
          startIcon={<Add />}
        >
          Add Page
        </ActionButton>
      </Box>

      <Grid container spacing={0}>
        {/* Pages Sidebar */}
        <Grid item>
          <PageSidebar>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 600,
                color: colors.text.primary
              }}
            >
              Pages ({pages.length})
            </Typography>
            {pages.map((page, index) => (
              <PageCard
                key={index}
                isSelected={selectedPageIndex === index}
                onClick={() => setSelectedPageIndex(index)}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: colors.text.primary,
                        flex: 1,
                        lineHeight: 1.3
                      }}
                    >
                      {page.title}
                    </Typography>
                    <Tooltip title="Delete Page">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePage(index);
                        }}
                        disabled={pages.length <= 1}
                        sx={{ ml: 1 }}
                      >
                        <Delete
                          fontSize="small"
                          sx={{
                            color: pages.length <= 1 ? colors.text.disabled : colors.error
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.text.secondary,
                      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                  >
                    {page.sections?.length || 0} sections
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                  <Article sx={{ color: colors.text.disabled, fontSize: '1.5rem' }} />
                </Box>
              </PageCard>
            ))}
          </PageSidebar>
        </Grid>

        {/* Page Editor */}
        <Grid item xs>
          <PageEditor>
            {selectedPage ? (
              <ReportPageFrame
                page={selectedPage}
                pageIndex={selectedPageIndex}
                onUpdatePage={handleUpdatePage}
                onUpdatePageTitle={handleUpdatePageTitle}
                onAddSection={handleAddSection}
                onDeleteSection={handleDeleteSection}
                onUpdateSection={handleUpdateSection}
                onMoveSectionToPage={handleMoveSectionToPage}
                onSectionReorder={handleSectionReorder}
                availablePages={pages.map((p, i) => ({ index: i, title: p.title }))}
              />
            ) : (
              <Box 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  border: `1px dashed ${colors.border}`,
                  borderRadius: '12px'
                }}
              >
                <Article sx={{ fontSize: 48, color: colors.text.disabled, mb: 2 }} />
                <Typography variant="h6" color={colors.text.secondary}>
                  No Page Selected
                </Typography>
              </Box>
            )}
          </PageEditor>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        aria-labelledby="delete-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ 
          background: `linear-gradient(135deg, ${colors.warning} 0%, ${colors.error} 100%)`,
          color: 'white',
          fontWeight: 600,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning />
            Confirm Delete Page
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: colors.text.primary
          }}>
            Are you sure you want to delete this page? This action cannot be undone.
          </Typography>
          {pageToDelete !== null && (
            <Typography variant="body2" sx={{
              mt: 2,
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              color: colors.text.secondary,
              fontWeight: 600
            }}>
              Page: "{pages[pageToDelete]?.title}"
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <ActionButton 
            onClick={() => setDeleteConfirmOpen(false)} 
            variant="outlined"
            sx={{ 
              borderColor: colors.border,
              color: colors.text.secondary
            }}
          >
            Cancel
          </ActionButton>
          <ActionButton 
            onClick={confirmDeletePage}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete Page
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

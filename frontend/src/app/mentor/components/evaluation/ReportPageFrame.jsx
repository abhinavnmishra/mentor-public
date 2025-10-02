import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  alpha,
  styled,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Edit,
  Add,
  DragIndicator,
  MoreVert,
  MoveUp,
  MoveDown,
  Delete,
  Forward,
  Article
} from '@mui/icons-material';
// Note: Drag and drop functionality can be enhanced with react-beautiful-dnd if needed
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

// PDF-like page frame
const PageFrame = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '800px',
  minHeight: '1000px', // A4-like aspect ratio
  margin: '0 auto',
  backgroundColor: colors.surface,
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  borderRadius: '8px',
  padding: '48px',
  border: `1px solid ${colors.border}`,
  position: 'relative',
  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  lineHeight: 1.6,
}));

const PageHeader = styled(Box)(({ theme }) => ({
  borderBottom: `2px solid ${colors.border}`,
  paddingBottom: '16px',
  marginBottom: '32px',
}));

const EditableTitle = styled(TextField)(({ theme }) => ({
  '& .MuiInput-root': {
    fontSize: '2rem',
    fontWeight: 700,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    color: colors.text.primary,
    '&:before': {
      display: 'none',
    },
    '&:after': {
      borderBottom: `2px solid ${colors.primary}`,
    },
  },
  '& .MuiInput-input': {
    padding: '8px 0',
    textAlign: 'center',
  }
}));

const SectionContainer = styled(Box)(({ theme }) => ({
  marginBottom: '32px',
  padding: '16px',
  borderRadius: '8px',
  border: `1px solid transparent`,
  backgroundColor: 'transparent',
  transition: 'all 0.2s ease-in-out',
  position: 'relative',
  '&:hover': {
    backgroundColor: alpha(colors.background, 0.5),
    '& .section-controls': {
      opacity: 1,
    }
  }
}));

const SectionControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '8px',
  right: '8px',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out',
  display: 'flex',
  gap: '4px',
  backgroundColor: colors.surface,
  borderRadius: '8px',
  padding: '4px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  border: `1px solid ${colors.border}`,
}));

const AddSectionButton = styled(Box)(({ theme }) => ({
  padding: '24px',
  border: `2px dashed ${colors.border}`,
  borderRadius: '8px',
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  marginTop: '24px',
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  }
}));

export default function ReportPageFrame({
  page,
  pageIndex,
  onUpdatePage,
  onUpdatePageTitle,
  onAddSection,
  onDeleteSection,
  onUpdateSection,
  onMoveSectionToPage,
  onSectionReorder,
  availablePages
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [sectionMenuAnchor, setSectionMenuAnchor] = useState(null);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(null);

  // Handle title editing
  const handleTitleClick = () => {
    setEditingTitle(true);
  };

  const handleTitleChange = (event) => {
    onUpdatePageTitle(pageIndex, event.target.value);
  };

  const handleTitleBlur = () => {
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setEditingTitle(false);
    }
  };

  // Handle section menu
  const handleSectionMenuClick = (event, sectionIndex) => {
    event.stopPropagation();
    setSectionMenuAnchor(event.currentTarget);
    setSelectedSectionIndex(sectionIndex);
  };

  const handleSectionMenuClose = () => {
    setSectionMenuAnchor(null);
    setSelectedSectionIndex(null);
  };

  // Handle section actions
  const handleMoveSection = (direction) => {
    if (selectedSectionIndex === null) return;
    
    const newIndex = direction === 'up' 
      ? Math.max(0, selectedSectionIndex - 1)
      : Math.min(page.sections.length - 1, selectedSectionIndex + 1);
    
    if (newIndex !== selectedSectionIndex) {
      onSectionReorder(pageIndex, selectedSectionIndex, newIndex);
    }
    
    handleSectionMenuClose();
  };

  const handleDeleteSection = () => {
    if (selectedSectionIndex !== null) {
      onDeleteSection(pageIndex, selectedSectionIndex);
    }
    handleSectionMenuClose();
  };

  const handleMoveSectionToPage = (targetPageIndex) => {
    if (selectedSectionIndex !== null) {
      onMoveSectionToPage(pageIndex, selectedSectionIndex, targetPageIndex);
    }
    handleSectionMenuClose();
  };

  // Handle section reordering
  const handleSectionMove = (sectionIndex, direction) => {
    const newIndex = direction === 'up' 
      ? Math.max(0, sectionIndex - 1)
      : Math.min(page.sections.length - 1, sectionIndex + 1);
    
    if (newIndex !== sectionIndex) {
      onSectionReorder(pageIndex, sectionIndex, newIndex);
    }
  };

  return (
    <PageFrame>
      {/* Page Header */}
      <PageHeader>
        {editingTitle ? (
          <EditableTitle
            variant="standard"
            value={page.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            fullWidth
          />
        ) : (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
            sx={{ cursor: 'pointer' }}
            onClick={handleTitleClick}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: colors.text.primary,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textAlign: 'center',
              }}
            >
              {page.title}
            </Typography>
            {/*<Tooltip title="Click to edit title">*/}
            {/*  <IconButton size="small" sx={{ ml: 1, opacity: 0.7 }}>*/}
            {/*    <Edit fontSize="small" />*/}
            {/*  </IconButton>*/}
            {/*</Tooltip>*/}
          </Box>
        )}
      </PageHeader>

      {/* Sections */}
      <Box>
        {page.sections.map((section, sectionIndex) => (
          <SectionContainer key={sectionIndex}>
            <SectionControls className="section-controls">
              <Tooltip title="Move section up">
                <IconButton 
                  size="small" 
                  onClick={() => handleSectionMove(sectionIndex, 'up')}
                  disabled={sectionIndex === 0}
                  sx={{ cursor: 'pointer' }}
                >
                  <DragIndicator fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="More options">
                <IconButton 
                  size="small"
                  onClick={(e) => handleSectionMenuClick(e, sectionIndex)}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Tooltip>
            </SectionControls>

            <ReportSectionEditor
              section={section}
              sectionIndex={sectionIndex}
              onUpdateSection={(updatedSection) => 
                onUpdateSection(pageIndex, sectionIndex, updatedSection)
              }
            />
          </SectionContainer>
        ))}
      </Box>

      {/* Add Section Button */}
      <AddSectionButton onClick={() => onAddSection(pageIndex)}>
        <Add sx={{ color: colors.primary, fontSize: '2rem', mb: 1 }} />
        <Typography
          variant="body1"
          sx={{
            color: colors.primary,
            fontWeight: 600,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Add New Section
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: colors.text.secondary,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}
        >
          Click to add content to this page
        </Typography>
      </AddSectionButton>

      {/* Section Actions Menu */}
      <Menu
        anchorEl={sectionMenuAnchor}
        open={Boolean(sectionMenuAnchor)}
        onClose={handleSectionMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${colors.border}`,
          }
        }}
      >
        <MenuItem 
          onClick={() => handleMoveSection('up')}
          disabled={selectedSectionIndex === 0}
        >
          <ListItemIcon>
            <MoveUp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move Up</ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleMoveSection('down')}
          disabled={selectedSectionIndex === page.sections.length - 1}
        >
          <ListItemIcon>
            <MoveDown fontSize="small" />
          </ListItemIcon>
          <ListItemText>Move Down</ListItemText>
        </MenuItem>

        <Divider />

        {availablePages
          .filter(p => p.index !== pageIndex)
          .map((targetPage) => (
            <MenuItem 
              key={targetPage.index}
              onClick={() => handleMoveSectionToPage(targetPage.index)}
            >
              <ListItemIcon>
                <Forward fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                Move to "{targetPage.title}"
              </ListItemText>
            </MenuItem>
          ))}

        {availablePages.filter(p => p.index !== pageIndex).length > 0 && <Divider />}

        <MenuItem 
          onClick={handleDeleteSection}
          sx={{ color: colors.error }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: colors.error }} />
          </ListItemIcon>
          <ListItemText>Delete Section</ListItemText>
        </MenuItem>
      </Menu>
    </PageFrame>
  );
}

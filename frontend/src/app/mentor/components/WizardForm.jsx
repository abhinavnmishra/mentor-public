import "../stylesheets/program.css"
import React, { useState, useEffect } from "react";
import {Card, Divider, Box, Pagination, Typography, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, alpha, Stack, Paper, Chip, Tooltip} from "@mui/material";
import Page from "./Page.jsx";
import {H2, H3, H4, H5, H6} from "../../components/Typography.jsx";
import {Add, LibraryAdd, Delete, Quiz, Info, Pages} from "@mui/icons-material";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from 'uuid';
import { styled } from "@mui/material/styles";

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

// Enhanced styled components
const ModernCard = styled(Card)(({ theme }) => ({
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    transition: 'all 0.2s ease-in-out',
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

const SectionHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: `1px solid ${colors.border}`,
}));

const GradientBanner = styled(Box)(({ theme }) => ({
    width: '100%',
    height: '180px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        zIndex: 1,
    }
}));

const StatsChip = styled(Chip)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontWeight: 600,
    fontSize: '0.75rem',
    height: '28px',
    borderRadius: '14px',
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
}));

const WizardForm = ({ questions, onQuestionsUpdate, currentPage, onPageChange, mentees, focusAreas = [], disabled = false }) => {
    const [pages, setPages] = useState(questions || [[]]);

    // Initialize pages from questions when the prop changes
    useEffect(() => {
        if (questions && JSON.stringify(questions) !== JSON.stringify(pages)) {
            setPages(questions);
        }
    }, [questions]);

    // Notify parent component when pages change
    useEffect(() => {
        if (onQuestionsUpdate) {
            onQuestionsUpdate(pages);
        }
    }, [pages]);

    const [openDialog, setOpenDialog] = useState(false);
    const [pageToDelete, setPageToDelete] = useState(null);

    const handlePageChange = (event, value) => {
        if (onPageChange) {
            onPageChange(value - 1);
        }
    };

    const handleMoveItem = (itemId, direction) => {
        const currentItems = [...pages];
        const currentPageItems = currentItems[currentPage];
        const itemIndex = currentPageItems.findIndex(item => item.id === itemId);
        const item = currentPageItems[itemIndex];

        // Remove item from current page
        currentPageItems.splice(itemIndex, 1);

        // Add item to target page
        const targetPageIndex = direction === 'next' ? currentPage + 1 : currentPage - 1;
        
        // Create new page if needed
        if (!currentItems[targetPageIndex]) {
            currentItems[targetPageIndex] = [];
        }

        currentItems[targetPageIndex].push(item);

        // Update indices for all items on both pages
        currentItems[currentPage] = currentPageItems.map((item, index) => ({
            ...item,
            index: index
        }));

        currentItems[targetPageIndex] = currentItems[targetPageIndex].map((item, index) => ({
            ...item,
            index: index
        }));

        setPages(currentItems);
    };

    const handleDeleteItem = (itemId) => {
        const updatedPages = [...pages];
        const currentItems = updatedPages[currentPage];
        const itemIndex = currentItems.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            // Remove item from current page
            currentItems.splice(itemIndex, 1);
            
            // Update indices for remaining items in current page
            currentItems.forEach((item, idx) => {
                item.index = idx;
            });

            setPages(updatedPages);
            console.log(`Deleted item ${itemId}`);
        }
    };

    const handleUpdateContent = (itemId, newContent) => {
        const updatedPages = [...pages];
        const currentItems = updatedPages[currentPage];
        const itemIndex = currentItems.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            currentItems[itemIndex] = {
                ...currentItems[itemIndex],
                content: newContent,
                version: (currentItems[itemIndex].version + 1)
            };
            setPages(updatedPages);
            console.log(`Updated content for item ${itemId}`);
        }
    };

    const handleUpdateOptions = (itemId, newOptions, newType) => {
        const updatedPages = [...pages];
        const currentItems = updatedPages[currentPage];
        const itemIndex = currentItems.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            currentItems[itemIndex] = {
                ...currentItems[itemIndex],
                options: newOptions,
                version: currentItems[itemIndex].version + 1,
                ...(newType && { type: newType })
            };
            setPages(updatedPages);
            console.log(`Updated options for item ${itemId}`);
        }
    };

    // Add method to update eval object
    const handleUpdateEval = (itemId, newEval) => {
        const updatedPages = [...pages];
        const currentItems = updatedPages[currentPage];
        const itemIndex = currentItems.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            currentItems[itemIndex] = {
                ...currentItems[itemIndex],
                eval: newEval,
                version: currentItems[itemIndex].version + 1
            };
            setPages(updatedPages);
            console.log(`Updated eval for item ${itemId}`);
        }
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = [...pages];
        const currentPageItems = [...items[currentPage]];
        const [reorderedItem] = currentPageItems.splice(result.source.index, 1);
        currentPageItems.splice(result.destination.index, 0, reorderedItem);

        // Update indices after reordering
        const updatedItems = currentPageItems.map((item, index) => ({
            ...item,
            index: index
        }));

        items[currentPage] = updatedItems;
        setPages(items);
    };

    const handleAddPage = () => {
        const newPage = []; // Create a new empty page
        setPages([...pages, newPage]); // Add the new page to the existing pages
        if (onPageChange) {
            onPageChange(pages.length); // Set the current page to the new page
        }
    };

    const handleDeletePage = () => {
        if (pages.length > 1) { // Ensure there's at least one page left
            const updatedPages = pages.filter((_, index) => index !== pageToDelete);
            setPages(updatedPages);
            if (onPageChange) {
                onPageChange(Math.max(0, Math.min(pageToDelete, updatedPages.length - 1))); // Move to appropriate page
            }
        } else {
            console.log("Cannot delete the last page.");
        }
        setOpenDialog(false);
    };

    const openDeleteDialog = (pageIndex) => {
        setPageToDelete(pageIndex);
        setOpenDialog(true);
    };

    const handleAddQuestion = () => {
        const updatedPages = [...pages];
        const newQuestion = {
            id: uuidv4(),
            version: 0,
            content: `New Question ${updatedPages[currentPage].length + 1}`,
            index: updatedPages[currentPage].length,
            type: "mcq",
            options: [],
            mentees: mentees.map(m => m.id), // Add all mentees by default
            eval: {
                numericScoring: false,
                reverseScoring: false,
                question_eval_score_criteria_high: "",
                question_eval_score_criteria_low: "",
                weight: 1,
                options: [],
                focusAreas: []
            }
        };
        updatedPages[currentPage].push(newQuestion);
        setPages(updatedPages);
    };

    // Add function to update mentees for a question
    const handleUpdateMentees = (itemId, newMentees) => {
        const updatedPages = [...pages];
        const currentItems = updatedPages[currentPage];
        const itemIndex = currentItems.findIndex(item => item.id === itemId);

        if (itemIndex !== -1) {
            currentItems[itemIndex] = {
                ...currentItems[itemIndex],
                mentees: newMentees
            };
            setPages(updatedPages);
            console.log(`Updated mentees for item ${itemId}`);
        }
    };

    return (
        <Box sx={{ 
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            <Box sx={{ position: 'relative', width: '100%' }}>
                {/* Modern Gradient Banner */}
                <GradientBanner>
                    <Box sx={{ 
                        textAlign: 'center', 
                        color: 'white', 
                        zIndex: 2, 
                        position: 'relative',
                        padding: '32px'
                    }}>
                        <Typography 
                            variant="h3" 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 700,
                                fontSize: '2.5rem',
                                marginBottom: '12px',
                                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                        >
                            Assessment Builder
                        </Typography>
                    </Box>
                </GradientBanner>

                {/* Main Content Card */}
                <ModernCard sx={{ 
                    padding: '32px', 
                    minHeight: '500px', 
                    position: 'relative', 
                    marginTop: '-45px',
                    zIndex: 2, 
                    marginInline: '24px',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header Section */}
                    <SectionHeader>
                        <Box sx={{ 
                            padding: '12px', 
                            borderRadius: '12px', 
                            backgroundColor: alpha(colors.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Quiz sx={{ color: colors.primary, fontSize: '24px' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 700,
                                    color: colors.text.primary,
                                    fontSize: '1.5rem',
                                    lineHeight: 1.2,
                                    marginBottom: '4px'
                                }}
                            >
                                Question Management
                            </Typography>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.secondary,
                                    fontSize: '0.875rem'
                                }}
                            >
                                Page {currentPage + 1} of {Math.max(1, pages.length)} • {(pages[currentPage] || []).length} questions
                            </Typography>
                        </Box>

                        {/* Stats and Actions */}
                        <Stack direction="row" spacing={2} alignItems="center">
                            <StatsChip 
                                icon={<Pages sx={{ fontSize: '16px' }} />}
                                label={`${Math.max(1, pages.length)} Pages`}
                            />
                            <StatsChip 
                                icon={<Quiz sx={{ fontSize: '16px' }} />}
                                label={`${pages.reduce((total, page) => total + (page?.length || 0), 0)} Questions`}
                            />
                        </Stack>
                    </SectionHeader>

                    {/* Action Buttons */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        gap: '12px', 
                        marginBottom: '24px' 
                    }}>
                        <Tooltip title="Add a new question to current page">
                            <ActionButton 
                                variant="contained" 
                                startIcon={<Add />} 
                                onClick={handleAddQuestion}
                                disabled={disabled}
                                sx={{
                                    backgroundColor: colors.success,
                                    '&:hover': {
                                        backgroundColor: '#059669',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                                    }
                                }}
                            >
                                Add Question
                            </ActionButton>
                        </Tooltip>
                        <Tooltip title="Create a new page">
                            <ActionButton 
                                variant="contained" 
                                startIcon={<LibraryAdd />} 
                                onClick={handleAddPage}
                                disabled={disabled}
                                sx={{
                                    backgroundColor: colors.primary,
                                    '&:hover': {
                                        backgroundColor: colors.primaryLight,
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                                    }
                                }}
                            >
                                Add Page
                            </ActionButton>
                        </Tooltip>
                        <Tooltip title="Delete current page">
                            <ActionButton 
                                variant="outlined" 
                                startIcon={<Delete />} 
                                onClick={() => openDeleteDialog(currentPage)}
                                disabled={disabled || pages.length <= 1}
                                sx={{
                                    color: colors.error,
                                    borderColor: colors.error,
                                    '&:hover': {
                                        backgroundColor: alpha(colors.error, 0.1),
                                        borderColor: colors.error,
                                    }
                                }}
                            >
                                Delete Page
                            </ActionButton>
                        </Tooltip>
                    </Box>

                    {/* Page Content */}
                    <Box sx={{ flex: 1, marginBottom: '24px' }}>
                        <Page 
                            items={pages[currentPage] || []} 
                            onDragEnd={onDragEnd}
                            currentPage={currentPage}
                            totalPages={pages.length}
                            onMoveItem={handleMoveItem}
                            onDeleteItem={handleDeleteItem}
                            onUpdateContent={handleUpdateContent}
                            onUpdateOptions={handleUpdateOptions}
                            onUpdateMentees={handleUpdateMentees}
                            onUpdateEval={handleUpdateEval}
                            mentees={mentees}
                            focusAreas={focusAreas}
                            disabled={disabled}
                        />
                    </Box>

                    {/* Pagination */}
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        paddingTop: '24px',
                        borderTop: `1px solid ${colors.border}`
                    }}>
                        <Pagination 
                            count={Math.max(1, pages.length)} 
                            page={currentPage + 1} 
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 500,
                                    borderRadius: '8px',
                                },
                                '& .Mui-selected': {
                                    backgroundColor: `${colors.primary} !important`,
                                    color: 'white',
                                }
                            }}
                        />
                    </Box>
                </ModernCard>
            </Box>

            {/* Delete Confirmation Dialog */}
            <Dialog 
                open={openDialog} 
                onClose={() => setOpenDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        padding: '8px'
                    }
                }}
            >
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ 
                            padding: '8px', 
                            borderRadius: '8px', 
                            backgroundColor: alpha(colors.error, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Delete sx={{ color: colors.error, fontSize: '20px' }} />
                        </Box>
                        <Typography 
                            variant="h6"
                            sx={{
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.primary
                            }}
                        >
                            Confirm Page Deletion
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ paddingTop: '16px' }}>
                    <Typography sx={{
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: colors.text.primary,
                        fontSize: '0.875rem'
                    }}>
                        Are you sure you want to delete this page? This action cannot be undone and will permanently remove all questions on this page.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <ActionButton onClick={() => setOpenDialog(false)}>
                        Cancel
                    </ActionButton>
                    <ActionButton 
                        onClick={handleDeletePage}
                        variant="contained"
                        sx={{
                            backgroundColor: colors.error,
                            '&:hover': {
                                backgroundColor: '#dc2626',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                            }
                        }}
                    >
                        Delete Page
                    </ActionButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

WizardForm.propTypes = {
    questions: PropTypes.arrayOf(PropTypes.array).isRequired,
    onQuestionsUpdate: PropTypes.func.isRequired,
    currentPage: PropTypes.number,
    onPageChange: PropTypes.func,
    mentees: PropTypes.array,
    focusAreas: PropTypes.array,
    disabled: PropTypes.bool
};

export default WizardForm;
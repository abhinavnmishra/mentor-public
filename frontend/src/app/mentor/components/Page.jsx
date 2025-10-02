import React from "react";
import { Typography, Box, alpha } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { styled } from "@mui/material/styles";
import QuestionItem from "./QuestionItem.jsx";

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

const DroppableContainer = styled(Box)(({ theme, isDraggingOver }) => ({
    padding: '16px',
    width: '100%',
    minHeight: '200px',
    background: isDraggingOver 
        ? `linear-gradient(135deg, ${alpha(colors.primary, 0.05)} 0%, ${alpha(colors.primaryLight, 0.08)} 100%)`
        : 'transparent',
    borderRadius: '12px',
    border: isDraggingOver 
        ? `2px dashed ${alpha(colors.primary, 0.3)}`
        : `2px dashed transparent`,
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    '&::before': isDraggingOver ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at center, ${alpha(colors.primary, 0.1)} 0%, transparent 70%)`,
        borderRadius: '12px',
        zIndex: 0,
    } : {}
}));

const EmptyState = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
    background: `linear-gradient(135deg, ${alpha(colors.background, 0.5)} 0%, ${alpha(colors.surface, 0.8)} 100%)`,
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    minHeight: '200px',
}));

export default function Page({ 
    items, 
    onDragEnd, 
    currentPage, 
    totalPages, 
    onMoveItem, 
    onDeleteItem,
    onUpdateContent,
    onUpdateOptions,
    onUpdateMentees,
    onUpdateEval,
    mentees,
    focusAreas
}) {
    const isEmpty = !items || items.length === 0;

    if (isEmpty) {
        return (
            <EmptyState>
                <Typography 
                    variant="h6" 
                    sx={{ 
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontWeight: 600,
                        color: colors.text.secondary,
                        fontSize: '1.125rem',
                        marginBottom: '8px'
                    }}
                >
                    No Questions Yet
                </Typography>
                <Typography 
                    sx={{ 
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        color: colors.text.disabled,
                        fontSize: '0.875rem',
                        maxWidth: '300px'
                    }}
                >
                    Start building your survey by adding questions or use the AI assistant to generate them automatically.
                </Typography>
            </EmptyState>
        );
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                    <DroppableContainer
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        isDraggingOver={snapshot.isDraggingOver}
                    >
                        {items.map((item, index) => (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                    <QuestionItem
                                        item={item}
                                        provided={provided}
                                        snapshot={snapshot}
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onMoveItem={onMoveItem}
                                        onDeleteItem={onDeleteItem}
                                        onUpdateContent={onUpdateContent}
                                        onUpdateOptions={onUpdateOptions}
                                        onUpdateMentees={onUpdateMentees}
                                        onUpdateEval={onUpdateEval}
                                        mentees={mentees}
                                        focusAreas={focusAreas}
                                    />
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </DroppableContainer>
                )}
            </Droppable>
        </DragDropContext>
    );
} 
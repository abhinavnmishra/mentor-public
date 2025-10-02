import "../stylesheets/program.css"
import React, { useState, useEffect, useRef } from "react";
import {
    Card, 
    IconButton, 
    InputAdornment, 
    styled, 
    CircularProgress,
    Button,
    Alert,
    Popper,
    Paper,
    MenuList,
    MenuItem,
    ClickAwayListener,
    Dialog,
    Box,
    Typography,
    Tooltip,
    alpha
} from "@mui/material";
import TextField from "@mui/material/TextField";
import SendIcon from '@mui/icons-material/Send';
import { H4 } from '../../components/Typography.jsx';
import { 
    AutoAwesome, 
    MoreHoriz, 
    Add, 
    PushPin, 
    OpenInFull, 
    CloseFullscreen,
    SmartToy,
    Person,
    QuestionAnswer
} from "@mui/icons-material";
import { useAxios } from "../../contexts/AxiosContext.jsx";
import { useAlert } from "../../contexts/AlertContext.jsx";

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

const ModernTextField = styled(TextField)(({ theme }) => ({
    '& .MuiInputLabel-root': {
        color: colors.text.secondary,
        fontWeight: 500,
        fontSize: '0.875rem',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: colors.primary,
    },
    '& .MuiOutlinedInput-root': {
        borderRadius: '24px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        backgroundColor: colors.surface,
        transition: 'all 0.2s ease-in-out',
        '& fieldset': {
            borderColor: colors.border,
            borderWidth: '1.5px',
        },
        '&:hover fieldset': {
            borderColor: colors.borderHover,
        },
        '&.Mui-focused fieldset': {
            borderColor: colors.primary,
            borderWidth: '2px',
            boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
        }
    },
    '& .MuiInputBase-input': {
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        color: colors.text.primary,
        padding: '12px 16px',
    }
}));

const MessageBubble = styled(Box)(({ isUser, isQuestion }) => ({
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '16px',
    marginBottom: '12px',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    backgroundColor: isQuestion 
        ? alpha(colors.warning, 0.1)
        : (isUser ? colors.primary : alpha(colors.secondary, 0.1)),
    color: isUser ? colors.surface : colors.text.primary,
    wordBreak: 'break-word',
    position: 'relative',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    border: isQuestion 
        ? `1px solid ${alpha(colors.warning, 0.2)}`
        : (isUser ? 'none' : `1px solid ${colors.border}`),
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    }
}));

const AddButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: colors.success,
    color: colors.surface,
    width: '28px',
    height: '28px',
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: '#059669',
        transform: 'scale(1.05)',
        boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)',
    },
    '& .MuiSvgIcon-root': {
        fontSize: '16px',
    }
}));

const OptionsList = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: `1px solid ${alpha(colors.border, 0.5)}`
});

const Option = styled(Box)({
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: alpha(colors.background, 0.8),
    border: `1px solid ${colors.border}`,
    cursor: 'default',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.8rem',
    color: colors.text.primary,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.background, 1),
        borderColor: colors.borderHover,
    }
});

const AdaptiveContainer = styled(({ maximized, ...props }) => 
    maximized ? <Dialog {...props} /> : <Card {...props} />
)(({ theme, maximized, pinned }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    ...(maximized ? {
        '& .MuiDialog-paper': {
            width: '85vw',
            maxWidth: '1200px',
            height: '85vh',
            maxHeight: '900px',
            margin: '20px',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }
    } : {
        height: '72vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        ...(pinned && {
            position: 'fixed',
            right: '24px',
            top: '120px',
            width: '690px',
            height: '85vh',
            zIndex: 1000,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        })
    })
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
    padding: '20px 24px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: alpha(colors.background, 0.5),
    borderRadius: '16px 16px 0 0',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: colors.surface,
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-track': {
        backgroundColor: alpha(colors.border, 0.3),
        borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
        backgroundColor: alpha(colors.secondary, 0.5),
        borderRadius: '3px',
        '&:hover': {
            backgroundColor: alpha(colors.secondary, 0.7),
        }
    }
}));

const InputContainer = styled(Box)(({ theme }) => ({
    padding: '20px 24px',
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: alpha(colors.background, 0.3),
    borderRadius: '0 0 16px 16px',
}));

const ActionButton = styled(Button)(({ theme }) => ({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '8px 16px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-1px)',
    }
}));

const LoadingIndicator = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    gap: '8px'
}));

const EmptyState = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
    color: colors.text.secondary,
    minHeight: '200px'
}));

const ActionIconButton = styled(IconButton)(({ theme, variant }) => ({
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'scale(1.05)',
    }
}));

export default function WizardChat({chatId, onAddQuestion, mentees, disabled = false}) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [inputMessage, setInputMessage] = useState('');
    const [messageCount, setMessageCount] = useState(50);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef(null);
    const axiosInstance = useAxios();
    const { showAlert } = useAlert();
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isPinned, setIsPinned] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    useEffect(() => {
        if (!loadingMore) {
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    }, [messages, loadingMore]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await axiosInstance.get(`/api/ai/chat/survey/${chatId}/${messageCount}`);
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setError('Failed to load chat history. Please try again.');
            showAlert('Failed to load chat history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadMoreMessages = async () => {
        try {
            setLoadingMore(true);
            setError(null);
            
            const container = messagesContainerRef.current;
            const scrollHeight = container?.scrollHeight || 0;
            
            const newCount = messageCount + 20;
            const { data } = await axiosInstance.get(`/api/ai/chat/survey/${chatId}/${newCount}`);
            setMessages(data);
            setMessageCount(newCount);
            
            setTimeout(() => {
                if (container) {
                    const newHeight = container.scrollHeight;
                    const heightDifference = newHeight - scrollHeight;
                    container.scrollTop = heightDifference > 0 ? heightDifference : 0;
                }
            }, 100);
        } catch (error) {
            console.error('Error loading more messages:', error);
            showAlert('Failed to load more messages', 'error');
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSend = async () => {
        if (!inputMessage.trim() || disabled) return;

        try {
            setLoading(true);
            setError(null);
            const { data } = await axiosInstance.post(`/api/ai/chat/survey/${chatId}`, {
                prompt: inputMessage,
                count: messageCount
            });
            setInputMessage('');
            setMessages(data);
            
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        } catch (error) {
            console.error('Error sending message:', error);
            setError('Failed to send message. Please try again.');
            showAlert('Failed to send message', 'error');
            fetchMessages();
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    const getQuestionType = (messageType) => {
        switch(messageType) {
            case 'question-descriptive':
                return 'descriptive';
            case 'question-mcq':
                return 'mcq';
            case 'question-mcq-multiselect':
                return 'mcq-multiselect';
            case 'question-rating':
                return 'rating';
            default:
                return null;
        }
    };

    const handleAddQuestion = (message) => {
        if (!onAddQuestion || disabled) return;
        
        const questionType = getQuestionType(message.type);
        if (!questionType) return;

        onAddQuestion({
            type: questionType,
            content: message.content,
            options: message.options || [],
            highScoreCriteria: message.highScoreCriteria || '',
            lowScoreCriteria: message.lowScoreCriteria || '',
            optionScores: message.optionScores || []
        });
        showAlert('Question added successfully', 'success');
    };

    const renderMessage = (message, index) => {
        const isUser = message.type === 'user';
        const isQuestion = message.type.includes('question');
        
        return (
            <MessageBubble key={index} isUser={isUser} isQuestion={isQuestion}>
                {message.content}
                {message.options && message.options.length > 0 && (
                    <OptionsList>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                fontWeight: 600,
                                color: colors.text.secondary,
                                fontSize: '0.75rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                marginBottom: '8px'
                            }}
                        >
                            Answer Options:
                        </Typography>
                        {message.options.map((option, optIndex) => (
                            <Option key={optIndex}>
                                {option}
                                {message.optionScores && message.optionScores[optIndex] && (
                                    <Typography 
                                        component="span" 
                                        sx={{ 
                                            marginLeft: '8px',
                                            color: colors.text.secondary,
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        (Score: {message.optionScores[optIndex]})
                                    </Typography>
                                )}
                            </Option>
                        ))}
                    </OptionsList>
                )}
                {message.highScoreCriteria && (
                    <Box sx={{ 
                        marginTop: '12px',
                        padding: '8px 12px',
                        backgroundColor: alpha(colors.success, 0.1),
                        borderRadius: '8px',
                        border: `1px solid ${alpha(colors.success, 0.2)}`
                    }}>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                display: 'block',
                                fontWeight: 600,
                                color: colors.success,
                                marginBottom: '4px'
                            }}
                        >
                            High Score Criteria:
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: colors.text.primary }}>
                            {message.highScoreCriteria}
                        </Typography>
                    </Box>
                )}
                {message.lowScoreCriteria && (
                    <Box sx={{ 
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: alpha(colors.warning, 0.1),
                        borderRadius: '8px',
                        border: `1px solid ${alpha(colors.warning, 0.2)}`
                    }}>
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                display: 'block',
                                fontWeight: 600,
                                color: colors.warning,
                                marginBottom: '4px'
                            }}
                        >
                            Low Score Criteria:
                        </Typography>
                        <Typography sx={{ fontSize: '0.8rem', color: colors.text.primary }}>
                            {message.lowScoreCriteria}
                        </Typography>
                    </Box>
                )}
                {isQuestion && onAddQuestion && !disabled && (
                    <Tooltip title="Add this question to your survey">
                        <AddButton
                            onClick={() => handleAddQuestion(message)}
                            size="small"
                        >
                            <Add />
                        </AddButton>
                    </Tooltip>
                )}
            </MessageBubble>
        );
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        const cursorPos = e.target.selectionStart;
        setCursorPosition(cursorPos);
        setInputMessage(newValue);
        
        const lastAtSymbol = newValue.lastIndexOf('@', cursorPos);
        if (lastAtSymbol !== -1) {
            const nextSpace = newValue.indexOf(' ', lastAtSymbol);
            const endPos = nextSpace === -1 ? newValue.length : nextSpace;
            
            if (cursorPos > lastAtSymbol && cursorPos <= endPos) {
                const searchTerm = newValue.substring(lastAtSymbol + 1, cursorPos).toLowerCase();
                setMentionSearch(searchTerm);
                setShowMentions(true);
                setMentionAnchorEl(e.target);
                setSelectedIndex(-1);
                return;
            }
        }
        
        setShowMentions(false);
        setSelectedIndex(-1);
    };

    const handleKeyDown = (e) => {
        if (!showMentions) return;

        const filteredMentees = getFilteredMentees();
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prevIndex => 
                    prevIndex < filteredMentees.length - 1 ? prevIndex + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prevIndex => 
                    prevIndex > 0 ? prevIndex - 1 : filteredMentees.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < filteredMentees.length) {
                    handleMentionSelect(filteredMentees[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowMentions(false);
                setSelectedIndex(-1);
                break;
            default:
                break;
        }
    };

    const getFilteredMentees = () => {
        if (!mentionSearch) return mentees;
        return mentees.filter(mentee => 
            mentee.keywords.toLowerCase().includes(mentionSearch.toLowerCase())
        );
    };

    const handleMentionSelect = (mentee) => {
        const lastAtSymbol = inputMessage.lastIndexOf('@', cursorPosition);
        if (lastAtSymbol === -1) return;

        const nextSpace = inputMessage.indexOf(' ', lastAtSymbol);
        const beforeMention = inputMessage.substring(0, lastAtSymbol);
        const afterMention = nextSpace === -1 
            ? inputMessage.substring(cursorPosition)
            : inputMessage.substring(nextSpace);
            
        const newMessage = `${beforeMention}@${mentee.name}${afterMention}`;
        setInputMessage(newMessage);
        setShowMentions(false);
        
        if (inputRef.current) {
            const newCursorPos = lastAtSymbol + mentee.name.length + 1;
            inputRef.current.focus();
            setTimeout(() => {
                inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        }
    };

    const handleMaximizeToggle = () => {
        setIsMaximized(!isMaximized);
        if (isPinned) setIsPinned(false);
    };

    const isEmpty = messages.length === 0 && !loading;

    return (
        <AdaptiveContainer 
            maximized={isMaximized}
            pinned={isPinned}
            open={isMaximized}
            onClose={() => setIsMaximized(false)}
        >
            <>
                <HeaderContainer>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Box sx={{ 
                            padding: '8px', 
                            borderRadius: '10px', 
                            backgroundColor: alpha(colors.primary, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <SmartToy sx={{ color: colors.primary, fontSize: '20px' }} />
                        </Box>
                        <Box>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontWeight: 700,
                                    color: colors.text.primary,
                                    fontSize: '1.125rem',
                                    lineHeight: 1.2,
                                    marginBottom: '2px'
                                }}
                            >
                                AI Assistant
                            </Typography>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.secondary,
                                    fontSize: '0.75rem'
                                }}
                            >
                                Generate questions and get survey help
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: '8px' }}>
                        <Tooltip title={isPinned ? "Unpin chat" : "Pin chat to screen"}>
                            <ActionIconButton
                                onClick={() => setIsPinned(!isPinned)}
                                sx={{
                                    backgroundColor: isPinned ? alpha(colors.primary, 0.1) : alpha(colors.secondary, 0.1),
                                    color: isPinned ? colors.primary : colors.secondary,
                                    border: `1px solid ${isPinned ? alpha(colors.primary, 0.2) : alpha(colors.secondary, 0.2)}`,
                                    transform: isPinned ? 'rotate(45deg)' : 'none',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        backgroundColor: isPinned ? alpha(colors.primary, 0.15) : alpha(colors.secondary, 0.15),
                                    }
                                }}
                                disabled={isMaximized}
                            >
                                <PushPin sx={{ fontSize: '18px' }} />
                            </ActionIconButton>
                        </Tooltip>
                        <Tooltip title={isMaximized ? "Exit fullscreen" : "Open in fullscreen"}>
                            <ActionIconButton
                                onClick={handleMaximizeToggle}
                                sx={{
                                    backgroundColor: isMaximized ? alpha(colors.primary, 0.1) : alpha(colors.secondary, 0.1),
                                    color: isMaximized ? colors.primary : colors.secondary,
                                    border: `1px solid ${isMaximized ? alpha(colors.primary, 0.2) : alpha(colors.secondary, 0.2)}`,
                                    '&:hover': {
                                        backgroundColor: isMaximized ? alpha(colors.primary, 0.15) : alpha(colors.secondary, 0.15),
                                    }
                                }}
                            >
                                {isMaximized ? <CloseFullscreen sx={{ fontSize: '18px' }} /> : <OpenInFull sx={{ fontSize: '18px' }} />}
                            </ActionIconButton>
                        </Tooltip>
                    </Box>
                </HeaderContainer>

                <MessagesContainer ref={messagesContainerRef}>
                    {loadingMore && (
                        <LoadingIndicator>
                            <CircularProgress size={20} sx={{ color: colors.primary }} />
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '0.875rem',
                                    color: colors.text.secondary
                                }}
                            >
                                Loading more messages...
                            </Typography>
                        </LoadingIndicator>
                    )}

                    {messages.length >= messageCount && (
                        <ActionButton
                            onClick={loadMoreMessages}
                            startIcon={<MoreHoriz />}
                            disabled={loadingMore}
                            sx={{ 
                                alignSelf: 'center', 
                                marginBottom: '16px',
                                color: colors.primary,
                                backgroundColor: alpha(colors.primary, 0.1),
                                border: `1px solid ${alpha(colors.primary, 0.2)}`,
                                '&:hover': {
                                    backgroundColor: alpha(colors.primary, 0.15),
                                }
                            }}
                        >
                            {loadingMore ? 'Loading...' : 'Load More Messages'}
                        </ActionButton>
                    )}

                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ 
                                marginBottom: '16px',
                                borderRadius: '12px',
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    {isEmpty && (
                        <EmptyState>
                            <QuestionAnswer sx={{ fontSize: '48px', marginBottom: '16px', color: colors.text.disabled }} />
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
                                Start a Conversation
                            </Typography>
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    color: colors.text.disabled,
                                    fontSize: '0.875rem',
                                    maxWidth: '280px'
                                }}
                            >
                                Ask the AI assistant to help you create survey questions, get suggestions, or improve your content.
                            </Typography>
                        </EmptyState>
                    )}

                    {messages.map((message, index) => renderMessage(message, index))}

                    {loading && (
                        <LoadingIndicator>
                            <CircularProgress size={20} sx={{ color: colors.primary }} />
                            <Typography 
                                sx={{ 
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '0.875rem',
                                    color: colors.text.secondary
                                }}
                            >
                                AI is thinking...
                            </Typography>
                        </LoadingIndicator>
                    )}

                    <div ref={messagesEndRef} />
                </MessagesContainer>

                <InputContainer>
                    <ModernTextField
                        fullWidth
                        inputRef={inputRef}
                        placeholder={disabled ? "Chat is disabled while survey is published" : "Ask me anything about your survey... Use @ to mention mentees"}
                        value={inputMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onKeyPress={handleKeyPress}
                        disabled={loading || disabled}
                        autoComplete="off"
                        multiline
                        maxRows={4}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <Tooltip title={disabled ? "Chat disabled" : "Send message"}>
                                        <span>
                                            <IconButton
                                                onClick={handleSend}
                                                edge="end"
                                                disabled={loading || !inputMessage.trim() || disabled}
                                                sx={{
                                                    backgroundColor: alpha(colors.primary, 0.1),
                                                    color: colors.primary,
                                                    border: `1px solid ${alpha(colors.primary, 0.2)}`,
                                                    borderRadius: '10px',
                                                    marginRight: '4px',
                                                    transition: 'all 0.2s ease-in-out',
                                                    '&:hover': {
                                                        backgroundColor: alpha(colors.primary, 0.15),
                                                        transform: 'scale(1.05)',
                                                    },
                                                    '&:disabled': {
                                                        backgroundColor: alpha(colors.text.disabled, 0.1),
                                                        color: colors.text.disabled,
                                                        borderColor: alpha(colors.text.disabled, 0.2),
                                                    }
                                                }}
                                            >
                                                {loading ? <CircularProgress size={18} /> : <SendIcon sx={{ fontSize: '18px' }} />}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Popper
                        open={showMentions}
                        anchorEl={mentionAnchorEl}
                        placement="top-start"
                        style={{ zIndex: 1300 }}
                    >
                        <Paper sx={{ 
                            borderRadius: '12px',
                            border: `1px solid ${colors.border}`,
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            overflow: 'hidden'
                        }}>
                            <ClickAwayListener onClickAway={() => {
                                setShowMentions(false);
                                setSelectedIndex(-1);
                            }}>
                                <MenuList sx={{ padding: '8px' }}>
                                    {getFilteredMentees().map((mentee, index) => (
                                        <MenuItem
                                            key={mentee.id}
                                            onClick={() => handleMentionSelect(mentee)}
                                            selected={index === selectedIndex}
                                            sx={{
                                                borderRadius: '8px',
                                                marginBottom: '4px',
                                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                fontSize: '0.875rem',
                                                '&.Mui-selected': {
                                                    backgroundColor: alpha(colors.primary, 0.1),
                                                    color: colors.primary,
                                                },
                                                '&.Mui-selected:hover': {
                                                    backgroundColor: alpha(colors.primary, 0.15),
                                                },
                                                '&:hover': {
                                                    backgroundColor: alpha(colors.secondary, 0.1),
                                                }
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Person sx={{ fontSize: '16px', color: colors.text.secondary }} />
                                                <Box>
                                                    <Typography sx={{ 
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                        fontWeight: 500,
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        {mentee.name}
                                                    </Typography>
                                                    <Typography sx={{ 
                                                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                                        fontSize: '0.75rem',
                                                        color: colors.text.secondary
                                                    }}>
                                                        {mentee.email}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Popper>
                </InputContainer>
            </>
        </AdaptiveContainer>
    );
}
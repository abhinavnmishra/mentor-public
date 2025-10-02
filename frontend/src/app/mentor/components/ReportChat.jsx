import {
    Box,
    Card,
    IconButton,
    InputAdornment,
    styled,
    CircularProgress,
    Dialog,
    Button,
    Typography,
    alpha,
    Fade,
    Zoom
} from "@mui/material";
import { 
    Send, 
    PushPin, 
    OpenInFull, 
    CloseFullscreen, 
    MoreHoriz,
    SmartToy,
    Person,
    Edit,
    AutoAwesome
} from "@mui/icons-material";
import React, { useState, useEffect, useRef } from "react";
import { H4 } from '../../components/Typography.jsx';
import { useAlert } from "../../contexts/AlertContext.jsx";
import TextField from "@mui/material/TextField";
import { useAxios } from "../../contexts/AxiosContext.jsx";

// Modern color palette - consistent with ReportView and ReportWizard
const colors = {
    primary: '#2563eb',
    primaryLight: '#3b82f6',
    secondary: '#7c3aed',
    success: '#059669',
    warning: '#d97706',
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
    "& .MuiOutlinedInput-root": {
        borderRadius: "16px",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        backgroundColor: colors.surface,
        border: `2px solid ${colors.border}`,
        transition: "all 0.3s ease-in-out",
        '&:hover': {
            borderColor: colors.borderHover,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
        '&.Mui-focused': {
            borderColor: colors.primary,
            boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
            background: colors.surface,
        },
    },
    "& .MuiOutlinedInput-input": {
        padding: "12px 16px",
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.875rem',
        color: colors.text.primary,
        '&::placeholder': {
            color: colors.text.secondary,
            opacity: 1,
        }
    },
    "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
    },
}));

const MessageBubble = styled('div')(({ isUser, isOperation }) => ({
    maxWidth: '85%',
    padding: '12px 16px',
    borderRadius: '16px',
    marginBottom: '12px',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    lineHeight: 1.5,
    backgroundColor: isOperation 
        ? alpha(colors.warning, 0.1)
        : isUser 
            ? colors.primary
            : alpha(colors.background, 0.8),
    color: isUser ? colors.surface : colors.text.primary,
    wordBreak: 'break-word',
    position: 'relative',
    border: isOperation ? `1px dashed ${colors.warning}` : 'none',
    boxShadow: isUser 
        ? '0 4px 12px rgba(37, 99, 235, 0.2)' 
        : '0 2px 8px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-1px)',
        boxShadow: isUser 
            ? '0 6px 16px rgba(37, 99, 235, 0.3)' 
            : '0 4px 12px rgba(0, 0, 0, 0.12)',
    },
    // HTML content styling for assistant messages
    '& h1, & h2, & h3, & h4, & h5, & h6': {
        margin: '12px 0 8px 0',
        fontWeight: 600,
        color: 'inherit',
        '&:first-child': {
            marginTop: 0
        }
    },
    '& h1': { fontSize: '1.25rem' },
    '& h2': { fontSize: '1.125rem' },
    '& h3': { fontSize: '1rem' },
    '& p': {
        margin: '8px 0',
        '&:first-child': {
            marginTop: 0
        },
        '&:last-child': {
            marginBottom: 0
        }
    },
    '& ul, & ol': {
        margin: '8px 0',
        paddingLeft: '20px',
        '&:first-child': {
            marginTop: 0
        },
        '&:last-child': {
            marginBottom: 0
        }
    },
    '& li': {
        margin: '4px 0',
        lineHeight: 1.4
    },
    '& strong, & b': {
        fontWeight: 600,
        color: isUser ? 'inherit' : colors.text.primary
    },
    '& em, & i': {
        fontStyle: 'italic',
        color: isUser ? 'inherit' : colors.text.secondary
    },
    '& br': {
        lineHeight: 1.5
    },
    ...(isOperation && {
        '&::before': {
            content: '"✏️"',
            position: 'absolute',
            top: '8px',
            left: '8px',
            fontSize: '12px'
        },
        paddingLeft: '32px'
    })
}));

const MessageIcon = styled(Box)(({ isUser, isOperation }) => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isOperation 
        ? alpha(colors.warning, 0.1)
        : isUser 
            ? alpha(colors.primary, 0.1)
            : alpha(colors.secondary, 0.1),
    color: isOperation 
        ? colors.warning
        : isUser 
            ? colors.primary
            : colors.secondary,
    marginBottom: '8px',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    fontSize: '16px',
    border: `1px solid ${isOperation 
        ? alpha(colors.warning, 0.2)
        : isUser 
            ? alpha(colors.primary, 0.2)
            : alpha(colors.secondary, 0.2)}`
}));

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
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${colors.border}`,
        }
    } : {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 130px)',
        overflow: 'hidden',
        borderRadius: '16px',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        ...(pinned && {
            position: 'fixed',
            right: '20px',
            top: '96px',
            width: '32vw',
            zIndex: 1000,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${colors.border}`,
        })
    })
}));

const MessagesContainer = styled(Box)({
    flexGrow: 1,
    overflow: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: alpha(colors.background, 0.3),
    '&::-webkit-scrollbar': {
        width: '6px',
    },
    '&::-webkit-scrollbar-track': {
        background: alpha(colors.border, 0.3),
        borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: alpha(colors.primary, 0.3),
        borderRadius: '3px',
        '&:hover': {
            background: alpha(colors.primary, 0.5),
        },
    },
});

const InputContainer = styled(Box)({
    padding: '20px',
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: colors.surface,
});

const HeaderContainer = styled(Box)({
    padding: '20px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
});

const ActionButton = styled(IconButton)(({ active }) => ({
    borderRadius: '12px',
    padding: '8px',
    transition: 'all 0.2s ease-in-out',
    backgroundColor: active ? alpha(colors.primary, 0.1) : 'transparent',
    color: active ? colors.primary : colors.text.secondary,
    border: `1px solid ${active ? alpha(colors.primary, 0.2) : 'transparent'}`,
    '&:hover': {
        backgroundColor: active ? alpha(colors.primary, 0.15) : alpha(colors.primary, 0.05),
        color: colors.primary,
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    '&:disabled': {
        color: colors.text.disabled,
        backgroundColor: 'transparent',
    }
}));

const LoadMoreButton = styled(Button)({
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '8px 16px',
    alignSelf: 'center',
    marginBottom: '16px',
    backgroundColor: alpha(colors.primary, 0.1),
    color: colors.primary,
    border: `1px solid ${alpha(colors.primary, 0.2)}`,
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.15),
        borderColor: alpha(colors.primary, 0.3),
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(37, 99, 235, 0.2)',
    },
    '&:disabled': {
        backgroundColor: alpha(colors.text.disabled, 0.1),
        color: colors.text.disabled,
        borderColor: 'transparent',
    }
});

const SendButton = styled(IconButton)({
    borderRadius: '12px',
    padding: '10px',
    backgroundColor: colors.primary,
    color: colors.surface,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: colors.primaryLight,
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    },
    '&:disabled': {
        backgroundColor: colors.text.disabled,
        color: colors.surface,
    }
});

export default function ReportChat({ formData, setFormData }) {
    const { showAlert } = useAlert();
    const axiosInstance = useAxios();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const [isPinned, setIsPinned] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [chatCount, setChatCount] = useState(20);
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

    // Initialize messages from formData.chatItems when formData changes
    useEffect(() => {
        if (formData && formData.chatItems && formData.chatItems.length > 0) {
            const formattedMessages = formData.chatItems.map((item, index) => ({
                id: index,
                content: item.message,
                type: item.type === 'user' 
                    ? 'user' 
                    : item.type === 'write-operation' 
                        ? 'operation' 
                        : 'assistant'
            }));
            
            setMessages(formattedMessages);
            
            if (!loadingMore) {
                setTimeout(() => {
                    if (messagesContainerRef.current) {
                        scrollToBottom();
                    }
                }, 100);
            }
        } else {
            setMessages([
                { 
                    id: 1, 
                    content: "Hello! I'm your AI assistant. I can help you design and refine your report. What would you like to work on?", 
                    type: 'assistant' 
                }
            ]);
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    scrollToBottom();
                }
            }, 100);
        }
    }, [formData]);

    const scrollToBottom = () => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTop = container.scrollHeight;
        }
    };

    const loadMoreMessages = async () => {
        if (!formData?.id || loadingMore) return;
        
        try {
            setLoadingMore(true);
            
            const container = messagesContainerRef.current;
            const scrollHeight = container?.scrollHeight || 0;
            
            const nextCount = chatCount + 20;
            const { data } = await axiosInstance.get(`/api/ai/chat/report/${formData.id}?count=${nextCount}`);
            
            if (data && data.length > 0) {
                setChatCount(nextCount);
                
                const formattedMessages = data.map((item, index) => ({
                    id: index,
                    content: item.message,
                    type: item.type === 'user' 
                        ? 'user' 
                        : item.type === 'write-operation' 
                            ? 'operation' 
                            : 'assistant'
                }));
                
                setMessages(formattedMessages);
                
                setTimeout(() => {
                    if (container && container.scrollHeight) {
                        const newHeight = container.scrollHeight;
                        const heightDifference = newHeight - scrollHeight;
                        container.scrollTop = heightDifference > 0 ? heightDifference : 0;
                    }
                }, 100);
            } else {
                showAlert('No more messages to load', 'info');
            }
        } catch (error) {
            console.error('Error loading more messages:', error);
            showAlert('Failed to load more messages', 'error');
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !formData?.id) return;

        const tempId = Date.now();
        const newMessage = { id: tempId, content: inputMessage, type: 'user' };
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setChatLoading(true);
        
        setTimeout(() => {
            if (messagesContainerRef.current) {
                scrollToBottom();
            }
        }, 50);

        try {
            const requestPayload = {
                ...formData,
                promptDto: {
                    prompt: inputMessage,
                    count: chatCount
                }
            };

            const { data } = await axiosInstance.post(`/api/ai/chat/report`, requestPayload);
            
            setFormData(data);
            
            setTimeout(() => {
                if (messagesContainerRef.current) {
                    scrollToBottom();
                }
            }, 100);
        } catch (error) {
            console.error('Error sending message:', error);
            showAlert('Failed to get AI response', 'error');
            
            setMessages(prev => prev.filter(msg => msg.id !== tempId));
        } finally {
            setChatLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleMaximizeToggle = () => {
        setIsMaximized(!isMaximized);
        if (isPinned) setIsPinned(false);
    };

    const getMessageIcon = (type) => {
        switch (type) {
            case 'user':
                return <Person fontSize="small" />;
            case 'operation':
                return <Edit fontSize="small" />;
            default:
                return <SmartToy fontSize="small" />;
        }
    };

    return (
        <AdaptiveContainer
            maximized={isMaximized}
            pinned={isPinned}
            open={isMaximized}
            onClose={() => setIsMaximized(false)}
        >
            <HeaderContainer>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                        padding: '8px', 
                        borderRadius: '12px', 
                        backgroundColor: alpha(colors.secondary, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <AutoAwesome sx={{ color: colors.secondary, fontSize: '20px' }} />
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
                            variant="caption" 
                            sx={{
                                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                color: colors.text.secondary,
                                fontSize: '0.75rem'
                            }}
                        >
                            Powered by Mentivo AI
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <ActionButton
                        onClick={() => setIsPinned(!isPinned)}
                        active={isPinned}
                        disabled={isMaximized}
                        title={isPinned ? "Unpin chat" : "Pin chat"}
                    >
                        <PushPin sx={{ 
                            transform: isPinned ? 'rotate(45deg)' : 'none',
                            transition: 'transform 0.2s ease'
                        }} />
                    </ActionButton>
                    <ActionButton
                        onClick={handleMaximizeToggle}
                        active={isMaximized}
                        title={isMaximized ? "Minimize chat" : "Maximize chat"}
                    >
                        {isMaximized ? <CloseFullscreen /> : <OpenInFull />}
                    </ActionButton>
                </Box>
            </HeaderContainer>

            <MessagesContainer ref={messagesContainerRef}>
                {messages.length >= chatCount && (
                    <LoadMoreButton
                        onClick={loadMoreMessages}
                        startIcon={<MoreHoriz />}
                        disabled={loadingMore}
                    >
                        {loadingMore ? 'Loading...' : 'Load More Messages'}
                    </LoadMoreButton>
                )}
                
                {messages.map((message) => (
                    <Box key={message.id} sx={{ display: 'flex', flexDirection: 'column', mb: 1 }}>
                        <MessageIcon 
                            isUser={message.type === 'user'}
                            isOperation={message.type === 'operation'}
                        >
                            {getMessageIcon(message.type)}
                        </MessageIcon>
                        <MessageBubble 
                            isUser={message.type === 'user'}
                            isOperation={message.type === 'operation'}
                        >
                            {message.type === 'operation' && (
                                <Box sx={{ 
                                    fontWeight: 600, 
                                    fontSize: '0.75rem', 
                                    color: colors.warning,
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Edit fontSize="small" />
                                    Write Operation
                                </Box>
                            )}
                            {message.type === 'user' ? (
                                // Render user messages as plain text for security
                                message.content
                            ) : (
                                // Render assistant and operation messages with HTML support
                                <div dangerouslySetInnerHTML={{ __html: message.content }} />
                            )}
                        </MessageBubble>
                    </Box>
                ))}
                
                {chatLoading && (
                    <Zoom in={chatLoading}>
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            my: 2,
                            gap: 2
                        }}>
                            <CircularProgress size={20} sx={{ color: colors.primary }} />
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: colors.text.secondary,
                                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                                    fontSize: '0.75rem'
                                }}
                            >
                                AI is thinking...
                            </Typography>
                        </Box>
                    </Zoom>
                )}
                
                <div ref={messagesEndRef} />
            </MessagesContainer>

            <InputContainer>
                <ModernTextField
                    fullWidth
                    multiline
                    maxRows={4}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your report..."
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SendButton
                                    onClick={handleSendMessage}
                                    disabled={chatLoading || !inputMessage.trim() || !formData?.id}
                                    title="Send message"
                                >
                                    <Send fontSize="small" />
                                </SendButton>
                            </InputAdornment>
                        )
                    }}
                />
                <Typography 
                    variant="caption" 
                    sx={{ 
                        mt: 1,
                        display: 'block',
                        color: colors.text.secondary,
                        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        fontSize: '0.75rem'
                    }}
                >
                    Press Enter to send, Shift+Enter for new line
                </Typography>
            </InputContainer>
        </AdaptiveContainer>
    );
} 
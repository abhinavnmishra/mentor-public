import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  alpha,
  Chip,
  Divider,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  IconButton
} from '@mui/material';
import { 
  Chat,
  Send,
  Lock,
  SmartToy,
  Person,
  PlayArrow
} from '@mui/icons-material';
import { 
  colors,
  ToolTypeIndicator
} from '../ExerciseStyledComponents';
import { useAxios } from 'app/contexts/AxiosContext';

const ChatBotTool = ({ tool, onChange, readOnly = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const axiosInstance = useAxios();
  
  // Scroll to bottom of messages container only
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    if (!isLoading) scrollToBottom();
  }, [isLoading]);

  // Initialize chat
  const handleInitiateChat = async () => {
    if (readOnly || !onChange) return;
    
    setIsLoading(true);
    try {
      // Create a copy of the tool with chatInitiated set to true
      const updatedTool = {
        ...tool,
        chatInitiated: true
      };
      
      // Call the chat API to get initial messages
      const response = await axiosInstance.put('/api/exercise/response/chat', updatedTool);
      
      // Update the tool with the response data
      if (response && response.data) {
        onChange(tool.uniqueName, response.data.messages, true);
      }
    } catch (error) {
      console.error('Error initiating chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || readOnly || !onChange) return;
    
    // Create user message
    const userMessage = {
      role: 'user',
      content: inputValue.trim()
    };
    
    // Update local state with user message
    const updatedMessages = [...(tool.messages || []), userMessage];
    onChange(tool.uniqueName, updatedMessages, true);
    
    // Clear input field
    setInputValue('');
    
    // Send to API
    setIsLoading(true);
    try {
      const updatedTool = {
        ...tool,
        messages: updatedMessages
      };
      
      const response = await axiosInstance.put('/api/exercise/response/chat', updatedTool);
      
      // Update with API response
      if (response && response.data) {
        onChange(tool.uniqueName, response.data.messages, true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Get chat type description based on instructions
  const getChatTypeDescription = () => {
    if (!tool.chatBotInstructions) return "Interactive Conversation";
    
    if (tool.chatBotInstructions.includes("self-reflection") || tool.chatBotInstructions.includes("awareness")) {
      return "Self-Reflection & Awareness";
    } else if (tool.chatBotInstructions.includes("bias") || tool.chatBotInstructions.includes("belief")) {
      return "Bias/Belief Challenge";
    } else if (tool.chatBotInstructions.includes("emotion")) {
      return "Emotion Tracker";
    } else if (tool.chatBotInstructions.includes("role-play") || tool.chatBotInstructions.includes("scenario")) {
      return "Role-Play & Scenario Simulation";
    } else if (tool.chatBotInstructions.includes("difficult conversation")) {
      return "Difficult Conversations Simulator";
    } else if (tool.chatBotInstructions.includes("conflict")) {
      return "Conflict Resolution Playground";
    } else if (tool.chatBotInstructions.includes("negotiation")) {
      return "Negotiation Practice";
    } else if (tool.chatBotInstructions.includes("decision") || tool.chatBotInstructions.includes("problem-solving")) {
      return "Decision-Making & Problem-Solving";
    } else if (tool.chatBotInstructions.includes("ethics") || tool.chatBotInstructions.includes("values")) {
      return "Ethics & Values Testing";
    }
    
    return "Interactive Conversation";
  };

  // Count messages by role (excluding system messages)
  const getMessageCounts = () => {
    if (!tool.messages || tool.messages.length === 0) return { user: 0, assistant: 0 };
    
    return tool.messages
      .filter(message => message.role !== 'system')
      .reduce((counts, message) => {
        if (message.role === 'user') counts.user += 1;
        if (message.role === 'assistant') counts.assistant += 1;
        return counts;
      }, { user: 0, assistant: 0 });
  };

  const messageCounts = getMessageCounts();
  const chatTypeDescription = getChatTypeDescription();
  const hasReachedMaxMessages = tool.maxChatCount && messageCounts.user >= tool.maxChatCount;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${readOnly ? alpha(colors.border, 0.5) : colors.border}`,
        backgroundColor: readOnly ? alpha(colors.background, 0.3) : colors.surface,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          borderColor: readOnly ? alpha(colors.border, 0.5) : colors.borderHover,
          boxShadow: readOnly ? 'none' : `0 4px 12px ${alpha(colors.tools.text, 0.1)}`,
        }
      }}
    >
      <ToolTypeIndicator toolType="CHAT_BOT" />
      
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${alpha(colors.tools.interactive, 0.05)} 0%, ${alpha(colors.tools.interactive, 0.02)} 100%)`,
          borderBottom: `1px solid ${colors.border}`,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              backgroundColor: alpha(colors.tools.interactive, 0.1),
              borderRadius: '8px',
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Chat sx={{ color: colors.tools.interactive, fontSize: '1.25rem' }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: colors.text.primary,
                fontSize: '1rem'
              }}
            >
              Interactive Chat
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {chatTypeDescription}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" alignItems="center" gap={1}>
          {readOnly && (
            <Chip
              icon={<Lock />}
              label="Read Only"
              size="small"
              variant="outlined"
              sx={{
                borderColor: colors.text.disabled,
                color: colors.text.disabled,
                '& .MuiChip-icon': {
                  color: colors.text.disabled
                }
              }}
            />
          )}
          {tool.maxChatCount && (
            <Chip
              label={`${messageCounts.user}/${tool.maxChatCount} messages`}
              size="small"
              variant="outlined"
              color={hasReachedMaxMessages ? "error" : "primary"}
            />
          )}
        </Box>
      </Box>
      
      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Instructions */}
        {tool.placeholderText && (
          <Box
            sx={{
              backgroundColor: alpha(colors.info, 0.05),
              border: `1px solid ${alpha(colors.info, 0.2)}`,
              borderRadius: '12px',
              p: 2,
              mb: 3
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                color: colors.text.primary,
                fontWeight: 500,
                lineHeight: 1.6
              }}
              dangerouslySetInnerHTML={{ __html: tool.placeholderText }}
            />
          </Box>
        )}
        
        {/* Chat Interface */}
        <Box
          sx={{
            backgroundColor: alpha(colors.background, 0.3),
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Chat Messages */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              minHeight: '250px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}
          >
            {(!tool.chatInitiated && !readOnly) ? (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                height="250px"
                gap={2}
              >
                <SmartToy sx={{ fontSize: '3rem', color: alpha(colors.tools.interactive, 0.5) }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: colors.text.primary,
                    textAlign: 'center'
                  }}
                >
                  Start a conversation
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.text.secondary,
                    textAlign: 'center',
                    maxWidth: '80%',
                    mb: 2
                  }}
                >
                  Click the button below to begin interacting with the AI assistant
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrow />}
                  onClick={handleInitiateChat}
                  disabled={isLoading}
                  sx={{
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  {isLoading ? 'Initializing...' : 'Start Conversation'}
                </Button>
              </Box>
            ) : (
              <>
                {(!tool.messages || tool.messages.length === 0) && (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    height="250px"
                  >
                    <Typography variant="body2" color="text.secondary">
                      {readOnly ? 'No messages in this conversation' : 'Loading conversation...'}
                    </Typography>
                  </Box>
                )}
                
                {tool.messages && tool.messages
                  .filter(message => message.role !== 'system') // Hide system messages
                  .map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      mb: 2,
                      flexDirection: message.role === 'user' ? 'row-reverse' : 'row'
                    }}
                  >
                    {message.role === 'user' ? (
                      <Avatar
                        sx={{
                          bgcolor: colors.primary,
                          width: 32,
                          height: 32,
                          mr: 0,
                          ml: 1
                        }}
                      >
                        <Person fontSize="small" />
                      </Avatar>
                    ) : (
                      <Avatar
                        src="/assets/avatar/avatar-5.webp"
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 1,
                          ml: 0
                        }}
                      />
                    )}
                    <Box
                      sx={{
                        maxWidth: '75%',
                        p: 2,
                        borderRadius: '12px',
                        backgroundColor: message.role === 'user' 
                          ? alpha(colors.primary, 0.1)
                          : alpha(colors.tools.interactive, 0.1),
                        color: colors.text.primary
                      }}
                    >
                      {message.role === 'assistant' ? (
                        <Box
                          sx={{
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '0.875rem',
                            '& a': { color: colors.primary },
                            '& ul, & ol': { pl: 2, mb: 1 },
                            '& p': { mb: 1 },
                            '& p:last-child': { mb: 0 },
                            '& code': {
                              backgroundColor: alpha(colors.text.secondary, 0.1),
                              padding: '2px 4px',
                              borderRadius: '4px',
                              fontFamily: 'monospace'
                            },
                            '& pre': {
                              backgroundColor: alpha(colors.text.secondary, 0.1),
                              padding: '8px',
                              borderRadius: '4px',
                              overflowX: 'auto',
                              fontFamily: 'monospace'
                            }
                          }}
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {message.content}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </Box>
          
          {/* Input Area */}
          {tool.chatInitiated && !readOnly && !hasReachedMaxMessages && (
            <>
              <Divider />
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Type your message here..."
                  multiline
                  maxRows={4}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading || readOnly}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      backgroundColor: colors.surface,
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 3px ${alpha(colors.tools.interactive, 0.1)}`,
                      }
                    }
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || readOnly}
                  sx={{
                    backgroundColor: alpha(colors.primary, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(colors.primary, 0.2),
                    }
                  }}
                >
                  {isLoading ? <CircularProgress size={24} /> : <Send />}
                </IconButton>
              </Box>
            </>
          )}
          
          {hasReachedMaxMessages && (
            <Box
              sx={{
                p: 2,
                borderTop: `1px solid ${colors.border}`,
                backgroundColor: alpha(colors.warning, 0.05),
                textAlign: 'center'
              }}
            >
              <Typography variant="body2" color="warning.main" fontWeight={500}>
                You've reached the maximum number of messages for this conversation
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Footer */}
        {tool.chatInitiated && tool.messages && tool.messages.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography
                variant="body2"
                sx={{
                  color: colors.text.secondary,
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                {isLoading ? 'Assistant is typing...' : 'Conversation history saved automatically'}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chat sx={{ color: colors.tools.interactive, fontSize: '1rem' }} />
                <Typography
                  variant="body2"
                  sx={{
                    color: colors.tools.interactive,
                    fontWeight: 600,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  }}
                >
                  {messageCounts.user + messageCounts.assistant} messages
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ChatBotTool;

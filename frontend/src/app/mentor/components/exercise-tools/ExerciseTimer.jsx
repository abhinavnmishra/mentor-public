import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  alpha,
  Paper,
  Divider,
  Chip
} from '@mui/material';
import { 
  Timer, 
  PlayArrow, 
  Pause, 
  Stop,
  Schedule,
  Warning,
  CheckCircle
} from '@mui/icons-material';
import { colors } from '../ExerciseStyledComponents';

const ExerciseTimer = ({ seconds, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  const getTimeStatus = useCallback(() => {
    if (isCompleted) return 'completed';
    if (timeLeft <= 0) return 'expired';
    if (timeLeft <= 30) return 'critical';
    if (timeLeft <= 60) return 'warning';
    return 'normal';
  }, [timeLeft, isCompleted]);
  
  const getStatusColor = useCallback(() => {
    const status = getTimeStatus();
    switch (status) {
      case 'completed': return colors.success;
      case 'expired': return colors.error;
      case 'critical': return colors.error;
      case 'warning': return colors.warning;
      default: return colors.primary;
    }
  }, [getTimeStatus]);
  
  const getStatusIcon = useCallback(() => {
    const status = getTimeStatus();
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'expired': return <Warning />;
      case 'critical': return <Warning />;
      case 'warning': return <Schedule />;
      default: return <Timer />;
    }
  }, [getTimeStatus]);
  
  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            setIsActive(false);
            setIsCompleted(true);
            if (onComplete) onComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!isActive && timeLeft !== 0) {
      clearInterval(interval);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, onComplete]);
  
  const toggleTimer = () => {
    if (timeLeft <= 0) return;
    
    if (!hasStarted) {
      setHasStarted(true);
    }
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setTimeLeft(seconds);
    setIsActive(false);
    setHasStarted(false);
    setIsCompleted(false);
  };
  
  const progress = ((seconds - timeLeft) / seconds) * 100;
  const statusColor = getStatusColor();
  const status = getTimeStatus();
  
  // If no timer is set, don't render anything
  if (!seconds || seconds <= 0) {
    return null;
  }
  
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `2px solid ${alpha(statusColor, 0.2)}`,
        background: `linear-gradient(135deg, ${colors.surface} 0%, ${alpha(statusColor, 0.02)} 100%)`,
        overflow: 'hidden',
        maxWidth: '400px',
        width: '100%',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${statusColor} 0%, ${alpha(statusColor, 0.8)} 100%)`,
          color: colors.text.inverse,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {getStatusIcon()}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Exercise Timer
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <Chip
            label={status.charAt(0).toUpperCase() + status.slice(1)}
            size="small"
            sx={{
              backgroundColor: alpha(colors.text.inverse, 0.2),
              color: colors.text.inverse,
              fontWeight: 600,
            }}
          />
        </Box>
      </Box>
      
      {/* Timer Display */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
          {/* Background circle */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={120}
            thickness={3}
            sx={{
              color: alpha(statusColor, 0.1),
              position: 'absolute',
            }}
          />
          {/* Progress circle */}
          <CircularProgress
            variant="determinate"
            value={progress}
            size={120}
            thickness={3}
            sx={{
              color: statusColor,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="h4"
              component="div"
              sx={{
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace',
                fontWeight: 700,
                color: statusColor,
                lineHeight: 1,
              }}
            >
              {formatTime(timeLeft)}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: colors.text.secondary,
                fontWeight: 500,
                mt: 0.5,
              }}
            >
              {Math.round(progress)}% complete
            </Typography>
          </Box>
        </Box>
        
        {/* Status Message */}
        <Typography 
          variant="body1" 
          sx={{ 
            mb: 3,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: colors.text.primary,
            fontWeight: 500,
          }}
        >
          {isCompleted 
            ? 'Time completed! Great work!' 
            : hasStarted 
              ? (isActive ? 'Timer is running...' : 'Timer is paused') 
              : 'Ready to start when you are'}
        </Typography>
        
        {/* Time Information */}
        {hasStarted && !isCompleted && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                Elapsed: {formatTime(seconds - timeLeft)}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text.secondary }}>
                Remaining: {formatTime(timeLeft)}
              </Typography>
            </Box>
          </>
        )}
        
        {/* Control Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          {!isCompleted && (
            <Button
              variant="contained"
              onClick={toggleTimer}
              disabled={timeLeft <= 0}
              startIcon={isActive ? <Pause /> : <PlayArrow />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                backgroundColor: isActive ? colors.warning : statusColor,
                '&:hover': {
                  backgroundColor: isActive ? colors.warningLight : alpha(statusColor, 0.9),
                },
                minWidth: '100px',
              }}
            >
              {timeLeft <= 0 ? 'Expired' : isActive ? 'Pause' : (hasStarted ? 'Resume' : 'Start')}
            </Button>
          )}
          
          {hasStarted && (
            <Button
              variant="outlined"
              onClick={resetTimer}
              startIcon={<Stop />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 600,
                fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                borderColor: colors.text.secondary,
                color: colors.text.secondary,
                '&:hover': {
                  borderColor: statusColor,
                  color: statusColor,
                  backgroundColor: alpha(statusColor, 0.05),
                },
              }}
            >
              Reset
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default ExerciseTimer;

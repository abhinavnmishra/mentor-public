// ProgramStatus.js
import React from 'react';
import { useState } from 'react';
import { 
    TextField, 
    MenuItem, 
    Select, 
    Chip, 
    Box, 
    InputLabel, 
    FormControl,
    styled,
    alpha,
    Stack
} from '@mui/material';
import { 
    CheckCircle, 
    PlayArrow, 
    Cancel, 
    Schedule 
} from '@mui/icons-material';

// Modern color palette (consistent with other components)
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

const options = [
    { 
        value: 'ACTIVE', 
        label: 'Active',
        color: colors.success,
        icon: <PlayArrow sx={{ fontSize: '16px' }} />
    },
    { 
        value: 'COMPLETED', 
        label: 'Completed',
        color: colors.primary,
        icon: <CheckCircle sx={{ fontSize: '16px' }} />
    },
    { 
        value: 'SUSPENDED', 
        label: 'Suspended',
        color: colors.error,
        icon: <Cancel sx={{ fontSize: '16px' }} />
    },
];

const StyledFormControl = styled(FormControl)(({ theme }) => ({
    minWidth: '140px',
}));

const StyledSelect = styled(Select)(({ theme }) => ({
    borderRadius: '12px',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: colors.surface,
    transition: 'all 0.2s ease-in-out',
    border: 'none',
    boxShadow: 'none',
    '& .MuiOutlinedInput-notchedOutline': { 
        border: 'none'
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { 
        border: 'none'
    },
    '&:hover .MuiOutlinedInput-notchedOutline': { 
        border: 'none'
    },
    '& .MuiSelect-select': {
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
    },
    '&:hover': {
        backgroundColor: alpha(colors.background, 0.8),
    },
    '&.Mui-focused': {
        backgroundColor: colors.surface,
        boxShadow: `0 0 0 3px ${alpha(colors.primary, 0.1)}`,
    }
}));

const StatusChip = styled(Chip)(({ theme, statusvalue }) => {
    const getStatusConfig = (status) => {
        const option = options.find(opt => opt.value === status);
        return option || { 
            color: colors.secondary, 
            icon: <Schedule sx={{ fontSize: '16px' }} />,
            label: 'Unknown'
        };
    };

    const config = getStatusConfig(statusvalue);

    return {
        backgroundColor: alpha(config.color, 0.1),
        color: config.color,
        border: `1px solid ${alpha(config.color, 0.2)}`,
        borderRadius: '20px',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: 600,
        fontSize: '0.75rem',
        height: '32px',
        minWidth: '120px',
        transition: 'all 0.2s ease-in-out',
        '& .MuiChip-label': {
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        },
        '& .MuiChip-icon': {
            color: config.color,
            marginLeft: '8px',
            marginRight: '-4px'
        },
        '&:hover': {
            backgroundColor: alpha(config.color, 0.15),
            borderColor: alpha(config.color, 0.3),
            transform: 'scale(1.02)',
        }
    };
});

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    padding: '12px 16px',
    borderRadius: '8px',
    margin: '4px 8px',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        backgroundColor: alpha(colors.primary, 0.08),
        borderRadius: '8px',
    },
    '&.Mui-selected': {
        backgroundColor: alpha(colors.primary, 0.12),
        '&:hover': {
            backgroundColor: alpha(colors.primary, 0.16),
        }
    }
}));

const MenuItemContent = styled(Stack)(({ theme }) => ({
    direction: 'row',
    spacing: 2,
    alignItems: 'center',
    width: '100%'
}));

const MenuItemIcon = styled(Box)(({ theme, statuscolor }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '6px',
    backgroundColor: alpha(statuscolor || colors.secondary, 0.1),
    color: statuscolor || colors.secondary,
}));

const MenuItemLabel = styled(Box)(({ theme }) => ({
    flex: 1,
    fontWeight: 500,
    color: colors.text.primary,
}));

function ProgramStatus({status, setStatus}) {
    const handleChange = (event) => {
        setStatus(event.target.value);
    };

    const getCurrentOption = () => {
        return options.find(option => option.value === status) || options[0];
    };

    const currentOption = getCurrentOption();

    return (
        <StyledFormControl>
            <StyledSelect
                labelId="program-status-select-label"
                value={status}
                onChange={handleChange}
                defaultValue={'ACTIVE'}
                renderValue={(selected) => {
                    const selectedOption = options.find(option => option.value === selected);
                    return (
                        <StatusChip
                            icon={selectedOption?.icon}
                            label={selectedOption?.label || selected}
                            statusvalue={selected}
                        />
                    );
                }}
                MenuProps={{
                    PaperProps: {
                        sx: {
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                            border: `1px solid ${colors.border}`,
                            marginTop: '8px',
                            '& .MuiList-root': {
                                padding: '8px',
                            }
                        }
                    }
                }}
            >
                {options.map((option) => (
                    <StyledMenuItem key={option.value} value={option.value}>
                        <MenuItemContent direction="row" spacing={2} alignItems="center">
                            <MenuItemIcon statuscolor={option.color}>
                                {option.icon}
                            </MenuItemIcon>
                            <MenuItemLabel>
                                {option.label}
                            </MenuItemLabel>
                        </MenuItemContent>
                    </StyledMenuItem>
                ))}
            </StyledSelect>
        </StyledFormControl>
    );
}

export default ProgramStatus;

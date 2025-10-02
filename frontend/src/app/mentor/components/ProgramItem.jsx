import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { fDate } from '../utils/format-time.jsx';
import Chip from '@mui/material/Chip';
import { styled, alpha } from "@mui/material";
import CreateProgramForm from "./CreateProgramForm.jsx";
import useAuth from "../../hooks/useAuth.js";
import {
    CalendarToday,
    Business,
    CheckCircle,
    TrendingUp,
    Cancel,
    Schedule
} from "@mui/icons-material";

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

const gradientColors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
];

const ModernCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    maxWidth: '400px',
    borderRadius: '20px',
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    background: colors.surface,
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        borderColor: colors.primary,
    }
}));

const CardHeader = styled(Box)(({ theme }) => ({
    position: 'relative',
    height: '200px',
    overflow: 'hidden',
    borderRadius: '20px 20px 0 0',
}));

const GradientOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
    zIndex: 2,
}));

const CoverImage = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: 1,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    position: 'absolute',
    bottom: '16px',
    left: '16px',
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    border: `2px solid ${colors.surface}`,
    backgroundColor: colors.surface,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
}));

const LogoImage = styled('img')(({ theme }) => ({
    width: '60px',
    height: '60px',
    objectFit: 'contain',
    borderRadius: '8px',
}));

const LogoAvatar = styled(Avatar)(({ theme }) => ({
    width: '60px',
    height: '60px',
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

const CardContent = styled(Box)(({ theme }) => ({
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
}));

const ClientInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
}));

const ClientName = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: colors.text.secondary,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
}));

const ProgramTitle = styled(Typography)(({ theme }) => ({
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '1.125rem',
    fontWeight: 600,
    color: colors.text.primary,
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '2.8rem',
}));

const DateInfo = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: colors.text.secondary,
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
    const getStatusStyles = () => {
        switch (status) {
            case 'ACTIVE':
                return {
                    backgroundColor: alpha(colors.success, 0.1),
                    color: colors.success,
                    border: `1px solid ${alpha(colors.success, 0.2)}`,
                };
            case 'COMPLETED':
                return {
                    backgroundColor: alpha(colors.primary, 0.1),
                    color: colors.primary,
                    border: `1px solid ${alpha(colors.primary, 0.2)}`,
                };
            case 'CANCELLED':
                return {
                    backgroundColor: alpha(colors.error, 0.1),
                    color: colors.error,
                    border: `1px solid ${alpha(colors.error, 0.2)}`,
                };
            default:
                return {
                    backgroundColor: alpha(colors.secondary, 0.1),
                    color: colors.secondary,
                    border: `1px solid ${alpha(colors.secondary, 0.2)}`,
                };
        }
    };

    return {
        ...getStatusStyles(),
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '0.75rem',
        fontWeight: 600,
        height: '24px',
        borderRadius: '8px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    };
});

const EditButton = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    zIndex: 4,
    backgroundColor: alpha(colors.surface, 0.9),
    backdropFilter: 'blur(8px)',
    borderRadius: '8px',
    border: `1px solid ${alpha(colors.border, 0.5)}`,
    '& .MuiIconButton-root': {
        color: colors.text.primary,
        '&:hover': {
            backgroundColor: alpha(colors.primary, 0.1),
            color: colors.primary,
        }
    }
}));

function getCharSum(str, max) {
    return ([...str].reduce((sum, char) => sum + char.charCodeAt(0), 0)) % max;
}

function getGradientIndex(programId) {
    return getCharSum(programId, gradientColors.length);
}

export function ProgramItem({ program, index, setUpdate, ...other }) {
    let navigate = useNavigate();
    const { user } = useAuth();
    const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

    const gradientIndex = getGradientIndex(program.id);
    const coverImageIndex = getCharSum(program.id, 24) + 1;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'ACTIVE':
                return <TrendingUp sx={{ fontSize: '14px' }} />;
            case 'COMPLETED':
                return <CheckCircle sx={{ fontSize: '14px' }} />;
            case 'CANCELLED':
                return <Cancel sx={{ fontSize: '14px' }} />;
            default:
                return <Schedule sx={{ fontSize: '14px' }} />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'Active';
            case 'COMPLETED':
                return 'Completed';
            case 'CANCELLED':
                return 'Cancelled';
            default:
                return 'Pending';
        }
    };

    const renderLogo = program.clientOrganisation.logoImageUrl ? (
        <LogoContainer>
            <LogoImage
                src={backendBaseUrl + program.clientOrganisation.logoImageUrl}
                alt={`${program.clientOrganisation.name} logo`}
            />
        </LogoContainer>
    ) : (
        <LogoContainer>
            <LogoAvatar sx={{ 
                background: gradientColors[index % gradientColors.length]
            }}>
                {program.clientOrganisation.name.charAt(0)}
            </LogoAvatar>
        </LogoContainer>
    );

    return (
        <ModernCard
            {...other}
            onClick={() => {
                navigate('/portal/program/' + program.id);
            }}
        >
            {/* Edit Button */}
            {(user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MODERATOR') && (
                <EditButton onClick={(e) => e.stopPropagation()}>
                    <CreateProgramForm setUpdate={setUpdate} program={program} />
                </EditButton>
            )}

            {/* Card Header with Cover Image */}
            <CardHeader>
                <CoverImage
                    sx={{
                        backgroundImage: `url('/assets/cover/cover-${coverImageIndex}.webp')`,
                    }}
                />
                <GradientOverlay />
                {renderLogo}
            </CardHeader>

            {/* Card Content */}
            <CardContent>
                {/* Client Info and Status */}
                <ClientInfo>
                    <ClientName>
                        <Business sx={{ fontSize: '16px' }} />
                        {program.clientOrganisation.name}
                    </ClientName>
                    <StatusChip
                        status={program.status}
                        icon={getStatusIcon(program.status)}
                        label={getStatusLabel(program.status)}
                        size="small"
                    />
                </ClientInfo>

                {/* Program Title */}
                <ProgramTitle>
                    {program.title}
                </ProgramTitle>

                {/* Date Information */}
                <DateInfo>
                    <CalendarToday sx={{ fontSize: '16px' }} />
                    <Typography 
                        sx={{ 
                            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                            fontSize: '0.875rem',
                            color: colors.text.secondary 
                        }}
                    >
                        Started {fDate(program.startDate)}
                    </Typography>
                </DateInfo>
            </CardContent>
        </ModernCard>
    );
}
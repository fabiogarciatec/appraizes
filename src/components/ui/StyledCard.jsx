import { Card, CardContent, Box, Typography, styled } from '@mui/material';

// Card estilizado com efeito de hover e transição suave
const StyledCardWrapper = styled(Card)(({ theme, color }) => ({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  borderRadius: theme.shape.borderRadius * 1.5,
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.05)',
  position: 'relative',
  overflow: 'hidden',
  flex: 1,
  boxSizing: 'border-box',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px 0 rgba(0, 0, 0, 0.1)',
  },
  '&::before': color ? {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    backgroundColor: `${theme.palette[color].main}`,
  } : {},
}));

// Conteúdo do card com padding consistente
const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(3),
  '&:last-child': {
    paddingBottom: theme.spacing(3),
  },
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
}));

// Componente de ícone com fundo colorido
const IconBox = styled(Box)(({ theme, color }) => ({
  backgroundColor: color ? `${theme.palette[color].light}` : theme.palette.primary.light,
  borderRadius: '50%',
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: color ? theme.palette[color].main : theme.palette.primary.main,
}));

// Título do card com estilo consistente
const CardTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));

// Valor do card com estilo consistente
const CardValue = styled(Typography)(({ theme, color }) => ({
  fontWeight: 700,
  color: color ? theme.palette[color].main : theme.palette.text.primary,
}));

const StyledCard = ({ 
  title, 
  icon, 
  color = 'primary',
  children,
  sx,
  ...props 
}) => {
  return (
    <StyledCardWrapper color={color} sx={{ width: '100%', ...sx }} {...props}>
      <StyledCardContent>
        {(title || icon) && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            {title && <CardTitle variant="h6">{title}</CardTitle>}
            {icon && <IconBox color={color}>{icon}</IconBox>}
          </Box>
        )}
        
        {children}
      </StyledCardContent>
    </StyledCardWrapper>
  );
};

export default StyledCard;

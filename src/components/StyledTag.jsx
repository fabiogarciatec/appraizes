import React from 'react';
import { Box } from '@mui/material';

export default function StyledTag({ children, color = '#1976d2', bgcolor = 'rgba(25,118,210,0.08)' }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        px: 2,
        py: 0.5,
        borderRadius: 5,
        border: `1.5px solid ${color}`,
        color,
        backgroundColor: bgcolor,
        fontWeight: 500,
        fontSize: 15,
        letterSpacing: 0.2,
        transition: 'background 0.2s',
        cursor: 'default',
        userSelect: 'none',
        lineHeight: 1.6,
        boxShadow: '0 1px 6px 0 rgba(25,118,210,0.05)'
      }}
    >
      {children}
    </Box>
  );
}

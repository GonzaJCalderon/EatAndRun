// src/components/CopyText.jsx
import React from 'react';
import { Tooltip, IconButton, Typography } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const CopyText = ({ text }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      alert('No se pudo copiar al portapapeles');
    }
  };

  return (
    <Typography variant="body2" component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ marginRight: 4 }}>{text}</span>
      <Tooltip title="Copiar al portapapeles">
        <IconButton onClick={handleCopy} size="small" sx={{ p: 0.5 }}>
          <ContentCopyIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Typography>
  );
};

export default CopyText;

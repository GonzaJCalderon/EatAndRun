// src/components/CustomAccordionItem.jsx
import React, { useRef, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Collapse,
  Typography,
  IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const CustomAccordionItem = ({ expanded, onToggle, dia, children }) => {
  const summaryRef = useRef(null);

  // Scroll cuando se expande
  useEffect(() => {
    if (expanded && summaryRef.current) {
      summaryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [expanded]);

  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Typography fontWeight="bold">📅 {dia.charAt(0).toUpperCase() + dia.slice(1)}</Typography>
        }
        onClick={onToggle}
        ref={summaryRef}
        action={
          <IconButton onClick={onToggle}>
            <ExpandMoreIcon
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }}
            />
          </IconButton>
        }
        sx={{ cursor: 'pointer', scrollMarginTop: '80px' }}
      />
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{children}</CardContent>
      </Collapse>
    </Card>
  );
};

export default CustomAccordionItem;

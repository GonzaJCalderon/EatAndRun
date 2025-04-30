import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Fab } from '@mui/material';

const WhatsAppButton = () => {
  return (
    <Fab
      color="success"
      component="a"
      href="https://wa.me/5492614601788"
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 2000
      }}
    >
      <WhatsAppIcon />
    </Fab>
  );
};

export default WhatsAppButton;

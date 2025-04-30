import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Fab } from '@mui/material';

const WhatsAppButton = () => {
  return (
    <Fab
      color="success"
      href="https://wa.me/54 9 2614 60-1788"
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

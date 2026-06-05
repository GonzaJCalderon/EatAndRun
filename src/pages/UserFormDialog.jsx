// src/components/UserFormDialog.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, Button
} from '@mui/material';

const roleOptions = [
  { value: 'usuario', label: 'Usuario' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'admin', label: 'Admin' },
  { value: 'moderador', label: 'Moderador' },
  { value: 'empleado', label: 'Empleado' },
];

export default function UserFormDialog({
  open,
  isEditing,
  initialData = {},
  onClose,
  onSave
}) {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    rol: 'usuario'
  });

  // Al abrir en modo edición, precargar datos:
  useEffect(() => {
    if (isEditing && initialData) {
      setForm({
        nombre: initialData.nombre || '',
        apellido: initialData.apellido || '',
        email: initialData.email || '',
        password: '',           // no remostrar contraseña
        rol: initialData.rol || 'usuario'
      });
    } else {
      setForm({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        rol: 'usuario'
      });
    }
  }, [isEditing, initialData, open]);

  const handleChange = key => e =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = () => onSave(form);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {isEditing ? '✏️ Editar Usuario' : '➕ Crear Usuario'}
      </DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
        <TextField label="Nombre" fullWidth value={form.nombre} onChange={handleChange('nombre')} />
        <TextField label="Apellido" fullWidth value={form.apellido} onChange={handleChange('apellido')} />
        <TextField label="Email" type="email" fullWidth value={form.email} onChange={handleChange('email')} />
        {!isEditing && (
          <TextField label="Password" type="password" fullWidth value={form.password} onChange={handleChange('password')} />
        )}
        <Select fullWidth value={form.rol} onChange={handleChange('rol')}>
          {roleOptions.map(r => (
            <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={
            !form.nombre ||
            !form.email ||
            (!isEditing && !form.password)
          }
          onClick={handleSubmit}
        >
          {isEditing ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

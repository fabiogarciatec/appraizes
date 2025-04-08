import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ListAlt as ListAltIcon,
  Add as AddIcon,
  Book as BookIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  ManageAccounts as ManageAccountsIcon,
  Business as BusinessIcon,
  Construction as ConstructionIcon,
  Build as BuildIcon,
  LocalGasStation as GasStationIcon,
  Settings as SettingsIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  MenuOpen as MenuOpenIcon,
  DirectionsCar as DirectionsCarIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  Engineering as EngineeringIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    role: currentUser?.role || 'Usuário'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      await updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      });

      setSuccess('Perfil atualizado com sucesso!');
      setEditMode(false);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
      role: currentUser?.role || 'Usuário'
    });
    setEditMode(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
            Meu Perfil
          </Typography>
          {!editMode && (
            <IconButton onClick={() => setEditMode(true)} color="primary">
              <EditIcon />
            </IconButton>
          )}
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {currentUser?.name?.charAt(0) || 'U'}
              </Avatar>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {currentUser?.name || 'Usuário'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser?.role || 'Usuário'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  variant="outlined"
                  type="email"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  variant="outlined"
                />
              </Grid>

              {editMode && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={handleCancel}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<SaveIcon />}
                      onClick={handleSave}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Salvar'}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {success}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default Profile;

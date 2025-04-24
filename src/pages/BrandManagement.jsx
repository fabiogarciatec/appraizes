import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Label as LabelIcon } from '@mui/icons-material';
import StyledTag from '../components/StyledTag';
import ApiService from '../services/ApiService';

export default function BrandManagement() {
  // Filtros de busca
  const [filterId, setFilterId] = useState('');
  const [filterName, setFilterName] = useState('');
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editBrand, setEditBrand] = useState(null);
  const [name, setName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get('/api/machine-brands');
      setBrands(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao carregar marcas', severity: 'error' });
    }
    setLoading(false);
  };

  const handleOpenDialog = (brand = null) => {
    setEditBrand(brand);
    setName(brand ? brand.name : '');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditBrand(null);
    setName('');
  };

  const handleSave = async () => {
    try {
      if (editBrand) {
        await ApiService.put(`/api/machine-brands/${editBrand.id}`, { name });
        setSnackbar({ open: true, message: 'Marca atualizada com sucesso!', severity: 'success' });
      } else {
        await ApiService.post('/api/machine-brands', { name });
        setSnackbar({ open: true, message: 'Marca cadastrada com sucesso!', severity: 'success' });
      }
      fetchBrands();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar marca', severity: 'error' });
    }
  };

  const handleDeleteClick = (brand) => {
    setBrandToDelete(brand);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;
    try {
      await ApiService.delete(`/api/machine-brands/${brandToDelete.id}`);
      setSnackbar({ open: true, message: 'Marca excluída com sucesso!', severity: 'success' });
      fetchBrands();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao excluir marca', severity: 'error' });
    }
    setDeleteDialogOpen(false);
    setBrandToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setBrandToDelete(null);
  };

  return (
    <Box minHeight="100vh" bgcolor="#f6f7fb" py={6} px={2} display="flex" flexDirection="column" alignItems="center">
      <Paper elevation={0} sx={{ bgcolor: 'transparent', mb: 4 }}>
        <Box display="flex" alignItems="flex-start" gap={2} mb={1}>
          <Box bgcolor="#1976d2" borderRadius={2} p={1.5} display="flex" alignItems="center" justifyContent="center">
            <LabelIcon sx={{ color: '#fff', fontSize: 32 }} />
          </Box>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h3" fontWeight={500} color="#444" sx={{ letterSpacing: 1 }}>
              Marcas de Peças e Máquinas
            </Typography>
            <Typography variant="subtitle1" color="#888" fontWeight={400}>
              Gerencie, edite e exclua marcas de peças e Máquinas
            </Typography>
          </Box>
        </Box>
      </Paper>
      <Box width="100%">
        {/* Filtros de busca */}
        <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', background: '#f6f7fb' }}>
          <TextField
            label="Filtrar por ID"
            type="number"
            variant="outlined"
            size="small"
            value={filterId}
            onChange={e => setFilterId(e.target.value)}
            sx={{ width: 140, background: '#fff', borderRadius: 2 }}
            InputLabelProps={{ sx: { color: '#888' }, shrink: true }}
          />
          <TextField
            label="Filtrar por Nome"
            variant="outlined"
            size="small"
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
            sx={{ minWidth: 180, background: '#fff', borderRadius: 2 }}
            InputLabelProps={{ sx: { color: '#888' } }}
          />
        </Paper>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.06)', fontWeight: 600, fontSize: 16, px: 3 }}
        >
          Nova Marca
        </Button>
        <Paper elevation={2} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.04)', width: '100%' }}>
          <TableContainer sx={{ width: '100%' }}>
            <Table sx={{ width: '100%' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f2f4f8' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Data de Inclusão</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...brands]
                  .filter(brand => {
                    // Filtro de ID
                    if (filterId && String(brand.id) !== String(filterId)) return false;
                    // Filtro de Nome
                    if (filterName && !brand.name.toLowerCase().includes(filterName.toLowerCase())) return false;
                    return true;
                  })
                  .sort((a, b) => a.id - b.id)
                  .map((brand) => (
                  <TableRow key={brand.id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#e3eafc' } }}>
                    <TableCell sx={{ color: '#444', fontSize: 15 }}>{brand.id}</TableCell>
                    <TableCell>
                      <StyledTag color="#1976d2" bgcolor="rgba(25,118,210,0.08)">{brand.name}</StyledTag>
                    </TableCell>
                    <TableCell sx={{ color: '#555', fontSize: 14 }}>
                      {brand.created_at ? new Date(brand.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDialog(brand)} sx={{ color: '#1976d2' }}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDeleteClick(brand)} sx={{ color: '#e53935' }}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {brands.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: '#888', fontStyle: 'italic' }}>Nenhuma marca cadastrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 370, boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.10)' } }}>
  <DialogTitle sx={{ fontWeight: 700, fontSize: 24, color: '#1976d2', letterSpacing: 0.5, pb: 0 }}>{editBrand ? 'Editar Marca' : 'Nova Marca'}</DialogTitle>
  <DialogContent sx={{ pt: 2, pb: 1 }}>
    <TextField
      autoFocus
      margin="dense"
      label="Nome da Marca"
      type="text"
      fullWidth
      value={name}
      onChange={e => setName(e.target.value)}
      sx={{ mt: 1, mb: 2, borderRadius: 2, background: '#f6f7fb', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      InputLabelProps={{ sx: { color: '#888' } }}
    />
  </DialogContent>
  <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
    <Button onClick={handleCloseDialog} sx={{ borderRadius: 2, color: '#888' }}>Cancelar</Button>
    <Button onClick={handleSave} variant="contained" color="primary" sx={{ borderRadius: 2, px: 3, fontWeight: 600, boxShadow: '0 2px 10px 0 rgba(25, 118, 210, 0.08)' }}>Salvar</Button>
  </DialogActions>
</Dialog>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} PaperProps={{ sx: { borderRadius: 4, minWidth: 370, boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.10)' } }}>
  <DialogTitle sx={{ fontWeight: 700, fontSize: 22, color: '#e53935', letterSpacing: 0.5, pb: 0 }}>Excluir Marca</DialogTitle>
  <DialogContent sx={{ pt: 2, pb: 1 }}>
    Tem certeza que deseja excluir a marca "{brandToDelete?.name}"?
  </DialogContent>
  <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
    <Button onClick={handleDeleteCancel} sx={{ borderRadius: 2, color: '#888' }}>Cancelar</Button>
    <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ borderRadius: 2, px: 3, fontWeight: 600, boxShadow: '0 2px 10px 0 rgba(229, 57, 53, 0.08)' }}>Excluir</Button>
  </DialogActions>
</Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

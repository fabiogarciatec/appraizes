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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, GroupWork as GroupWorkIcon } from '@mui/icons-material';
import StyledTag from '../components/StyledTag';
import ApiService from '../services/ApiService';

export default function FamilyManagement() {
  // Filtros de busca
  const [filterId, setFilterId] = useState('');
  const [filterName, setFilterName] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState(null);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editFamily, setEditFamily] = useState(null);
  const [name, setName] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get('/api/machine-families');
      setFamilies(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao carregar famílias', severity: 'error' });
    }
    setLoading(false);
  };

  const handleOpenDialog = (family = null) => {
    setEditFamily(family);
    setName(family ? family.name : '');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditFamily(null);
    setName('');
  };

  const handleSave = async () => {
    try {
      if (editFamily) {
        await ApiService.put(`/api/machine-families/${editFamily.id}`, { name });
        setSnackbar({ open: true, message: 'Família atualizada com sucesso!', severity: 'success' });
      } else {
        await ApiService.post('/api/machine-families', { name });
        setSnackbar({ open: true, message: 'Família cadastrada com sucesso!', severity: 'success' });
      }
      fetchFamilies();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar família', severity: 'error' });
    }
  };

  const handleDeleteClick = (family) => {
    setFamilyToDelete(family);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!familyToDelete) return;
    try {
      await ApiService.delete(`/api/machine-families/${familyToDelete.id}`);
      setSnackbar({ open: true, message: 'Família excluída com sucesso!', severity: 'success' });
      fetchFamilies();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao excluir família', severity: 'error' });
    }
    setDeleteDialogOpen(false);
    setFamilyToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFamilyToDelete(null);
  };

  return (
    <Box minHeight="100vh" bgcolor="#f6f7fb" py={6} px={2} display="flex" flexDirection="column" alignItems="center">
      <Paper elevation={0} sx={{ bgcolor: 'transparent', mb: 4 }}>
        <Box display="flex" alignItems="flex-start" gap={2} mb={1}>
          <Box bgcolor="#1976d2" borderRadius={2} p={1.5} display="flex" alignItems="center" justifyContent="center">
            <GroupWorkIcon sx={{ color: '#fff', fontSize: 32 }} />
          </Box>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h3" fontWeight={500} color="#444" sx={{ letterSpacing: 1 }}>
              Famílias de Máquinas
            </Typography>
            <Typography variant="subtitle1" color="#888" fontWeight={400}>
              Gerencie, edite e exclua famílias de equipamentos.
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
          Nova Família
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
                {families
                  .filter(family => {
                    // Filtro de ID
                    if (filterId && String(family.id) !== String(filterId)) return false;
                    // Filtro de Nome
                    if (filterName && !family.name.toLowerCase().includes(filterName.toLowerCase())) return false;
                    return true;
                  })
                  .map((family) => (
                  <TableRow key={family.id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#e3eafc' } }}>
                    <TableCell sx={{ color: '#444', fontSize: 15 }}>{family.id}</TableCell>
                    <TableCell>
  <StyledTag color="#1976d2" bgcolor="rgba(25,118,210,0.08)">{family.name}</StyledTag>
</TableCell>
                    <TableCell sx={{ color: '#555', fontSize: 14 }}>
                      {family.created_at ? new Date(family.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDialog(family)} sx={{ color: '#1976d2' }}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDeleteClick(family)} sx={{ color: '#e53935' }}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {families.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: '#888', fontStyle: 'italic' }}>Nenhuma família cadastrada.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 370, boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.10)' } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 24, color: '#1976d2', letterSpacing: 0.5, pb: 0 }}>{editFamily ? 'Editar Família' : 'Nova Família'}</DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da Família"
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

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Tem certeza que deseja excluir a família "{familyToDelete?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Excluir</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

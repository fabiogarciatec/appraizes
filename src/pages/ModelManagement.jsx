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
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, PrecisionManufacturing as PrecisionManufacturingIcon } from '@mui/icons-material';
import ApiService from '../services/ApiService';
import StyledTag from '../components/StyledTag';

export default function ModelManagement() {
  // Filtros de busca
  const [filterId, setFilterId] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterFamily, setFilterFamily] = useState('');
  const [models, setModels] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editModel, setEditModel] = useState(null);
  const [name, setName] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState(null);

  useEffect(() => {
    fetchModels();
    fetchFamilies();
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const data = await ApiService.get('/api/machine-models');
      setModels(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao carregar modelos', severity: 'error' });
    }
    setLoading(false);
  };

  const fetchFamilies = async () => {
    try {
      const data = await ApiService.get('/api/machine-families');
      setFamilies(data);
    } catch (error) {
      // Silenciar erro para não sobrepor o snackbar de modelos
    }
  };

  const handleOpenDialog = (model = null) => {
    setEditModel(model);
    setName(model ? model.name : '');
    setFamilyId(model ? model.family_id : '');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditModel(null);
    setName('');
    setFamilyId('');
  };

  const handleSave = async () => {
    try {
      if (editModel) {
        await ApiService.put(`/api/machine-models/${editModel.id}`, { name, family_id: familyId });
        setSnackbar({ open: true, message: 'Modelo atualizado com sucesso!', severity: 'success' });
      } else {
        await ApiService.post('/api/machine-models', { name, family_id: familyId });
        setSnackbar({ open: true, message: 'Modelo cadastrado com sucesso!', severity: 'success' });
      }
      fetchModels();
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar modelo', severity: 'error' });
    }
  };

  const handleDeleteClick = (model) => {
    setModelToDelete(model);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!modelToDelete) return;
    try {
      await ApiService.delete(`/api/machine-models/${modelToDelete.id}`);
      setSnackbar({ open: true, message: 'Modelo excluído com sucesso!', severity: 'success' });
      fetchModels();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao excluir modelo', severity: 'error' });
    }
    setDeleteDialogOpen(false);
    setModelToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setModelToDelete(null);
  };

  return (
    <Box minHeight="100vh" bgcolor="#f6f7fb" py={6} px={2} display="flex" flexDirection="column" alignItems="center">
      <Paper elevation={0} sx={{ bgcolor: 'transparent', mb: 4 }}>
        <Box display="flex" alignItems="flex-start" gap={2} mb={1}>
          <Box bgcolor="#1976d2" borderRadius={2} p={1.5} display="flex" alignItems="center" justifyContent="center">
            <PrecisionManufacturingIcon sx={{ color: '#fff', fontSize: 32 }} />
          </Box>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h3" fontWeight={500} color="#444" sx={{ letterSpacing: 1 }}>
              Modelos de Máquinas
            </Typography>
            <Typography variant="subtitle1" color="#888" fontWeight={400}>
              Gerencie, edite e exclua modelos de equipamentos.
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
          <FormControl sx={{ minWidth: 190, background: '#fff', borderRadius: 2 }} size="small">
            <InputLabel id="filter-family-label" shrink>Filtrar por Família</InputLabel>
            <Select
              labelId="filter-family-label"
              value={filterFamily}
              label="Filtrar por Família"
              onChange={e => setFilterFamily(e.target.value)}
              displayEmpty
              notched
            >
              <MenuItem value=""><em>Todas</em></MenuItem>
              {families.map(fam => (
                <MenuItem key={fam.id} value={fam.id}>{fam.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.06)', fontWeight: 600, fontSize: 16, px: 3 }}
        >
          Novo Modelo
        </Button>
        <Paper elevation={2} sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 2px 16px 0 rgba(25, 118, 210, 0.04)', width: '100%' }}>
          <TableContainer sx={{ width: '100%' }}>
            <Table sx={{ width: '100%' }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f2f4f8' }}>
                  <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Família</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Data de Inclusão</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: '#222', fontSize: 16 }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {models
                  .filter(model => {
                    // Filtro de ID
                    if (filterId && String(model.id) !== String(filterId)) return false;
                    // Filtro de Nome
                    if (filterName && !model.name.toLowerCase().includes(filterName.toLowerCase())) return false;
                    // Filtro de Família
                    if (filterFamily && String(model.family_id) !== String(filterFamily)) return false;
                    return true;
                  })
                  .map((model) => (
                  <TableRow key={model.id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: '#e3eafc' } }}>
                    <TableCell sx={{ color: '#444', fontSize: 15 }}>{model.id}</TableCell>
                    <TableCell>
  <StyledTag color="#1976d2" bgcolor="rgba(25,118,210,0.08)">{model.name}</StyledTag>
</TableCell>
                    <TableCell>
  {families.find((f) => f.id === model.family_id) ? (
    <StyledTag color="#43a047" bgcolor="rgba(67,160,71,0.10)">{families.find((f) => f.id === model.family_id).name}</StyledTag>
  ) : '-'}
</TableCell>
                    <TableCell sx={{ color: '#555', fontSize: 14 }}>
                      {model.created_at ? new Date(model.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => handleOpenDialog(model)} sx={{ color: '#1976d2' }}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDeleteClick(model)} sx={{ color: '#e53935' }}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {models.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ color: '#888', fontStyle: 'italic' }}>Nenhum modelo cadastrado.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {/* Modal de inclusão/edição */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 370, boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.10)' } }}>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 24, color: '#1976d2', letterSpacing: 0.5, pb: 0 }}>{editModel ? 'Editar Modelo' : 'Novo Modelo'}</DialogTitle>
        <DialogContent sx={{ pt: 2, pb: 1 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Modelo"
            type="text"
            fullWidth
            value={name}
            onChange={e => setName(e.target.value)}
            sx={{ mt: 1, mb: 2, borderRadius: 2, background: '#f6f7fb', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputLabelProps={{ sx: { color: '#888' } }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="family-select-label">Família</InputLabel>
            <Select
              labelId="family-select-label"
              value={familyId}
              label="Família"
              onChange={e => setFamilyId(e.target.value)}
              sx={{ borderRadius: 2, background: '#f6f7fb' }}
            >
              {families.map((family) => (
                <MenuItem key={family.id} value={family.id}>{family.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button onClick={handleCloseDialog} sx={{ borderRadius: 2, color: '#888' }}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary" sx={{ borderRadius: 2, px: 3, fontWeight: 600, boxShadow: '0 2px 10px 0 rgba(25, 118, 210, 0.08)' }}>Salvar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação de exclusão */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          Tem certeza que deseja excluir o modelo "{modelToDelete?.name}"?
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

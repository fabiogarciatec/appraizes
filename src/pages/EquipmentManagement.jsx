import React, { useState, useEffect } from 'react';
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
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Construction as ConstructionIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  Numbers as NumbersIcon,
  Tag as TagIcon
} from '@mui/icons-material';
import { 
  equipments as mockEquipments, 
  machineModels, 
  machineFamilies, 
  clients 
} from '../data/mockData';

// Store para gerenciar o estado dos equipamentos
const useEquipmentStore = () => {
  const [equipments, setEquipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializa os equipamentos a partir do localStorage ou dos dados mockados
  const initializeEquipments = () => {
    setIsLoading(true);
    try {
      const storedEquipments = localStorage.getItem('appraizes_equipments');
      if (storedEquipments) {
        setEquipments(JSON.parse(storedEquipments));
      } else {
        // Se não houver equipamentos no localStorage, usa os mockados
        setEquipments(mockEquipments);
        localStorage.setItem('appraizes_equipments', JSON.stringify(mockEquipments));
      }
    } catch (err) {
      setError('Erro ao carregar equipamentos: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Adiciona um novo equipamento
  const addEquipment = (equipment) => {
    const newEquipment = {
      ...equipment,
      id: equipments.length > 0 ? Math.max(...equipments.map(e => e.id)) + 1 : 1
    };
    const updatedEquipments = [...equipments, newEquipment];
    setEquipments(updatedEquipments);
    localStorage.setItem('appraizes_equipments', JSON.stringify(updatedEquipments));
    return newEquipment;
  };

  // Atualiza um equipamento existente
  const updateEquipment = (updatedEquipment) => {
    const updatedEquipments = equipments.map(equipment => 
      equipment.id === updatedEquipment.id ? updatedEquipment : equipment
    );
    setEquipments(updatedEquipments);
    localStorage.setItem('appraizes_equipments', JSON.stringify(updatedEquipments));
  };

  // Remove um equipamento
  const deleteEquipment = (equipmentId) => {
    const updatedEquipments = equipments.filter(equipment => equipment.id !== equipmentId);
    setEquipments(updatedEquipments);
    localStorage.setItem('appraizes_equipments', JSON.stringify(updatedEquipments));
  };

  return {
    equipments,
    isLoading,
    error,
    initializeEquipments,
    addEquipment,
    updateEquipment,
    deleteEquipment
  };
};

// Componente principal de gerenciamento de equipamentos
export default function EquipmentManagement() {
  // Estado do store de equipamentos
  const {
    equipments,
    isLoading,
    error,
    initializeEquipments,
    addEquipment,
    updateEquipment,
    deleteEquipment
  } = useEquipmentStore();

  // Estados locais para controlar a interface
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' ou 'edit'
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [formData, setFormData] = useState({
    chassis: '',
    series: '',
    modelId: '',
    familyId: '',
    year: new Date().getFullYear(),
    hourmeter: 0,
    clientId: ''
  });
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Inicializa os equipamentos ao montar o componente
  useEffect(() => {
    initializeEquipments();
  }, []);

  // Manipuladores de eventos
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      chassis: '',
      series: '',
      modelId: '',
      familyId: '',
      year: new Date().getFullYear(),
      hourmeter: 0,
      clientId: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (equipment) => {
    setDialogMode('edit');
    setFormData({
      ...equipment
    });
    setSelectedEquipment(equipment);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEquipment(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Conversão para número quando apropriado
    const parsedValue = name === 'year' || name === 'hourmeter' || 
                         name === 'modelId' || name === 'familyId' || 
                         name === 'clientId' 
                       ? parseInt(value, 10) || '' 
                       : value;
    
    // Se o campo for familyId, resetamos o modelId para evitar inconsistências
    if (name === 'familyId') {
      setFormData({
        ...formData,
        [name]: parsedValue,
        modelId: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: parsedValue
      });
    }
  };

  const handleSubmit = () => {
    try {
      // Validação básica
      if (!formData.chassis || !formData.modelId || !formData.familyId || !formData.clientId) {
        throw new Error('Os campos Chassi, Modelo, Família e Proprietário são obrigatórios');
      }

      if (dialogMode === 'add') {
        // Adiciona o novo equipamento
        addEquipment(formData);
        setSnackbar({
          open: true,
          message: 'Equipamento adicionado com sucesso!',
          severity: 'success'
        });
      } else {
        // Atualiza o equipamento existente
        const updatedEquipment = {
          ...selectedEquipment,
          ...formData
        };
        updateEquipment(updatedEquipment);
        setSnackbar({
          open: true,
          message: 'Equipamento atualizado com sucesso!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleOpenDeleteDialog = (equipment) => {
    setEquipmentToDelete(equipment);
    setConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog(false);
    setEquipmentToDelete(null);
  };

  const handleConfirmDelete = () => {
    try {
      if (!equipmentToDelete) return;
      
      deleteEquipment(equipmentToDelete.id);
      setSnackbar({
        open: true,
        message: 'Equipamento excluído com sucesso!',
        severity: 'success'
      });
      handleCloseDeleteDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
      handleCloseDeleteDialog();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Funções auxiliares para obter informações relacionadas
  const getModelName = (modelId) => {
    const model = machineModels.find(model => model.id === modelId);
    return model ? model.name : 'Não especificado';
  };

  const getFamilyName = (familyId) => {
    const family = machineFamilies.find(family => family.id === familyId);
    return family ? family.name : 'Não especificada';
  };

  const getClientName = (clientId) => {
    const client = clients.find(client => client.id === clientId);
    return client ? client.name : 'Não especificado';
  };

  // Renderização condicional durante o carregamento
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando equipamentos...</Typography>
      </Box>
    );
  }

  // Renderização em caso de erro
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Filtra os modelos com base na família selecionada
  const filteredModels = formData.familyId 
    ? machineModels.filter(model => model.familyId === formData.familyId)
    : [];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Cadastro de Equipamentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Novo Equipamento
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Chassi</TableCell>
                <TableCell>Série</TableCell>
                <TableCell>Modelo</TableCell>
                <TableCell>Família</TableCell>
                <TableCell>Ano</TableCell>
                <TableCell>Horímetro</TableCell>
                <TableCell>Proprietário</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      Nenhum equipamento cadastrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                equipments.map((equipment) => (
                  <TableRow key={equipment.id} hover>
                    <TableCell>{equipment.chassis}</TableCell>
                    <TableCell>{equipment.series}</TableCell>
                    <TableCell>{getModelName(equipment.modelId)}</TableCell>
                    <TableCell>
                      <Chip 
                        size="small" 
                        label={getFamilyName(equipment.familyId)}
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{equipment.year}</TableCell>
                    <TableCell>{equipment.hourmeter} h</TableCell>
                    <TableCell>{getClientName(equipment.clientId)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar equipamento">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(equipment)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir equipamento">
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(equipment)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para adicionar/editar equipamento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Adicionar Novo Equipamento' : 'Editar Equipamento'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="chassis"
              label="Chassi"
              value={formData.chassis}
              onChange={handleInputChange}
              fullWidth
              required
              InputProps={{
                startAdornment: <NumbersIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <TextField
              name="series"
              label="Série"
              value={formData.series}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <TagIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            <FormControl fullWidth required>
              <InputLabel id="family-label">Família</InputLabel>
              <Select
                labelId="family-label"
                name="familyId"
                value={formData.familyId}
                onChange={handleInputChange}
                label="Família"
                startAdornment={<CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {machineFamilies.map((family) => (
                  <MenuItem key={family.id} value={family.id}>
                    {family.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth required disabled={!formData.familyId}>
              <InputLabel id="model-label">Modelo</InputLabel>
              <Select
                labelId="model-label"
                name="modelId"
                value={formData.modelId}
                onChange={handleInputChange}
                label="Modelo"
                startAdornment={<ConstructionIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {filteredModels.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              name="year"
              label="Ano de Fabricação"
              type="number"
              value={formData.year}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <CalendarMonthIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                inputProps: { min: 1900, max: new Date().getFullYear() }
              }}
            />
            
            <TextField
              name="hourmeter"
              label="Horímetro (horas)"
              type="number"
              value={formData.hourmeter}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                inputProps: { min: 0 }
              }}
            />
            
            <FormControl fullWidth required>
              <InputLabel id="client-label">Proprietário</InputLabel>
              <Select
                labelId="client-label"
                name="clientId"
                value={formData.clientId}
                onChange={handleInputChange}
                label="Proprietário"
                startAdornment={<BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação para excluir equipamento */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o equipamento "{equipmentToDelete?.chassis}" 
            ({getModelName(equipmentToDelete?.modelId)})?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

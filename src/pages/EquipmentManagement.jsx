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
  Autocomplete,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Tooltip,
  Chip,
  CircularProgress
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
import ApiService from '../services/ApiService';

// Store para gerenciar o estado dos equipamentos
const useEquipmentStore = () => {
  const [equipments, setEquipments] = useState([]);
  const [machineModels, setMachineModels] = useState([]);
  const [machineFamilies, setMachineFamilies] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Busca os equipamentos da API
  const fetchEquipments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ApiService.getAllEquipments();
      setEquipments(data);
    } catch (err) {
      console.error('Erro ao buscar equipamentos:', err);
      setError('Erro ao carregar equipamentos: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Busca os modelos de máquinas da API
  const fetchMachineModels = async () => {
    try {
      const data = await ApiService.getAllMachineModels();
      setMachineModels(data);
    } catch (err) {
      console.error('Erro ao buscar modelos de máquinas:', err);
    }
  };

  // Busca as famílias de máquinas da API
  const fetchMachineFamilies = async () => {
    try {
      const data = await ApiService.getAllMachineFamilies();
      setMachineFamilies(data);
    } catch (err) {
      console.error('Erro ao buscar famílias de máquinas:', err);
    }
  };

  // Busca os clientes da API
  const fetchClients = async () => {
    try {
      const data = await ApiService.getAllClients();
      setClients(data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    }
  };

  // Inicializa os dados necessários
  const initializeEquipments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Busca todos os dados necessários em paralelo
      await Promise.all([
        fetchEquipments(),
        fetchMachineModels(),
        fetchMachineFamilies(),
        fetchClients()
      ]);
    } catch (err) {
      console.error('Erro ao inicializar dados:', err);
      setError('Erro ao inicializar dados: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Adiciona um novo equipamento
  const addEquipment = async (equipmentData) => {
    setIsSubmitting(true);
    try {
      const response = await ApiService.createEquipment(equipmentData);
      await fetchEquipments(); // Atualiza a lista de equipamentos
      return response.equipment;
    } catch (err) {
      console.error('Erro ao adicionar equipamento:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atualiza um equipamento existente
  const updateEquipment = async (id, equipmentData) => {
    setIsSubmitting(true);
    try {
      const response = await ApiService.updateEquipment(id, equipmentData);
      await fetchEquipments(); // Atualiza a lista de equipamentos
    } catch (err) {
      console.error(`Erro ao atualizar equipamento ${id}:`, err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remove um equipamento
  const deleteEquipment = async (id) => {
    setIsSubmitting(true);
    try {
      await ApiService.deleteEquipment(id);
      await fetchEquipments(); // Atualiza a lista de equipamentos
    } catch (err) {
      console.error(`Erro ao excluir equipamento ${id}:`, err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    equipments,
    machineModels,
    machineFamilies,
    clients,
    isLoading,
    isSubmitting,
    error,
    fetchEquipments,
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
    machineModels,
    machineFamilies,
    clients,
    isLoading,
    isSubmitting,
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

  // --- Estados dos filtros ---
  const [filterChassis, setFilterChassis] = useState('');
  const [filterSeries, setFilterSeries] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterModelId, setFilterModelId] = useState('');
  const [filterFamilyId, setFilterFamilyId] = useState('');
  const [filterClientId, setFilterClientId] = useState('');

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
    // Garantir que todos os campos estejam presentes e com valores válidos
    setFormData({
      chassis: equipment.chassis || '',
      series: equipment.series || '',
      modelId: equipment.modelId || equipment.model_id || '',
      familyId: equipment.familyId || equipment.family_id || '',
      year: equipment.year || new Date().getFullYear(),
      hourmeter: equipment.hourmeter || 0,
      clientId: equipment.clientId || equipment.client_id || ''
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
    let parsedValue;
    if (name === 'year' || name === 'hourmeter') {
      // Para campos numéricos, converter para número ou usar 0
      parsedValue = value === '' ? 0 : parseInt(value, 10) || 0;
    } else if (name === 'modelId' || name === 'familyId' || name === 'clientId') {
      // Para IDs, manter como string vazia se não houver valor
      parsedValue = value === '' ? '' : value;
    } else {
      // Para campos de texto, usar o valor como está
      parsedValue = value;
    }
    
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

  const handleSubmit = async () => {
    try {
      // Validação básica
      if (!formData.chassis || !formData.modelId || !formData.familyId || !formData.clientId) {
        throw new Error('Os campos Chassi, Modelo, Família e Proprietário são obrigatórios');
      }

      if (dialogMode === 'add') {
        // Adiciona o novo equipamento
        await addEquipment(formData);
        setSnackbar({
          open: true,
          message: 'Equipamento adicionado com sucesso!',
          severity: 'success'
        });
      } else {
        // Atualiza o equipamento existente
        await updateEquipment(selectedEquipment.id, formData);
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
        message: err.message || 'Ocorreu um erro ao processar a operação',
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

  const handleConfirmDelete = async () => {
    try {
      if (!equipmentToDelete) return;
      
      await deleteEquipment(equipmentToDelete.id);
      setSnackbar({
        open: true,
        message: 'Equipamento excluído com sucesso!',
        severity: 'success'
      });
      handleCloseDeleteDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Ocorreu um erro ao excluir o equipamento',
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
  const getModelName = (equipment) => {
    // Verifica se o equipamento existe
    if (!equipment) return 'Não especificado';
    
    // Se o equipamento já tem o nome do modelo da API
    if (equipment.model_name) return equipment.model_name;
    
    // Caso contrário, busca pelo ID (pode ser modelId ou model_id)
    const modelId = equipment.modelId || equipment.model_id;
    if (!modelId) return 'Não especificado';
    
    const model = machineModels.find(model => model.id === modelId);
    return model ? model.name : 'Não especificado';
  };

  const getFamilyName = (equipment) => {
    // Se o equipamento já tem o nome da família da API
    if (equipment.family_name) return equipment.family_name;
    
    // Caso contrário, busca pelo ID (pode ser familyId ou family_id)
    const familyId = equipment.familyId || equipment.family_id;
    if (!familyId) return 'Não especificado';
    
    const family = machineFamilies.find(family => family.id === familyId);
    return family ? family.name : 'Não especificado';
  };

  const getClientName = (equipment) => {
    // Se o equipamento já tem o nome do cliente da API
    if (equipment.client_name) return equipment.client_name;
    
    // Caso contrário, busca pelo ID (pode ser clientId ou client_id)
    const clientId = equipment.clientId || equipment.client_id;
    if (!clientId) return 'Não especificado';
    
    const client = clients.find(client => client.id === clientId);
    return client ? client.name : 'Não especificado';
  };

  // Filtra os modelos com base na família selecionada
  const getFilteredModels = () => {
    if (!formData.familyId) return machineModels;
    return machineModels.filter(model => {
      // Verifica se o modelo tem family_id ou familyId
      const modelFamilyId = model.family_id !== undefined ? model.family_id : model.familyId;
      return modelFamilyId === formData.familyId;
    });
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

  // Usando a função getFilteredModels já definida anteriormente
  const filteredModels = formData.familyId ? getFilteredModels() : [];

  // --- Lógica de filtragem dos equipamentos ---
  const filteredEquipments = equipments.filter(eq => {
    // Chassi
    if (filterChassis && !(eq.chassis || '').toLowerCase().includes(filterChassis.toLowerCase())) return false;
    // Série
    if (filterSeries && !(eq.series || '').toLowerCase().includes(filterSeries.toLowerCase())) return false;
    // Ano
    if (filterYear && String(eq.year) !== String(filterYear)) return false;
    // Modelo
    if (filterModelId && String(eq.modelId || eq.model_id) !== String(filterModelId)) return false;
    // Família
    if (filterFamilyId && String(eq.familyId || eq.family_id) !== String(filterFamilyId)) return false;
    // Proprietário
    if (filterClientId && String(eq.clientId || eq.client_id) !== String(filterClientId)) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      {/* Cabeçalho no mesmo estilo das outras páginas */}
      <Paper elevation={0} sx={{ bgcolor: 'transparent', mb: 4 }}>
        <Box display="flex" alignItems="flex-start" gap={2} mb={1}>
          <Box bgcolor="#1976d2" borderRadius={2} p={1.5} display="flex" alignItems="center" justifyContent="center">
            <ConstructionIcon sx={{ color: '#fff', fontSize: 32 }} />
          </Box>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h3" fontWeight={500} color="#444" sx={{ letterSpacing: 1 }}>
              Equipamentos
            </Typography>
            <Typography variant="subtitle1" color="#888" fontWeight={400}>
              Gerencie, edite e exclua equipamentos.
            </Typography>
          </Box>
        </Box>
      </Paper>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Filtrar por Chassi"
          variant="outlined"
          size="small"
          value={filterChassis}
          onChange={e => setFilterChassis(e.target.value)}
          sx={{ minWidth: 150, background: '#fff', borderRadius: 2 }}
          InputLabelProps={{ sx: { color: '#888' } }}
        />
        <TextField
          label="Filtrar por Série"
          variant="outlined"
          size="small"
          value={filterSeries}
          onChange={e => setFilterSeries(e.target.value)}
          sx={{ minWidth: 120, background: '#fff', borderRadius: 2 }}
          InputLabelProps={{ sx: { color: '#888' } }}
        />
        <TextField
          label="Filtrar por Ano"
          variant="outlined"
          size="small"
          type="number"
          value={filterYear}
          onChange={e => setFilterYear(e.target.value)}
          sx={{ minWidth: 100, background: '#fff', borderRadius: 2 }}
          InputLabelProps={{ sx: { color: '#888' } }}
        />
        <Autocomplete
  options={machineModels}
  getOptionLabel={option => option.name || ''}
  value={machineModels.find(m => String(m.id) === String(filterModelId)) || null}
  onChange={(_, newValue) => setFilterModelId(newValue ? newValue.id : '')}
  renderInput={(params) => (
    <TextField {...params} label="Modelo" variant="outlined" size="small" sx={{ minWidth: 160, background: '#fff', borderRadius: 2 }} InputLabelProps={{ sx: { color: '#888' } }} />
  )}
  isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
  clearOnEscape
/>

        <Autocomplete
  options={machineFamilies}
  getOptionLabel={option => option.name || ''}
  value={machineFamilies.find(f => String(f.id) === String(filterFamilyId)) || null}
  onChange={(_, newValue) => setFilterFamilyId(newValue ? newValue.id : '')}
  renderInput={(params) => (
    <TextField {...params} label="Família" variant="outlined" size="small" sx={{ minWidth: 160, background: '#fff', borderRadius: 2 }} InputLabelProps={{ sx: { color: '#888' } }} />
  )}
  isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
  clearOnEscape
/>

        <Autocomplete
  options={clients}
  getOptionLabel={option => option.name || ''}
  value={clients.find(c => String(c.id) === String(filterClientId)) || null}
  onChange={(_, newValue) => setFilterClientId(newValue ? newValue.id : '')}
  renderInput={(params) => (
    <TextField {...params} label="Proprietário" variant="outlined" size="small" sx={{ minWidth: 160, background: '#fff', borderRadius: 2 }} InputLabelProps={{ sx: { color: '#888' } }} />
  )}
  isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
  clearOnEscape
/>

        <Box flexGrow={1} />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          sx={{ whiteSpace: 'nowrap' }}
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
              {filteredEquipments.length === 0 ? (
                <TableRow>
                    <TableCell>{getFamilyName(equipment.familyId || equipment.family_id)}</TableCell>
                    <TableCell>{equipment.year}</TableCell>
                    <TableCell>{equipment.hourmeter}</TableCell>
                    <TableCell>{getClientName(equipment.clientId || equipment.client_id)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton onClick={() => handleOpenEditDialog(equipment)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton onClick={() => handleOpenDeleteDialog(equipment)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para adicionar/editar equipamento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
  <Paper elevation={3} sx={{ borderRadius: 4, p: 0, bgcolor: '#f9fafb' }}>
    <Box display="flex" alignItems="center" gap={2} px={3} pt={3} pb={1}>
      <Box bgcolor="#1976d2" borderRadius={2} p={1.2} display="flex" alignItems="center" justifyContent="center">
        <ConstructionIcon sx={{ color: '#fff', fontSize: 28 }} />
      </Box>
      <Box sx={{ textAlign: 'left' }}>
        <Typography variant="h5" fontWeight={600} color="#444">
          {dialogMode === 'add' ? 'Adicionar Novo Equipamento' : 'Editar Equipamento'}
        </Typography>
        <Typography variant="subtitle2" color="#888" fontWeight={400}>
          Preencha todos os campos obrigatórios para {dialogMode === 'add' ? 'adicionar' : 'editar'} um equipamento.
        </Typography>
      </Box>
    </Box>
        {/* Cabeçalho movido para Paper acima */}
        <DialogContent sx={{ px: 3, pt: 0, pb: 2 }}>
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
            
            <Autocomplete
  options={machineFamilies}
  getOptionLabel={option => option?.name || ''}
  value={machineFamilies.find(f => String(f.id) === String(formData.familyId)) || null}
  onChange={(_, newValue) => {
    setFormData({
      ...formData,
      familyId: newValue ? newValue.id : '',
      modelId: '' // Limpa o modelo ao trocar família
    });
  }}
  renderInput={(params) => (
    <TextField {...params} label="Família" required fullWidth InputProps={{ ...params.InputProps, startAdornment: <CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
  )}
  isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
  clearOnEscape
/>
            
            <Autocomplete
  options={filteredModels}
  getOptionLabel={option => option?.name || ''}
  value={filteredModels.find(m => String(m.id) === String(formData.modelId)) || null}
  onChange={(_, newValue) => {
    setFormData({
      ...formData,
      modelId: newValue ? newValue.id : ''
    });
  }}
  renderInput={(params) => (
    <TextField {...params} label="Modelo" required fullWidth InputProps={{ ...params.InputProps, startAdornment: <ConstructionIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
  )}
  isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
  clearOnEscape
  disabled={!formData.familyId}
/>
            
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
            
            <Autocomplete
  options={clients}
  getOptionLabel={option => option?.name || ''}
  value={clients.find(c => String(c.id) === String(formData.clientId)) || null}
  onChange={(_, newValue) => {
<<<<<<< HEAD
=======
    setFormData({ ...formData, clientId: newValue ? newValue.id : '' });
  }}
  renderInput={(params) => (
    <TextField {...params} label="Proprietário" variant="outlined" required fullWidth InputLabelProps={{ sx: { color: '#888' } }}
      InputProps={{ ...params.InputProps, startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
    />
  )}
  isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
  clearOnEscape
/>
</Box>
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
              
              <Autocomplete
  options={machineFamilies}
  getOptionLabel={option => option?.name || ''}
  value={machineFamilies.find(f => String(f.id) === String(formData.familyId)) || null}
  onChange={(_, newValue) => {
    setFormData({
      ...formData,
      familyId: newValue ? newValue.id : '',
      modelId: '' // Limpa o modelo ao trocar família
    });
  }}
  renderInput={(params) => (
    <TextField {...params} label="Família" required fullWidth InputProps={{ ...params.InputProps, startAdornment: <CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
  )}
  isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
  clearOnEscape
/>
              
              <Autocomplete
  options={filteredModels}
  getOptionLabel={option => option?.name || ''}
  value={filteredModels.find(m => String(m.id) === String(formData.modelId)) || null}
  onChange={(_, newValue) => {
    setFormData({
      ...formData,
      modelId: newValue ? newValue.id : ''
    });
  }}
  renderInput={(params) => (
    <TextField {...params} label="Modelo" required fullWidth InputProps={{ ...params.InputProps, startAdornment: <ConstructionIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
  )}
  isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
  clearOnEscape
  disabled={!formData.familyId}
/>
              
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
              
              <Autocomplete
  options={clients}
  getOptionLabel={option => option?.name || ''}
  value={clients.find(c => String(c.id) === String(formData.clientId)) || null}
  onChange={(_, newValue) => {
>>>>>>> eed667e (feat: atualizações gerais, autocomplete nos modais, novos componentes e ajustes de backend)
    setFormData({
      ...formData,
      clientId: newValue ? newValue.id : ''
    });
  }}
  renderInput={(params) => (
    <TextField {...params} label="Proprietário" required fullWidth InputProps={{ ...params.InputProps, startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} /> }} />
  )}
  isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
  clearOnEscape
/>
<<<<<<< HEAD
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
          <Button onClick={handleCloseDialog} disabled={isSubmitting} sx={{ borderRadius: 2, fontWeight: 500 }}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary" 
            disabled={isSubmitting}
            sx={{ fontWeight: 600, borderRadius: 2, px: 4 }}
          >
            {dialogMode === 'add' ? 'Salvar' : 'Atualizar'}
          </Button>
        </DialogActions>
      </Paper>
    </Dialog>

    <Dialog open={confirmDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
=======
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2, pt: 0 }}>
            <Button onClick={handleCloseDialog} disabled={isSubmitting} sx={{ borderRadius: 2, fontWeight: 500 }}>Cancelar</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary" 
              disabled={isSubmitting}
              sx={{ fontWeight: 600, borderRadius: 2, px: 4 }}
            >
              {dialogMode === 'add' ? 'Salvar' : 'Atualizar'}
            </Button>
          </DialogActions>
        </Paper>
      </Dialog>

      <Dialog open={confirmDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
>>>>>>> eed667e (feat: atualizações gerais, autocomplete nos modais, novos componentes e ajustes de backend)
  <DialogTitle>Confirmar Exclusão</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Tem certeza que deseja excluir o equipamento "{equipmentToDelete?.chassis}" 
<<<<<<< HEAD
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDeleteDialog} color="secondary">
      Cancelar
    </Button>
    <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={isSubmitting}>
      {isSubmitting ? <CircularProgress size={22} /> : 'Excluir'}
=======
      ({getModelName(equipmentToDelete)})?
      Esta ação não pode ser desfeita.
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDeleteDialog} disabled={isSubmitting}>Cancelar</Button>
    <Button 
      onClick={handleConfirmDelete} 
      color="error" 
      variant="contained"
      disabled={isSubmitting}
      startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
    >
      Excluir
>>>>>>> eed667e (feat: atualizações gerais, autocomplete nos modais, novos componentes e ajustes de backend)
    </Button>
  </DialogActions>
</Dialog>

{/* Snackbar para feedback de ações */}
<Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
  <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
    {snackbar.message}
  </Alert>
</Snackbar>
  </Box>
  );
}

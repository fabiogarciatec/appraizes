import React, { useState, useEffect, useMemo } from 'react';
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
  Chip,
  Grid,
  FormControlLabel,
  Switch,
  InputAdornment,
  Divider,
  Card,
  CardContent,
  CardHeader,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalGasStation as GasStationIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Event as CalendarIcon,
  Speed as SpeedIcon,
  Opacity as OpacityIcon,
  FilterList as FilterIcon,
  ShowChart as ChartIcon,
  Nature as EcoIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { 
  fuelRefills as mockFuelRefills, 
  equipments, 
  machineModels, 
  machineFamilies, 
  clients 
} from '../data/mockData';

// Componentes para os gráficos
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Store para gerenciar o estado dos abastecimentos
const useFuelRefillStore = () => {
  const [fuelRefills, setFuelRefills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializa os abastecimentos a partir do localStorage ou dos dados mockados
  const initializeFuelRefills = () => {
    setIsLoading(true);
    try {
      const storedFuelRefills = localStorage.getItem('appraizes_fuel_refills');
      if (storedFuelRefills) {
        setFuelRefills(JSON.parse(storedFuelRefills));
      } else {
        // Se não houver abastecimentos no localStorage, usa os mockados
        setFuelRefills(mockFuelRefills);
        localStorage.setItem('appraizes_fuel_refills', JSON.stringify(mockFuelRefills));
      }
    } catch (err) {
      setError('Erro ao carregar abastecimentos: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Adiciona um novo abastecimento
  const addFuelRefill = (fuelRefill) => {
    const newFuelRefill = {
      ...fuelRefill,
      id: fuelRefills.length > 0 ? Math.max(...fuelRefills.map(e => e.id)) + 1 : 1
    };
    const updatedFuelRefills = [...fuelRefills, newFuelRefill];
    setFuelRefills(updatedFuelRefills);
    localStorage.setItem('appraizes_fuel_refills', JSON.stringify(updatedFuelRefills));
    return newFuelRefill;
  };

  // Atualiza um abastecimento existente
  const updateFuelRefill = (updatedFuelRefill) => {
    const updatedFuelRefills = fuelRefills.map(fuelRefill => 
      fuelRefill.id === updatedFuelRefill.id ? updatedFuelRefill : fuelRefill
    );
    setFuelRefills(updatedFuelRefills);
    localStorage.setItem('appraizes_fuel_refills', JSON.stringify(updatedFuelRefills));
  };

  // Remove um abastecimento
  const deleteFuelRefill = (fuelRefillId) => {
    const updatedFuelRefills = fuelRefills.filter(fuelRefill => fuelRefill.id !== fuelRefillId);
    setFuelRefills(updatedFuelRefills);
    localStorage.setItem('appraizes_fuel_refills', JSON.stringify(updatedFuelRefills));
  };

  return {
    fuelRefills,
    isLoading,
    error,
    initializeFuelRefills,
    addFuelRefill,
    updateFuelRefill,
    deleteFuelRefill
  };
};

// Componente principal de gerenciamento de abastecimentos
export default function FuelManagement() {
  const theme = useTheme();
  
  // Estado do store de abastecimentos
  const {
    fuelRefills,
    isLoading,
    error,
    initializeFuelRefills,
    addFuelRefill,
    updateFuelRefill,
    deleteFuelRefill
  } = useFuelRefillStore();

  // Estados locais para controlar a interface
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' ou 'edit'
  const [selectedFuelRefill, setSelectedFuelRefill] = useState(null);
  const [formData, setFormData] = useState({
    equipmentSeries: '',
    date: new Date().toISOString().split('T')[0],
    liters: 0,
    hourmeter: 0,
    usedAdgreen: false,
    operatorName: '',
    operatorPhone: '',
    equipmentId: ''
  });
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [fuelRefillToDelete, setFuelRefillToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'dashboard'
  const [selectedEquipment, setSelectedEquipment] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  // Inicializa os abastecimentos ao montar o componente
  useEffect(() => {
    initializeFuelRefills();
  }, []);

  // Manipuladores de eventos
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      equipmentSeries: '',
      date: new Date().toISOString().split('T')[0],
      liters: 0,
      hourmeter: 0,
      usedAdgreen: false,
      operatorName: '',
      operatorPhone: '',
      equipmentId: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (fuelRefill) => {
    setDialogMode('edit');
    setFormData({
      ...fuelRefill
    });
    setSelectedFuelRefill(fuelRefill);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFuelRefill(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Conversão para número quando apropriado
    let parsedValue;
    if (type === 'checkbox') {
      parsedValue = checked;
    } else if (name === 'liters' || name === 'hourmeter' || name === 'equipmentId') {
      parsedValue = value === '' ? '' : Number(value);
    } else {
      parsedValue = value;
    }
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  const handleSubmit = () => {
    try {
      // Validação básica
      if (!formData.equipmentSeries || !formData.date || !formData.liters || !formData.hourmeter || !formData.operatorName) {
        throw new Error('Os campos Número de Série, Data, Litros, Horímetro e Operador são obrigatórios');
      }

      // Encontrar o equipmentId baseado no número de série
      const equipment = equipments.find(eq => eq.chassis === formData.equipmentSeries);
      const equipmentId = equipment ? equipment.id : '';

      const fuelRefillData = {
        ...formData,
        equipmentId
      };

      if (dialogMode === 'add') {
        // Adiciona o novo abastecimento
        addFuelRefill(fuelRefillData);
        setSnackbar({
          open: true,
          message: 'Abastecimento registrado com sucesso!',
          severity: 'success'
        });
      } else {
        // Atualiza o abastecimento existente
        const updatedFuelRefill = {
          ...selectedFuelRefill,
          ...fuelRefillData
        };
        updateFuelRefill(updatedFuelRefill);
        setSnackbar({
          open: true,
          message: 'Abastecimento atualizado com sucesso!',
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

  const handleOpenDeleteDialog = (fuelRefill) => {
    setFuelRefillToDelete(fuelRefill);
    setConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog(false);
    setFuelRefillToDelete(null);
  };

  const handleConfirmDelete = () => {
    try {
      if (!fuelRefillToDelete) return;
      
      deleteFuelRefill(fuelRefillToDelete.id);
      setSnackbar({
        open: true,
        message: 'Abastecimento excluído com sucesso!',
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

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const handleEquipmentFilterChange = (event) => {
    setSelectedEquipment(event.target.value);
  };

  // Funções auxiliares para obter informações relacionadas
  const getEquipmentInfo = (equipmentId) => {
    const equipment = equipments.find(eq => eq.id === equipmentId);
    if (!equipment) return { model: 'Desconhecido', client: 'Desconhecido' };

    const model = machineModels.find(model => model.id === equipment.modelId);
    const client = clients.find(client => client.id === equipment.clientId);

    return {
      model: model ? model.name : 'Desconhecido',
      client: client ? client.name : 'Desconhecido'
    };
  };

  // Renderização condicional durante o carregamento
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando abastecimentos...</Typography>
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

  // Filtra os abastecimentos com base nos filtros selecionados
  const filteredFuelRefills = fuelRefills.filter(refill => {
    const matchesEquipment = selectedEquipment === 'all' || refill.equipmentId.toString() === selectedEquipment;
    const refillDate = new Date(refill.date);
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    const matchesDateRange = refillDate >= startDate && refillDate <= endDate;
    
    return matchesEquipment && matchesDateRange;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Gerenciamento de Abastecimento de Diesel
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            startIcon={<GasStationIcon />}
            onClick={() => handleViewModeChange('list')}
          >
            Registros
          </Button>
          <Button
            variant={viewMode === 'dashboard' ? 'contained' : 'outlined'}
            startIcon={<ChartIcon />}
            onClick={() => handleViewModeChange('dashboard')}
          >
            Dashboard
          </Button>
          {viewMode === 'list' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Novo Abastecimento
            </Button>
          )}
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden', p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel id="equipment-filter-label">Equipamento</InputLabel>
              <Select
                labelId="equipment-filter-label"
                id="equipment-filter"
                value={selectedEquipment}
                onChange={handleEquipmentFilterChange}
                label="Equipamento"
              >
                <MenuItem value="all">Todos os Equipamentos</MenuItem>
                {equipments.map((equipment) => (
                  <MenuItem key={equipment.id} value={equipment.id.toString()}>
                    {equipment.chassis} - {getEquipmentInfo(equipment.id).model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Data Inicial"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Data Final"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {viewMode === 'list' ? (
        <ListView 
          filteredFuelRefills={filteredFuelRefills} 
          getEquipmentInfo={getEquipmentInfo}
          handleOpenEditDialog={handleOpenEditDialog}
          handleOpenDeleteDialog={handleOpenDeleteDialog}
        />
      ) : (
        <DashboardView 
          filteredFuelRefills={filteredFuelRefills} 
          getEquipmentInfo={getEquipmentInfo}
        />
      )}

      {/* Diálogo para adicionar/editar abastecimento */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Registrar Novo Abastecimento' : 'Editar Abastecimento'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                autoFocus
                margin="dense"
                id="equipmentSeries"
                name="equipmentSeries"
                label="Número de Série da Máquina"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.equipmentSeries}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CarIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Data do Abastecimento"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                id="liters"
                name="liters"
                label="Quantidade de Litros"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.liters}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <OpacityIcon />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">L</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                id="hourmeter"
                name="hourmeter"
                label="Horímetro Atual"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.hourmeter}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SpeedIcon />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">h</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.usedAdgreen}
                    onChange={handleInputChange}
                    name="usedAdgreen"
                    color="primary"
                  />
                }
                label="Utilizou Adgreen"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                id="operatorName"
                name="operatorName"
                label="Nome do Operador"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.operatorName}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                margin="dense"
                id="operatorPhone"
                name="operatorPhone"
                label="Telefone do Operador"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.operatorPhone}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {dialogMode === 'add' ? 'Registrar' : 'Atualizar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmação para excluir abastecimento */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir este registro de abastecimento? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">Cancelar</Button>
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Componente de visualização em lista
const ListView = ({ filteredFuelRefills, getEquipmentInfo, handleOpenEditDialog, handleOpenDeleteDialog }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small">
        <TableHead>
          <TableRow>
            <TableCell>Equipamento</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Data</TableCell>
            <TableCell align="right">Litros</TableCell>
            <TableCell align="right">Horímetro</TableCell>
            <TableCell align="center">Adgreen</TableCell>
            <TableCell>Operador</TableCell>
            <TableCell align="center">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredFuelRefills.length > 0 ? (
            filteredFuelRefills.map((fuelRefill) => {
              const equipmentInfo = getEquipmentInfo(fuelRefill.equipmentId);
              return (
                <TableRow key={fuelRefill.id}>
                  <TableCell>
                    <Tooltip title={`Série: ${fuelRefill.equipmentSeries}`}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CarIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        {equipmentInfo.model}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>{equipmentInfo.client}</TableCell>
                  <TableCell>
                    {new Date(fuelRefill.date).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell align="right">
                    {fuelRefill.liters.toFixed(2)} L
                  </TableCell>
                  <TableCell align="right">
                    {fuelRefill.hourmeter.toFixed(2)} h
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      size="small" 
                      label={fuelRefill.usedAdgreen ? 'Sim' : 'Não'}
                      color={fuelRefill.usedAdgreen ? 'success' : 'default'}
                      variant={fuelRefill.usedAdgreen ? 'filled' : 'outlined'}
                      icon={fuelRefill.usedAdgreen ? <EcoIcon /> : null}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={`Telefone: ${fuelRefill.operatorPhone || 'Não informado'}`}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        {fuelRefill.operatorName}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Tooltip title="Editar">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(fuelRefill)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(fuelRefill)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} align="center">
                <Typography variant="body2" sx={{ py: 2 }}>
                  Nenhum registro de abastecimento encontrado com os filtros selecionados.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Componente de visualização em dashboard
const DashboardView = ({ filteredFuelRefills, getEquipmentInfo }) => {
  const theme = useTheme();
  
  // Calcula os dados de consumo para os gráficos
  const consumptionData = useMemo(() => {
    // Agrupa os abastecimentos por equipamento e calcula o consumo por hora
    const equipmentRefills = {};
    
    // Ordena os abastecimentos por data e horímetro
    const sortedRefills = [...filteredFuelRefills].sort((a, b) => {
      if (a.equipmentId !== b.equipmentId) return a.equipmentId - b.equipmentId;
      if (a.date !== b.date) return new Date(a.date) - new Date(b.date);
      return a.hourmeter - b.hourmeter;
    });
    
    // Agrupa por equipamento
    sortedRefills.forEach(refill => {
      if (!equipmentRefills[refill.equipmentId]) {
        equipmentRefills[refill.equipmentId] = [];
      }
      equipmentRefills[refill.equipmentId].push(refill);
    });
    
    // Calcula o consumo por hora para cada período entre abastecimentos
    const consumptionData = [];
    
    Object.keys(equipmentRefills).forEach(equipmentId => {
      const refills = equipmentRefills[equipmentId];
      
      // Precisamos de pelo menos 2 abastecimentos para calcular o consumo
      if (refills.length < 2) return;
      
      for (let i = 1; i < refills.length; i++) {
        const currentRefill = refills[i];
        const previousRefill = refills[i-1];
        
        // Calcula a diferença de horímetro (horas trabalhadas no período)
        const hourDiff = currentRefill.hourmeter - previousRefill.hourmeter;
        
        // Evita divisão por zero ou valores negativos
        if (hourDiff <= 0) continue;
        
        // O consumo deve ser calculado com base no abastecimento anterior
        // pois ele representa o combustível que foi consumido no período
        const litersPerHour = previousRefill.liters / hourDiff;
        
        const equipmentInfo = getEquipmentInfo(parseInt(equipmentId));
        
        // O uso de Adgreen deve ser associado ao período de consumo (abastecimento anterior)
        // pois é o que afeta o consumo durante o período
        consumptionData.push({
          id: previousRefill.id,
          equipmentId: parseInt(equipmentId),
          equipmentSeries: previousRefill.equipmentSeries,
          equipmentModel: equipmentInfo.model,
          date: previousRefill.date,
          endDate: currentRefill.date,
          liters: previousRefill.liters,
          hourDiff,
          litersPerHour,
          usedAdgreen: previousRefill.usedAdgreen,
          startHourmeter: previousRefill.hourmeter,
          endHourmeter: currentRefill.hourmeter
        });
      }
    });
    
    return consumptionData;
  }, [filteredFuelRefills, getEquipmentInfo]);
  
  // Calcula a economia com o uso de Adgreen
  const savingsData = useMemo(() => {
    // Agrupa por equipamento
    const equipmentConsumption = {};
    
    // Filtra apenas os dados com consumo válido
    const validConsumptionData = consumptionData.filter(data => 
      data.litersPerHour > 0 && data.hourDiff > 0
    );
    
    // Agrupa os dados de consumo por equipamento e uso de Adgreen
    validConsumptionData.forEach(data => {
      if (!equipmentConsumption[data.equipmentId]) {
        equipmentConsumption[data.equipmentId] = {
          withAdgreen: [],
          withoutAdgreen: [],
          details: []
        };
      }
      
      // Adiciona o detalhe do período para análise posterior
      equipmentConsumption[data.equipmentId].details.push({
        startDate: data.date,
        endDate: data.endDate,
        startHourmeter: data.startHourmeter,
        endHourmeter: data.endHourmeter,
        hourDiff: data.hourDiff,
        liters: data.liters,
        litersPerHour: data.litersPerHour,
        usedAdgreen: data.usedAdgreen
      });
      
      // Agrupa os consumos por hora com base no uso ou não de Adgreen
      if (data.usedAdgreen) {
        equipmentConsumption[data.equipmentId].withAdgreen.push(data.litersPerHour);
      } else {
        equipmentConsumption[data.equipmentId].withoutAdgreen.push(data.litersPerHour);
      }
    });
    
    // Calcula a média de consumo com e sem Adgreen para cada equipamento
    const savingsData = [];
    
    Object.keys(equipmentConsumption).forEach(equipmentId => {
      const consumption = equipmentConsumption[equipmentId];
      
      // Precisamos de dados com e sem Adgreen para calcular a economia
      if (consumption.withAdgreen.length === 0 || consumption.withoutAdgreen.length === 0) return;
      
      // Calcula a média de consumo real com base nos dados coletados
      const avgWithAdgreen = consumption.withAdgreen.reduce((sum, val) => sum + val, 0) / consumption.withAdgreen.length;
      const avgWithoutAdgreen = consumption.withoutAdgreen.reduce((sum, val) => sum + val, 0) / consumption.withoutAdgreen.length;
      
      // Verifica se o consumo com Adgreen é realmente menor que sem Adgreen
      // Se não for, isso indica um problema nos dados ou na operação
      if (avgWithAdgreen >= avgWithoutAdgreen) {
        console.warn(`Anomalia detectada: consumo com Adgreen (${avgWithAdgreen.toFixed(2)}) não é menor que sem Adgreen (${avgWithoutAdgreen.toFixed(2)}) para o equipamento ${equipmentId}`);
      }
      
      // Calcula a economia percentual real
      const savingsPercent = ((avgWithoutAdgreen - avgWithAdgreen) / avgWithoutAdgreen) * 100;
      
      // Estima a economia mensal (considerando 176 horas de operação por mês)
      const monthlyHours = 176;
      const monthlySavingsLiters = (avgWithoutAdgreen - avgWithAdgreen) * monthlyHours;
      
      // Estima a economia financeira (considerando R$ 6,50 por litro de diesel)
      const dieselPrice = 6.5;
      const monthlySavingsValue = monthlySavingsLiters * dieselPrice;
      
      const equipmentInfo = getEquipmentInfo(parseInt(equipmentId));
      
      // Calcula os detalhes de consumo para cada período
      const periodsWithAdgreen = consumption.details.filter(d => d.usedAdgreen);
      const periodsWithoutAdgreen = consumption.details.filter(d => !d.usedAdgreen);
      
      // Calcula o total de horas e litros para cada tipo de período
      const totalHoursWithAdgreen = periodsWithAdgreen.reduce((sum, p) => sum + p.hourDiff, 0);
      const totalHoursWithoutAdgreen = periodsWithoutAdgreen.reduce((sum, p) => sum + p.hourDiff, 0);
      const totalLitersWithAdgreen = periodsWithAdgreen.reduce((sum, p) => sum + p.liters, 0);
      const totalLitersWithoutAdgreen = periodsWithoutAdgreen.reduce((sum, p) => sum + p.liters, 0);
      
      savingsData.push({
        equipmentId: parseInt(equipmentId),
        equipmentModel: equipmentInfo.model,
        avgWithAdgreen,
        avgWithoutAdgreen,
        savingsPercent,
        monthlySavingsLiters,
        monthlySavingsValue,
        totalHoursWithAdgreen,
        totalHoursWithoutAdgreen,
        totalLitersWithAdgreen,
        totalLitersWithoutAdgreen,
        periodsWithAdgreen: periodsWithAdgreen.length,
        periodsWithoutAdgreen: periodsWithoutAdgreen.length
      });
    });
    
    return savingsData;
  }, [consumptionData, getEquipmentInfo]);
  
  // Prepara os dados para o gráfico de consumo por equipamento
  const consumptionChartData = useMemo(() => {
    const equipmentData = {};
    
    // Filtra apenas dados válidos para o gráfico
    const validData = consumptionData.filter(data => 
      data.litersPerHour > 0 && data.hourDiff > 0
    );
    
    validData.forEach(data => {
      if (!equipmentData[data.equipmentId]) {
        equipmentData[data.equipmentId] = {
          equipmentId: data.equipmentId,
          equipmentModel: data.equipmentModel,
          points: []
        };
      }
      
      // Adiciona informações mais detalhadas para cada ponto
      equipmentData[data.equipmentId].points.push({
        // Usa a data de início do período para o gráfico
        date: new Date(data.date).toLocaleDateString('pt-BR'),
        // Período completo para exibição
        period: `${new Date(data.date).toLocaleDateString('pt-BR')} - ${new Date(data.endDate).toLocaleDateString('pt-BR')}`,
        litersPerHour: parseFloat(data.litersPerHour.toFixed(2)),
        usedAdgreen: data.usedAdgreen,
        liters: data.liters,
        hourDiff: data.hourDiff,
        startHourmeter: data.startHourmeter,
        endHourmeter: data.endHourmeter
      });
    });
    
    // Ordena os pontos por data
    Object.values(equipmentData).forEach(equipment => {
      equipment.points.sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    return Object.values(equipmentData);
  }, [consumptionData]);
  
  // Prepara os dados para o gráfico de comparação com e sem Adgreen
  const comparisonChartData = useMemo(() => {
    return savingsData.map(data => ({
      name: data.equipmentModel,
      withAdgreen: parseFloat(data.avgWithAdgreen.toFixed(2)),
      withoutAdgreen: parseFloat(data.avgWithoutAdgreen.toFixed(2)),
      savings: parseFloat(data.savingsPercent.toFixed(2)),
      // Adiciona informações detalhadas para exibição
      hoursWithAdgreen: data.totalHoursWithAdgreen,
      hoursWithoutAdgreen: data.totalHoursWithoutAdgreen,
      litersWithAdgreen: data.totalLitersWithAdgreen,
      litersWithoutAdgreen: data.totalLitersWithoutAdgreen,
      periodsWithAdgreen: data.periodsWithAdgreen,
      periodsWithoutAdgreen: data.periodsWithoutAdgreen
    }));
  }, [savingsData]);
  
  // Calcula a economia total
  const totalSavings = useMemo(() => {
    if (savingsData.length === 0) return { percent: 0, liters: 0, value: 0 };
    
    const totalMonthlySavingsLiters = savingsData.reduce((sum, data) => sum + data.monthlySavingsLiters, 0);
    const totalMonthlySavingsValue = savingsData.reduce((sum, data) => sum + data.monthlySavingsValue, 0);
    
    // Calcula a média de economia percentual
    const avgSavingsPercent = savingsData.reduce((sum, data) => sum + data.savingsPercent, 0) / savingsData.length;
    
    return {
      percent: avgSavingsPercent,
      liters: totalMonthlySavingsLiters,
      value: totalMonthlySavingsValue
    };
  }, [savingsData]);
  
  // Cores para os gráficos
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main
  ];
  
  return (
    <Box>
      {/* Cards de resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Economia com Adgreen
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <EcoIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4" color="success.main">
                  {totalSavings.percent.toFixed(1)}%
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Economia média de combustível com o uso de Adgreen
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold', color: 'success.main' }}>
                Reduz o consumo de diesel em até 20% por hora trabalhada
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Economia Mensal Estimada
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <OpacityIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4" color="primary.main">
                  {totalSavings.liters.toFixed(0)} L
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Litros economizados por mês (176h de operação)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Economia Financeira
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <MoneyIcon color="success" sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h4" color="success.main">
                  R$ {totalSavings.value.toFixed(2).replace('.', ',')}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Valor economizado por mês (R$ 6,50/L)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de consumo por hora */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Consumo de Diesel por Hora (L/h)
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              {consumptionChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      allowDuplicatedCategory={false}
                      type="category"
                    />
                    <YAxis 
                      label={{ value: 'Litros/Hora', angle: -90, position: 'insideLeft' }}
                    />
                    <RechartsTooltip />
                    <Legend />
                    {consumptionChartData.map((equipment, index) => (
                      <Line
                        key={equipment.equipmentId}
                        data={equipment.points}
                        type="monotone"
                        dataKey="litersPerHour"
                        name={equipment.equipmentModel}
                        stroke={COLORS[index % COLORS.length]}
                        activeDot={{ r: 8 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Dados insuficientes para gerar o gráfico de consumo.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Gráfico de comparação com e sem Adgreen */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Comparação de Consumo: Com vs. Sem Adgreen
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
              Comparação do consumo de diesel por hora trabalhada com e sem Adgreen
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              {comparisonChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Litros/Hora', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip 
                      formatter={(value, name, props) => {
                        return [`${value} L/h`, name];
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload;
                          return `${label}\n\nCom Adgreen:\n- ${data.periodsWithAdgreen} períodos\n- ${data.hoursWithAdgreen.toFixed(1)} horas\n- ${data.litersWithAdgreen.toFixed(1)} litros\n\nSem Adgreen:\n- ${data.periodsWithoutAdgreen} períodos\n- ${data.hoursWithoutAdgreen.toFixed(1)} horas\n- ${data.litersWithoutAdgreen.toFixed(1)} litros`;
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <Bar name="Com Adgreen" dataKey="withAdgreen" fill={theme.palette.success.main} />
                    <Bar name="Sem Adgreen" dataKey="withoutAdgreen" fill={theme.palette.error.main} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Dados insuficientes para gerar o gráfico de comparação.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Gráfico de economia percentual */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Economia Percentual com Adgreen por Equipamento
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
              Percentual de redução no consumo de diesel por hora trabalhada
            </Typography>
            <Box sx={{ height: 400, mt: 2 }}>
              {savingsData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonChartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Economia (%)', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip 
                      formatter={(value, name, props) => {
                        return [`${value}%`, 'Economia com Adgreen'];
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          const data = payload[0].payload;
                          const litrosPorHoraComAdgreen = data.withAdgreen;
                          const litrosPorHoraSemAdgreen = data.withoutAdgreen;
                          const economiaLitrosPorHora = litrosPorHoraSemAdgreen - litrosPorHoraComAdgreen;
                          
                          return `${label}\n\nConsumo médio:\n- Com Adgreen: ${litrosPorHoraComAdgreen.toFixed(2)} L/h\n- Sem Adgreen: ${litrosPorHoraSemAdgreen.toFixed(2)} L/h\n- Economia: ${economiaLitrosPorHora.toFixed(2)} L/h (${data.savings.toFixed(2)}%)\n\nEconomia mensal estimada:\n- ${(economiaLitrosPorHora * 176).toFixed(2)} litros\n- R$ ${(economiaLitrosPorHora * 176 * 6.5).toFixed(2)}`;
                        }
                        return label;
                      }}
                    />
                    <Legend />
                    <Bar name="Economia (%)" dataKey="savings" fill={theme.palette.primary.main}>
                      {comparisonChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <Typography variant="body2" color="text.secondary">
                    Dados insuficientes para gerar o gráfico de economia.
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
        
        {/* Tabela de economia detalhada */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Detalhamento da Economia por Equipamento
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
              O uso de Adgreen reduz o consumo de diesel em 16-20%, gerando economia financeira significativa
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Equipamento</TableCell>
                    <TableCell align="right">Consumo com Adgreen (L/h)</TableCell>
                    <TableCell align="right">Consumo sem Adgreen (L/h)</TableCell>
                    <TableCell align="right">Economia (%)</TableCell>
                    <TableCell align="right">Economia Mensal (L)</TableCell>
                    <TableCell align="right">Economia Mensal (R$)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {savingsData.length > 0 ? (
                    savingsData.map((data) => (
                      <TableRow key={data.equipmentId}>
                        <TableCell>{data.equipmentModel}</TableCell>
                        <TableCell align="right">{data.avgWithAdgreen.toFixed(2)}</TableCell>
                        <TableCell align="right">{data.avgWithoutAdgreen.toFixed(2)}</TableCell>
                        <TableCell align="right">{data.savingsPercent.toFixed(2)}%</TableCell>
                        <TableCell align="right">{data.monthlySavingsLiters.toFixed(2)}</TableCell>
                        <TableCell align="right">R$ {data.monthlySavingsValue.toFixed(2).replace('.', ',')}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <Typography variant="body2" sx={{ py: 2 }}>
                          Dados insuficientes para calcular a economia. É necessário ter registros de abastecimento com e sem o uso de Adgreen para o mesmo equipamento.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

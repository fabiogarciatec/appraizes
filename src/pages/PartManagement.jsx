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
  Chip,
  Autocomplete,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  Category as CategoryIcon,
  LocalOffer as LocalOfferIcon,
  Bookmark as BookmarkIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { 
  officialParts, 
  popularNames, 
  machineModels, 
  machineFamilies,
  partCategories 
} from '../data/mockData';

// Store para gerenciar o estado das peças
const usePartStore = () => {
  const [officialPartsList, setOfficialPartsList] = useState([]);
  const [popularNamesList, setPopularNamesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializa as peças a partir do localStorage ou dos dados mockados
  const initializeParts = () => {
    setIsLoading(true);
    try {
      // Carrega peças oficiais
      const storedOfficialParts = localStorage.getItem('appraizes_official_parts');
      if (storedOfficialParts) {
        setOfficialPartsList(JSON.parse(storedOfficialParts));
      } else {
        setOfficialPartsList(officialParts);
        localStorage.setItem('appraizes_official_parts', JSON.stringify(officialParts));
      }

      // Carrega nomes populares
      const storedPopularNames = localStorage.getItem('appraizes_popular_names');
      if (storedPopularNames) {
        setPopularNamesList(JSON.parse(storedPopularNames));
      } else {
        setPopularNamesList(popularNames);
        localStorage.setItem('appraizes_popular_names', JSON.stringify(popularNames));
      }
    } catch (err) {
      setError('Erro ao carregar peças: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Adiciona uma nova peça oficial
  const addOfficialPart = (part) => {
    const newPart = {
      ...part,
      id: officialPartsList.length > 0 ? Math.max(...officialPartsList.map(p => p.id)) + 1 : 1
    };
    const updatedParts = [...officialPartsList, newPart];
    setOfficialPartsList(updatedParts);
    localStorage.setItem('appraizes_official_parts', JSON.stringify(updatedParts));
    return newPart;
  };

  // Atualiza uma peça oficial existente
  const updateOfficialPart = (updatedPart) => {
    const updatedParts = officialPartsList.map(part => 
      part.id === updatedPart.id ? updatedPart : part
    );
    setOfficialPartsList(updatedParts);
    localStorage.setItem('appraizes_official_parts', JSON.stringify(updatedParts));
  };

  // Remove uma peça oficial
  const deleteOfficialPart = (partId) => {
    // Primeiro, remover todos os nomes populares associados a esta peça
    const updatedPopularNames = popularNamesList.filter(name => name.officialPartId !== partId);
    setPopularNamesList(updatedPopularNames);
    localStorage.setItem('appraizes_popular_names', JSON.stringify(updatedPopularNames));

    // Depois, remover a peça oficial
    const updatedParts = officialPartsList.filter(part => part.id !== partId);
    setOfficialPartsList(updatedParts);
    localStorage.setItem('appraizes_official_parts', JSON.stringify(updatedParts));
  };

  // Adiciona um novo nome popular
  const addPopularName = (popularName) => {
    const newName = {
      ...popularName,
      id: popularNamesList.length > 0 ? Math.max(...popularNamesList.map(n => n.id)) + 1 : 1
    };
    const updatedNames = [...popularNamesList, newName];
    setPopularNamesList(updatedNames);
    localStorage.setItem('appraizes_popular_names', JSON.stringify(updatedNames));
    return newName;
  };

  // Remove um nome popular
  const deletePopularName = (nameId) => {
    const updatedNames = popularNamesList.filter(name => name.id !== nameId);
    setPopularNamesList(updatedNames);
    localStorage.setItem('appraizes_popular_names', JSON.stringify(updatedNames));
  };

  return {
    officialPartsList,
    popularNamesList,
    isLoading,
    error,
    initializeParts,
    addOfficialPart,
    updateOfficialPart,
    deleteOfficialPart,
    addPopularName,
    deletePopularName
  };
};

// Componente principal de gerenciamento de peças
export default function PartManagement() {
  // Estado do store de peças
  const {
    officialPartsList,
    popularNamesList,
    isLoading,
    error,
    initializeParts,
    addOfficialPart,
    updateOfficialPart,
    deleteOfficialPart,
    addPopularName,
    deletePopularName
  } = usePartStore();

  // Estados locais para controlar a interface
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' ou 'edit'
  const [selectedPart, setSelectedPart] = useState(null);
  const [formData, setFormData] = useState({
    officialName: '',
    manufacturerRef: '',
    categoryId: '',
    description: '',
    compatibleMachines: []
  });
  const [popularNameInput, setPopularNameInput] = useState('');
  const [selectedOfficialPartId, setSelectedOfficialPartId] = useState(null);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [partToDelete, setPartToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Inicializa as peças ao montar o componente
  useEffect(() => {
    initializeParts();
  }, []);

  // Manipuladores de eventos
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      officialName: '',
      manufacturerRef: '',
      categoryId: '',
      description: '',
      compatibleMachines: []
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (part) => {
    setDialogMode('edit');
    setFormData({
      ...part
    });
    setSelectedPart(part);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPart(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Conversão para número quando apropriado
    const parsedValue = name === 'categoryId' ? parseInt(value, 10) || '' : value;
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });
  };

  const handleCompatibleMachineChange = (newMachines) => {
    setFormData({
      ...formData,
      compatibleMachines: newMachines
    });
  };

  const handleAddMachineCompatibility = () => {
    const newCompatibility = {
      modelId: '',
      startYear: new Date().getFullYear() - 5,
      endYear: new Date().getFullYear(),
      startChassis: '',
      endChassis: ''
    };
    
    setFormData({
      ...formData,
      compatibleMachines: [...formData.compatibleMachines, newCompatibility]
    });
  };

  const handleRemoveMachineCompatibility = (index) => {
    const updatedMachines = [...formData.compatibleMachines];
    updatedMachines.splice(index, 1);
    
    setFormData({
      ...formData,
      compatibleMachines: updatedMachines
    });
  };

  const handleMachineCompatibilityChange = (index, field, value) => {
    const updatedMachines = [...formData.compatibleMachines];
    
    // Conversão para número quando apropriado
    const parsedValue = ['modelId', 'startYear', 'endYear'].includes(field) 
      ? parseInt(value, 10) || '' 
      : value;
    
    updatedMachines[index][field] = parsedValue;
    
    setFormData({
      ...formData,
      compatibleMachines: updatedMachines
    });
  };

  const handleSubmit = () => {
    try {
      // Validação básica
      if (!formData.officialName || !formData.manufacturerRef || !formData.categoryId) {
        throw new Error('Os campos Nome do Fabricante, Referência e Categoria são obrigatórios');
      }

      if (dialogMode === 'add') {
        // Adiciona a nova peça
        addOfficialPart(formData);
        setSnackbar({
          open: true,
          message: 'Peça adicionada com sucesso!',
          severity: 'success'
        });
      } else {
        // Atualiza a peça existente
        const updatedPart = {
          ...selectedPart,
          ...formData
        };
        updateOfficialPart(updatedPart);
        setSnackbar({
          open: true,
          message: 'Peça atualizada com sucesso!',
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

  const handleOpenDeleteDialog = (part) => {
    setPartToDelete(part);
    setConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog(false);
    setPartToDelete(null);
  };

  const handleConfirmDelete = () => {
    try {
      if (!partToDelete) return;
      
      deleteOfficialPart(partToDelete.id);
      setSnackbar({
        open: true,
        message: 'Peça excluída com sucesso!',
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

  const handleAddPopularName = () => {
    try {
      if (!popularNameInput.trim() || !selectedOfficialPartId) {
        throw new Error('Nome popular e peça oficial são obrigatórios');
      }

      // Verifica se já existe um nome popular igual para a mesma peça
      const exists = popularNamesList.some(
        name => name.popularName.toLowerCase() === popularNameInput.toLowerCase() && 
               name.officialPartId === selectedOfficialPartId
      );

      if (exists) {
        throw new Error('Este nome popular já existe para esta peça');
      }

      addPopularName({
        popularName: popularNameInput,
        officialPartId: selectedOfficialPartId
      });

      setPopularNameInput('');
      setSelectedOfficialPartId(null);

      setSnackbar({
        open: true,
        message: 'Nome popular adicionado com sucesso!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleDeletePopularName = (nameId) => {
    try {
      deletePopularName(nameId);
      setSnackbar({
        open: true,
        message: 'Nome popular removido com sucesso!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Funções auxiliares para obter informações relacionadas
  const getCategoryName = (categoryId) => {
    const category = partCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Não especificada';
  };

  const getModelName = (modelId) => {
    const model = machineModels.find(model => model.id === modelId);
    return model ? model.name : 'Não especificado';
  };

  const getPopularNamesForPart = (partId) => {
    return popularNamesList.filter(name => name.officialPartId === partId);
  };

  // Renderização condicional durante o carregamento
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando peças...</Typography>
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

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          Cadastro de Peças
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Nova Peça
        </Button>
      </Box>

      {/* Seção de Peças Oficiais */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Peças Cadastradas
      </Typography>
      <Paper sx={{ width: '100%', overflow: 'hidden', mb: 4 }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Nome do Fabricante</TableCell>
                <TableCell>Referência</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Nomes Populares</TableCell>
                <TableCell>Aplicações</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {officialPartsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      Nenhuma peça cadastrada
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                officialPartsList.map((part) => {
                  const popularNamesForPart = getPopularNamesForPart(part.id);
                  
                  return (
                    <TableRow key={part.id} hover>
                      <TableCell>{part.officialName}</TableCell>
                      <TableCell>{part.manufacturerRef}</TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={getCategoryName(part.categoryId)}
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{part.description}</TableCell>
                      <TableCell>
                        {popularNamesForPart.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {popularNamesForPart.map(name => (
                              <Chip
                                key={name.id}
                                size="small"
                                label={name.popularName}
                                onDelete={() => handleDeletePopularName(name.id)}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Nenhum nome popular
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {part.compatibleMachines && part.compatibleMachines.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {part.compatibleMachines.map((machine, index) => (
                              <Chip
                                key={index}
                                size="small"
                                label={`${getModelName(machine.modelId)} (${machine.startYear}-${machine.endYear})`}
                                color="secondary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sem aplicações definidas
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar peça">
                          <IconButton 
                            color="primary" 
                            onClick={() => handleOpenEditDialog(part)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir peça">
                          <IconButton 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(part)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Seção para adicionar nomes populares */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Adicionar Nome Popular
      </Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              label="Nome Popular"
              value={popularNameInput}
              onChange={(e) => setPopularNameInput(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <LocalOfferIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth>
              <InputLabel id="official-part-label">Peça Oficial</InputLabel>
              <Select
                labelId="official-part-label"
                value={selectedOfficialPartId || ''}
                onChange={(e) => setSelectedOfficialPartId(e.target.value)}
                label="Peça Oficial"
                startAdornment={<BuildIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {officialPartsList.map((part) => (
                  <MenuItem key={part.id} value={part.id}>
                    {part.officialName} ({part.manufacturerRef})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddPopularName}
              startIcon={<AddIcon />}
            >
              Adicionar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialog para adicionar/editar peça */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Adicionar Nova Peça' : 'Editar Peça'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="officialName"
              label="Nome do Fabricante"
              value={formData.officialName}
              onChange={handleInputChange}
              fullWidth
              required
              InputProps={{
                startAdornment: <BuildIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <TextField
              name="manufacturerRef"
              label="Referência"
              value={formData.manufacturerRef}
              onChange={handleInputChange}
              fullWidth
              required
              InputProps={{
                startAdornment: <BookmarkIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            
            <FormControl fullWidth required>
              <InputLabel id="category-label">Categoria</InputLabel>
              <Select
                labelId="category-label"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                label="Categoria"
                startAdornment={<CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {partCategories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              name="description"
              label="Descrição"
              value={formData.description}
              onChange={handleInputChange}
              fullWidth
              multiline
              rows={2}
            />
            
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Aplicações
            </Typography>
            
            {formData.compatibleMachines && formData.compatibleMachines.map((machine, index) => (
              <Box key={index} sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2">Aplicação {index + 1}</Typography>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleRemoveMachineCompatibility(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Modelo</InputLabel>
                      <Select
                        value={machine.modelId || ''}
                        onChange={(e) => handleMachineCompatibilityChange(index, 'modelId', e.target.value)}
                        label="Modelo"
                      >
                        {machineModels.map((model) => (
                          <MenuItem key={model.id} value={model.id}>
                            {model.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      label="Ano Início"
                      type="number"
                      value={machine.startYear || ''}
                      onChange={(e) => handleMachineCompatibilityChange(index, 'startYear', e.target.value)}
                      fullWidth
                      InputProps={{
                        inputProps: { min: 1900, max: new Date().getFullYear() }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      label="Ano Fim"
                      type="number"
                      value={machine.endYear || ''}
                      onChange={(e) => handleMachineCompatibilityChange(index, 'endYear', e.target.value)}
                      fullWidth
                      InputProps={{
                        inputProps: { min: 1900, max: new Date().getFullYear() + 5 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Chassi Início"
                      value={machine.startChassis || ''}
                      onChange={(e) => handleMachineCompatibilityChange(index, 'startChassis', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Chassi Fim"
                      value={machine.endChassis || ''}
                      onChange={(e) => handleMachineCompatibilityChange(index, 'endChassis', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddMachineCompatibility}
              sx={{ mt: 1 }}
            >
              Adicionar Aplicação
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação para excluir peça */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir a peça "{partToDelete?.officialName}" 
            ({partToDelete?.manufacturerRef})?
            Esta ação não pode ser desfeita e também removerá todos os nomes populares associados a esta peça.
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

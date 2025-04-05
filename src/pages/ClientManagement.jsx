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
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { clients as mockClients } from '../data/mockData';

// Store para gerenciar o estado dos clientes
const useClientStore = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Inicializa os clientes a partir do localStorage ou dos dados mockados
  const initializeClients = () => {
    setIsLoading(true);
    try {
      const storedClients = localStorage.getItem('appraizes_clients');
      if (storedClients) {
        setClients(JSON.parse(storedClients));
      } else {
        // Se não houver clientes no localStorage, usa os mockados
        setClients(mockClients);
        localStorage.setItem('appraizes_clients', JSON.stringify(mockClients));
      }
    } catch (err) {
      setError('Erro ao carregar clientes: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Adiciona um novo cliente
  const addClient = (client) => {
    const newClient = {
      ...client,
      id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1
    };
    const updatedClients = [...clients, newClient];
    setClients(updatedClients);
    localStorage.setItem('appraizes_clients', JSON.stringify(updatedClients));
    return newClient;
  };

  // Atualiza um cliente existente
  const updateClient = (updatedClient) => {
    const updatedClients = clients.map(client => 
      client.id === updatedClient.id ? updatedClient : client
    );
    setClients(updatedClients);
    localStorage.setItem('appraizes_clients', JSON.stringify(updatedClients));
  };

  // Remove um cliente
  const deleteClient = (clientId) => {
    const updatedClients = clients.filter(client => client.id !== clientId);
    setClients(updatedClients);
    localStorage.setItem('appraizes_clients', JSON.stringify(updatedClients));
  };

  return {
    clients,
    isLoading,
    error,
    initializeClients,
    addClient,
    updateClient,
    deleteClient
  };
};

// Componente principal de gerenciamento de clientes
export default function ClientManagement() {
  // Estado do store de clientes
  const {
    clients,
    isLoading,
    error,
    initializeClients,
    addClient,
    updateClient,
    deleteClient
  } = useClientStore();

  // Estados locais para controlar a interface
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' ou 'edit'
  const [selectedClient, setSelectedClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: ''
  });
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Inicializa os clientes ao montar o componente
  useEffect(() => {
    initializeClients();
  }, []);

  // Manipuladores de eventos
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      name: '',
      contact: '',
      phone: '',
      email: ''
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (client) => {
    setDialogMode('edit');
    setFormData({
      ...client
    });
    setSelectedClient(client);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClient(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = () => {
    try {
      // Validação básica
      if (!formData.name) {
        throw new Error('O nome da empresa é obrigatório');
      }

      if (dialogMode === 'add') {
        // Adiciona o novo cliente
        addClient(formData);
        setSnackbar({
          open: true,
          message: 'Cliente adicionado com sucesso!',
          severity: 'success'
        });
      } else {
        // Atualiza o cliente existente
        const updatedClient = {
          ...selectedClient,
          ...formData
        };
        updateClient(updatedClient);
        setSnackbar({
          open: true,
          message: 'Cliente atualizado com sucesso!',
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

  const handleOpenDeleteDialog = (client) => {
    setClientToDelete(client);
    setConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog(false);
    setClientToDelete(null);
  };

  const handleConfirmDelete = () => {
    try {
      if (!clientToDelete) return;
      
      deleteClient(clientToDelete.id);
      setSnackbar({
        open: true,
        message: 'Cliente excluído com sucesso!',
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

  // Renderização condicional durante o carregamento
  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Carregando clientes...</Typography>
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
          Cadastro de Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          Novo Cliente
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Empresa</TableCell>
                <TableCell>Contato</TableCell>
                <TableCell>Telefone</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body1" sx={{ py: 2 }}>
                      Nenhum cliente cadastrado
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                clients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>{client.id}</TableCell>
                    <TableCell>{client.name}</TableCell>
                    <TableCell>{client.contact}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar cliente">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleOpenEditDialog(client)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir cliente">
                        <IconButton 
                          color="error" 
                          onClick={() => handleOpenDeleteDialog(client)}
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

      {/* Dialog para adicionar/editar cliente */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Adicionar Novo Cliente' : 'Editar Cliente'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="name"
              label="Nome da Empresa"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
              InputProps={{
                startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <TextField
              name="contact"
              label="Nome do Contato"
              value={formData.contact}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <TextField
              name="phone"
              label="Telefone"
              value={formData.phone}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <TextField
              name="email"
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              InputProps={{
                startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">
            {dialogMode === 'add' ? 'Adicionar' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmação para excluir cliente */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o cliente "{clientToDelete?.name}"?
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

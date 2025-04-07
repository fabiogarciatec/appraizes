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
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useDatabase } from '../context/DatabaseContext';
import ApiService from '../services/ApiService';

// Store para gerenciar o estado dos usuários
const useUserStore = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { users: dbUserService } = useDatabase();

  // Inicializa os usuários a partir da API
  const initializeUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedUsers = await ApiService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError('Erro ao carregar usuários: ' + (err.message || 'Erro desconhecido'));
      // Fallback para dados locais se a API falhar
      const storedUsers = localStorage.getItem('appraizes_users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Força uma atualização dos dados
  const refreshUsers = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Efeito para buscar os usuários quando o componente montar ou quando refreshTrigger mudar
  useEffect(() => {
    initializeUsers();
  }, [refreshTrigger]);

  // Adiciona um novo usuário
  const addUser = async (user) => {
    try {
      setIsLoading(true);
      // Chama a API para criar o usuário
      const newUser = await ApiService.createUser(user);
      // Atualiza a lista local
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      console.error('Erro ao adicionar usuário:', err);
      setError('Erro ao adicionar usuário: ' + (err.message || 'Erro desconhecido'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualiza um usuário existente
  const updateUser = async (updatedUser) => {
    try {
      setIsLoading(true);
      // Chama a API para atualizar o usuário
      await ApiService.updateUser(updatedUser.id, updatedUser);
      // Atualiza a lista local
      setUsers(prev => prev.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      ));
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      setError('Erro ao atualizar usuário: ' + (err.message || 'Erro desconhecido'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Remove um usuário
  const deleteUser = async (userId) => {
    try {
      setIsLoading(true);
      // Chama a API para excluir o usuário
      await ApiService.deleteUser(userId);
      // Atualiza a lista local
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      setError('Erro ao excluir usuário: ' + (err.message || 'Erro desconhecido'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    error,
    initializeUsers,
    refreshUsers,
    addUser,
    updateUser,
    deleteUser
  };
};

// Componente principal de gerenciamento de usuários
export default function UserManagement() {
  // Estado do store de usuários
  const {
    users,
    isLoading,
    error,
    initializeUsers,
    refreshUsers,
    addUser,
    updateUser,
    deleteUser
  } = useUserStore();

  // Estados locais para controlar a interface
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' ou 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'consultor'
  });
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Manipuladores de eventos
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'consultor'
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user) => {
    setDialogMode('edit');
    // Omite a senha por segurança
    const { password, ...userWithoutPassword } = user;
    setFormData({
      ...userWithoutPassword,
      password: '' // Senha em branco para edição
    });
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      // Validação básica
      if (!formData.username || !formData.name || !formData.email || 
          (dialogMode === 'add' && !formData.password)) {
        throw new Error('Todos os campos são obrigatórios, exceto a senha ao editar');
      }

      if (dialogMode === 'add') {
        // Verifica se o username já existe
        if (users.some(user => user.username === formData.username)) {
          throw new Error('Nome de usuário já existe');
        }
        
        // Adiciona o novo usuário
        await addUser(formData);
        setSnackbar({
          open: true,
          message: 'Usuário adicionado com sucesso!',
          severity: 'success'
        });
      } else {
        // Verifica se o username já existe (exceto o próprio usuário)
        if (users.some(user => 
          user.username === formData.username && user.id !== formData.id
        )) {
          throw new Error('Nome de usuário já existe');
        }
        
        // Atualiza o usuário existente
        const updatedUser = {
          ...selectedUser,
          ...formData,
          // Mantém a senha antiga se não for fornecida uma nova
          password: formData.password ? formData.password : selectedUser.password
        };
        await updateUser(updatedUser);
        setSnackbar({
          open: true,
          message: 'Usuário atualizado com sucesso!',
          severity: 'success'
        });
      }
      
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Ocorreu um erro ao processar a solicitação',
        severity: 'error'
      });
    }
  };

  const handleOpenDeleteDialog = (user) => {
    setUserToDelete(user);
    setConfirmDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog(false);
    setUserToDelete(null);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!userToDelete) return;
      
      // Impede a exclusão do próprio usuário admin (id 1)
      if (userToDelete.id === 1 && userToDelete.role === 'admin') {
        throw new Error('Não é possível excluir o usuário administrador principal');
      }
      
      await deleteUser(userToDelete.id);
      setSnackbar({
        open: true,
        message: 'Usuário excluído com sucesso!',
        severity: 'success'
      });
      
      handleCloseDeleteDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Ocorreu um erro ao excluir o usuário',
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
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Carregando usuários...</Typography>
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
          Gerenciamento de Usuários
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshUsers}
            sx={{ mr: 1 }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Novo Usuário
          </Button>
        </Box>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Usuário</TableCell>
                <TableCell>E-mail</TableCell>
                <TableCell>Função</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={<PersonIcon />} 
                        label={user.role === 'admin' ? 'Administrador' : 'Consultor'} 
                        color={user.role === 'admin' ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton 
                        color="primary" 
                        onClick={() => handleOpenEditDialog(user)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleOpenDeleteDialog(user)}
                        size="small"
                        disabled={user.id === 1 && user.role === 'admin'} // Desabilita o botão para o admin principal
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Dialog para adicionar/editar usuário */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Adicionar Novo Usuário' : 'Editar Usuário'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              name="name"
              label="Nome Completo"
              value={formData.name}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="username"
              label="Nome de Usuário"
              value={formData.username}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="email"
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              name="password"
              label={dialogMode === 'add' ? 'Senha' : 'Nova Senha (deixe em branco para manter a atual)'}
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
              required={dialogMode === 'add'}
            />
            <FormControl fullWidth>
              <InputLabel id="role-label">Função</InputLabel>
              <Select
                labelId="role-label"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                label="Função"
              >
                <MenuItem value="consultor">Consultor</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
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

      {/* Dialog de confirmação para excluir usuário */}
      <Dialog
        open={confirmDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o usuário "{userToDelete?.name}"?
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

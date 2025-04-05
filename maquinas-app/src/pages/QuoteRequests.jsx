import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  TablePagination,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import { quoteRequests, clients } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function QuoteRequests() {
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Filtrar solicitações do consultor atual se não for admin
    let filtered = currentUser.role === 'admin'
      ? [...quoteRequests]
      : quoteRequests.filter(req => req.consultantId === currentUser.id);

    // Aplicar filtro de pesquisa
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.popularPartName.toLowerCase().includes(term) ||
        req.machineInfo.model.toLowerCase().includes(term) ||
        req.machineInfo.chassis.toLowerCase().includes(term) ||
        getClientName(req.clientId).toLowerCase().includes(term)
      );
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredRequests(filtered);
  }, [searchTerm, currentUser]);

  // Função para obter o nome do cliente pelo ID
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  // Função para obter a cor do chip de status
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'identified': return 'info';
      case 'quoted': return 'success';
      case 'completed': return 'secondary';
      default: return 'default';
    }
  };

  // Função para obter o texto do status
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'identified': return 'Identificada';
      case 'quoted': return 'Orçada';
      case 'completed': return 'Concluída';
      default: return 'Desconhecido';
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Solicitações de Orçamento
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/solicitacoes/nova')}
        >
          Nova Solicitação
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por peça, cliente, máquina..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de solicitações">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Peça Solicitada</TableCell>
              <TableCell>Máquina</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRequests
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>{getClientName(request.clientId)}</TableCell>
                  <TableCell>{request.popularPartName}</TableCell>
                  <TableCell>
                    {`${request.machineInfo.model} (${request.machineInfo.chassis})`}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(request.status)} 
                      color={getStatusColor(request.status)} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      {request.status === 'pending' && (
                        <Tooltip title="Identificar Peça">
                          <IconButton 
                            color="primary"
                            onClick={() => navigate(`/solicitacoes/${request.id}/identificar`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Visualizar Detalhes">
                        <IconButton color="info">
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      {request.status === 'identified' && (
                        <Tooltip title="Gerar Orçamento">
                          <IconButton color="success">
                            <LocalShippingIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma solicitação encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredRequests.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>
    </Box>
  );
}

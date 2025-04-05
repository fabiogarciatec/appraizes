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
  Tooltip,
  Divider,
  alpha,
  useTheme
} from '@mui/material';
import { 
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  LocalShipping as LocalShippingIcon,
  FilterList as FilterListIcon
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
  const theme = useTheme();

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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: '100%', mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h5" component="h1" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Solicitações de Orçamento
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => navigate('/solicitacoes/nova')}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              }
            }}
          >
            Nova Solicitação
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar por peça, cliente, máquina..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                height: '56px',
                '& fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.2),
                },
                '&:hover fieldset': {
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Filtros avançados">
                    <IconButton>
                      <FilterListIcon color="action" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <TableContainer component={Paper} sx={{ 
          borderRadius: 2, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
          overflow: 'hidden',
          '& .MuiTableCell-head': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.text.secondary,
            fontWeight: 600,
            fontSize: '0.875rem',
          },
          '& .MuiTableRow-root': {
            '&:nth-of-type(even)': {
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
            },
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
            }
          }
        }}>
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
                  <TableCell sx={{ py: 2 }}>{request.id}</TableCell>
                  <TableCell sx={{ py: 2 }}>{request.date}</TableCell>
                  <TableCell sx={{ py: 2, fontWeight: 500 }}>{getClientName(request.clientId)}</TableCell>
                  <TableCell sx={{ py: 2 }}>{request.popularPartName}</TableCell>
                  <TableCell sx={{ py: 2 }}>
                    {`${request.machineInfo.model} (${request.machineInfo.chassis})`}
                  </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Chip 
                      label={getStatusText(request.status)} 
                      color={getStatusColor(request.status)} 
                      size="small"
                      sx={{ 
                        fontWeight: 500,
                        borderRadius: '6px',
                        px: 1
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      {request.status === 'pending' && (
                        <Tooltip title="Identificar Peça" arrow>
                          <IconButton 
                            color="primary"
                            onClick={() => navigate(`/solicitacoes/${request.id}/identificar`)}
                            size="small"
                            sx={{ 
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Visualizar Detalhes" arrow>
                        <IconButton 
                          color="info"
                          size="small"
                          sx={{ 
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.info.main, 0.2),
                            }
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {request.status === 'identified' && (
                        <Tooltip title="Gerar Orçamento" arrow>
                          <IconButton 
                            color="success"
                            size="small"
                            sx={{ 
                              backgroundColor: alpha(theme.palette.success.main, 0.1),
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.success.main, 0.2),
                              }
                            }}
                          >
                            <LocalShippingIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhuma solicitação encontrada
                  </Typography>
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
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
              fontSize: '0.875rem',
            }
          }}
        />
      </TableContainer>
      </Paper>
    </Box>
  );
}

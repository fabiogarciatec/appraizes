import { useState, useEffect } from 'react';
import StyledCard from '../components/ui/StyledCard';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Divider,
  Button
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { quoteRequests, clients, officialParts } from '../data/mockData';

export default function ClientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [clientRequests, setClientRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    // Buscar o cliente pelo ID
    const foundClient = clients.find(c => c.id === parseInt(id));
    if (foundClient) {
      setClient(foundClient);
      
      // Buscar solicitações deste cliente
      const requests = quoteRequests.filter(req => req.clientId === parseInt(id));
      // Ordenar por data (mais recente primeiro)
      requests.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setClientRequests(requests);
    } else {
      // Redirecionar se o cliente não for encontrado
      navigate('/solicitacoes');
    }
  }, [id, navigate]);

  // Função para obter o nome oficial da peça pelo ID
  const getOfficialPartName = (partId) => {
    if (!partId) return 'Não identificada';
    const part = officialParts.find(p => p.id === partId);
    return part ? part.officialName : 'Peça não encontrada';
  };

  // Função para obter a referência do fabricante pelo ID da peça
  const getManufacturerRef = (partId) => {
    if (!partId) return 'N/A';
    const part = officialParts.find(p => p.id === partId);
    return part ? part.manufacturerRef : 'N/A';
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

  // Manipuladores de eventos
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!client) {
    return (
      <Box>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/solicitacoes')}
          sx={{ mr: 2 }}
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1">
          Histórico do Cliente
        </Typography>
      </Box>
      
      <StyledCard
        title="Informações do Cliente"
        color="primary"
      >
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Nome:</strong> {client.name}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Telefone:</strong> {client.phone}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Email:</strong> {client.email}
          </Typography>
          <Typography variant="body1">
            <strong>Endereço:</strong> {client.address}
          </Typography>
        </Box>
      </StyledCard>
      
      <StyledCard
        title="Resumo de Solicitações"
        color="secondary"
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'background.default', borderRadius: 1, flexGrow: 1 }}>
            <Typography variant="h4">{clientRequests.length}</Typography>
            <Typography variant="body2">Total</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'warning.light', borderRadius: 1, flexGrow: 1 }}>
            <Typography variant="h4">
              {clientRequests.filter(req => req.status === 'pending').length}
            </Typography>
            <Typography variant="body2">Pendentes</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', p: 1, bgcolor: 'success.light', borderRadius: 1, flexGrow: 1 }}>
            <Typography variant="h4">
              {clientRequests.filter(req => req.status === 'completed').length}
            </Typography>
            <Typography variant="body2">Concluídas</Typography>
          </Box>
        </Box>
      </StyledCard>
      
      <Typography variant="h6" gutterBottom>
        Solicitações do Cliente
      </Typography>
      
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="tabela de solicitações do cliente">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Nome Popular</TableCell>
              <TableCell>Peça Identificada</TableCell>
              <TableCell>Referência</TableCell>
              <TableCell>Máquina</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clientRequests
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>{request.popularPartName}</TableCell>
                  <TableCell>{getOfficialPartName(request.identifiedPartId)}</TableCell>
                  <TableCell>{getManufacturerRef(request.identifiedPartId)}</TableCell>
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
                    <Tooltip title="Visualizar Detalhes">
                      <IconButton 
                        color="primary"
                        onClick={() => navigate(`/solicitacoes/${request.id}`)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            {clientRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Nenhuma solicitação encontrada para este cliente
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={clientRequests.length}
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

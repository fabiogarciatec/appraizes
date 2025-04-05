import { useState, useEffect } from 'react';
import StyledCard from '../components/ui/StyledCard';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  InputAdornment,
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
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import { 
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { 
  popularNames, 
  officialParts, 
  partCategories,
  machineModels
} from '../data/mockData';

// Componente para exibir os detalhes de uma peça
const PartDetails = ({ part }) => {
  if (!part) return null;

  // Função para obter o nome da categoria pelo ID
  const getCategoryName = (categoryId) => {
    const category = partCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  };

  // Função para obter o nome do modelo pelo ID
  const getModelName = (modelId) => {
    const model = machineModels.find(m => m.id === modelId);
    return model ? model.name : 'Modelo não encontrado';
  };

  // Obter nomes populares para esta peça
  const getPopularNames = (partId) => {
    return popularNames.filter(name => name.partId === partId);
  };

  const partPopularNames = getPopularNames(part.id);

  return (
    <Dialog
      open={!!part}
      onClose={() => null}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        Detalhes da Peça
        <IconButton
          aria-label="close"
          onClick={() => null}
          sx={{ position: 'absolute', right: 8, top: 8, color: 'white' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <StyledCard
              title="Informações Básicas"
              color="primary"
            >
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Nome Oficial:</strong> {part.officialName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Referência do Fabricante:</strong> {part.manufacturerRef}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Categoria:</strong> {getCategoryName(part.categoryId)}
              </Typography>
              <Typography variant="body1">
                <strong>Descrição:</strong> {part.description}
              </Typography>
            </StyledCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <StyledCard
              title="Nomes Populares"
              color="info"
            >
              <List dense sx={{ mt: 1 }}>
                {partPopularNames.map((name, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Label fontSize="small" sx={{ color: 'info.main' }} />
                    </ListItemIcon>
                    <ListItemText 
                      primary={name.popularName} 
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </StyledCard>
          </Grid>
          
          <Grid item xs={12}>
            <StyledCard
              title="Compatibilidade"
              color="success"
            >
              <TableContainer sx={{ mt: 1 }}>
                <Table size="small" sx={{ 
                  '& .MuiTableHead-root': { 
                    bgcolor: 'background.default' 
                  },
                  '& .MuiTableCell-head': { 
                    fontWeight: 600 
                  }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Modelo</TableCell>
                      <TableCell>Anos</TableCell>
                      <TableCell>Chassis</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {part.compatibleMachines.map((compat, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{getModelName(compat.modelId)}</TableCell>
                        <TableCell>{compat.startYear} - {compat.endYear}</TableCell>
                        <TableCell>{compat.startChassis} - {compat.endChassis}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </StyledCard>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button 
          variant="contained"
          sx={{ 
            fontWeight: 500,
            borderRadius: 2,
            px: 3
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default function PartDictionary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tabValue, setTabValue] = useState(0);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedPart, setSelectedPart] = useState(null);

  // Efeito para filtrar itens com base na aba selecionada e termo de pesquisa
  useEffect(() => {
    let items = [];
    
    if (tabValue === 0) {
      // Aba de Nomes Populares
      items = popularNames.map(name => {
        const officialPart = officialParts.find(part => part.id === name.partId);
        return {
          id: name.id,
          popularName: name.popularName,
          officialName: officialPart ? officialPart.officialName : 'Peça não encontrada',
          manufacturerRef: officialPart ? officialPart.manufacturerRef : 'N/A',
          partId: name.partId
        };
      });
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        items = items.filter(item => 
          item.popularName.toLowerCase().includes(term) ||
          item.officialName.toLowerCase().includes(term) ||
          item.manufacturerRef.toLowerCase().includes(term)
        );
      }
    } else {
      // Aba de Peças Oficiais
      items = [...officialParts];
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        items = items.filter(item => 
          item.officialName.toLowerCase().includes(term) ||
          item.manufacturerRef.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
        );
      }
    }
    
    setFilteredItems(items);
    setPage(0); // Resetar para a primeira página ao filtrar
  }, [searchTerm, tabValue]);

  // Função para obter o nome da categoria pelo ID
  const getCategoryName = (categoryId) => {
    const category = partCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  };

  // Manipuladores de eventos
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewPart = (partId) => {
    const part = officialParts.find(p => p.id === partId);
    setSelectedPart(part);
  };

  // Renderizar tabela com base na aba selecionada
  const renderTable = () => {
    if (tabValue === 0) {
      // Tabela de Nomes Populares
      return (
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="tabela de nomes populares">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome Popular</TableCell>
                <TableCell>Nome Oficial</TableCell>
                <TableCell>Referência do Fabricante</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.popularName}</TableCell>
                    <TableCell>{item.officialName}</TableCell>
                    <TableCell>{item.manufacturerRef}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver Detalhes da Peça">
                        <IconButton 
                          color="primary"
                          onClick={() => handleViewPart(item.partId)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Nenhum resultado encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      );
    } else {
      // Tabela de Peças Oficiais
      return (
        <Grid container spacing={2} sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {filteredItems
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((item) => {
              const partPopularNames = popularNames
                .filter(name => name.partId === item.id)
                .map(name => name.popularName);
                
              return (
                <Grid item xs={12} sm={6} md={4} key={item.id} sx={{ display: 'flex' }}>
                  <StyledCard
                    title={item.officialName}
                    color="primary"
                    sx={{ 
                      width: '100%',
                      height: '100%',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleViewPart(item.id)}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Ref: {item.manufacturerRef}
                      </Typography>
                      <Chip 
                        label={getCategoryName(item.categoryId)} 
                        size="small" 
                        color="primary" 
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                    
                    <Divider sx={{ my: 1.5 }} />
                    
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'info.main' }}>
                      Nomes Populares:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                      {partPopularNames.length > 0 ? (
                        partPopularNames.map((name, idx) => (
                          <Chip 
                            key={idx} 
                            label={name} 
                            size="small" 
                            color="info"
                            variant="outlined"
                            sx={{ mb: 0.5, borderRadius: 1.5, fontWeight: 500 }}
                          />
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Nenhum nome popular registrado
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<VisibilityIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPart(item.id);
                        }}
                        fullWidth
                        sx={{ 
                          mt: 1,
                          borderRadius: 2,
                          py: 1.2,
                          fontWeight: 500
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    </Box>
                  </StyledCard>
                </Grid>
              );
            })}
          {filteredItems.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" align="center">
                Nenhum resultado encontrado
              </Typography>
            </Grid>
          )}
        </Grid>
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dicionário de Peças
      </Typography>
      
      <Paper sx={{ mb: 3, p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nome, referência, descrição..."
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
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Nomes Populares" />
          <Tab label="Peças Oficiais" />
        </Tabs>
        
        <Divider />
        
        {renderTable()}
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredItems.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Linhas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>
      
      {selectedPart && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Detalhes da Peça
          </Typography>
          <PartDetails part={selectedPart} />
        </Box>
      )}
    </Box>
  );
}

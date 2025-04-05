import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StyledCard from '../components/ui/StyledCard';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Autocomplete,
  Chip
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { 
  quoteRequests, 
  clients, 
  officialParts, 
  partCategories, 
  machineModels,
  machineFamilies
} from '../data/mockData';

// Passos do processo de identificação
const steps = ['Informações da Solicitação', 'Identificar Peça', 'Confirmar Compatibilidade'];

export default function IdentifyPart() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [quoteRequest, setQuoteRequest] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    // Buscar a solicitação pelo ID
    const request = quoteRequests.find(req => req.id === parseInt(id));
    if (request) {
      setQuoteRequest(request);
    } else {
      // Redirecionar se a solicitação não for encontrada
      navigate('/solicitacoes');
    }
  }, [id, navigate]);

  // Função para buscar peças oficiais
  const searchOfficialParts = (term) => {
    if (!term) {
      setSearchResults([]);
      return;
    }
    
    const results = officialParts.filter(part => 
      part.officialName.toLowerCase().includes(term.toLowerCase()) ||
      part.manufacturerRef.toLowerCase().includes(term.toLowerCase()) ||
      part.description.toLowerCase().includes(term.toLowerCase())
    );
    
    setSearchResults(results);
  };

  // Função para obter o nome da categoria pelo ID
  const getCategoryName = (categoryId) => {
    const category = partCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Categoria não encontrada';
  };

  // Função para obter o nome do cliente pelo ID
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  // Função para obter o nome da família pelo ID
  const getFamilyName = (familyId) => {
    const family = machineFamilies.find(f => f.id === parseInt(familyId));
    return family ? family.name : 'Família não encontrada';
  };

  // Função para obter o nome do modelo pelo ID
  const getModelName = (modelId) => {
    const model = machineModels.find(m => m.id === parseInt(modelId));
    return model ? model.name : 'Modelo não encontrado';
  };

  // Validação para o formulário de identificação
  const validationSchema = Yup.object({
    officialPartId: Yup.number().required('Peça oficial é obrigatória'),
    notes: Yup.string()
  });
  
  // Configuração do Formik
  const formik = useFormik({
    initialValues: {
      officialPartId: '',
      notes: ''
    },
    validationSchema,
    onSubmit: (values) => {
      // Em uma aplicação real, aqui faríamos uma chamada à API
      console.log('Formulário enviado:', values);
      
      // Simulando o envio bem-sucedido
      setOpenSnackbar(true);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/solicitacoes');
      }, 2000);
    }
  });

  // Manipuladores para os passos
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePartSelect = (part) => {
    setSelectedPart(part);
    formik.setFieldValue('officialPartId', part.id);
  };

  // Verificar compatibilidade da peça com a máquina
  const isCompatible = () => {
    if (!selectedPart || !quoteRequest) return false;
    
    const { machineInfo } = quoteRequest;
    const { compatibleMachines } = selectedPart;
    
    // Verificar se há alguma entrada de compatibilidade para o modelo da máquina
    const compatibilityEntry = compatibleMachines.find(entry => 
      entry.modelId === parseInt(machineInfo.model)
    );
    
    if (!compatibilityEntry) return false;
    
    // Verificar ano
    const machineYear = parseInt(machineInfo.year);
    if (machineYear < compatibilityEntry.startYear || machineYear > compatibilityEntry.endYear) {
      return false;
    }
    
    // Verificar chassi (simplificado para demonstração)
    const machineChassis = machineInfo.chassis;
    if (machineChassis < compatibilityEntry.startChassis || machineChassis > compatibilityEntry.endChassis) {
      return false;
    }
    
    return true;
  };

  // Renderizar o conteúdo com base no passo ativo
  const getStepContent = (step) => {
    if (!quoteRequest) return <Typography>Carregando...</Typography>;
    
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Detalhes da Solicitação
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <StyledCard title="Informações da Solicitação" color="primary">
                  <Box sx={{ mt: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Cliente:</strong> {getClientName(quoteRequest.clientId)}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Data da Solicitação:</strong> {quoteRequest.date}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Nome Popular da Peça:</strong> {quoteRequest.popularPartName}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Status:</strong> 
                        <Chip 
                          label={getStatusText(quoteRequest.status)} 
                          color={getStatusColor(quoteRequest.status)} 
                          size="small" 
                          sx={{ ml: 1, fontWeight: 500 }}
                        />
                      </Typography>
                    </Box>
                  </Box>
                </StyledCard>
              </Grid>

              <Grid item xs={12} sm={6}>
                <StyledCard title="Informações da Máquina" color="secondary">
                  <Box sx={{ mt: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Família:</strong> {quoteRequest.machineInfo.family}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Modelo:</strong> {quoteRequest.machineInfo.model}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Ano:</strong> {quoteRequest.machineInfo.year}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Número de Série:</strong> {quoteRequest.machineInfo.serialNumber || 'Não informado'}
                      </Typography>
                    </Box>
                  </Box>
                </StyledCard>
              </Grid>
              
              <Grid item xs={12}>
                <StyledCard
                  title="Observações"
                  color="warning"
                >
                  <Typography variant="body1">
                    {quoteRequest.observations || "Nenhuma observação fornecida."}
                  </Typography>
                </StyledCard>
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Identificar Peça Oficial
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <StyledCard title="Buscar Peça no Catálogo" color="primary">
                  <Box sx={{ mt: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Autocomplete
                      fullWidth
                      options={searchResults}
                      getOptionLabel={(option) => `${option.officialName} (${option.manufacturerRef})`}
                      onChange={(event, newValue) => {
                        handlePartSelect(newValue);
                      }}
                      onInputChange={(event, newInputValue) => {
                        setSearchTerm(newInputValue);
                        searchOfficialParts(newInputValue);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Buscar peça oficial"
                          helperText="Busque pelo nome oficial, referência ou descrição"
                        />
                      )}
                    />
                  </Box>
                </StyledCard>
              </Grid>

              <Grid item xs={12} sm={6}>
                <StyledCard title="Resultado da Busca" color="secondary">
                  <Box sx={{ mt: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {searchResults.length > 0 ? (
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Nome Oficial:</strong> {selectedPart.officialName}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Referência:</strong> {selectedPart.manufacturerRef}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Categoria:</strong> {getCategoryName(selectedPart.categoryId)}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Descrição:</strong> {selectedPart.description}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ p: 2, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body1">
                          {searchTerm
                            ? 'Nenhuma peça encontrada. Tente outro termo de busca.'
                            : 'Use a busca para encontrar peças no catálogo.'}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </StyledCard>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="notes"
                  name="notes"
                  label="Observações sobre a identificação"
                  multiline
                  rows={3}
                  value={formik.values.notes}
                  onChange={formik.handleChange}
                  error={formik.touched.notes && Boolean(formik.errors.notes)}
                  helperText={formik.touched.notes && formik.errors.notes}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirmar Compatibilidade
            </Typography>
            
            {selectedPart ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert 
                    severity={isCompatible() ? "success" : "warning"}
                    sx={{ mb: 2 }}
                  >
                    {isCompatible() 
                      ? "A peça selecionada é compatível com a máquina do cliente." 
                      : "Atenção: A peça selecionada pode não ser totalmente compatível com a máquina do cliente. Verifique os detalhes abaixo."}
                  </Alert>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledCard
                    title="Máquina do Cliente"
                    color="info"
                  >
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Família:</strong> {quoteRequest.machineInfo.family}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Modelo:</strong> {quoteRequest.machineInfo.model}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Ano:</strong> {quoteRequest.machineInfo.year}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Chassi:</strong> {quoteRequest.machineInfo.chassis}
                    </Typography>
                  </StyledCard>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <StyledCard
                    title="Peça Identificada"
                    color="success"
                  >
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Nome Oficial:</strong> {selectedPart.officialName}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Referência:</strong> {selectedPart.manufacturerRef}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Categoria:</strong> {getCategoryName(selectedPart.categoryId)}
                    </Typography>
                  </StyledCard>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body1" gutterBottom>
                    Ao confirmar, você está registrando que a peça <strong>{selectedPart.officialName}</strong> (Ref: {selectedPart.manufacturerRef}) 
                    corresponde ao que o cliente solicitou como "<strong>{quoteRequest.popularPartName}</strong>".
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Esta informação será salva no dicionário técnico para consultas futuras.
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography color="error">
                Nenhuma peça foi selecionada. Por favor, volte ao passo anterior e selecione uma peça.
              </Typography>
            )}
          </Box>
        );
      default:
        return 'Passo desconhecido';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Identificar Peça
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ mt: 2, mb: 4 }}>
            {getStepContent(activeStep)}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Voltar
            </Button>
            <Box>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/solicitacoes')}
                sx={{ mr: 1 }}
              >
                Cancelar
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!selectedPart || formik.isSubmitting}
                >
                  Confirmar Identificação
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={activeStep === 1 && !selectedPart}
                >
                  Próximo
                </Button>
              )}
            </Box>
          </Box>
        </form>
      </Paper>
      
      {/* Snackbar de sucesso */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          Peça identificada com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
}

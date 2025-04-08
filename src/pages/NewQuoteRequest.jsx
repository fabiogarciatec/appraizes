import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';

// Mock data
import { 
  clients, 
  machineFamilies, 
  machineModels,
  popularNames,
} from '../data/mockData';

// Icons
import {
  Business as BusinessIcon,
  Build as BuildIcon,
  Category as CategoryIcon,
  DirectionsCar as DirectionsCarIcon,
  Numbers as NumbersIcon,
  CalendarMonth as CalendarMonthIcon,
  Notes as NotesIcon,
  Send as SendIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// Definição dos passos do stepper
const steps = ['Informações Básicas', 'Dados da Máquina', 'Detalhes Adicionais'];

export default function NewQuoteRequest() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [popularPartSuggestions, setPopularPartSuggestions] = useState([]);
  const navigate = useNavigate();
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  
  // Esquema de validação com Yup
  const validationSchema = yup.object({
    clientId: yup.string().required('Cliente é obrigatório'),
    popularPartName: yup.string().required('Nome da peça é obrigatório'),
    machineFamily: yup.string().required('Família da máquina é obrigatória'),
    machineModel: yup.string().required('Modelo da máquina é obrigatório'),
    machineSeries: yup.string(),
    machineChassis: yup.string(),
    machineYear: yup.number().integer().min(1900).max(new Date().getFullYear()),
    observations: yup.string(),
    hasPhoto: yup.boolean(),
  });
  
  // Initialize formik
  const formik = useFormik({
    initialValues: {
      clientId: '',
      popularPartName: '',
      machineFamily: '',
      machineModel: '',
      machineSeries: '',
      machineChassis: '',
      machineYear: new Date().getFullYear(),
      observations: '',
      hasPhoto: false,
    },
    validationSchema,
    onSubmit: (values) => {
      setIsSubmitting(true);
      
      // Em uma aplicação real, aqui faríamos uma chamada à API
      console.log('Formulário enviado:', values);
      
      // Simulando o envio bem-sucedido
      setTimeout(() => {
        setIsSubmitting(false);
        setOpenSnackbar(true);
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          navigate('/solicitacoes');
        }, 2000);
      }, 1500);
    }
  });
  
  // Atualiza os modelos disponíveis quando a família é alterada
  const handleFamilyChange = (event) => {
    const familyId = parseInt(event.target.value);
    formik.setFieldValue('machineFamily', event.target.value);
    formik.setFieldValue('machineModel', ''); // Limpa o modelo selecionado
    
    setSelectedFamily(familyId);
    
    // Filtra os modelos pela família selecionada
    const models = machineModels.filter(model => model.familyId === familyId);
    setAvailableModels(models);
  };
  
  // Manipula a pesquisa de peças pelo nome popular
  const handlePartNameChange = (event) => {
    const query = event.target.value.toLowerCase();
    formik.setFieldValue('popularPartName', event.target.value);
    
    if (query.length > 2) {
      // Filtra nomes populares que correspondem à consulta
      const suggestions = popularNames
        .filter(name => name.popularName.toLowerCase().includes(query))
        .slice(0, 5); // Limita a 5 sugestões
      
      setPopularPartSuggestions(suggestions);
    } else {
      setPopularPartSuggestions([]);
    }
  };
  
  // Navegação entre os passos
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Verifica se o passo atual está completo
  const isStepComplete = (step) => {
    if (step === 0) {
      return formik.values.clientId && formik.values.popularPartName;
    } else if (step === 1) {
      return formik.values.machineFamily && formik.values.machineModel && formik.values.machineChassis && formik.values.machineYear;
    }
    return true;
  };
  
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        borderRadius: 2, 
        width: '100%', 
        mb: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Typography variant="h5" component="h1" sx={{ mb: 4 }}>
            Nova Solicitação de Identificação de Peça
          </Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          {/* Passo 1: Informações Básicas */}
          {activeStep === 0 && (
            <Card variant="outlined" sx={{ width: '100%', mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Informações Básicas
                  </Typography>
                </Box>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={12}>
                    <TextField
                      fullWidth
                      id="clientId"
                      name="clientId"
                      label="Cliente"
                      select
                      value={formik.values.clientId}
                      onChange={formik.handleChange}
                      error={formik.touched.clientId && Boolean(formik.errors.clientId)}
                      helperText={formik.touched.clientId && formik.errors.clientId}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessIcon color="action" />
                          </InputAdornment>
                        ),
                        sx: {
                          px: 2, // Aumenta o padding horizontal
                          '& .MuiOutlinedInput-input': {
                            pl: 1, // Padding à esquerda do texto
                            minWidth: '250px !important', // Largura mínima de 250px para o dropdown cliente
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          px: 1,
                          minHeight: '56px', // Altura mínima para o dropdown
                          '& fieldset': {
                            px: 2,
                          }
                        },
                        '& .MuiInputLabel-root': {
                          ml: 1, // Move o label um pouco para a direita
                          mt: 0.5, // Ajusta a posição vertical do label
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          }
                        }
                      }}
                    >
                      <MenuItem value="">Selecionar cliente</MenuItem>
                      {clients.map((client) => (
                        <MenuItem key={client.id} value={client.id}>
                          {client.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={12}>
                    <Autocomplete
                      freeSolo
                      id="popularPartName"
                      options={popularPartSuggestions.map(suggestion => suggestion.popularName)}
                      fullWidth
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          name="popularPartName"
                          label="Nome da Peça Solicitada"
                          value={formik.values.popularPartName}
                          onChange={handlePartNameChange}
                          error={formik.touched.popularPartName && Boolean(formik.errors.popularPartName)}
                          helperText={formik.touched.popularPartName && formik.errors.popularPartName}
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <BuildIcon color="action" />
                              </InputAdornment>
                            ),
                            sx: {
                              px: 2, // Padding horizontal padrão
                              '& .MuiOutlinedInput-input': {
                                pl: 1, // Padding à esquerda do texto padrão
                                pr: 2, // Padding à direita do texto padrão
                                fontSize: '1rem', // Fonte padrão
                                minWidth: '300px !important', // Largura mínima de 300px para o input
                                width: '100% !important', // Força a largura total
                              },
                              '& .MuiAutocomplete-input': {
                                minWidth: '300px !important', // Largura mínima de 300px
                                width: '100% !important',
                              }
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              px: 2,
                              py: 0,
                              height: '56px', // Mesma altura do dropdown
                              '& fieldset': {
                                px: 4,
                              },
                              '& .MuiAutocomplete-endAdornment': {
                                right: 16, // Ajusta a posição do ícone de dropdown
                              }
                            },
                            '& .MuiInputLabel-root': {
                              ml: 2.5, // Move o label 5px a mais para a direita (total de 20px)
                              mt: 0.5, // Ajusta a posição vertical do label
                              '&.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -9px) scale(0.75)',
                              }
                            },
                            width: '100%', // Garante que o campo ocupe toda a largura disponível
                            mb: 2, // Adiciona margem inferior
                          }}
                        />
                      )}
                    />
                    {popularPartSuggestions.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Sugestões baseadas em nomes populares já cadastrados
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  disabled={!isStepComplete(0)}
                >
                  Próximo
                </Button>
              </CardActions>
            </Card>
          )}
          
          {/* Passo 2: Dados da Máquina */}
          {activeStep === 1 && (
            <Card variant="outlined" sx={{ width: '100%', mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <DirectionsCarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Dados da Máquina
                  </Typography>
                </Box>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="machineFamily"
                      name="machineFamily"
                      label="Família da Máquina"
                      select
                      value={formik.values.machineFamily}
                      onChange={handleFamilyChange}
                      error={formik.touched.machineFamily && Boolean(formik.errors.machineFamily)}
                      helperText={formik.touched.machineFamily && formik.errors.machineFamily}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CategoryIcon color="action" />
                          </InputAdornment>
                        ),
                        sx: {
                          px: 2, // Aumenta o padding horizontal
                          '& .MuiOutlinedInput-input': {
                            pl: 1, // Padding à esquerda do texto
                            minWidth: '250px !important', // Largura mínima de 250px para o dropdown cliente
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          px: 1,
                          minHeight: '56px', // Altura mínima para o dropdown
                          '& fieldset': {
                            px: 2,
                          }
                        },
                        '& .MuiInputLabel-root': {
                          ml: 1, // Move o label um pouco para a direita
                          mt: 0.5, // Ajusta a posição vertical do label
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          }
                        }
                      }}
                    >
                      <MenuItem value="">Selecione uma família</MenuItem>
                      {machineFamilies.map((family) => (
                        <MenuItem key={family.id} value={family.id}>
                          {family.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      id="machineModel"
                      name="machineModel"
                      label="Modelo da Máquina"
                      select
                      value={formik.values.machineModel}
                      onChange={formik.handleChange}
                      disabled={!selectedFamily}
                      error={formik.touched.machineModel && Boolean(formik.errors.machineModel)}
                      helperText={formik.touched.machineModel && formik.errors.machineModel}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DirectionsCarIcon color="action" />
                          </InputAdornment>
                        ),
                        sx: {
                          px: 2, // Aumenta o padding horizontal
                          '& .MuiOutlinedInput-input': {
                            pl: 1, // Padding à esquerda do texto
                            minWidth: '250px !important', // Largura mínima de 250px para o dropdown cliente
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          px: 1,
                          minHeight: '56px', // Altura mínima para o dropdown
                          '& fieldset': {
                            px: 2,
                          }
                        },
                        '& .MuiInputLabel-root': {
                          ml: 1, // Move o label um pouco para a direita
                          mt: 0.5, // Ajusta a posição vertical do label
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          }
                        }
                      }}
                    >
                      <MenuItem value="">Selecione um modelo</MenuItem>
                      {availableModels.map((model) => (
                        <MenuItem key={model.id} value={model.id}>
                          {model.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      id="machineSeries"
                      name="machineSeries"
                      label="Série da Máquina"
                      value={formik.values.machineSeries}
                      onChange={formik.handleChange}
                      error={formik.touched.machineSeries && Boolean(formik.errors.machineSeries)}
                      helperText={formik.touched.machineSeries && formik.errors.machineSeries}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NumbersIcon color="action" />
                          </InputAdornment>
                        ),
                        sx: {
                          px: 2, // Aumenta o padding horizontal
                          '& .MuiOutlinedInput-input': {
                            pl: 1, // Padding à esquerda do texto
                            minWidth: '250px !important', // Largura mínima de 250px para o dropdown cliente
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          px: 1,
                          minHeight: '56px', // Altura mínima para o dropdown
                          '& fieldset': {
                            px: 2,
                          }
                        },
                        '& .MuiInputLabel-root': {
                          ml: 1, // Move o label um pouco para a direita
                          mt: 0.5, // Ajusta a posição vertical do label
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      id="machineChassis"
                      name="machineChassis"
                      label="Número do Chassi"
                      value={formik.values.machineChassis}
                      onChange={formik.handleChange}
                      error={formik.touched.machineChassis && Boolean(formik.errors.machineChassis)}
                      helperText={formik.touched.machineChassis && formik.errors.machineChassis}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NumbersIcon color="action" />
                          </InputAdornment>
                        ),
                        sx: {
                          px: 2, // Aumenta o padding horizontal
                          '& .MuiOutlinedInput-input': {
                            pl: 1, // Padding à esquerda do texto
                            minWidth: '250px !important', // Largura mínima de 250px para o dropdown cliente
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          px: 1,
                          minHeight: '56px', // Altura mínima para o dropdown
                          '& fieldset': {
                            px: 2,
                          }
                        },
                        '& .MuiInputLabel-root': {
                          ml: 1, // Move o label um pouco para a direita
                          mt: 0.5, // Ajusta a posição vertical do label
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      id="machineYear"
                      name="machineYear"
                      label="Ano da Máquina"
                      type="number"
                      value={formik.values.machineYear}
                      onChange={formik.handleChange}
                      error={formik.touched.machineYear && Boolean(formik.errors.machineYear)}
                      helperText={formik.touched.machineYear && formik.errors.machineYear}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarMonthIcon color="action" />
                          </InputAdornment>
                        ),
                        inputProps: { min: 1900, max: new Date().getFullYear() },
                        sx: {
                          px: 2, // Aumenta o padding horizontal
                          '& .MuiOutlinedInput-input': {
                            pl: 1, // Padding à esquerda do texto
                            minWidth: '250px !important', // Largura mínima de 250px para o dropdown cliente
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          px: 1,
                          minHeight: '56px', // Altura mínima para o dropdown
                          '& fieldset': {
                            px: 2,
                          }
                        },
                        '& .MuiInputLabel-root': {
                          ml: 1, // Move o label um pouco para a direita
                          mt: 0.5, // Ajusta a posição vertical do label
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                >
                  Voltar
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleNext}
                  disabled={!isStepComplete(1)}
                >
                  Próximo
                </Button>
              </CardActions>
            </Card>
          )}
          
          {/* Passo 3: Detalhes Adicionais */}
          {activeStep === 2 && (
            <Card variant="outlined" sx={{ width: '100%', mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                  <NotesIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" component="h2">
                    Detalhes Adicionais
                  </Typography>
                </Box>
                
                <Grid container spacing={4} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Grid item xs={12} sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      id="observations"
                      name="observations"
                      label="Observações Adicionais"
                      multiline
                      rows={6}
                      margin="normal"
                      style={{ minHeight: '150px' }}
                      value={formik.values.observations}
                      onChange={formik.handleChange}
                      error={formik.touched.observations && Boolean(formik.errors.observations)}
                      helperText={formik.touched.observations && formik.errors.observations}
                      placeholder="Descreva detalhes importantes sobre a peça ou situação da máquina"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                            <NotesIcon color="action" />
                          </InputAdornment>
                        ),
                        sx: {
                          px: 2, // Aumenta o padding horizontal
                          '& .MuiOutlinedInput-input': {
                            pl: 1, // Padding à esquerda do texto
                            minWidth: '250px !important', // Largura mínima de 250px para o dropdown cliente
                          }
                        }
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          px: 1,
                          minHeight: '56px', // Altura mínima para o dropdown
                          '& fieldset': {
                            px: 2,
                          }
                        },
                        '& .MuiInputLabel-root': {
                          ml: 1, // Move o label um pouco para a direita
                          mt: 0.5, // Ajusta a posição vertical do label
                          '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                          }
                        }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                      <PhotoCameraIcon color="action" sx={{ mr: 2 }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1">Adicionar foto da peça</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Uma foto da peça facilita a identificação pelo especialista
                        </Typography>
                      </Box>
                      <Button 
                        variant="outlined" 
                        startIcon={<PhotoCameraIcon />}
                        onClick={() => formik.setFieldValue('hasPhoto', !formik.values.hasPhoto)}
                        color={formik.values.hasPhoto ? "success" : "primary"}
                      >
                        {formik.values.hasPhoto ? "Foto adicionada" : "Adicionar foto"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                >
                  Voltar
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  type="submit"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                >
                  {isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </CardActions>
            </Card>
          )}
        </form>
        
        {/* Resumo da solicitação */}
        {activeStep > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              Resumo da solicitação
            </Typography>
            <Grid container spacing={2}>
              {formik.values.clientId && (
                <Grid item xs={6} md={3}>
                  <Chip 
                    icon={<BusinessIcon />} 
                    label={clients.find(c => c.id === parseInt(formik.values.clientId))?.name || 'Cliente'} 
                    size="small" 
                    variant="outlined" 
                  />
                </Grid>
              )}
              {formik.values.popularPartName && (
                <Grid item xs={6} md={3}>
                  <Chip 
                    icon={<BuildIcon />} 
                    label={formik.values.popularPartName} 
                    size="small" 
                    variant="outlined" 
                  />
                </Grid>
              )}
              {formik.values.machineFamily && (
                <Grid item xs={6} md={3}>
                  <Chip 
                    icon={<CategoryIcon />} 
                    label={machineFamilies.find(f => f.id === parseInt(formik.values.machineFamily))?.name || 'Família'} 
                    size="small" 
                    variant="outlined" 
                  />
                </Grid>
              )}
              {formik.values.machineModel && (
                <Grid item xs={6} md={3}>
                  <Chip 
                    icon={<DirectionsCarIcon />} 
                    label={machineModels.find(m => m.id === parseInt(formik.values.machineModel))?.name || 'Modelo'} 
                    size="small" 
                    variant="outlined" 
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        )}
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
          Solicitação enviada com sucesso! Um especialista irá analisá-la em breve.
        </Alert>
      </Snackbar>
    </Box>
  );
}

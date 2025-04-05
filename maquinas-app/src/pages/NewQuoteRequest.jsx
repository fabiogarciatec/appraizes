import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { clients, machineFamilies, machineModels } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function NewQuoteRequest() {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Estado para controlar a seleção de família e modelos disponíveis
  const [selectedFamily, setSelectedFamily] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  
  // Esquema de validação com Yup
  const validationSchema = Yup.object({
    clientId: Yup.number().required('Cliente é obrigatório'),
    popularPartName: Yup.string().required('Nome da peça é obrigatório'),
    machineFamily: Yup.string().required('Família da máquina é obrigatória'),
    machineModel: Yup.string().required('Modelo da máquina é obrigatório'),
    machineSeries: Yup.string(),
    machineChassis: Yup.string().required('Número do chassi é obrigatório'),
    machineYear: Yup.number()
      .required('Ano da máquina é obrigatório')
      .min(1900, 'Ano inválido')
      .max(new Date().getFullYear(), 'Ano não pode ser futuro'),
    observations: Yup.string()
  });
  
  // Configuração do Formik
  const formik = useFormik({
    initialValues: {
      clientId: '',
      popularPartName: '',
      machineFamily: '',
      machineModel: '',
      machineSeries: '',
      machineChassis: '',
      machineYear: new Date().getFullYear(),
      observations: ''
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
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Nova Solicitação de Orçamento
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            {/* Seção de informações básicas */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Informações Básicas
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
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
              >
                <MenuItem value="">Selecione um cliente</MenuItem>
                {clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>
                    {client.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="popularPartName"
                name="popularPartName"
                label="Nome da Peça Solicitada"
                value={formik.values.popularPartName}
                onChange={formik.handleChange}
                error={formik.touched.popularPartName && Boolean(formik.errors.popularPartName)}
                helperText={formik.touched.popularPartName && formik.errors.popularPartName}
              />
            </Grid>
            
            {/* Seção de informações da máquina */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Informações da Máquina
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
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
                InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
              />
            </Grid>
            
            {/* Seção de observações */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Observações
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="observations"
                name="observations"
                label="Observações Adicionais"
                multiline
                rows={4}
                value={formik.values.observations}
                onChange={formik.handleChange}
                error={formik.touched.observations && Boolean(formik.errors.observations)}
                helperText={formik.touched.observations && formik.errors.observations}
              />
            </Grid>
            
            {/* Botões de ação */}
            <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/solicitacoes')}
              >
                Cancelar
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={formik.isSubmitting}
              >
                Salvar Solicitação
              </Button>
            </Grid>
          </Grid>
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
          Solicitação criada com sucesso!
        </Alert>
      </Snackbar>
    </Box>
  );
}

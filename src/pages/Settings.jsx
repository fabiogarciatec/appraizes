import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs,
  Tab,
  Divider,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { 
  Settings as SettingsIcon,
  Storage as StorageIcon,
  Security as SecurityIcon,
  Backup as BackupIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import DatabaseStatus from '../components/ui/DatabaseStatus';

// Componente de painel de configuração
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
      style={{ padding: '16px 0' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se o usuário é administrador
  useEffect(() => {
    if (currentUser && currentUser.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [currentUser]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: '4px 16px', width: '100%', boxSizing: 'border-box' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 1, mt: 0 }}>
        Configurações
      </Typography>

      {!isAdmin && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Algumas configurações podem estar restritas para usuários não administradores.
        </Alert>
      )}

      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<StorageIcon />} label="Banco de Dados" />
          <Tab icon={<SecurityIcon />} label="Segurança" disabled={!isAdmin} />
          <Tab icon={<BackupIcon />} label="Backup" disabled={!isAdmin} />
        </Tabs>
        
        <Divider />
        
        {/* Painel de Banco de Dados */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Status do Banco de Dados
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Aqui você pode verificar o status da conexão com o banco de dados, estatísticas e realizar testes de conectividade.
            </Typography>
            
            <DatabaseStatus />
          </Box>
        </TabPanel>
        
        {/* Painel de Segurança */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configurações de Segurança
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Gerencie as configurações de segurança do sistema.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Política de Senhas</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Esta funcionalidade será implementada em breve.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Autenticação</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Esta funcionalidade será implementada em breve.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Painel de Backup */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Backup e Restauração
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Gerencie backups do banco de dados e restaure quando necessário.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Backup Manual</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Esta funcionalidade será implementada em breve.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">Restauração</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Esta funcionalidade será implementada em breve.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
}

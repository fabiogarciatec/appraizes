import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Book,
    Build,
    Help,
    Update
} from '@mui/icons-material';
import knowledgeBaseService from '../../../services/knowledgeBaseService';

// Available icons
const ICONS = [
    { value: 'Book', label: 'Book (Livro)', component: <Book /> },
    { value: 'Build', label: 'Build (Ferramenta)', component: <Build /> },
    { value: 'Help', label: 'Help (Ajuda)', component: <Help /> },
    { value: 'Update', label: 'Update (Atualização)', component: <Update /> }
];

const KBAdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', icon: 'Book' });
    const [saving, setSaving] = useState(false);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await knowledgeBaseService.getCategories();
            setCategories(data);
        } catch (err) {
            console.error("Failed to load categories", err);
            setError("Falha ao carregar categorias.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleOpenDialog = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                icon: category.icon || 'Book'
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '', icon: 'Book' });
        }
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingCategory(null);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editingCategory) {
                await knowledgeBaseService.updateCategory(editingCategory.id, formData);
                setNotification({ open: true, message: 'Categoria atualizada com sucesso!', severity: 'success' });
            } else {
                await knowledgeBaseService.createCategory(formData);
                setNotification({ open: true, message: 'Categoria criada com sucesso!', severity: 'success' });
            }
            handleCloseDialog();
            loadCategories();
        } catch (err) {
            console.error("Error saving category", err);
            setNotification({ open: true, message: 'Erro ao salvar categoria.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
            try {
                await knowledgeBaseService.deleteCategory(id);
                setNotification({ open: true, message: 'Categoria excluída com sucesso!', severity: 'success' });
                loadCategories();
            } catch (err) {
                console.error("Failed to delete category", err);
                const errorMessage = err.message && err.message.includes('artigos ativos')
                    ? 'Não é possível excluir categoria com artigos ativos.'
                    : 'Erro ao excluir categoria.';
                setNotification({ open: true, message: errorMessage, severity: 'error' });
            }
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (loading) return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="600">
                    Gerenciar Categorias
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Nova Categoria
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'background.default' }}>
                            <TableCell>Ícone</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id} hover>
                                <TableCell>
                                    {ICONS.find(i => i.value === category.icon)?.component || <Book />}
                                </TableCell>
                                <TableCell component="th" scope="row">
                                    <Typography variant="subtitle2" fontWeight="600">{category.name}</Typography>
                                </TableCell>
                                <TableCell>{category.description}</TableCell>
                                <TableCell align="right">
                                    <IconButton size="small" onClick={() => handleOpenDialog(category)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(category.id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {categories.length === 0 && (
                            <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>Nenhuma categoria encontrada.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog for Create/Edit */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Nome"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <TextField
                            label="Descrição"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <TextField
                            select
                            label="Ícone"
                            fullWidth
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        >
                            {ICONS.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {option.component}
                                        {option.label}
                                    </Box>
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancelar</Button>
                    <Button onClick={handleSave} variant="contained" disabled={saving || !formData.name}>
                        {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default KBAdminCategories;

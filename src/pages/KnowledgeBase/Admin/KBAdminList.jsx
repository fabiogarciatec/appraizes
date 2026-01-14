import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Chip,
    Tooltip,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import knowledgeBaseService from '../../../services/knowledgeBaseService';

const KBAdminList = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const loadArticles = async () => {
        try {
            setLoading(true);
            const data = await knowledgeBaseService.getArticles();
            setArticles(data);
        } catch (err) {
            console.error("Failed to load articles", err);
            setError("Falha ao carregar artigos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadArticles();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este artigo?')) {
            try {
                await knowledgeBaseService.deleteArticle(id);
                setArticles(articles.filter(a => a.id !== id));
                setNotification({ open: true, message: 'Artigo excluído com sucesso', severity: 'success' });
            } catch (err) {
                console.error("Failed to delete article", err);
                setNotification({ open: true, message: 'Erro ao excluir artigo', severity: 'error' });
            }
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

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
                <Typography variant="h4" fontWeight="600">
                    Gerenciar Artigos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/base-conhecimento/novo')}
                >
                    Novo Artigo
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'background.default' }}>
                            <TableCell>Título</TableCell>
                            <TableCell>Categoria</TableCell>
                            <TableCell>Autor</TableCell>
                            <TableCell>Visualizações</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Visibilidade</TableCell>
                            <TableCell>Recomendado</TableCell>
                            <TableCell align="right">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {articles.map((article) => (
                            <TableRow key={article.id} hover>
                                <TableCell component="th" scope="row">
                                    <Typography variant="subtitle2" fontWeight="600">
                                        {article.title}
                                    </Typography>
                                </TableCell>
                                <TableCell>{article.category_name}</TableCell>
                                <TableCell>{article.author_name || 'Admin'}</TableCell>
                                <TableCell>{article.views}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={article.status === 'published' ? "Publicado" : "Rascunho"}
                                        color={article.status === 'published' ? "success" : "warning"}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={article.is_public ? "Público" : "Restrito"}
                                        color={article.is_public ? "primary" : "default"}
                                        size="small"
                                        variant="filled"
                                        sx={{ bgcolor: article.is_public ? 'primary.light' : 'action.selected', color: article.is_public ? 'primary.main' : 'text.secondary', fontWeight: 600 }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={article.is_featured ? "Sim" : "Não"}
                                        color={article.is_featured ? "secondary" : "default"}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Ver no Portal">
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/portal/artigo/${article.id}`)}
                                            sx={{ color: 'info.main' }}
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Editar">
                                        <IconButton
                                            size="small"
                                            onClick={() => navigate(`/base-conhecimento/editar/${article.id}`)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Excluir">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(article.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {articles.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    Nenhum artigo encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default KBAdminList;

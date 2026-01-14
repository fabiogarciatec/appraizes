import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
    Alert,
    Stack,
    Snackbar,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    Article as ArticleIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import knowledgeBaseService from '../../../services/knowledgeBaseService';

const KBArticleEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const quillRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        category_id: '',
        content: '',
        excerpt: '',
        tags: '',
        read_time: '5 min',
        status: 'draft',
        is_public: false,
        is_featured: false
    });

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const loadInitData = async () => {
            try {
                setLoading(true);
                // Load categories
                const cats = await knowledgeBaseService.getCategories();
                setCategories(cats);

                // If edit mode, load article
                if (isEditMode) {
                    const article = await knowledgeBaseService.getArticleById(id);
                    setFormData({
                        title: article.title,
                        category_id: article.category_id,
                        content: article.content,
                        excerpt: article.excerpt || '',
                        tags: article.tags || '',
                        read_time: article.read_time || '5 min',
                        status: article.status || 'draft',
                        is_public: article.is_public === 1 || article.is_public === true,
                        is_featured: article.is_featured === 1 || article.is_featured === true
                    });
                } else if (cats.length > 0) {
                    // Set default category
                    setFormData(prev => ({ ...prev, category_id: cats[0].id }));
                }
            } catch (err) {
                console.error("Failed to load data", err);
                setError("Erro ao carregar dados do editor.");
            } finally {
                setLoading(false);
            }
        };

        loadInitData();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handler específico para o ReactQuill
    const handleContentChange = (content) => {
        setFormData(prev => ({
            ...prev,
            content: content
        }));
    };

    // Imagem Handler customizado para fazer upload para o servidor
    const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files[0];
            if (file) {
                try {
                    // Save current cursor state
                    const range = quillRef.current.getEditor().getSelection(true);

                    // Upload to server
                    const res = await knowledgeBaseService.uploadImage(file);
                    const url = res.url; // Assuming API returns { url: '...' }

                    // Insert image at cursor
                    quillRef.current.getEditor().insertEmbed(range.index, 'image', url);

                    // Move cursor to next position
                    quillRef.current.getEditor().setSelection(range.index + 1);
                } catch (err) {
                    console.error('Image upload failed', err);
                    setNotification({
                        open: true,
                        message: 'Erro ao fazer upload da imagem. Tente novamente.',
                        severity: 'error'
                    });
                }
            }
        };
    };

    // Configuração do Quill
    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [{ 'font': [] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                image: imageHandler
            }
        }
    }), []);

    const formats = [
        'header', 'font',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image', 'video', 'color', 'background', 'align'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend validation
        // Verifica se o content é vazio ou contém apenas tags HTML vazias (<p><br></p>)
        const strippedContent = formData.content.replace(/<[^>]+>/g, '').trim();

        if (!formData.title.trim() || !formData.category_id || strippedContent.length === 0) {
            setNotification({
                open: true,
                message: 'Por favor, preencha todos os campos obrigatórios (Título, Categoria e Conteúdo).',
                severity: 'warning'
            });
            return;
        }

        setSaving(true);
        try {
            if (isEditMode) {
                await knowledgeBaseService.updateArticle(id, formData);
                setNotification({ open: true, message: 'Artigo atualizado com sucesso!', severity: 'success' });
            } else {
                await knowledgeBaseService.createArticle(formData);
                setNotification({ open: true, message: 'Artigo criado com sucesso!', severity: 'success' });
            }

            setTimeout(() => {
                navigate('/base-conhecimento');
            }, 1000);
        } catch (err) {
            console.error("Error saving article", err);
            // Show more specific error from backend if available
            const errorMessage = err.response?.data?.message || 'Erro ao salvar artigo.';
            setNotification({ open: true, message: errorMessage, severity: 'error' });
            setSaving(false);
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (loading) {
        return (
            <Box sx={{ p: 5, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
                <Button onClick={() => navigate('/base-conhecimento')} sx={{ mt: 2 }} variant="outlined">
                    Voltar para Lista
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: '100%', mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/base-conhecimento')}
                        color="inherit"
                    >
                        Voltar
                    </Button>
                    <Typography variant="h5" fontWeight="600">
                        {isEditMode ? `Editando: ${formData.title}` : 'Novo Artigo'}
                    </Typography>
                </Box>
                <Box>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/base-conhecimento')}
                        disabled={saving}
                        sx={{ mr: 2 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        size="large"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                        disabled={saving}
                    >
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </Box>
            </Box>

            <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                    {/* Main Content Column */}
                    <Box>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                    <ArticleIcon color="primary" />
                                    <Typography variant="h6">Conteúdo Principal</Typography>
                                </Box>
                                <Divider sx={{ mb: 3 }} />

                                <Stack spacing={3}>
                                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                                        <TextField
                                            fullWidth
                                            label="Título do Artigo"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            variant="outlined"
                                            placeholder="Digite um título claro e descritivo"
                                        />

                                        <TextField
                                            fullWidth
                                            label="Resumo / Descrição Curta"
                                            name="excerpt"
                                            value={formData.excerpt}
                                            onChange={handleChange}
                                            multiline
                                            rows={2}
                                            required
                                            placeholder="Breve descrição..."
                                            helperText="Exibido na listagem."
                                        />
                                    </Stack>

                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                                            Conteúdo Detalhado (Editor Rico + Imagens)
                                        </Typography>
                                        <Box sx={{
                                            '& .quill': { height: '500px', display: 'flex', flexDirection: 'column' },
                                            '& .ql-container': { flex: 1, overflow: 'auto' }
                                        }}>
                                            <ReactQuill
                                                ref={quillRef}
                                                theme="snow"
                                                value={formData.content}
                                                onChange={handleContentChange}
                                                modules={modules}
                                                formats={formats}
                                                placeholder="Escreva seu artigo aqui... Use a barra de ferramentas para formatar."
                                                style={{ height: '450px', marginBottom: '50px' }}
                                            />
                                        </Box>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Sidebar / Metadata Column */}
                    <Box>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', flex: 1 }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                        <SettingsIcon color="primary" />
                                        <Typography variant="h6">Configurações</Typography>
                                    </Box>
                                    <Divider sx={{ mb: 3 }} />

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth required>
                                                <InputLabel>Status</InputLabel>
                                                <Select
                                                    name="status"
                                                    value={formData.status}
                                                    label="Status"
                                                    onChange={handleChange}
                                                >
                                                    <MenuItem value="draft">Rascunho</MenuItem>
                                                    <MenuItem value="published">Publicado</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth required>
                                                <InputLabel>Visibilidade</InputLabel>
                                                <Select
                                                    name="is_public"
                                                    value={formData.is_public}
                                                    label="Visibilidade"
                                                    onChange={handleChange}
                                                >
                                                    <MenuItem value={true}>Público</MenuItem>
                                                    <MenuItem value={false}>Restrito (Logado)</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <FormControl fullWidth required>
                                                <InputLabel>Categoria</InputLabel>
                                                <Select
                                                    name="category_id"
                                                    value={formData.category_id}
                                                    label="Categoria"
                                                    onChange={handleChange}
                                                >
                                                    {categories.map((cat) => (
                                                        <MenuItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </MenuItem>
                                                    ))}
                                                    {categories.length === 0 && (
                                                        <MenuItem disabled value="">
                                                            Nenhuma categoria encontrada
                                                        </MenuItem>
                                                    )}
                                                </Select>
                                            </FormControl>
                                        </Grid>

                                        <Grid item xs={12} md={3}>
                                            <TextField
                                                fullWidth
                                                label="Tempo de Leitura"
                                                name="read_time"
                                                value={formData.read_time}
                                                onChange={handleChange}
                                                placeholder="Ex: 5 min"
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={12}>
                                            <TextField
                                                fullWidth
                                                label="Tags"
                                                name="tags"
                                                value={formData.tags}
                                                onChange={handleChange}
                                                placeholder="Separadas por vírgula"
                                                helperText="Ex: tutorial, manutenção, urgente"
                                            />
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Recomendado</InputLabel>
                                                <Select
                                                    name="is_featured"
                                                    value={formData.is_featured}
                                                    label="Recomendado"
                                                    onChange={handleChange}
                                                >
                                                    <MenuItem value={true}>Sim</MenuItem>
                                                    <MenuItem value={false}>Não</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', bgcolor: '#f5f5f5', flex: 0, minWidth: '200px', height: 'fit-content' }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Informações
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Status:</strong> {formData.status === 'published' ? 'Publicado' : 'Rascunho'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Visibilidade:</strong> {formData.is_public ? 'Público' : 'Restrito'}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Autor:</strong> Admin
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                </Stack>
            </form>

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

export default KBArticleEditor;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Breadcrumbs,
    Link,
    Chip,
    Divider,
    Paper,
    IconButton,
    Tooltip,
    useTheme,
    alpha,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    NavigateNext,
    ArrowBack,
    Share,
    BookmarkBorder,
    ThumbUpOutlined,
    Print
} from '@mui/icons-material';
import knowledgeBaseService from '../../../services/knowledgeBaseService';

const ArticleView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const data = await knowledgeBaseService.getPublicArticleById(id);
                setArticle(data);
            } catch (err) {
                console.error("Failed to load article", err);
                // Ignora AbortError (timeout do ApiService)
                if (err.name === 'AbortError') {
                    console.warn('Requisição abortada por timeout');
                    return;
                }

                if (err.response && err.response.status === 403) {
                    setError("Este conteúdo é restrito. Faça login para acessar.");
                } else if (err.response && err.response.status === 404) {
                    setError("Artigo não encontrado.");
                } else if (err.message && err.message.includes('403')) {
                    setError("Este conteúdo é restrito. Faça login para acessar.");
                } else if (err.message && err.message.includes('404')) {
                    setError("Artigo não encontrado.");
                } else {
                    setError("Não foi possível carregar o artigo.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchArticle();
        }
    }, [id]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error || !article) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Alert severity="error">{error || "Artigo não encontrado."}</Alert>
                <Box sx={{ mt: 2 }}>
                    <Link component="button" onClick={() => navigate('/portal')}>
                        Voltar para a Base de Conhecimento
                    </Link>
                </Box>
            </Container>
        );
    }

    // Parse tags if they are a string
    const tagsList = typeof article.tags === 'string'
        ? article.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : (Array.isArray(article.tags) ? article.tags : []);

    return (
        <Box sx={{ pb: 8 }}>
            {/* Header / Breadcrumbs */}
            <Box sx={{ bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', py: 3 }}>
                <Container maxWidth={false} sx={{ px: '36px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <IconButton onClick={() => navigate('/portal')} sx={{ mr: 2 }}>
                            <ArrowBack />
                        </IconButton>
                        <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb">
                            <Link underline="hover" color="inherit" onClick={() => navigate('/portal')} sx={{ cursor: 'pointer' }}>
                                Base de Conhecimento
                            </Link>
                            <Link underline="hover" color="inherit" href="#">
                                {article.category_name}
                            </Link>
                            <Typography color="text.primary" sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {article.title}
                            </Typography>
                        </Breadcrumbs>
                    </Box>
                </Container>
            </Box>

            {/* Main Content */}
            <Container maxWidth={false} sx={{ mt: 5, px: '36px' }}>
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 6 },
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    {/* Article Header */}
                    <Box sx={{ mb: 4 }}>
                        <Chip
                            label={article.category_name}
                            color="primary"
                            size="small"
                            sx={{ mb: 2, fontWeight: 600 }}
                        />
                        <Typography variant="h3" component="h1" fontWeight="800" gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                            {article.title}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3, color: 'text.secondary' }}>
                            <Typography variant="body2">
                                Por <strong>{article.author_name || 'Admin'}</strong>
                            </Typography>
                            <Divider orientation="vertical" flexItem variant="middle" />
                            <Typography variant="body2">
                                {article.created_at ? new Date(article.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}
                            </Typography>
                            <Divider orientation="vertical" flexItem variant="middle" />
                            <Typography variant="body2">
                                {article.read_time || '5 min'} de leitura
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 6 }} />

                    {/* Article Body */}
                    <Box
                        sx={{
                            typography: 'body1',
                            '& h2': {
                                fontSize: '1.8rem',
                                fontWeight: 700,
                                mt: 6,
                                mb: 2,
                                color: 'text.primary'
                            },
                            '& h3': {
                                fontSize: '1.4rem',
                                fontWeight: 600,
                                mt: 4,
                                mb: 2,
                                color: 'text.primary'
                            },
                            '& p': {
                                fontSize: '1.1rem',
                                lineHeight: 1.8,
                                mb: 3,
                                color: 'text.secondary'
                            },
                            '& ul, & ol': {
                                mb: 3,
                                pl: 4,
                                '& li': {
                                    mb: 1,
                                    fontSize: '1.1rem',
                                    color: 'text.secondary'
                                }
                            },
                            '& blockquote': {
                                borderLeft: `4px solid ${theme.palette.primary.main}`,
                                m: 0,
                                my: 4,
                                pl: 3,
                                py: 1,
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderRadius: '0 8px 8px 0',
                                fontStyle: 'italic',
                                color: 'text.primary'
                            }
                        }}
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    {/* Tags */}
                    {tagsList.length > 0 && (
                        <Box sx={{ mt: 6, mb: 4 }}>
                            {tagsList.map(tag => (
                                <Chip
                                    key={tag}
                                    label={`#${tag}`}
                                    onClick={() => { }}
                                    sx={{ mr: 1, mb: 1, borderRadius: 1 }}
                                />
                            ))}
                        </Box>
                    )}

                    <Divider sx={{ my: 4 }} />

                    {/* Feedback & Actions */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                                Esse artigo foi útil?
                            </Typography>
                            <IconButton color="primary">
                                <ThumbUpOutlined />
                            </IconButton>
                        </Box>

                        <Box>
                            <Tooltip title="Salvar">
                                <IconButton>
                                    <BookmarkBorder />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Compartilhar">
                                <IconButton>
                                    <Share />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Imprimir">
                                <IconButton>
                                    <Print />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ArticleView;

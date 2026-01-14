import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    Chip,
    Paper,
    useTheme,
    alpha,
    CircularProgress,
    Skeleton
} from '@mui/material';
import {
    Search as SearchIcon,
    Book,
    Build,
    Help,
    Update,
    ArrowForward,
    Article
} from '@mui/icons-material';
import knowledgeBaseService from '../../../services/knowledgeBaseService';

// Helper to get icon component dynamically
const getIcon = (iconName) => {
    switch (iconName) {
        case 'Book': return <Book fontSize="large" />;
        case 'Build': return <Build fontSize="large" />;
        case 'Help': return <Help fontSize="large" />;
        case 'Update': return <Update fontSize="large" />;
        default: return <Book fontSize="large" />;
    }
};

const PortalHome = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [articles, setArticles] = useState([]);

    // Initial data load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [categoriesData, articlesData] = await Promise.all([
                    knowledgeBaseService.getPublicCategories(),
                    knowledgeBaseService.getPublicArticles({ limit: 6 })
                ]);
                setCategories(categoriesData);
                setArticles(articlesData);
            } catch (error) {
                console.error("Failed to load KB data", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    // Search and Filter effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            // Skip initial empty search if we already loaded initial data
            if (searchTerm === '' && !selectedCategory && articles.length > 0 && !searching) return;

            try {
                setSearching(true);
                const results = await knowledgeBaseService.getPublicArticles({
                    search: searchTerm,
                    category: selectedCategory,
                    limit: 6 // Increase limit for search results
                });
                setArticles(results);
            } catch (error) {
                console.error("Search failed", error);
            } finally {
                setSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedCategory]);

    const handleCategoryClick = (categoryName) => {
        if (selectedCategory === categoryName) {
            setSelectedCategory(null); // Toggle off
        } else {
            setSelectedCategory(categoryName);
        }
    };

    return (
        <Box>

            {/* Hero Section */}
            <Box
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    pt: 12,
                    pb: 16,
                    position: 'relative',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                }}
            >
                {/* Abstract shapes/background elements */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: -50,
                        right: -50,
                        width: 300,
                        height: 300,
                        borderRadius: '50%',
                        bgcolor: 'rgba(255,255,255,0.1)'
                    }}
                />

                <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <Typography variant="h3" component="h1" fontWeight="800" gutterBottom>
                        Como podemos ajudar você?
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mb: 6, fontWeight: 400 }}>
                        Busque por tópicos, guias e respostas rápidas.
                    </Typography>

                    <Paper
                        elevation={3}
                        sx={{
                            p: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            maxWidth: 600,
                            mx: 'auto',
                            borderRadius: 3,
                            height: 60
                        }}
                    >
                        <TextField
                            fullWidth
                            placeholder="Digite sua dúvida..."
                            variant="standard"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                disableUnderline: true,
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="action" sx={{ ml: 2, mr: 1 }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (searching && <CircularProgress size={20} sx={{ mr: 2 }} />),
                                sx: { fontSize: '1.1rem' }
                            }}
                        />
                    </Paper>
                </Container>
            </Box>

            {/* Content Section */}
            <Container maxWidth="lg" sx={{ mt: -8, mb: 8, position: 'relative', zIndex: 2 }}>
                {/* Topics Grid */}
                <Grid container spacing={4}>
                    {loading ? (
                        // Loading Skeletons
                        Array.from(new Array(4)).map((_, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
                            </Grid>
                        ))
                    ) : (
                        categories.map((category) => (
                            <Grid item xs={12} sm={6} md={3} key={category.id}>
                                <Card
                                    elevation={selectedCategory === category.name ? 8 : 2}
                                    sx={{
                                        height: '100%',
                                        borderRadius: 4,
                                        transition: 'all 0.2s',
                                        cursor: 'pointer',
                                        transform: selectedCategory === category.name ? 'translateY(-4px)' : 'none',
                                        border: selectedCategory === category.name ? `2px solid ${theme.palette.primary.main}` : 'none',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                                        }
                                    }}
                                    onClick={() => handleCategoryClick(category.name)}
                                >
                                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                        <Box
                                            sx={{
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: 'primary.main',
                                                width: 70,
                                                height: 70,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 2,
                                                mx: 'auto'
                                            }}
                                        >
                                            {getIcon(category.icon)}
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {category.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {category.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>

                {/* Recent/Popular Articles */}
                <Box sx={{ mt: 8 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h5" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Article sx={{ mr: 1, color: 'primary.main' }} />
                            {searchTerm ? 'Resultados da busca' : (selectedCategory ? `Artigos em ${selectedCategory}` : 'Artigos Recomendados')}
                        </Typography>
                        {selectedCategory && (
                            <Chip label={`Filtro: ${selectedCategory}`} onDelete={() => setSelectedCategory(null)} color="primary" />
                        )}
                    </Box>

                    <Grid container spacing={3}>
                        {loading || searching ? (
                            Array.from(new Array(4)).map((_, index) => (
                                <Grid item xs={12} md={6} key={index}>
                                    <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 3 }} />
                                </Grid>
                            ))
                        ) : articles.length > 0 ? (
                            articles.map((article) => (
                                <Grid item xs={12} md={6} key={article.id}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            borderColor: 'divider',
                                            transition: 'all 0.2s',
                                            cursor: 'pointer',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                bgcolor: alpha(theme.palette.primary.main, 0.02)
                                            }
                                        }}
                                        onClick={() => navigate(`/portal/artigo/${article.id}`)}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Chip
                                                label={article.category_name}
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                                sx={{ borderRadius: 1 }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {article.read_time || '5 min'} leitura
                                            </Typography>
                                        </Box>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            {article.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {article.excerpt}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                                            <Typography variant="body2" fontWeight="600" sx={{ mr: 0.5 }}>
                                                Ler artigo
                                            </Typography>
                                            <ArrowForward fontSize="small" />
                                        </Box>
                                    </Paper>
                                </Grid>
                            ))
                        ) : (
                            <Grid item xs={12}>
                                <Typography variant="h6" color="text.secondary" align="center" sx={{ py: 4 }}>
                                    Nenhum artigo encontrado.
                                </Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default PortalHome;

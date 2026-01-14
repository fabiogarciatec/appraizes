import ApiService from './ApiService';

/**
 * Serviço para gerenciar as chamadas à API da Base de Conhecimento
 */
const knowledgeBaseService = {
    // --- Categorias ---

    /**
     * Obtém todas as categorias ativas
     * @returns {Promise<Array>} Lista de categorias
     */
    getCategories: async () => {
        try {
            return await ApiService.get('/kb/categories');
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            throw error;
        }
    },

    /**
     * Obtém categorias PÚBLICAS (Portal)
     * @returns {Promise<Array>} Lista de categorias
     */
    getPublicCategories: async () => {
        try {
            return await ApiService.get('/public/kb/categories');
        } catch (error) {
            console.error('Erro ao buscar categorias públicas:', error);
            throw error;
        }
    },

    /**
     * Cria uma nova categoria (Admin)
     * @param {Object} categoryData - Dados da categoria
     * @returns {Promise<Object>} Resposta da API
     */
    createCategory: async (categoryData) => {
        try {
            return await ApiService.post('/kb/categories', categoryData);
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            throw error;
        }
    },

    /**
     * Atualiza uma categoria existente (Admin)
     * @param {string|number} id - ID da categoria
     * @param {Object} categoryData - Dados da categoria
     * @returns {Promise<Object>} Resposta da API
     */
    updateCategory: async (id, categoryData) => {
        try {
            return await ApiService.put(`/kb/categories/${id}`, categoryData);
        } catch (error) {
            console.error(`Erro ao atualizar categoria ${id}:`, error);
            throw error;
        }
    },

    /**
     * Remove uma categoria (Admin)
     * @param {string|number} id - ID da categoria
     * @returns {Promise<Object>} Resposta da API
     */
    deleteCategory: async (id) => {
        try {
            return await ApiService.delete(`/kb/categories/${id}`);
        } catch (error) {
            console.error(`Erro ao excluir categoria ${id}:`, error);
            throw error;
        }
    },

    // --- Artigos ---

    /**
     * Obtém lista de artigos com filtros opcionais
     * @param {Object} filters - Filtros (search, category, limit)
     * @returns {Promise<Array>} Lista de artigos
     */
    getArticles: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const endpoint = `/kb/articles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            return await ApiService.get(endpoint);
        } catch (error) {
            console.error('Erro ao buscar artigos:', error);
            throw error;
        }
    },

    /**
     * Obtém lista de artigos PÚBLICOS (Portal)
     * @param {Object} filters - Filtros (search, category, limit)
     * @returns {Promise<Array>} Lista de artigos
     */
    getPublicArticles: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (filters.search) queryParams.append('search', filters.search);
            if (filters.category) queryParams.append('category', filters.category);
            if (filters.limit) queryParams.append('limit', filters.limit);

            const endpoint = `/public/kb/articles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            return await ApiService.get(endpoint);
        } catch (error) {
            console.error('Erro ao buscar artigos públicos:', error);
            throw error;
        }
    },

    /**
     * Obtém um artigo específico pelo ID
     * @param {string|number} id - ID do artigo
     * @returns {Promise<Object>} Detalhes do artigo
     */
    getArticleById: async (id) => {
        try {
            return await ApiService.get(`/kb/articles/${id}`);
        } catch (error) {
            console.error(`Erro ao buscar artigo ${id}:`, error);
            throw error;
        }
    },

    /**
     * Obtém um artigo PÚBLICO específico pelo ID (Portal)
     * @param {string|number} id - ID do artigo
     * @returns {Promise<Object>} Detalhes do artigo
     */
    getPublicArticleById: async (id) => {
        try {
            return await ApiService.get(`/public/kb/articles/${id}`);
        } catch (error) {
            console.error(`Erro ao buscar artigo público ${id}:`, error);
            throw error;
        }
    },

    /**
     * Cria um novo artigo (Admin)
     * @param {Object} articleData - Dados do artigo
     * @returns {Promise<Object>} Resposta da API
     */
    createArticle: async (articleData) => {
        try {
            return await ApiService.post('/kb/articles', articleData);
        } catch (error) {
            console.error('Erro ao criar artigo:', error);
            throw error;
        }
    },

    /**
     * Atualiza um artigo existente (Admin)
     * @param {string|number} id - ID do artigo
     * @param {Object} articleData - Dados atualizados
     * @returns {Promise<Object>} Resposta da API
     */
    updateArticle: async (id, articleData) => {
        try {
            return await ApiService.put(`/kb/articles/${id}`, articleData);
        } catch (error) {
            console.error(`Erro ao atualizar artigo ${id}:`, error);
            throw error;
        }
    },

    /**
     * Remove um artigo (Admin)
     * @param {string|number} id - ID do artigo
     * @returns {Promise<Object>} Resposta da API
     */
    deleteArticle: async (id) => {
        try {
            return await ApiService.delete(`/kb/articles/${id}`);
        } catch (error) {
            console.error(`Erro ao excluir artigo ${id}:`, error);
            throw error;
        }
    },

    /**
     * Upload de imagem para uso nos artigos
     * @param {File} file - Arquivo de imagem
     * @returns {Promise<string>} URL da imagem
     */
    uploadImage: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Use direct axios call or specific ApiService method if it supports FormData
            // Assuming ApiService.post supports FormData if we don't set Content-Type manually (axios handles it)
            // But ApiService might force application/json. 
            // Let's assume ApiService needs a small tweak or we use it carefully.
            // If ApiService.post uses axios, passing FormData usually works if headers aren't hardcoded to json.
            // Checking ApiService... it sets 'Content-Type': 'application/json' by default?
            // Let's try passing formatted request.

            // To be safe, we might need a dedicated upload method in ApiService or override headers.
            // For now, let's try assuming standard axios behavior or add a specific method.
            // Actually, best to use ApiService.post with a 3rd arg for config if available, or just standard axios if accessible.
            // Since I cannot check ApiService easily without reading again, I'll add a specific call here using axios directly if imported, 
            // OR simply stick to ApiService and hope it handles FormData, OR add a method.

            // Let's implement it assuming ApiService.post wraps axios.
            // If it fails, I'll fix it. 
            // Wait, ApiService checks for token etc.

            // Let's check ApiService again to be sure.

            // Use the dedicated upload method in ApiService
            return await ApiService.upload('/upload', formData);
        } catch (error) {
            console.error('Erro ao fazer upload de imagem:', error);
            throw error;
        }
    }
};

export default knowledgeBaseService;

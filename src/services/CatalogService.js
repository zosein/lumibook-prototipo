// Serviço para comunicação com API de catalogação

import api from "./api";
import { normalizeBook } from '../utils/normalizeUtils';

// Serviço responsável por operações do catálogo de livros
const CatalogService = {
	// Headers padrão para as requisições
	getHeaders(includeAuth = true) {
		const headers = {
			"Content-Type": "application/json",
		};

		if (includeAuth) {
			const token = localStorage.getItem("authToken");
			if (token) {
				headers["Authorization"] = `Bearer ${token}`;
			}
		}

		return headers;
	},

	// Catalogar nova obra
	async catalogarObra(dadosObra, adminId) {
		const response = await api.post(
			"/api/books",
			dadosObra,
			{ headers: this.getHeaders() }
		);
		return { success: true, data: response.data, message: "Obra catalogada com sucesso!" };
	},

	// Validar dados antes de enviar para API
	validarDadosObra(dados) {
		const errors = {};

		// Validações obrigatórias
		if (!dados.titulo?.trim()) {
			errors.titulo = "Título é obrigatório";
		} else if (dados.titulo.trim().length < 2) {
			errors.titulo = "Título deve ter pelo menos 2 caracteres";
		} else if (dados.titulo.trim().length > 255) {
			errors.titulo = "Título não pode exceder 255 caracteres";
		}

		if (!Array.isArray(dados.autores) || dados.autores.length === 0) {
			errors.autores = "Pelo menos um autor é obrigatório";
		} else if (dados.autores.some(a => typeof a !== 'string' || a.trim().length < 2)) {
			errors.autores = "Cada autor deve ser uma string com pelo menos 2 caracteres";
		}

		if (!dados.tipo) {
			errors.tipo = "Tipo de obra é obrigatório";
		}

		if (!dados.categoria) {
			errors.categoria = "Categoria é obrigatória";
		}

		if (!dados.ano || isNaN(dados.ano)) {
			errors.ano = "Ano de publicação é obrigatório";
		} else {
			const ano = parseInt(dados.ano);
			const anoAtual = new Date().getFullYear();
			if (ano < 1450 || ano > anoAtual + 1) {
				errors.ano = `Ano deve estar entre 1450 e ${anoAtual + 1}`;
			}
		}

		if (!dados.localizacao?.trim()) {
			errors.localizacao = "Localização é obrigatória";
		}

		if (
			!dados.exemplares ||
			isNaN(dados.exemplares) ||
			parseInt(dados.exemplares) < 1
		) {
			errors.exemplares = "Quantidade de exemplares deve ser pelo menos 1";
		}

		// Validações opcionais com formato
		if (dados.isbn && dados.isbn.trim()) {
			const isbnLimpo = dados.isbn.replace(/[-\s]/g, "");
			if (!/^\d{10}(\d{3})?$/.test(isbnLimpo)) {
				errors.isbn = "ISBN deve ter formato válido (ISBN-10 ou ISBN-13)";
			}
		}

		if (
			dados.paginas &&
			(isNaN(dados.paginas) || parseInt(dados.paginas) < 1)
		) {
			errors.paginas = "Número de páginas deve ser um número positivo";
		}

		if (dados.resumo && dados.resumo.length > 1000) {
			errors.resumo = "Resumo não pode exceder 1000 caracteres";
		}

		return {
			isValid: Object.keys(errors).length === 0,
			errors,
		};
	},

	// Buscar tipos de obra da API
	async getTiposObra() {
		const response = await api.get("/api/works/types", { headers: this.getHeaders(false) });
		return response.data;
	},

	// Buscar categorias da API
	async getCategorias() {
		const response = await api.get("/api/categories", { headers: this.getHeaders(false) });
		return response.data;
	},

	// Buscar editoras da API (para autocomplete)
	async getEditoras(termo = "") {
		const response = await api.get(`/api/publishers/search?query=${encodeURIComponent(termo)}`, { headers: this.getHeaders(false) });
		return response.data;
	},

	// Verificar duplicatas por ISBN ou título
	async verificarDuplicata(isbn, titulo) {
		const params = new URLSearchParams();
		if (isbn) params.append("isbn", isbn);
		if (titulo) params.append("titulo", titulo);
		const response = await api.get(`/api/works/check-duplicate?${params}`, { headers: this.getHeaders() });
		return response.data;
	},

	// Buscar obra por ISBN (para preenchimento automático)
	async buscarPorISBN(isbn) {
		const response = await api.get(`/api/books/isbn/${isbn}`, { headers: this.getHeaders(false) });
		return response.data;
	},

	// Buscar detalhes de um livro
	async getBookById(id) {
		const res = await api.get(`/api/books/${id}`);
		// Normaliza os campos para o padrão esperado pelo frontend
		const { normalizeBook } = await import('../utils/normalizeUtils');
		return normalizeBook(res.data);
	},

	// Buscar livros relacionados
	async getRelatedBooks(id) {
		const res = await api.get(`/api/books/relacionados/${id}`);
		return res.data;
	},

	// Buscar livros recentes
	async getRecentBooks() {
		const res = await api.get(`/api/books/recentes`);
		return Array.isArray(res.data) ? res.data.map(normalizeBook) : [];
	},

	// Buscar livros (pesquisa)
	async searchBooks(params) {
		// Garante que só 'q' será enviado
		const onlyQ = {};
		if (params && params.q) {
			onlyQ.q = params.q;
		}
		const res = await api.get(`/api/books/search`, { params: onlyQ });
		return Array.isArray(res.data) ? res.data.map(normalizeBook) : [];
	},

	// Busca todos os livros do catálogo, com filtros opcionais
	async getBooks({ search, category, available } = {}) {
		const params = {};
		if (search) params.q = search;
		if (category) params.category = category;
		if (available !== undefined) params.available = available;
		const response = await api.get('/api/books', { params });
		return Array.isArray(response.data) ? response.data.map(normalizeBook) : [];
	},

	// Busca detalhes de um livro específico
	async getBookDetails(bookId) {
		return api.get(`/api/books/${bookId}`);
	},

	// Adiciona um novo livro ao catálogo
	async addBook(bookData, token) {
		const res = await api.post("/api/books", bookData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		window._frontReqResLog = window._frontReqResLog || [];
		window._frontReqResLog.push({
			endpoint: "/api/books",
			method: "POST",
			req: { body: bookData, headers: { Authorization: "Bearer ..." } },
			res: res.data,
		});
		return res;
	},

	// Atualiza informações de um livro
	async updateBook(bookId, bookData, token) {
		const res = await api.put(`/api/books/${bookId}`, bookData, {
			headers: { Authorization: `Bearer ${token}` },
		});
		window._frontReqResLog = window._frontReqResLog || [];
		window._frontReqResLog.push({
			endpoint: `/api/books/${bookId}`,
			method: "PUT",
			req: { body: bookData, headers: { Authorization: "Bearer ..." } },
			res: res.data,
		});
		return res;
	},

	// Remove um livro do catálogo
	async deleteBook(bookId, token) {
		const res = await api.delete(`/api/books/${bookId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		window._frontReqResLog = window._frontReqResLog || [];
		window._frontReqResLog.push({
			endpoint: `/api/books/${bookId}`,
			method: "DELETE",
			req: { headers: { Authorization: "Bearer ..." } },
			res: res.data,
		});
		return res;
	},

	// Métodos para rotas de obras avançadas
	getObras: async function(params = {}, token) {
		const res = await api.get("/api/works", {
			params,
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data;
	},

	catalogarObraAdmin: async function(data, token) {
		const res = await api.post("/api/admin/works/catalog", data, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data;
	},

	verificarDuplicataObra: async function(params = {}, token) {
		const res = await api.get("/api/works/check-duplicate", {
			params,
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data;
	},

	// Buscar por ISBN
	async getBookByISBN(isbn) {
		const res = await api.get(`/api/books/isbn/${isbn}`);
		return res.data;
	},

	// Buscar autores da API (para autocomplete)
	async getAutores(termo = "") {
		const response = await api.get(`/api/authors/search?query=${encodeURIComponent(termo)}`, { headers: this.getHeaders(false) });
		// Espera que a API retorne [{_id, nome}] ou [{id, nome}]
		return Array.isArray(response.data)
			? response.data.map(a => ({ label: a.nome, value: a._id || a.id }))
			: [];
	},

	// Cadastro rápido de autor
	async criarAutorRapido(nome) {
		const response = await api.post('/api/authors', { nome });
		return response.data;
	},

	// Cadastro rápido de editora
	async criarEditoraRapida(nome) {
		const response = await api.post('/api/publishers', { nome });
		return response.data;
	},
};

export default CatalogService;

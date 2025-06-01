// Serviço para comunicação com API de catalogação

import api from "./api";

export class CatalogService {
  
  // Headers padrão para as requisições
  static getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth) {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  // Catalogar nova obra
  static async catalogarObra(dadosObra, adminId) {
    try {
      const response = await api.post(
        "/admin/obras/catalogar",
        {
          ...dadosObra,
          adminId,
          dataCatalogacao: new Date().toISOString(),
          status: "ativo",
        },
        { headers: this.getHeaders() }
      );
      const result = response.data;
      return {
        success: true,
        data: result,
        message: "Obra catalogada com sucesso!",
      };
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
      if (error.message && error.message.includes("Network Error")) {
        throw new Error("Erro de conexão. Verifique sua internet e tente novamente.");
      }
      throw new Error(error.message || "Erro inesperado ao catalogar obra");
    }
  }

  // Validar dados antes de enviar para API
  static validarDadosObra(dados) {
    const errors = {};

    // Validações obrigatórias
    if (!dados.titulo?.trim()) {
      errors.titulo = 'Título é obrigatório';
    } else if (dados.titulo.trim().length < 2) {
      errors.titulo = 'Título deve ter pelo menos 2 caracteres';
    } else if (dados.titulo.trim().length > 255) {
      errors.titulo = 'Título não pode exceder 255 caracteres';
    }

    if (!dados.autor?.trim()) {
      errors.autor = 'Autor é obrigatório';
    } else if (dados.autor.trim().length < 2) {
      errors.autor = 'Nome do autor deve ter pelo menos 2 caracteres';
    } else if (dados.autor.trim().length > 100) {
      errors.autor = 'Nome do autor não pode exceder 100 caracteres';
    }

    if (!dados.tipo) {
      errors.tipo = 'Tipo de obra é obrigatório';
    }

    if (!dados.categoria) {
      errors.categoria = 'Categoria é obrigatória';
    }

    if (!dados.ano || isNaN(dados.ano)) {
      errors.ano = 'Ano de publicação é obrigatório';
    } else {
      const ano = parseInt(dados.ano);
      const anoAtual = new Date().getFullYear();
      if (ano < 1450 || ano > anoAtual + 1) {
        errors.ano = `Ano deve estar entre 1450 e ${anoAtual + 1}`;
      }
    }

    if (!dados.localizacao?.trim()) {
      errors.localizacao = 'Localização é obrigatória';
    }

    if (!dados.exemplares || isNaN(dados.exemplares) || parseInt(dados.exemplares) < 1) {
      errors.exemplares = 'Quantidade de exemplares deve ser pelo menos 1';
    }

    // Validações opcionais com formato
    if (dados.isbn && dados.isbn.trim()) {
      const isbnLimpo = dados.isbn.replace(/[-\s]/g, '');
      if (!/^\d{10}(\d{3})?$/.test(isbnLimpo)) {
        errors.isbn = 'ISBN deve ter formato válido (ISBN-10 ou ISBN-13)';
      }
    }

    if (dados.paginas && (isNaN(dados.paginas) || parseInt(dados.paginas) < 1)) {
      errors.paginas = 'Número de páginas deve ser um número positivo';
    }

    if (dados.resumo && dados.resumo.length > 1000) {
      errors.resumo = 'Resumo não pode exceder 1000 caracteres';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Buscar tipos de obra da API
  static async getTiposObra() {
    try {
      const response = await api.get("/obras/tipos", {
        headers: this.getHeaders(false),
      });
      return response.data;
    } catch (error) {
      throw new Error(
        "Não foi possível carregar tipos de obra. Verifique a conexão com a API."
      );
    }
  }

  // Buscar categorias da API
  static async getCategorias() {
    try {
      const response = await api.get("/obras/categorias", {
        headers: this.getHeaders(false),
      });
      return response.data;
    } catch (error) {
      throw new Error(
        "Não foi possível carregar categorias. Verifique a conexão com a API."
      );
    }
  }

  // Buscar editoras da API (para autocomplete)
  static async getEditoras(termo = "") {
    try {
      const response = await api.get(`/editoras/buscar?q=${encodeURIComponent(termo)}`, {
        headers: this.getHeaders(false),
      });
      return response.data;
    } catch (error) {
      return [];
    }
  }

  // Verificar duplicatas por ISBN ou título
  static async verificarDuplicata(isbn, titulo) {
    try {
      const params = new URLSearchParams();
      if (isbn) params.append("isbn", isbn);
      if (titulo) params.append("titulo", titulo);
      const response = await api.get(`/obras/verificar-duplicata?${params}`, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      return { existe: false, obras: [] };
    }
  }

  // Buscar obra por ISBN (para preenchimento automático)
  static async buscarPorISBN(isbn) {
    try {
      const response = await api.get(`/obras/isbn/${isbn}`, {
        headers: this.getHeaders(false),
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      return null;
    }
  }

  // Buscar detalhes de um livro
  static async getBookById(bookId, token) {
    const res = await api.get(`/livros/${bookId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }

  // Buscar livros relacionados
  static async getRelatedBooks(bookId, token) {
    const res = await api.get(`/livros/relacionados/${bookId}?limit=4`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }

  // Buscar livros recentes
  static async getRecentBooks(token) {
    const res = await api.get(`/livros/recentes?limit=3`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }

  // Buscar livros (pesquisa)
  static async searchBooks(params, token) {
    const res = await api.get(`/livros/buscar`, {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
}

export default CatalogService;
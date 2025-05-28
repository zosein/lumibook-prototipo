// Serviço para comunicação com API de catalogação

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
      console.log('[API CALL] POST /api/admin/obras/catalogar', {
        dados: dadosObra,
        adminId
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/obras/catalogar`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...dadosObra,
          adminId,
          dataCatalogacao: new Date().toISOString(),
          status: 'ativo'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('[API RESPONSE] Obra catalogada com sucesso:', result);
      return {
        success: true,
        data: result,
        message: 'Obra catalogada com sucesso!'
      };

    } catch (error) {
      console.error('[API ERROR] Erro ao catalogar obra:', error);
      
      // Tratar diferentes tipos de erro
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
      }
      
      throw new Error(error.message || 'Erro inesperado ao catalogar obra');
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
      const response = await fetch(`${API_BASE_URL}/api/obras/tipos`, {
        headers: this.getHeaders(false)
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar tipos de obra');
      }

      const tipos = await response.json();
      return tipos;

    } catch (error) {      console.error('[API ERROR] Erro ao buscar tipos de obra:', error);
      
      // Não usar fallback - forçar uso da API
      throw new Error('Não foi possível carregar tipos de obra. Verifique a conexão com a API.');
    }
  }

  // Buscar categorias da API
  static async getCategorias() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/obras/categorias`, {
        headers: this.getHeaders(false)
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar categorias');
      }

      const categorias = await response.json();
      return categorias;

    } catch (error) {      console.error('[API ERROR] Erro ao buscar categorias:', error);
      
      // Não usar fallback - forçar uso da API
      throw new Error('Não foi possível carregar categorias. Verifique a conexão com a API.');
    }
  }

  // Buscar editoras da API (para autocomplete)
  static async getEditoras(termo = '') {
    try {
      const url = `${API_BASE_URL}/api/editoras/buscar?q=${encodeURIComponent(termo)}`;
      const response = await fetch(url, {
        headers: this.getHeaders(false)
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar editoras');
      }

      const editoras = await response.json();
      return editoras;

    } catch (error) {
      console.warn('[API WARNING] Erro ao buscar editoras:', error);
      return [];
    }
  }

  // Verificar duplicatas por ISBN ou título
  static async verificarDuplicata(isbn, titulo) {
    try {
      const params = new URLSearchParams();
      if (isbn) params.append('isbn', isbn);
      if (titulo) params.append('titulo', titulo);

      const response = await fetch(`${API_BASE_URL}/api/obras/verificar-duplicata?${params}`, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error('Erro ao verificar duplicatas');
      }

      const resultado = await response.json();
      return resultado;

    } catch (error) {
      console.warn('[API WARNING] Erro ao verificar duplicata:', error);
      return { existe: false, obras: [] };
    }
  }

  // Buscar obra por ISBN (para preenchimento automático)
  static async buscarPorISBN(isbn) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/obras/isbn/${isbn}`, {
        headers: this.getHeaders(false)
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // ISBN não encontrado, não é erro
        }
        throw new Error('Erro ao buscar por ISBN');
      }

      const obra = await response.json();
      return obra;

    } catch (error) {
      console.warn('[API WARNING] Erro ao buscar por ISBN:', error);
      return null;
    }
  }
}

export default CatalogService;
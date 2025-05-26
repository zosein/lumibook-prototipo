import { useState, useEffect, useCallback } from 'react';
import CatalogService from '../services/CatalogService';

export const useCatalogacao = (adminId) => {
  // Estado do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    ano: '',
    tipo: '',
    categoria: '',
    editora: '',
    idioma: 'Português',
    paginas: '',
    resumo: '',
    localizacao: '',
    exemplares: 1
  });

  // Estado de controle
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [tiposObra, setTiposObra] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sugestaoEditoras, setSugestaoEditoras] = useState([]);
  const [verificandoDuplicata, setVerificandoDuplicata] = useState(false);

  // Carregar tipos e categorias na inicialização
  useEffect(() => {
    const carregarDados = async () => {
      setLoading(true);
      try {
        const [tiposData, categoriasData] = await Promise.all([
          CatalogService.getTiposObra(),
          CatalogService.getCategorias()
        ]);
        
        setTiposObra(tiposData);
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Atualizar campo do formulário
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo específico
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Limpar mensagem de sucesso
    if (success) {
      setSuccess('');
    }
  }, [errors, success]);

  // Buscar sugestões de editoras
  const buscarEditoras = useCallback(async (termo) => {
    if (termo.length < 2) {
      setSugestaoEditoras([]);
      return;
    }

    try {
      const editoras = await CatalogService.getEditoras(termo);
      setSugestaoEditoras(editoras);
    } catch (error) {
      console.error('Erro ao buscar editoras:', error);
      setSugestaoEditoras([]);
    }
  }, []);

  // Verificar duplicatas por ISBN
  const verificarDuplicata = useCallback(async (isbn, titulo) => {
    if (!isbn && !titulo) return;

    setVerificandoDuplicata(true);
    try {
      const resultado = await CatalogService.verificarDuplicata(isbn, titulo);
      
      if (resultado.existe) {
        setErrors(prev => ({
          ...prev,
          duplicata: `Possível duplicata encontrada: ${resultado.obras.map(o => o.titulo).join(', ')}`
        }));
      } else {
        setErrors(prev => ({ ...prev, duplicata: undefined }));
      }
      
      return resultado;
    } catch (error) {
      console.error('Erro ao verificar duplicata:', error);
    } finally {
      setVerificandoDuplicata(false);
    }
  }, []);

  // Buscar dados por ISBN
  const preencherPorISBN = useCallback(async (isbn) => {
    if (!isbn || isbn.length < 10) return;

    try {
      const obra = await CatalogService.buscarPorISBN(isbn);
      
      if (obra) {
        setFormData(prev => ({
          ...prev,
          titulo: obra.titulo || prev.titulo,
          autor: obra.autor || prev.autor,
          editora: obra.editora || prev.editora,
          ano: obra.ano || prev.ano,
          categoria: obra.categoria || prev.categoria,
          idioma: obra.idioma || prev.idioma,
          paginas: obra.paginas || prev.paginas,
          resumo: obra.resumo || prev.resumo
        }));

        setSuccess('Dados preenchidos automaticamente via ISBN!');
      }
    } catch (error) {
      console.error('Erro ao buscar por ISBN:', error);
    }
  }, []);

  // Validar formulário
  const validarFormulario = useCallback(() => {
    const validation = CatalogService.validarDadosObra(formData);
    setErrors(validation.errors);
    return validation.isValid;
  }, [formData]);

  // Submeter formulário
  const submitForm = useCallback(async () => {
    if (!validarFormulario()) {
      return { success: false, message: 'Por favor, corrija os erros antes de continuar.' };
    }

    setSubmitting(true);
    setErrors({});
    setSuccess('');

    try {
      const resultado = await CatalogService.catalogarObra(formData, adminId);
      
      if (resultado.success) {
        setSuccess(resultado.message);
        
        // Limpar formulário após sucesso
        setFormData({
          titulo: '',
          autor: '',
          isbn: '',
          ano: '',
          tipo: '',
          categoria: '',
          editora: '',
          idioma: 'Português',
          paginas: '',
          resumo: '',
          localizacao: '',
          exemplares: 1
        });

        return { success: true, data: resultado.data };
      }
    } catch (error) {
      const errorMessage = error.message || 'Erro ao catalogar obra';
      setErrors({ geral: errorMessage });
      return { success: false, message: errorMessage };
    } finally {
      setSubmitting(false);
    }
  }, [formData, adminId, validarFormulario]);

  // Limpar formulário
  const limparFormulario = useCallback(() => {
    setFormData({
      titulo: '',
      autor: '',
      isbn: '',
      ano: '',
      tipo: '',
      categoria: '',
      editora: '',
      idioma: 'Português',
      paginas: '',
      resumo: '',
      localizacao: '',
      exemplares: 1
    });
    setErrors({});
    setSuccess('');
  }, []);

  return {
    // Estado
    formData,
    loading,
    submitting,
    errors,
    success,
    tiposObra,
    categorias,
    sugestaoEditoras,
    verificandoDuplicata,
    
    // Ações
    updateField,
    buscarEditoras,
    verificarDuplicata,
    preencherPorISBN,
    validarFormulario,
    submitForm,
    limparFormulario
  };
};

export default useCatalogacao;
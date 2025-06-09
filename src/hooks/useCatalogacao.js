import { useState, useEffect, useCallback } from "react";
import CatalogService from "../services/CatalogService";
import { buscarLivroPorISBN } from '../utils/buscaLivroPorISBN';

export const useCatalogacao = (adminId) => {
	// Estado do formulário
	const [formData, setFormData] = useState({
		isbn: "",
		ano: "",
		tipo: "",
		categoria: "",
		editora: "",
		idioma: "Português",
		paginas: "",
		resumo: "",
		localizacao: "",
		exemplares: 1,
		autor: "",
		titulo: "",
	});

	// Estado de controle
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState({});
	const [success, setSuccess] = useState("");
	const [tiposObra, setTiposObra] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [sugestaoEditoras, setSugestaoEditoras] = useState([]);
	const [verificandoDuplicata, setVerificandoDuplicata] = useState(false);
	const [capaUrl, setCapaUrl] = useState(null);

	// Carregar tipos e categorias na inicialização
	useEffect(() => {
		const carregarDados = async () => {
			setLoading(true);
			try {
				const [tiposData, categoriasData] = await Promise.all([
					CatalogService.getTiposObra(),
					CatalogService.getCategorias(),
				]);
				setTiposObra(tiposData);
				setCategorias(categoriasData.categorias || categoriasData);
			} catch (error) {
				console.error("Erro ao carregar dados iniciais:", error);
			} finally {
				setLoading(false);
			}
		};

		carregarDados();
	}, []);

	// Atualizar campo do formulário
	const updateField = useCallback(
		(field, value) => {
			setFormData((prev) => ({ ...prev, [field]: value }));
			setErrors((prev) => ({ ...prev, [field]: undefined }));
			if (success) setSuccess("");
		},
		[success]
	);

	const buscarEditoras = useCallback(async (termo) => {
		if (termo.length < 2) return setSugestaoEditoras([]);
		try {
			const editoras = await CatalogService.getEditoras(termo);
			setSugestaoEditoras(editoras);
		} catch (error) {
			console.error("Erro ao buscar editoras:", error);
			setSugestaoEditoras([]);
		}
	}, []);

	const verificarDuplicata = useCallback(async (isbn, titulo) => {
		if (!isbn && !titulo) return;
		setVerificandoDuplicata(true);
		try {
			const resultado = await CatalogService.verificarDuplicata(isbn, titulo);
			if (resultado.existe) {
				setErrors((prev) => ({
					...prev,
					duplicata: `Possível duplicata encontrada: ${resultado.obras
						.map((o) => o.titulo)
						.join(", ")}`,
				}));
			} else {
				setErrors((prev) => ({ ...prev, duplicata: undefined }));
			}
			return resultado;
		} catch (error) {
			console.error("Erro ao verificar duplicata:", error);
		} finally {
			setVerificandoDuplicata(false);
		}
	}, []);

	const preencherPorISBN = useCallback(async (isbn) => {
		if (!isbn || isbn.length < 10) return;
		try {
			let obra = await CatalogService.buscarPorISBN(isbn);
			if (!obra) {
				// Busca no utilitário centralizado (OpenLibrary + Google Books)
				obra = await buscarLivroPorISBN(isbn);
			}
			if (obra) {
				setFormData((prev) => ({
					...prev,
					titulo: obra.titulo || prev.titulo,
					autor: obra.autor || prev.autor,
					editora: obra.editora || prev.editora,
					ano: obra.ano || prev.ano,
					idioma: obra.idioma || prev.idioma,
					paginas: obra.paginas || prev.paginas,
					resumo: obra.resumo || prev.resumo,
					categoria: obra.categoria || prev.categoria,
				}));
				setCapaUrl(obra.capa || null);
				setSuccess("Dados preenchidos automaticamente via ISBN!");
			} else {
				setCapaUrl(null);
			}
		} catch (error) {
			setCapaUrl(null);
			console.error("Erro ao buscar por ISBN:", error);
		}
	}, []);

	const validarFormulario = useCallback(() => {
		// Garantir que a validação veja autores como array
		const dadosParaValidar = {
			...formData,
			autores: formData.autor ? [formData.autor] : [],
		};
		const validation = CatalogService.validarDadosObra(dadosParaValidar);
		setErrors(validation.errors);
		return validation.isValid;
	}, [formData]);

	const submitForm = useCallback(async () => {
		console.log('Dados enviados para catalogar:', formData);
		console.log('Valor de formData.titulo no submit:', formData.titulo);
		if (!validarFormulario()) {
			console.log('Validação falhou:', errors);
			return {
				success: false,
				message: "Por favor, corrija os erros antes de continuar.",
			};
		}
		console.log('Validação passou, enviando para o backend...');
		setSubmitting(true);
		setErrors({});
		setSuccess("");
		try {
			// Enviar apenas os campos esperados pelo backend
			const dadosEnvio = {
				isbn: formData.isbn,
				ano: formData.ano,
				tipo: formData.tipo,
				categoria: formData.categoria,
				editora: formData.editora,
				idioma: formData.idioma,
				paginas: formData.paginas,
				resumo: formData.resumo,
				localizacao: formData.localizacao,
				exemplares: formData.exemplares,
				title: formData.titulo,
				authors: formData.autor ? [formData.autor] : [],
			};
			console.log('Payload final para o backend:', dadosEnvio);
			const resultado = await CatalogService.catalogarObra(dadosEnvio, adminId);
			console.log('Resultado da API:', resultado);
			if (resultado.success) {
				setSuccess(resultado.message);
				setFormData({
					isbn: "",
					ano: "",
					tipo: "",
					categoria: "",
					editora: "",
					idioma: "Português",
					paginas: "",
					resumo: "",
					localizacao: "",
					exemplares: 1,
					autor: "",
					titulo: "",
				});
				return { success: true, data: resultado.data };
			}
		} catch (error) {
			console.error('Erro ao catalogar:', error);
			const errorMessage = error.message || "Erro ao catalogar obra";
			setErrors({ geral: errorMessage });
			return { success: false, message: errorMessage };
		} finally {
			setSubmitting(false);
		}
	}, [formData, adminId, validarFormulario]);

	const limparFormulario = useCallback(() => {
		setFormData({
			isbn: "",
			ano: "",
			tipo: "",
			categoria: "",
			editora: "",
			idioma: "Português",
			paginas: "",
			resumo: "",
			localizacao: "",
			exemplares: 1,
			autor: "",
			titulo: "",
		});
		setErrors({});
		setSuccess("");
	}, []);

	return {
		formData,
		loading,
		submitting,
		errors,
		success,
		tiposObra,
		categorias,
		sugestaoEditoras,
		verificandoDuplicata,
		updateField,
		buscarEditoras,
		verificarDuplicata,
		preencherPorISBN,
		validarFormulario,
		submitForm,
		limparFormulario,
		capaUrl,
	};
};

export default useCatalogacao;

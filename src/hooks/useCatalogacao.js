import { useState, useCallback } from "react";
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
		editoraLabel: "",
		idioma: "Português",
		paginas: "",
		resumo: "",
		localizacao: "",
		exemplares: 1,
		autor: "",
		autorLabel: "",
		titulo: "",
	});

	// Estado de controle
	const [submitting, setSubmitting] = useState(false);
	const [errors, setErrors] = useState({});
	const [success, setSuccess] = useState("");
	const [sugestaoEditoras, setSugestaoEditoras] = useState([]);
	const [sugestaoAutores, setSugestaoAutores] = useState([]);
	const [verificandoDuplicata, setVerificandoDuplicata] = useState(false);
	const [capaUrl, setCapaUrl] = useState(null);

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

	const buscarAutores = useCallback(async (termo) => {
		if (termo.length < 2) return setSugestaoAutores([]);
		try {
			const autores = await CatalogService.getAutores(termo);
			setSugestaoAutores(autores);
		} catch (error) {
			console.error("Erro ao buscar autores:", error);
			setSugestaoAutores([]);
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
			// Busca OpenLibrary
			let dadosLivro = null;
			try {
				dadosLivro = await buscarLivroPorISBN(isbn); // agora só OpenLibrary
			} catch (e) {
				dadosLivro = null;
			}

			// Busca local (opcional)
			let obraLocal = null;
			try {
				obraLocal = await CatalogService.buscarPorISBN(isbn);
			} catch (error) {
				obraLocal = null;
			}

			// Preencher diretamente com o nome do autor/editora, sem buscar ID
			let autorLabel = dadosLivro?.autor || obraLocal?.autor || '';
			let editoraLabel = dadosLivro?.editora || obraLocal?.editora || '';
			let categoria = dadosLivro?.categoria || obraLocal?.categoria || '';

			// Fallback da capa: se não houver capa no OpenLibrary, tenta Google Books
			let capaUrl = dadosLivro?.capa || null;
			if (!capaUrl) {
				try {
					const googleData = await import('../utils/buscaLivroPorISBN');
					const googleLivro = await googleData.buscarLivroGoogleBooks(isbn);
					if (googleLivro && googleLivro.capa) {
						capaUrl = googleLivro.capa;
					}
					// Fallback para autor/editora/categoria do Google Books se não vier do OpenLibrary
					if (!autorLabel && googleLivro?.autor) autorLabel = googleLivro.autor;
					if (!editoraLabel && googleLivro?.editora) editoraLabel = googleLivro.editora;
					if (!categoria && googleLivro?.categoria) categoria = googleLivro.categoria;
				} catch {}
			}

			setFormData((prev) => ({
				...prev,
				titulo: dadosLivro?.titulo?.trim() ? dadosLivro.titulo : (obraLocal?.titulo || prev.titulo),
				autor: '', // Não seta ID
				autorLabel: autorLabel || prev.autorLabel,
				editora: '', // Não seta ID
				editoraLabel: editoraLabel || prev.editoraLabel,
				categoria: categoria || prev.categoria,
				ano: dadosLivro?.ano || obraLocal?.ano || prev.ano,
				idioma: dadosLivro?.idioma || obraLocal?.idioma || prev.idioma,
				paginas: (dadosLivro?.paginas ?? obraLocal?.paginas ?? prev.paginas)?.toString() || '',
				resumo: dadosLivro?.resumo || obraLocal?.resumo || prev.resumo,
				isbn: prev.isbn,
				tipo: prev.tipo,
				localizacao: prev.localizacao,
			}));
			setCapaUrl(capaUrl);
			setSuccess("Dados preenchidos automaticamente via ISBN!");
			setErrors((prev) => ({ ...prev, isbn: undefined })); // Limpa erro de ISBN
		} catch (error) {
			setCapaUrl(null);
			setSuccess("");
			setErrors((prev) => ({ ...prev, isbn: undefined })); // Não mostra erro
		}
	}, []);

	const validarFormulario = useCallback(() => {
		// Garantir que a validação veja autores como array
		const autoresValidados = formData.autor ? [formData.autor] : (formData.autorLabel ? [formData.autorLabel] : []);
		const dadosParaValidar = {
			...formData,
			autores: autoresValidados,
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
			// Enviar sempre authors como array de strings (nomes) e publisher como string.
			// O campo ano deve ser enviado como número (parseInt), não string.
			// O campo stock permanece igual (Number(formData.exemplares)).
			// Não buscar ou enviar IDs de autor/editora, apenas nomes.
			// O payload deve ser compatível com o backend conforme instrução.
			const dadosEnvio = {
				title: formData.titulo,
				authors: formData.autorLabel ? [formData.autorLabel] : [],
				publisher: formData.editoraLabel || formData.editora || '',
				category: formData.categoria,
				stock: Number(formData.exemplares),
				idioma: formData.idioma,
				localizacao: formData.localizacao,
				paginas: formData.paginas ? parseInt(formData.paginas) : undefined,
				resumo: formData.resumo,
				tipo: formData.tipo,
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
					editoraLabel: "",
					idioma: "Português",
					paginas: "",
					resumo: "",
					localizacao: "",
					exemplares: 1,
					autor: "",
					autorLabel: "",
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
	}, [formData, adminId, validarFormulario, errors]);

	const limparFormulario = useCallback(() => {
		setFormData({
			isbn: "",
			ano: "",
			tipo: "",
			categoria: "",
			editora: "",
			editoraLabel: "",
			idioma: "Português",
			paginas: "",
			resumo: "",
			localizacao: "",
			exemplares: 1,
			autor: "",
			autorLabel: "",
			titulo: "",
		});
		setErrors({});
		setSuccess("");
		setCapaUrl(null);
	}, []);

	return {
		formData,
		setFormData,
		submitting,
		errors,
		success,
		sugestaoEditoras,
		sugestaoAutores,
		verificandoDuplicata,
		updateField,
		buscarEditoras,
		buscarAutores,
		verificarDuplicata,
		preencherPorISBN,
		validarFormulario,
		submitForm,
		limparFormulario,
		capaUrl,
	};
};

export default useCatalogacao;

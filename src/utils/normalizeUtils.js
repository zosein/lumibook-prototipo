// src/utils/normalizeUtils.js
import { formatTimeAgo } from "./dateUtils";

export function normalizeActivityData(activity) {
	return {
		id: activity.id,
		action: activity.descricao || activity.action,
		details: activity.detalhes || activity.details,
		time: activity.dataHora
			? formatTimeAgo(new Date(activity.dataHora))
			: "Recente",
		icon: activity.icon || "Activity",
		color: activity.cor || "blue",
		userId: activity.userId || activity.usuarioId,
	};
}

// Normaliza um usuário para o padrão
export function normalizeUser(user) {
	if (!user) return user;
	return {
		id: user.id || user._id || user.usuarioId,
		nome: user.nome || user.name || user.usuario,
		email: user.email,
		papel: user.papel || user.role,
		matricula: user.matricula,
		tipoLogin: user.tipoLogin,
		avatarUrl: user.avatarUrl || user.avatar,
		statusConta: user.statusConta || user.status,
		telefone: user.telefone || user.phone,
	};
}

// Normaliza um livro para o padrão
export function normalizeBook(book) {
	if (!book) return book;

	// Normalização de exemplares
	let exemplares = { disponiveis: 0, total: 0 };
	if (Array.isArray(book.exemplares)) {
		const valor = book.exemplares[0];
		// Se for array de objetos (ex: [{codigo, status}])
		if (typeof valor === 'object' && valor !== null) {
			exemplares.total = book.exemplares.length;
			exemplares.disponiveis = book.exemplares.filter(e => e.status === 'disponivel' || e.status === 'available').length;
		} else {
			// Se for array e o primeiro item for número ou string numérica, usar como total/disponíveis
			const num = typeof valor === 'string' ? parseInt(valor, 10) : valor;
			if (!isNaN(num)) {
				exemplares.total = num;
				exemplares.disponiveis = (book.stock !== undefined ? book.stock : num);
			} else {
				exemplares.total = book.exemplares.length;
				exemplares.disponiveis = (book.stock !== undefined ? book.stock : 0);
			}
		}
	} else if (typeof book.exemplares === 'number') {
		exemplares.total = book.exemplares;
		exemplares.disponiveis = (book.stock !== undefined ? book.stock : book.exemplares);
	} else if (typeof book.exemplares === 'object' && book.exemplares !== null) {
		exemplares.total = book.exemplares.total ?? book.exemplares.disponiveis ?? 0;
		exemplares.disponiveis = book.exemplares.disponiveis ?? 0;
	} else {
		exemplares.total = 0;
		exemplares.disponiveis = 0;
	}

	return {
		id: book.id || book._id || book.livroId,
		titulo: book.titulo || book.title,
		autores: Array.isArray(book.autores) ? book.autores : (book.authors ? book.authors : (book.autor ? [book.autor] : [])),
		autor: book.autor || (Array.isArray(book.authors) ? book.authors[0] : ''),
		isbn: book.isbn,
		ano: book.ano,
		tipo: book.tipo,
		categoria: book.categoria,
		editora: book.editora,
		exemplares,
		stock: book.stock,
		disponivel: book.disponivel,
		resumo: book.resumo,
		capa: book.capa,
		edicao: book.edicao || book.edition,
		paginas: book.paginas,
		localizacao: book.localizacao || book.location,
		idioma: book.idioma || book.language,
		// Campos extras do payload
		...book
	};
}

// Normaliza uma reserva para o padrão
export function normalizeReservation(res) {
	if (!res) return res;
	return {
		id: res.id || res._id,
		userId: res.userId || res.usuarioId,
		bookId: res.bookId || res.livroId,
		status: res.status,
		dataReserva: res.dataReserva,
	};
}

// Normaliza uma multa para o padrão
export function normalizeFine(fine) {
	if (!fine) return fine;
	return {
		id: fine.id || fine._id,
		userId: fine.userId || fine.usuarioId,
		valor: fine.valor,
		descricao: fine.descricao,
		status: fine.status,
	};
}

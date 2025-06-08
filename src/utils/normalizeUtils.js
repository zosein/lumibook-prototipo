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
	return {
		id: book.id || book._id || book.livroId,
		titulo: book.titulo || book.title,
		autores: Array.isArray(book.autores) ? book.autores : (book.autor ? [book.autor] : []),
		isbn: book.isbn,
		ano: book.ano,
		tipo: book.tipo,
		categoria: book.categoria,
		editora: book.editora,
		exemplares: book.exemplares,
		disponivel: book.disponivel,
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

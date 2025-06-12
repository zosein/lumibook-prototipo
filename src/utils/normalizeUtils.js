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
		matricula: user.matricula,
		papel: user.papel || user.role,
		avatar: user.avatar,
		statusConta: user.statusConta || user.status,
		membroDesde: user.membroDesde,
		token: user.token,
	};
}

// Normaliza um livro para o padrão
export function normalizeBook(book) {
	if (!book) return book;

	// Tradução dos tipos conhecidos para português
	const tipoMap = {
		'Book': 'Livro',
		'Thesis': 'Tese',
		'Periodical': 'Periódico',
		'E-book': 'E-book',
		'Livro': 'Livro',
		'Tese': 'Tese',
		'Periódico': 'Periódico',
	};

	// Normalização de exemplares
	let exemplares = { disponiveis: 0, total: 0 };
	if (typeof book.stock === 'number') {
		exemplares.total = book.stock;
		exemplares.disponiveis = book.stock;
	} else if (Array.isArray(book.exemplares) && book.exemplares.length > 0) {
		const valor = book.exemplares[0];
		if (typeof valor === 'object' && valor !== null) {
			exemplares.total = book.exemplares.length;
			exemplares.disponiveis = book.exemplares.filter(e => {
				const status = (e.status || '').toLowerCase();
				return status === 'disponivel' || status === 'disponível' || status === 'available';
			}).length;
		} else {
			const num = typeof valor === 'string' ? parseInt(valor, 10) : valor;
			if (!isNaN(num)) {
				exemplares.total = num;
				exemplares.disponiveis = num;
			} else {
				exemplares.total = book.exemplares.length;
				exemplares.disponiveis = 0;
			}
		}
	} else if (typeof book.exemplares === 'number') {
		exemplares.total = book.exemplares;
		exemplares.disponiveis = book.exemplares;
	} else if (typeof book.exemplares === 'object' && book.exemplares !== null) {
		exemplares.total = book.exemplares.total ?? book.exemplares.disponiveis ?? 0;
		exemplares.disponiveis = book.exemplares.disponiveis ?? 0;
	} else {
		exemplares.total = typeof book.stock === 'number' ? book.stock : 0;
		exemplares.disponiveis = typeof book.stock === 'number' ? book.stock : 0;
	}

	// Normalização de autor
	let autor = '';
	if (book.autor) {
		autor = book.autor;
	} else if (Array.isArray(book.authors) && book.authors.length > 0) {
		// Se vier array de IDs, mostra 'Autor desconhecido'
		if (typeof book.authors[0] === 'string' && book.authors[0].length === 24) {
			autor = 'Autor desconhecido';
		} else {
			autor = book.authors[0];
		}
	} else if (Array.isArray(book.autores) && book.autores.length > 0) {
		autor = book.autores[0];
	} else {
		autor = 'Autor desconhecido';
	}

	// Normalização de autores (array)
	let autores = [];
	if (Array.isArray(book.autores) && book.autores.length > 0) {
		autores = book.autores;
	} else if (Array.isArray(book.authors) && book.authors.length > 0) {
		// Se vier array de IDs, retorna array vazio
		if (typeof book.authors[0] === 'string' && book.authors[0].length === 24) {
			autores = [];
		} else {
			autores = book.authors;
		}
	} else if (book.autor) {
		autores = [book.autor];
	}

	return {
		id: book.id || book._id || book.livroId,
		titulo: book.titulo || book.title,
		autores,
		autor,
		isbn: book.isbn,
		ano: book.ano,
		tipo: tipoMap[book.tipo] || book.tipo,
		categoria: book.categoria,
		editora: book.editora || 'Não informado',
		stock: book.stock,
		disponivel: book.disponivel,
		resumo: book.resumo,
		capa: book.capa,
		edicao: book.edicao || book.edition || '1ª edição',
		paginas: book.paginas,
		localizacao: book.localizacao || book.location,
		idioma: book.idioma || book.language,
		exemplares,
		...book
	};
}

// Normaliza uma reserva para o padrão
export function normalizeReservation(res) {
	if (!res) return res;
	return {
		id: res.id || res._id,
		tituloLivro: res.tituloLivro,
		dataReserva: res.dataReserva,
		status: res.status,
	};
}

// Normaliza uma multa para o padrão
export function normalizeFine(fine) {
	if (!fine) return fine;
	return {
		id: fine.id || fine._id,
		valor: fine.valor,
		motivo: fine.motivo,
	};
}

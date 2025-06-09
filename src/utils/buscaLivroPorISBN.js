import translate from 'translate';

// Função auxiliar para buscar resumo no Google Books
async function buscarResumoGoogleBooks(isbn, precisaResumo = true, precisaEdicao = true) {
  try {
    const isbnLimpo = isbn.replace(/[-\s]/g, '');
    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbnLimpo}`;
    const response = await fetch(url);
    const data = await response.json();
    let resumo = '';
    let edicao = '';
    if (data.totalItems > 0 && data.items[0].volumeInfo) {
      const info = data.items[0].volumeInfo;
      if (precisaResumo && info.description) resumo = info.description;
      if (precisaEdicao && info.edition) edicao = info.edition;
      // Algumas vezes a edição está no título
      if (precisaEdicao && !edicao && info.title) {
        const match = info.title.match(/\b(\d+)[ªa] edição\b/i);
        if (match) edicao = match[0];
      }
    }
    return { resumo, edicao };
  } catch (e) {
    return { resumo: '', edicao: '' };
  }
}

// Função para buscar dados do OpenLibrary
async function buscarLivroOpenLibrary(isbn) {
  const isbnLimpo = isbn.replace(/[-\s]/g, '');
  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbnLimpo}&format=json&jscmd=data`;
  const response = await fetch(url);
  const data = await response.json();
  const livro = data[`ISBN:${isbnLimpo}`];
  if (!livro) return null;

  // Converter idioma para nome amigável se possível
  let idioma = 'Português';
  if (livro.languages && livro.languages[0]?.key) {
    const langKey = livro.languages[0].key.replace('/languages/', '');
    const idiomasMap = { por: 'Português', eng: 'Inglês', spa: 'Espanhol', fra: 'Francês', deu: 'Alemão', ita: 'Italiano' };
    idioma = idiomasMap[langKey] || langKey;
  }

  // Edição
  let edicao = livro.edition_name || livro.edition || '';

  // Resumo pode estar em notes (objeto ou string), subtitle ou description
  let resumo = '';
  if (typeof livro.notes === 'string') resumo = livro.notes;
  else if (livro.notes?.value) resumo = livro.notes.value;
  else if (livro.subtitle) resumo = livro.subtitle;
  else if (typeof livro.description === 'string') resumo = livro.description;
  else if (livro.description?.value) resumo = livro.description.value;

  // Fallback: buscar no Google Books se não houver resumo ou edição
  if (!resumo || !edicao) {
    const googleData = await buscarResumoGoogleBooks(isbn, !resumo, !edicao);
    if (!resumo && googleData.resumo) resumo = googleData.resumo;
    if (!edicao && googleData.edicao) edicao = googleData.edicao;
  }

  // Se ainda não houver edição, sugerir padrão
  if (!edicao) edicao = '1ª edição';

  // Se ainda não houver resumo, exibir mensagem amigável
  if (!resumo) {
    resumo = 'Resumo não disponível automaticamente. Preencha manualmente se desejar.';
  }

  // Pega só o primeiro parágrafo ou frase
  if (resumo) {
    const splitParagrafo = resumo.split(/\n|\r|\./).map(s => s.trim()).filter(Boolean);
    resumo = splitParagrafo[0] || resumo;
  }

  // Limitar o resumo a 250 caracteres
  if (resumo && resumo.length > 250) resumo = resumo.slice(0, 250) + '...';

  // Traduzir para português se não estiver em português
  let resumoTraduzido = resumo;
  if (resumo && idioma !== 'Português') {
    try {
      resumoTraduzido = await translate(resumo, { to: 'pt' });
      if (resumoTraduzido.length > 250) resumoTraduzido = resumoTraduzido.slice(0, 250) + '...';
    } catch (e) {
      resumoTraduzido = resumo;
    }
  }

  // Extrair apenas o ano numérico do publish_date
  let ano = '';
  if (livro.publish_date) {
    const matchAno = livro.publish_date.match(/(\d{4})/);
    if (matchAno) ano = matchAno[1];
  }

  // Categoria: usar o gênero mais frequente do OpenLibrary, se disponível
  let categoria = '';
  if (livro.genres && Array.isArray(livro.genres) && livro.genres.length > 0) {
    // Contar ocorrências de cada gênero
    const freq = {};
    livro.genres.forEach(g => {
      if (typeof g === 'string') freq[g] = (freq[g] || 0) + 1;
    });
    // Pega o gênero mais frequente
    const maisFrequente = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
    if (maisFrequente) categoria = maisFrequente[0];
  }
  // Traduzir categoria para português se necessário
  let categoriaTraduzida = categoria;
  if (categoria && !/^[a-zA-ZáéíóúãõâêîôûçàèìòùäëïöüÁÉÍÓÚÃÕÂÊÎÔÛÇÀÈÌÒÙÄËÏÖÜ\s-]+$/.test(categoria)) {
    try {
      categoriaTraduzida = await translate(categoria, { to: 'pt' });
    } catch (e) {
      categoriaTraduzida = categoria;
    }
  }

  return {
    titulo: livro.title || '',
    autor: livro.authors?.[0]?.name || '',
    editora: livro.publishers?.[0]?.name || '',
    ano,
    idioma,
    paginas: livro.number_of_pages || '',
    resumo: resumoTraduzido,
    categoria: categoriaTraduzida,
    capa: livro.cover?.large || livro.cover?.medium || livro.cover?.small || '',
    edicao,
  };
}

// Função principal: busca por ISBN com fallback
export async function buscarLivroPorISBN(isbn) {
  // Primeiro tenta OpenLibrary (com fallback Google Books já embutido)
  const dados = await buscarLivroOpenLibrary(isbn);
  return dados;
} 
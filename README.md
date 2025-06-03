# LumiBook - Sistema de Biblioteca Digital

LumiBook é uma aplicação web para sistemas de biblioteca, permitindo buscar, visualizar detalhes e gerenciar obras do acervo (outras funcionalidades ainda em desenvolvimento).

## Funcionalidades

- Busca de Obras: Pesquise por título, autor ou assunto
- Filtros Avançados: Filtre por tipo de material, ano de publicação, idioma e disponibilidade
- Visualização do Acervo: Navegue pelas categorias e obras recentes
- Detalhes Completos: Veja informações detalhadas de cada obra
- Layout Responsivo: Funciona em dispositivos móveis e desktop

### Tecnologias Utilizadas

- React
- Tailwind CSS para estilização
- Lucide React para ícones
- Estrutura de componentes modular

### Instalação

Clone o repositório e instale as dependências:

- git clone github.com/zosein/lumibook-prototipo
- npm install
- npm install lucide

### Executando o Projeto

- npm run build - otimiza o app para a produção
- npm test - executa os testes
- npm start - inicia o servidor de desenvolvimento

O aplicativo estará disponível em http://localhost:3000

### Estrutura do Projeto

src/
├── components/
│ ├── Header.jsx # Cabeçalho da aplicação
│ ├── SearchBar.jsx # Barra de pesquisa com filtros
│ ├── NavigationBar.jsx # Barra de navegação inferior
│ ├── HomeContent.jsx # Conteúdo da página inicial
│ ├── ResultList.jsx # Lista de resultados de pesquisa
│ └── BookDetails.jsx # Detalhes do livro
├── data/
│ └── sampleData.js # Dados de exemplo para a aplicação
├── pages/
│ ├── HomePage.jsx # Página inicial
│ ├── SearchResultsPage.jsx # Página de resultados de pesquisa
│ └── DetailsPage.jsx # Página de detalhes do livro
└── App.jsx # Componente principal da aplicação

## Exportação de Log de Requisições/Respostas

Na página de perfil do admin/bibliotecário, utilize o botão "Exportar Log de Req/Res" para baixar um arquivo JSON contendo todas as requisições e respostas do front relacionadas ao cadastro de bibliotecário e gerenciamento de livros. Use este arquivo para validar a compatibilidade com o back-end.

## Licença

Este projeto está licenciado sob a licença MIT.

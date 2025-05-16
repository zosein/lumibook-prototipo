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

git clone [url-do-repositorio]
cd lumibook-prototipo
npm install
npm install lucide

### Executando o Projeto

npm run build - otimiza o app para a produção
npm test - executa os testes
npm start - inicia o servidor de desenvolvimento

O aplicativo estará disponível em http://localhost:3000

### Estrutura do Projeto

src/
├── components/ # Componentes reutilizáveis
│ ├── BookDetails.jsx
│ ├── Header.jsx
│ ├── HomeContent.jsx
│ ├── NavigationBar.jsx
│ ├── ResultList.jsx
│ └── SearchBar.jsx
├── data/ # Dados de exemplo
│ └── sampleData.js
├── pages/ # Páginas da aplicação(ainda com páginas a fazer, ex: login, cadastro, etc)
│ ├── DetailsPage.jsx
│ ├── HomePage.jsx
│ └── SearchResultsPage.jsx
└── App.jsx # Componente principal

## Licença

Este projeto está licenciado sob a licença MIT.

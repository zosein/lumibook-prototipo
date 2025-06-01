# Formatos de Resposta JSON Esperados pelo Front-end

Este arquivo documenta os formatos de resposta JSON que o front-end espera receber da API, com base na análise minuciosa dos serviços, páginas e componentes do projeto.

---

## 1. Usuários (Cadastro e Login)

### Cadastro (`/usuarios/register`)
- **Enviado:**
  ```json
  {
    "nome": "João da Silva",
    "email": "joao@email.com",
    "senha": "senha123"
  }
  ```
- **Esperado na resposta:**
  - Sucesso: `{ success: true, message: string, data: { ...usuario } }`
  - Erro: `{ success: false, message: string }`

### Login (`/usuarios/login`)
- **Enviado:**
  ```json
  {
    "identificador": "joao@email.com",
    "senha": "senha123"
  }
  ```
- **Esperado na resposta:**
  ```json
  {
    "token": "<jwt>",
    "id": "...",
    "nome": "João da Silva",
    "email": "joao@email.com",
    "papel": "aluno|professor|admin",
    ...
  }
  ```

---

## 2. Livros / Obras

### Busca de Livros (`/livros/buscar`)
- **Esperado na resposta:**
  ```json
  [
    {
      "id": "...",
      "titulo": "O Senhor dos Anéis",
      "autor": "J.R.R. Tolkien",
      "ano": 1954,
      "tipo": "Fantasia",
      "categoria": "Fantasia",
      "disponivel": true,
      "isbn": "...",
      "localizacao": "Estante A",
      "edicao": "1ª edição",
      "idioma": "Português"
    },
    ...
  ]
  ```

### Detalhes do Livro (`/livros/:id`)
- **Esperado na resposta:**
  ```json
  {
    "id": "...",
    "titulo": "O Senhor dos Anéis",
    "autor": "J.R.R. Tolkien",
    "ano": 1954,
    "tipo": "Fantasia",
    "categoria": "Fantasia",
    "isbn": "...",
    "localizacao": "Estante A",
    "edicao": "1ª edição",
    "idioma": "Português",
    "sinopse": "Uma aventura épica...",
    "paginas": 1200,
    ...
  }
  ```

---

## 3. Reservas

### Criar Reserva (`/reservas`)
- **Enviado:**
  ```json
  {
    "usuarioId": "...",
    "livroId": "...",
    "exemplarId": "...",
    "dataReserva": "2024-06-01T12:00:00.000Z"
  }
  ```
- **Esperado na resposta:**
  ```json
  {
    "id": "...",
    "usuarioId": "...",
    "livroId": "...",
    "exemplarId": "...",
    "dataReserva": "2024-06-01T12:00:00.000Z",
    "status": "ativa|cancelada|expirada"
  }
  ```

### Listar Reservas Ativas (`/reservas?userId=...`)
- **Esperado:** Array de objetos no formato acima.

---

## 4. Multas

### Listar Multas Ativas (`/multas?userId=...`)
- **Esperado:**
  ```json
  [
    {
      "id": "...",
      "usuarioId": "...",
      "reservaId": "...",
      "valor": 10.50,
      "status": "pendente|paga"
    },
    ...
  ]
  ```

---

## 5. Empréstimos

### Criar Empréstimo (`/emprestimos`)
- **Enviado:**
  ```json
  {
    "usuarioId": "...",
    "livroId": "...",
    "itens": [ { "exemplarId": "..." } ],
    "dataEmprestimo": "2024-06-01T12:00:00.000Z",
    "dataPrevistaDevolucao": "2024-06-15T12:00:00.000Z"
  }
  ```
- **Esperado na resposta:**
  ```json
  {
    "id": "...",
    "usuarioId": "...",
    "livroId": "...",
    "itens": [ { "exemplarId": "..." } ],
    "dataEmprestimo": "2024-06-01T12:00:00.000Z",
    "dataPrevistaDevolucao": "2024-06-15T12:00:00.000Z",
    "status": "ativo|finalizado"
  }
  ```

---

## 6. Estatísticas do Usuário

### (`/alunos/:id/estatisticas` ou `/professores/:id/estatisticas`)
- **Esperado:**
  ```json
  {
    "livrosEmprestados": 2,
    "livrosDisponiveis": 1,
    "limiteConcorrente": 3,
    "devolucoesPendentes": 0,
    "reservasAtivas": 1,
    "historicoEmprestimos": 5,
    "ultimaAtualizacao": "2024-06-01T12:00:00.000Z",
    "fonte": "api",
    "tipoUsuario": "aluno",
    "multasPendentes": 0,
    "pontosUsuario": 0
  }
  ```

---

## 7. Catalogação de Obras (Admin)

### (`/admin/obras/catalogar`)
- **Enviado:**
  ```json
  {
    "titulo": "...",
    "autor": "...",
    "isbn": "...",
    "ano": 2024,
    "tipo": "Livro",
    "categoria": "Literatura",
    "editora": "...",
    "idioma": "Português",
    "paginas": 350,
    "resumo": "...",
    "localizacao": "Estante A",
    "exemplares": 1,
    "adminId": "...",
    "dataCatalogacao": "2024-06-01T12:00:00.000Z",
    "status": "ativo"
  }
  ```
- **Esperado na resposta:**
  ```json
  {
    "success": true,
    "data": { ...obra },
    "message": "Obra catalogada com sucesso!"
  }
  ```

---

## 8. Autores e Editoras

### Criar Autor (`/autores`)
- **Enviado:**
  ```json
  {
    "nome": "J.R.R. Tolkien",
    "bio": "Escritor britânico...",
    "nascimento": "1892-01-03"
  }
  ```
- **Esperado na resposta:**
  ```json
  {
    "id": "...",
    "nome": "J.R.R. Tolkien",
    "bio": "Escritor britânico...",
    "nascimento": "1892-01-03"
  }
  ```

### Criar Editora (`/editoras`)
- **Enviado:**
  ```json
  {
    "nome": "Editora Fantástica",
    "endereco": "Rua das Letras, 123",
    "contato": "contato@editora.com"
  }
  ```
- **Esperado na resposta:**
  ```json
  {
    "id": "...",
    "nome": "Editora Fantástica",
    "endereco": "Rua das Letras, 123",
    "contato": "contato@editora.com"
  }
  ```

---

## Observações Gerais
- Todos os endpoints de listagem retornam arrays de objetos no formato acima.
- Em caso de erro, a API deve retornar `{ success: false, message: string }` ou `{ message: string }`.
- Campos opcionais podem ser `null` ou omitidos.

---

**Use este arquivo para comparar os formatos aceitos pela API e os esperados pelo front-end.** 
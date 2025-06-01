# Divergências de Formatos JSON - Lumibook

Este arquivo lista as divergências encontradas entre os formatos aceitos pela API e os esperados pelo front-end, indicando onde cada ajuste deve ser feito.

---

  ## PRIMEIROS AJUSTES (BACK-END)

  ### 1. Cadastro de Usuário
  - **Divergência:**
    - A API espera campos adicionais como `telefone`, `papel` e, para alunos, `matricula`.
    - O front-end espera apenas `nome`, `email`, `senha`.
  - **Ajuste sugerido:**
    - Padronizar o payload aceito pela API para aceitar o formato mínimo do front ou ajustar o front para sempre enviar os campos extras (mesmo que vazios).

  ### 2. Cadastro de Autor
  - **Divergência:**
    - A API espera `biografia` e `nacionalidade`.
    - O front-end espera `bio` e `nascimento`.
  - **Ajuste sugerido:**
    - Padronizar os nomes dos campos para `bio` e `nascimento` ou ajustar o front para enviar/esperar os nomes conforme a API.

  ### 3. Cadastro de Editora
  - **Divergência:**
    - A API espera `cidade` e `pais`.
    - O front-end espera `endereco` e `contato`.
  - **Ajuste sugerido:**
    - Padronizar os nomes dos campos para `endereco` e `contato` ou ajustar o front para enviar/esperar os nomes conforme a API.

  ### 4. Reservas e Empréstimos
  - **Divergência:**
    - A API aceita tanto `livroId` quanto `exemplarId` separadamente, mas o front espera ambos juntos em alguns fluxos.
    - O campo `dataReserva` nem sempre está presente nos exemplos da API.
  - **Ajuste sugerido:**
    - Padronizar para sempre exigir ambos os campos e garantir que `dataReserva` seja retornado na resposta.

  ### 5. Resposta de Sucesso
  - **Divergência:**
    - O front espera respostas do tipo `{ success: true, data: {...}, message: "..." }` em várias operações (ex: catalogação de obra), mas a API pode retornar apenas o objeto criado.
  - **Ajuste sugerido:**
    - Padronizar as respostas da API para sempre incluir os campos `success`, `data` e `message` onde aplicável.

  ---

## AJUSTES NO FRONT-END (caso não seja possível padronizar o back)

### 1. Cadastro de Usuário
- Ajustar o front para sempre enviar os campos `telefone`, `papel` e, se for aluno, `matricula`.

### 2. Cadastro de Autor
- Ajustar o front para enviar `biografia` e `nacionalidade` ao invés de `bio` e `nascimento`, ou mapear a resposta da API para os nomes esperados.

### 3. Cadastro de Editora
- Ajustar o front para enviar `cidade` e `pais` ao invés de `endereco` e `contato`, ou mapear a resposta da API para os nomes esperados.

### 4. Reservas e Empréstimos
- Ajustar o front para lidar com respostas que podem não conter todos os campos esperados, tratando casos onde apenas `livroId` ou `exemplarId` estejam presentes.

### 5. Resposta de Sucesso
- Ajustar o front para aceitar respostas sem o campo `success` e tratar mensagens de sucesso/erro conforme o objeto retornado.

---

**Recomenda-se priorizar os ajustes no back-end para garantir padronização e facilitar a manutenção futura.** 
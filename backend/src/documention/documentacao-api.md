
# 📌 Documentação da API – Agenda Cultural

## 🔐 Autenticação

### Registrar usuário
**POST** `/auth/register`

**Body (JSON):**
```json
{
  "nome": "João",
  "email": "joao@email.com",
  "senha": "123456",
  "papel": "usuario"
}
```

---

### Login
**POST** `/auth/login`

**Body (JSON):**
```json
{
  "email": "joao@email.com",
  "senha": "123456"
}
```

**Retorno:** Token JWT

---

## 🎭 Eventos

### Listar eventos públicos
**GET** `/events`

---

### Criar evento (autenticado)
**POST** `/events`  
🔒 Bearer Token

**Body (multipart/form-data):**
- titulo
- descricao
- data_inicio
- data_fim
- valor_ingresso
- categoria_id
- nome_local
- latitude
- longitude
- foto

---

### Buscar evento por ID
**GET** `/events/{id}`

---

### Atualizar evento
**PATCH** `/events/{id}`  
🔒 Bearer Token

---

### Remover evento
**DELETE** `/events/{id}`  
🔒 Bearer Token

---

## 🗂️ Categorias

### Listar categorias
**GET** `/categorias`

---

### Criar categoria
**POST** `/categorias`  
🔒 Bearer Token

---

## 📝 Inscrições

### Inscrever-se em evento
**POST** `/subscriptions`  
🔒 Bearer Token

---

### Listar minhas inscrições
**GET** `/subscriptions/me`  
🔒 Bearer Token

---

## 🛠️ Administração

### Listar sugestões pendentes
**GET** `/adm/sugestoes`  
🔒 Bearer Token

---

### Gerar relatório
**POST** `/adm/relatorios/gerar`  
🔒 Bearer Token

---

## 🔑 Autenticação
Todas as rotas protegidas exigem o header:

```
Authorization: Bearer TOKEN_JWT
```

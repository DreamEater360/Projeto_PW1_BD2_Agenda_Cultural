Aqui está um guia completo e profissional para o seu repositório. Ele explica desde a configuração dos bancos de dados na nuvem até a execução via Docker ou manualmente.

Substitua o conteúdo do arquivo `README.md` na raiz do projeto por este:

---

# 🎭 Agenda Cultural Local

Este projeto é uma aplicação web completa para gestão de eventos culturais, desenvolvida para as disciplinas de **Programação Web 1** e **Banco de Dados 2** (ADS - IFPB). A plataforma permite que cidadãos sugiram eventos, organizadores publiquem atividades e gestores públicos moderem o conteúdo e visualizem relatórios estatísticos.

## 🚀 Tecnologias Principais

- **Frontend:** React + TypeScript, Vite, Leaflet (Mapas), Lucide React.
- **Backend:** Node.js + TypeScript, Express, Zod (Validação), Multer (Uploads).
- **Bancos de Dados (Persistência Poliglota):**
  - **MongoDB Atlas:** Banco primário para dados transacionais e geoespaciais (GeoJSON).
  - **Neo4j AuraDB:** Banco secundário para modelagem de grafos e relacionamentos.
- **DevOps:** Docker & Docker Compose.

---

## 📋 Pré-requisitos

Antes de começar, você precisará ter instalado:
- [Git](https://git-scm.com/)
- [Node.js v22+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (opcional, mas recomendado)

### Contas na Nuvem necessárias:
1. **MongoDB Atlas:** Crie um cluster gratuito e obtenha a string de conexão.
2. **Neo4j AuraDB:** Crie uma instância gratuita "Blank Sandbox" e guarde a URI, usuário e senha.

---

## 🛠️ Configuração do Ambiente

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/Projeto_PW1_BD2_Agenda_Cultural.git
cd Projeto_PW1_BD2_Agenda_Cultural
```

### 2. Variáveis de Ambiente (.env)

Crie um arquivo `.env` dentro da pasta `backend/` seguindo o modelo abaixo:

```env
PORT=3333
JWT_SECRET=sua_chave_secreta_aqui

# MONGODB ATLAS
MONGO_URI=mongodb+srv://USUARIO:SENHA@cluster.mongodb.net/agenda_cultural?retryWrites=true&w=majority

# NEO4J AURADB
NEO4J_URI=neo4j+s://xxxxxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=sua_senha_do_neo4j
```

---

## 🐳 Rodando com Docker (Recomendado)

O Docker subirá o backend automaticamente. O frontend deve ser iniciado manualmente para facilitar o desenvolvimento.

1. Na raiz do projeto, suba o container do backend:
```bash
docker-compose up -d
```

2. Entre na pasta do frontend e inicie a interface:
```bash
cd frontend
npm install
npm run dev
```

O sistema estará disponível em:
- **Frontend:** `http://localhost:5173`
- **Backend (API):** `http://localhost:3333`

---

## 💻 Rodando Manualmente (Sem Docker)

### Backend
1. Abra um terminal na pasta `backend/`.
2. Instale as dependências: `npm install`.
3. Inicie o servidor: `npm run dev`.

### Frontend
1. Abra um terminal na pasta `frontend/`.
2. Instale as dependências: `npm install`.
3. Inicie a aplicação: `npm run dev`.

---

## 🔑 Perfis de Acesso para Teste

Para testar as diferentes funcionalidades, crie contas com os seguintes papéis:

1. **Cidadão (`CIDADAO`):**
   - Pode visualizar eventos no mapa.
   - Pode **sugerir** novos eventos (ficam como PENDENTE).
   - Pode confirmar presença em eventos aprovados.

2. **Organizador (`ORGANIZADOR`):**
   - Requer CNPJ de 14 dígitos no cadastro.
   - Pode publicar eventos diretamente.
   - Possui painel exclusivo para **Editar, Ocultar ou Excluir** seus próprios eventos.

3. **Administrador/Gestor (`ADMINISTRADOR`):**
   - Acesso ao **Painel de Moderação**: Aprova ou Rejeita sugestões de cidadãos.
   - Acesso ao **Painel de Relatórios**: Visualiza estatísticas reais de usuários, eventos e categorias.

---

## 📍 Funcionalidades Geoespaciais

- O sistema utiliza a API **Nominatim** para buscar coordenadas a partir do nome do local digitado.
- Os dados são salvos no MongoDB usando o formato **GeoJSON Point**, permitindo buscas por proximidade no futuro.
- A visualização é feita via **Leaflet**, com marcadores interativos e seletor de mapa na criação de eventos.

---

## 🛡️ Segurança e Validação

- **Blindagem de Crash:** O servidor possui um middleware global de tratamento de erros que captura falhas assíncronas e de validação sem derrubar o processo.
- **Validação com Zod:** Todos os inputs (Título, Descrição, CNPJ, Coordenadas) são validados no servidor.
- **Integridade Poliglota:** Operações de cadastro e exclusão são sincronizadas entre MongoDB e Neo4j. Se uma falha crítica ocorrer no banco primário, a operação é revertida.

---
**ADS IFPB - Campus Cajazeiras**  
*Desenvolvido por: Francisco Erlyson Pamplona, Samuel Videres e Anderson Lorran.*

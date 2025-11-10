# 🌳 TreeApp - Chat com Firebase e CRUD Completo

Aplicação web SPA (Single Page Application) de chat em tempo real com **autenticação Firebase** e **CRUD completo de mensagens** (Create, Read, Update, Delete).

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Setup](#instalação-e-setup)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Arquitetura](#arquitetura)
- [Regras de Segurança](#regras-de-segurança)
- [Firebase Emulator](#firebase-emulator)
- [Como Usar](#como-usar)

---

## 🎯 Sobre o Projeto

TreeApp é uma aplicação de chat moderna e completa que demonstra:

✅ **Autenticação Firebase Auth** (Email/Senha + Google)  
✅ **CRUD Completo de Mensagens** (Criar, Ler, Editar, Deletar)  
✅ **Código JavaScript Namespaced** (`window.TreeApp`)  
✅ **Chat em Tempo Real** com Firestore  
✅ **Interface WhatsApp-style** responsiva  
✅ **Regras de Segurança Firestore** robustas  
✅ **Suporte a Firebase Emulator** para desenvolvimento local  

---

## ⚡ Funcionalidades

### 🔐 Autenticação
- Login com email e senha
- Registro de novos usuários
- Login com Google OAuth
- Logout seguro
- Persistência de sessão
- Redirecionamento automático

### 💬 Chat em Tempo Real
- Lista de conversas ativas
- Busca de usuários
- Iniciar novas conversas
- Envio de mensagens instantâneas
- Atualização em tempo real
- Notificação de última mensagem

### ✏️ **CRUD Completo de Mensagens**
- ✅ **CREATE**: Enviar novas mensagens
- ✅ **READ**: Ler mensagens em tempo real
- ✅ **UPDATE**: Editar mensagens enviadas
- ✅ **DELETE**: Deletar mensagens próprias

### 🎨 Interface
- Design WhatsApp Web moderno
- Responsivo (mobile e desktop)
- Animações suaves
- Indicadores visuais (mensagem editada)
- Botões de ação hover/touch
- Estados de loading

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+ Modules)
- **Backend**: Firebase
  - Firebase Auth (Autenticação)
  - Cloud Firestore (Banco de dados em tempo real)
- **Ferramentas**:
  - Firebase CLI
  - Firebase Emulator Suite
  - Font Awesome (Ícones)

---

## 📁 Estrutura do Projeto

```
tree-38bf7/
│
├── src/                              # 📂 Código fonte principal
│   ├── index.html                    # 🏠 Página de login/registro
│   │
│   ├── assets/
│   │   ├── css/
│   │   │   ├── login.css             # 🎨 Estilos da página de login
│   │   │   └── chat.css              # 🎨 Estilos do chat
│   │   │
│   │   └── js/
│   │       ├── config/
│   │       │   └── firebase.js       # 🔥 Configuração Firebase + namespace
│   │       │
│   │       ├── modules/
│   │       │   ├── auth.js           # 🔐 Módulo de autenticação
│   │       │   └── crud.js           # 📝 Operações CRUD (mensagens, chats, users)
│   │       │
│   │       └── pages/
│   │           ├── login.js          # � Lógica da página de login
│   │           └── chat.js           # � Aplicação principal do chat
│   │
│   └── pages/
│       └── chat.html                 # 💬 Interface do chat
│
├── firebase.json                     # ⚙️ Configuração Firebase Hosting + Emulator
├── firestore.rules                   # 🔒 Regras de segurança Firestore
├── firestore.indexes.json            # 🗂️ Índices do Firestore
├── .firebaserc                       # 🎯 Configuração de projeto Firebase
└── README.md                         # 📖 Este arquivo
```

### 🗂️ Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| **assets/js/config/firebase.js** | Inicializa Firebase e exporta `window.TreeApp.firebase` |
| **assets/js/modules/auth.js** | Funções de autenticação exportadas em `window.TreeApp.auth` |
| **assets/js/modules/crud.js** | CRUD completo exportado em `window.TreeApp.crud` |
| **assets/js/pages/chat.js** | Classe ChatApp principal com edit/delete |
| **assets/js/pages/login.js** | Classe LoginPage |
| **assets/css/login.css** | Estilos da tela de login animada |
| **assets/css/chat.css** | Estilos do chat (WhatsApp style) |

---

## 📋 Pré-requisitos

- **Node.js** >= 14.x
- **NPM** ou Yarn
- **Conta no Firebase**
- **Firebase CLI** instalado globalmente

```bash
# Instalar Firebase CLI
npm install -g firebase-tools
```

---

## 🚀 Instalação e Setup

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/seu-usuario/tree-app.git
cd tree-app
```

### 2️⃣ Instalar dependências (opcional)

```bash
npm install
```

### 3️⃣ Configurar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative **Authentication** (Email/Password e Google)
3. Ative **Cloud Firestore**
4. Copie as credenciais do projeto

### 4️⃣ Atualizar configuração

Edite `src/assets/js/config/firebase.js` com suas credenciais:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_MESSAGING_ID",
    appId: "SEU_APP_ID"
};
```

### 5️⃣ Deploy das regras de segurança

```bash
firebase login
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## 📜 Scripts Disponíveis

### Desenvolvimento Local

```bash
# Iniciar servidor local (porta 5000)
firebase serve

# Ou usar servidor HTTP simples
npx http-server src -p 5000
```

### Firebase Emulator (Recomendado)

```bash
# Iniciar todos os emulators
firebase emulators:start

# Apenas Auth e Firestore
firebase emulators:start --only auth,firestore
```

### Deploy

```bash
# Deploy completo
firebase deploy

# Deploy apenas hosting
firebase deploy --only hosting

# Deploy apenas regras
firebase deploy --only firestore:rules,firestore:indexes
```

---

## 🏗️ Arquitetura

### Namespace Global: `window.TreeApp`

Todo o código está encapsulado no namespace `window.TreeApp`:

```javascript
window.TreeApp = {
    firebase: {
        app,              // Firebase App
        auth,             // Firebase Auth instance
        db,               // Firestore instance
        providerGoogle    // Google Auth Provider
    },
    auth: {
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        logout,
        getCurrentUser,
        isAuthenticated,
        initAuthStateListener,
        saveUserProfile
    },
    crud: {
        // Messages CRUD
        createMessage,
        getMessages,
        getMessage,
        updateMessage,
        deleteMessage,
        listenToMessages,
        
        // Chats CRUD
        createChat,
        getUserChats,
        getChat,
        updateLastMessage,
        deleteChat,
        listenToChats,
        
        // Users
        getAllUsers,
        getUser,
        updateUserProfile
    },
    ui: {
        LoginPage,
        WhatsAppApp
    }
};
```

### Módulos

#### 1. **firebase.js** - Inicialização
```javascript
// Configura Firebase App, Auth, Firestore
// Exporta para window.TreeApp.firebase
```

#### 2. **auth.js** - Autenticação
```javascript
// Funções de registro, login, logout
// Gerencia estado de autenticação
// Salva perfil de usuário no Firestore
```

#### 3. **crud.js** - Operações CRUD
```javascript
// CRUD de Mensagens (Create, Read, Update, Delete)
// CRUD de Chats (Create, Read, Update, Delete)
// Operações de Usuários (Read, Update)
// Listeners em tempo real (onSnapshot)
```

#### 4. **app.js** - Aplicação Principal
```javascript
class WhatsAppApp {
    // Gerencia interface do chat
    // Renderiza mensagens com botões edit/delete
    // Implementa funcionalidade de edição
    // Implementa funcionalidade de deleção
}
```

#### 5. **login.js** - Página de Login
```javascript
class LoginPage {
    // Gerencia formulários de login/registro
    // Valida inputs
    // Redireciona após autenticação
}
```

---

## 🔒 Regras de Segurança

### Coleção `users`
```javascript
allow read: if isAuthenticated();          // Qualquer usuário autenticado pode ler
allow write: if isOwner(userId);           // Apenas próprio perfil
```

### Coleção `chats`
```javascript
allow read: if uid in participants;        // Apenas participantes
allow create: if uid in participants;      // Criar se for participante
allow update: if uid in participants;      // Atualizar se for participante
allow delete: if uid in participants;      // Deletar se for participante
```

### Subcoleção `messages`
```javascript
allow read: if uid in chat.participants;           // Ler se for participante do chat
allow create: if uid in chat.participants &&       // Criar se for participante
                 senderId == uid;                  // e senderId é o próprio uid
allow update: if senderId == uid;                  // Atualizar apenas próprias mensagens
allow delete: if senderId == uid;                  // Deletar apenas próprias mensagens
```

Arquivo completo: [`firestore.rules`](firestore.rules)

---

## 🧪 Firebase Emulator

### Configuração

O projeto está configurado para usar Firebase Emulator:

```json
{
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "hosting": { "port": 5000 },
    "ui": { "enabled": true, "port": 4000 }
  }
}
```

### Como usar

#### 1️⃣ Iniciar emulators:
```bash
firebase emulators:start
```

#### 2️⃣ Acessar interfaces:
- **App**: http://localhost:5000
- **Emulator UI**: http://localhost:4000
- **Firestore**: localhost:8080
- **Auth**: localhost:9099

#### 3️⃣ Dados de teste:
Os emulators iniciam com dados vazios. Crie usuários de teste pela interface.

### Vantagens do Emulator
- 🚀 Desenvolvimento offline
- 💾 Dados locais (não afeta produção)
- 🧪 Testes sem custos
- 🔄 Reset rápido de dados
- 📊 Interface visual para debug

---

## 📊 Diagramas

### Fluxo de Autenticação

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Login/Register     │
│  - Email/Senha      │
│  - Google OAuth     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Firebase Auth      │
│  - Valida           │
│  - Cria token       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Salvar Perfil      │
│  (Firestore users)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Redirecionar para  │
│  whatsapp.html      │
└─────────────────────┘
```

### Fluxo CRUD de Mensagens

```
┌──────────────┐      ┌──────────────┐      ┌─────────────────┐
│   UI Click   │─────▶│  TreeApp     │─────▶│   Firestore     │
│ (Edit/Delete)│      │  .crud       │      │   Database      │
└──────────────┘      └──────┬───────┘      └────────┬────────┘
                             │                       │
                             │  updateMessage()      │
                             │  deleteMessage()      │
                             │                       │
                             ◀───────────────────────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  onSnapshot  │
                      │  (Real-time) │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │  Update DOM  │
                      │  (UI Sync)   │
                      └──────────────┘
```

### Estrutura de Dados Firestore

```
Firestore
│
├── users/
│   └── {userId}
│       ├── uid: string
│       ├── email: string
│       ├── displayName: string
│       ├── contacts: array
│       ├── createdAt: timestamp
│       ├── isOnline: boolean
│       └── lastSeen: timestamp
│
└── chats/
    └── {chatId}
        ├── participants: array [userId1, userId2]
        ├── participantsData: object
        │   ├── {userId1}: { name, email }
        │   └── {userId2}: { name, email }
        ├── lastMessage: string
        ├── lastMessageTime: timestamp
        ├── createdAt: timestamp
        └── messages/ (subcollection)
            └── {messageId}
                ├── text: string
                ├── senderId: string
                ├── senderName: string
                ├── timestamp: timestamp
                ├── edited: boolean (opcional)
                └── editedAt: timestamp (opcional)
```

---

## 📖 Como Usar

### 1️⃣ Criar Conta

1. Acesse http://localhost:5000
2. Clique em "Inscrever-se"
3. Preencha Nome, Email e Senha
4. Clique em "Registrar"
5. Ou use "Login com Google"

### 2️⃣ Iniciar Conversa

1. Clique no botão "Novo Chat"
2. Busque por um usuário
3. Clique no usuário para iniciar conversa

### 3️⃣ Enviar Mensagem

1. Digite sua mensagem no campo inferior
2. Pressione Enter ou clique no botão enviar
3. Mensagem aparece em verde à direita

### 4️⃣ Editar Mensagem ✏️

1. **Hover** sobre sua mensagem (verde)
2. Clique no botão **✏️ Editar**
3. Texto aparece no input
4. Edite o texto
5. Clique em **✓** para salvar
6. Ou clique em **✗** para cancelar
7. Mensagem editada mostra tag **(editada)**

### 5️⃣ Deletar Mensagem 🗑️

1. **Hover** sobre sua mensagem (verde)
2. Clique no botão **🗑️ Deletar**
3. Confirme a ação no popup
4. Mensagem é removida do chat

---

## 🧪 Checklist de Testes

### Autenticação
- [ ] Registro com email/senha
- [ ] Login com email/senha
- [ ] Login com Google
- [ ] Logout
- [ ] Persistência de sessão
- [ ] Redirecionamento automático

### Chat
- [ ] Buscar usuários
- [ ] Iniciar nova conversa
- [ ] Enviar mensagem
- [ ] Receber mensagem em tempo real
- [ ] Ver lista de conversas
- [ ] Última mensagem atualizada

### CRUD de Mensagens
- [ ] **CREATE**: Enviar nova mensagem
- [ ] **READ**: Ver mensagens em tempo real
- [ ] **UPDATE**: Editar mensagem própria
- [ ] UPDATE: Tag "(editada)" aparece
- [ ] UPDATE: Cancelar edição funciona
- [ ] **DELETE**: Deletar mensagem própria
- [ ] DELETE: Confirmação funciona
- [ ] Botões edit/delete aparecem apenas em mensagens próprias
- [ ] Hover/touch mostra botões

### Responsividade
- [ ] Layout mobile (< 768px)
- [ ] Layout desktop (> 768px)
- [ ] Botão voltar funciona no mobile
- [ ] Chat ocupa tela cheia no mobile

---

## 🐛 Troubleshooting

### Erro: "Missing or insufficient permissions"
- Verifique se as regras do Firestore estão implantadas:
  ```bash
  firebase deploy --only firestore:rules
  ```
- Verifique se o usuário está autenticado
- Verifique se o usuário é participante do chat

### Erro: "Index required"
- Implante os índices:
  ```bash
  firebase deploy --only firestore:indexes
  ```
- Aguarde alguns minutos para a construção do índice
- Recarregue a página

### Mensagens não aparecem
- Verifique o console do navegador (F12)
- Confirme que o Firebase está inicializado
- Verifique as regras de segurança
- Teste com Firebase Emulator primeiro

---

## 📝 Requisitos Acadêmicos Atendidos

✅ **App web simples (SPA)** - Single Page Application  
✅ **Autenticação por e-mail/senha** - Firebase Auth  
✅ **CRUD completo** - Mensagens (Create, Read, Update, Delete)  
✅ **Código JavaScript namespaced** - `window.TreeApp`  
✅ **Regras de segurança Firestore** - Permissões por participante  
✅ **Repositório organizado** - Estrutura `/src/`  
✅ **Arquivos de configuração** - firebase.json, firestore.rules, .firebaserc  
✅ **README.md** - Documentação completa  
✅ **Demo local** - Firebase Emulator configurado  

---

## 📝 Licença

Este projeto foi criado para fins educacionais.

---

## 👨‍💻 Autor

**João Victor**  
- Projeto: TreeApp  
- Firebase Project ID: `tree-38bf7`  
- Data: Novembro 2025

---

## 🙏 Agradecimentos

- Firebase Team pela plataforma incrível
- Font Awesome pelos ícones
- Comunidade Open Source

---

**🌳 TreeApp** - Chat em tempo real com CRUD completo desenvolvido com ❤️ usando Firebase

---

### 🚀 Quick Start

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/tree-app.git

# 2. Entre no diretório
cd tree-app

# 3. Instale Firebase CLI (se necessário)
npm install -g firebase-tools

# 4. Login no Firebase
firebase login

# 5. Inicie os emulators
firebase emulators:start

# 6. Acesse no navegador
# http://localhost:5000
```

Pronto! 🎉 Agora você pode testar toda a aplicação localmente sem afetar o banco de produção.

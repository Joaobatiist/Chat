// Chat Page - TreeApp
import { auth, db } from '../config/firebase.js';
import { logout } from '../modules/auth.js';
import { 
    collection, 
    query, 
    orderBy, 
    onSnapshot, 
    addDoc, 
    serverTimestamp,
    where,
    getDocs,
    doc,
    updateDoc,
    getDoc,
    deleteDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// Initialize namespace
if (!window.TreeApp) {
    window.TreeApp = {};
}

class ChatApp {
    constructor() {
        this.currentUser = null;
        this.currentChat = null;
        this.users = new Map();
        this.chats = new Map();
        this.unsubscribeMessages = null;
        this.editingMessageId = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.checkAuthentication();
    }

    initializeElements() {
        // Sidebar elements
        this.userNameElement = document.getElementById('user-name');
        this.logoutButton = document.getElementById('btn-logout');
        this.searchInput = document.getElementById('search-users');
        this.showUsersButton = document.getElementById('btn-show-users');
        this.chatList = document.getElementById('chat-list');
        this.userList = document.getElementById('user-list');
        this.sidebar = document.getElementById('sidebar');
        
        // Chat area elements
        this.welcomeScreen = document.getElementById('welcome-screen');
        this.chatContainer = document.getElementById('chat-container');
        this.chatArea = document.getElementById('chat-area');
        this.contactName = document.getElementById('contact-name');
        this.contactStatus = document.getElementById('contact-status');
        this.messagesArea = document.getElementById('messages-area');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.backButton = document.getElementById('back-button');
    }

    setupEventListeners() {
        // Logout
        this.logoutButton.addEventListener('click', () => this.handleLogout());
        
        // Show users button
        this.showUsersButton.addEventListener('click', () => {
            this.searchInput.value = '';
            this.showUserList();
            this.searchInput.focus();
        });
        
        // Search functionality
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.searchInput.addEventListener('focus', () => this.showUserList());
        this.searchInput.addEventListener('blur', () => {
            setTimeout(() => {
                if (!this.searchInput.value.trim()) {
                    this.hideUserList();
                }
            }, 150);
        });
        
        // Send message
        this.sendButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.editingMessageId) {
                this.saveEditedMessage();
            } else {
                this.sendMessage();
            }
        });
        
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.editingMessageId) {
                    this.saveEditedMessage();
                } else {
                    this.sendMessage();
                }
            }
        });
        
        // Cancel edit on ESC
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.editingMessageId) {
                this.cancelEdit();
            }
        });
        
        // Mobile navigation
        this.backButton.addEventListener('click', () => {
            this.showSidebar();
        });
    }

    checkAuthentication() {
        
        
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = user;
                this.userNameElement.textContent = user.displayName || user.email;

                // Aguardar um pouco para garantir que o Firestore esteja pronto
                setTimeout(() => {
                    this.loadUsers();
                    this.loadChats();
                }, 1000);
            } else {
                
                // Redirecionar para login
                window.location.href = '../index.html';
            }
        });
    }

    async loadUsers() {
        try {
           
            
            // Limpar loading
            const loadingEl = document.getElementById('users-loading');
            if (loadingEl) loadingEl.style.display = 'none';
            
            const usersQuery = query(collection(db, 'users'));
            const snapshot = await getDocs(usersQuery);
            
           
            
            this.users.clear();
            this.userList.innerHTML = '';
            
            if (snapshot.empty) {
                this.userList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>Nenhum usuário encontrado</p>
                    </div>
                `;
                return;
            }
            
            snapshot.forEach((doc) => {
                const userData = doc.data();
                
                
                if (doc.id !== this.currentUser.uid) {
                    this.users.set(doc.id, { id: doc.id, ...userData });
                    this.renderUserItem(doc.id, userData);
                }
            });
            
            
            
        } catch (error) {
          
            
            // Mostrar erro na interface
            this.userList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Erro ao carregar usuários</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }

    renderUserItem(userId, userData) {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.dataset.userId = userId;
        
        userItem.innerHTML = `
            <div class="user-avatar-item">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-info-item">
                <div class="user-name-item">${userData.displayName || userData.email}</div>
            </div>
        `;
        
        userItem.addEventListener('click', () => this.startChat(userId, userData));
        this.userList.appendChild(userItem);
    }

    async startChat(userId, userData) {
        try {
            // Criar ou encontrar conversa existente
            const chatId = this.generateChatId(this.currentUser.uid, userId);
            
            // Verificar se já existe
            const chatQuery = query(
                collection(db, 'chats'),
                where('participants', 'array-contains', this.currentUser.uid)
            );
            
            const snapshot = await getDocs(chatQuery);
            let existingChat = null;
            
            snapshot.forEach((doc) => {
                const chatData = doc.data();
                if (chatData.participants.includes(userId)) {
                    existingChat = { id: doc.id, ...chatData };
                }
            });
            
            if (!existingChat) {
                // Criar nova conversa
                const newChat = {
                    participants: [this.currentUser.uid, userId],
                    participantsData: {
                        [this.currentUser.uid]: {
                            name: this.currentUser.displayName || this.currentUser.email,
                            email: this.currentUser.email
                        },
                        [userId]: {
                            name: userData.displayName || userData.email,
                            email: userData.email
                        }
                    },
                    lastMessage: '',
                    lastMessageTime: serverTimestamp(),
                    createdAt: serverTimestamp()
                };
                
                const docRef = await addDoc(collection(db, 'chats'), newChat);
                existingChat = { id: docRef.id, ...newChat };
            }
            
            this.openChat(existingChat, userData);
            this.hideUserList();
            this.searchInput.value = '';
            
        } catch (error) {
            console.error('Erro ao iniciar chat:', error);
        }
    }

    generateChatId(uid1, uid2) {
        return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
    }

    openChat(chatData, otherUserData) {
        this.currentChat = chatData;
        
        // Mostrar área de chat
        this.welcomeScreen.style.display = 'none';
        this.chatContainer.style.display = 'flex';
        
        // Atualizar header do chat
        this.contactName.textContent = otherUserData.displayName || otherUserData.email;
        this.contactStatus.textContent = 'online';
        
        // Limpar mensagens anteriores
        this.messagesArea.innerHTML = '';
        
        // Carregar mensagens
        this.loadMessages(chatData.id);
        
        // Mobile: mostrar chat e esconder sidebar
        if (window.innerWidth <= 768) {
            this.showChat();
        }
        
        // Atualizar lista de chats
        this.updateChatList();
    }

    loadMessages(chatId) {
 
        // Cancelar listener anterior se existir
        if (this.unsubscribeMessages) {
            this.unsubscribeMessages();
        }
        
        // Escutar mensagens em tempo real
        const messagesQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        
        this.unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const messageData = { id: change.doc.id, ...change.doc.data() };
                
                if (change.type === 'added') {
                    this.renderMessage(messageData);
                } else if (change.type === 'modified') {
                    this.updateMessageInDOM(messageData);
                } else if (change.type === 'removed') {
                    this.removeMessageFromDOM(messageData.id);
                }
            });
            
            // Scroll para o final
            this.scrollToBottom();
        }, (error) => {
            console.error('Erro ao carregar mensagens:', error);
        });
    }

    renderMessage(messageData) {
        // Verificar se a mensagem já existe (evitar duplicatas)
        const existingMessage = this.messagesArea.querySelector(`[data-message-id="${messageData.id}"]`);
        if (existingMessage) {
            return;
        }
        
        const isSent = messageData.senderId === this.currentUser.uid;
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isSent ? 'sent' : 'received'}`;
        messageElement.setAttribute('data-message-id', messageData.id);
        
        let time = 'Enviando...';
        if (messageData.timestamp) {
            try {
                time = new Date(messageData.timestamp.toDate()).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            } catch (error) {
                time = 'Agora';
            }
        }
        
        const editedLabel = messageData.edited ? ' <span class="edited-label">(editada)</span>' : '';
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-text">${messageData.text}${editedLabel}</div>
                <div class="message-footer">
                    <div class="message-time">${time}</div>
                    ${isSent ? `
                        <div class="message-actions">
                            <button class="message-action-btn edit-btn" data-message-id="${messageData.id}" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="message-action-btn delete-btn" data-message-id="${messageData.id}" title="Deletar">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // Add event listeners for edit/delete buttons
        if (isSent) {
            const editBtn = messageElement.querySelector('.edit-btn');
            const deleteBtn = messageElement.querySelector('.delete-btn');
            
            editBtn?.addEventListener('click', () => this.editMessage(messageData.id, messageData.text));
            deleteBtn?.addEventListener('click', () => this.confirmDeleteMessage(messageData.id));
        }
        
        this.messagesArea.appendChild(messageElement);
    }

    async sendMessage() {
        const text = this.messageInput.value.trim();
        
        
        if (!text) {
            
            return;
        }
        
        if (!this.currentChat) {
           
            alert('Selecione uma conversa primeiro!');
            return;
        }
        
        if (!this.currentUser) {
            
            alert('Você precisa estar logado!');
            return;
        }
        
        try {
         
            
            // Verificar se o usuário é participante do chat
            if (!this.currentChat.participants || !this.currentChat.participants.includes(this.currentUser.uid)) {
                console.error('❌ Usuário não é participante do chat');
                alert('Erro: Você não é participante desta conversa!');
                return;
            }
            
            const messageData = {
                text,
                senderId: this.currentUser.uid,
                senderName: this.currentUser.displayName || this.currentUser.email,
                timestamp: serverTimestamp()
            };
           
            
            // Primeiro tentar ler o chat para verificar permissões
            const chatRef = doc(db, 'chats', this.currentChat.id);
           
            
            try {
                const chatSnap = await getDoc(chatRef);
                if (!chatSnap.exists()) {
                    console.error('❌ Chat não existe!');
                    alert('Erro: Conversa não encontrada!');
                    return;
                }
               
            } catch (readError) {
                console.error('❌ Erro ao ler chat:', readError);
                alert('Erro: Não é possível acessar esta conversa!');
                return;
            }
            
            // Adicionar mensagem à subcoleção
            const messagesCollectionRef = collection(db, 'chats', this.currentChat.id, 'messages');
            const docRef = await addDoc(messagesCollectionRef, messageData);
           
            await updateDoc(chatRef, {
                lastMessage: text,
                lastMessageTime: serverTimestamp()
            });
           
            
            // Limpar input
            this.messageInput.value = '';
           
            
        } catch (error) {
            console.error('❌ Erro ao enviar mensagem:', error);
            console.error('❌ Detalhes do erro:', error.code, error.message);
            
            if (error.code === 'permission-denied') {
                alert('Erro de permissão: Verifique se você tem acesso a esta conversa e se as regras do Firestore estão corretas.');
            } else {
                alert(`Erro ao enviar mensagem: ${error.message}`);
            }
        }
    }

    scrollToBottom() {
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    }

    loadChats() {
        try {
            
            
            // Limpar loading
            const loadingEl = document.getElementById('chats-loading');
            if (loadingEl) loadingEl.style.display = 'none';
            
            // Consulta simples sem orderBy para não precisar de índice composto
            const chatsQuery = query(
                collection(db, 'chats'),
                where('participants', 'array-contains', this.currentUser.uid)
            );
            
          
            
            onSnapshot(chatsQuery, (snapshot) => {
                
                
                this.chatList.innerHTML = '';
                
                if (snapshot.empty) {
                    this.chatList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-comments"></i>
                            <p>Nenhuma conversa ainda</p>
                            <small>Pesquise por usuários para iniciar uma conversa</small>
                        </div>
                    `;
                    return;
                }
                
                // Coletar todos os chats
                const chats = [];
                snapshot.forEach((doc) => {
                    const chatData = { id: doc.id, ...doc.data() };
                    chats.push(chatData);
                    
                });
                
                // Ordenar no cliente por lastMessageTime (mais recente primeiro)
                chats.sort((a, b) => {
                    const timeA = a.lastMessageTime?.toMillis() || 0;
                    const timeB = b.lastMessageTime?.toMillis() || 0;
                    return timeB - timeA;
                });
                
                
                
                // Renderizar chats ordenados
                chats.forEach(chatData => {
                    this.renderChatItem(chatData);
                });
            }, (error) => {
                console.error('Erro ao carregar conversas:', error);
                
                // Se for erro de índice, mostrar mensagem específica
                if (error.code === 'failed-precondition' && error.message.includes('index')) {
                    this.chatList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-clock"></i>
                            <p>Índice do banco sendo construído...</p>
                            <small>Aguarde alguns minutos e recarregue a página</small>
                            <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px; background: #25d366; color: white; border: none; border-radius: 3px; cursor: pointer;">
                                Recarregar
                            </button>
                        </div>
                    `;
                } else {
                    this.chatList.innerHTML = `
                        <div class="empty-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Erro ao carregar conversas</p>
                            <small>${error.message}</small>
                        </div>
                    `;
                }
            });
            
        } catch (error) {
            console.error('Erro ao configurar listener de conversas:', error);
        }
    }

    renderChatItem(chatData) {
        const otherUserId = chatData.participants.find(id => id !== this.currentUser.uid);
        const otherUserData = chatData.participantsData[otherUserId];
        
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.dataset.chatId = chatData.id;
        
        const lastMessageTime = chatData.lastMessageTime ? 
            new Date(chatData.lastMessageTime.toDate()).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }) : '';
        
        chatItem.innerHTML = `
            <div class="chat-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="chat-info">
                <div class="chat-name">${otherUserData?.name || 'Usuário'}</div>
                <div class="chat-last-message">${chatData.lastMessage || 'Nova conversa'}</div>
            </div>
            <div class="chat-time">${lastMessageTime}</div>
        `;
        
        chatItem.addEventListener('click', () => {
            // Remover active de outros itens
            document.querySelectorAll('.chat-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Adicionar active ao item clicado
            chatItem.classList.add('active');
            
            // Abrir chat
            this.openChat(chatData, otherUserData);
        });
        
        this.chatList.appendChild(chatItem);
    }

    showUserList() {
        this.userList.style.display = 'block';
        this.chatList.style.display = 'none';
    }

    hideUserList() {
        this.userList.style.display = 'none';
        this.chatList.style.display = 'block';
    }

    handleSearch(query) {
        this.showUserList();
        
        // Filtrar usuários
        const userItems = this.userList.querySelectorAll('.user-item');
        
        if (!query.trim()) {
            // Mostrar todos os usuários quando não há pesquisa
            userItems.forEach(item => {
                item.style.display = 'flex';
            });
        } else {
            // Filtrar usuários baseado na pesquisa
            userItems.forEach(item => {
                const userName = item.querySelector('.user-name-item').textContent.toLowerCase();
                if (userName.includes(query.toLowerCase())) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        }
    }

    updateChatList() {
        // Recarregar lista de chats para refletir mudanças
        this.loadChats();
    }

    // Mobile navigation functions
    showChat() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.add('hidden');
            this.chatArea.classList.add('active');
        }
    }
    
    showSidebar() {
        if (window.innerWidth <= 768) {
            this.sidebar.classList.remove('hidden');
            this.chatArea.classList.remove('active');
        }
    }
    
    // Handle window resize
    handleResize() {
        if (window.innerWidth > 768) {
            // Desktop: show both sidebar and chat
            this.sidebar.classList.remove('hidden');
            this.chatArea.classList.remove('active');
        }
    }

    async handleLogout() {
        try {
            if (this.unsubscribeMessages) {
                this.unsubscribeMessages();
            }
            
            await logout();
            window.location.href = '../index.html';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    // ==================== CRUD FUNCTIONS ====================
    
    updateMessageInDOM(messageData) {
        const messageElement = this.messagesArea.querySelector(`[data-message-id="${messageData.id}"]`);
        if (messageElement) {
            const messageText = messageElement.querySelector('.message-text');
            if (messageText) {
                const editedLabel = messageData.edited ? ' <span class="edited-label">(editada)</span>' : '';
                messageText.innerHTML = `${messageData.text}${editedLabel}`;
            }
        }
    }

    removeMessageFromDOM(messageId) {
        const messageElement = this.messagesArea.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.remove();
        }
    }

    editMessage(messageId, currentText) {
        this.editingMessageId = messageId;
        this.messageInput.value = currentText;
        this.messageInput.focus();
        this.messageInput.select();
        
        // Change button icon to save
        this.sendButton.innerHTML = '<i class="fas fa-check"></i>';
        this.sendButton.classList.add('editing');
        
        // Add cancel button
        if (!document.getElementById('cancel-edit-btn')) {
            const cancelBtn = document.createElement('button');
            cancelBtn.id = 'cancel-edit-btn';
            cancelBtn.className = 'cancel-edit-btn';
            cancelBtn.innerHTML = '<i class="fas fa-times"></i>';
            cancelBtn.title = 'Cancelar';
            cancelBtn.addEventListener('click', () => this.cancelEdit());
            this.sendButton.parentElement.insertBefore(cancelBtn, this.sendButton);
        }
    }

    async saveEditedMessage() {
        const newText = this.messageInput.value.trim();
        
        if (!newText || !this.editingMessageId) {
            return;
        }
        
        try {
            const messageRef = doc(db, 'chats', this.currentChat.id, 'messages', this.editingMessageId);
            await updateDoc(messageRef, {
                text: newText,
                edited: true,
                editedAt: serverTimestamp()
            });
            this.cancelEdit();
        } catch (error) {
            console.error('Erro ao editar mensagem:', error);
            alert('Erro ao editar mensagem');
        }
    }

    cancelEdit() {
        this.editingMessageId = null;
        this.messageInput.value = '';
        this.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
        this.sendButton.classList.remove('editing');
        
        const cancelBtn = document.getElementById('cancel-edit-btn');
        if (cancelBtn) {
            cancelBtn.remove();
        }
    }

    confirmDeleteMessage(messageId) {
        if (confirm('Tem certeza que deseja deletar esta mensagem?')) {
            this.deleteMessage(messageId);
        }
    }

    async deleteMessage(messageId) {
        try {
            const messageRef = doc(db, 'chats', this.currentChat.id, 'messages', messageId);
            await deleteDoc(messageRef);
        } catch (error) {
            console.error('Erro ao deletar mensagem:', error);
            alert('Erro ao deletar mensagem');
        }
    }
}

// Export to namespace
window.TreeApp.ui = window.TreeApp.ui || {};
window.TreeApp.ui.ChatApp = ChatApp;

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const app = new ChatApp();
    
    // Handle window resize for responsive behavior
    window.addEventListener('resize', () => {
        app.handleResize();
    });
});

export default ChatApp;
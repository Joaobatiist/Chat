// CRUD Operations for Messages and Chats
import { db } from '../config/firebase.js';
import { 
    collection, 
    addDoc, 
    query, 
    orderBy, 
    onSnapshot,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc,
    where,
    getDocs,
    getDoc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Initialize namespace
if (!window.TreeApp) {
    window.TreeApp = {};
}

// ==================== MESSAGES CRUD ====================

// CREATE: Send/Create a new message
async function createMessage(chatId, messageData) {
    try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const docRef = await addDoc(messagesRef, {
            ...messageData,
            timestamp: serverTimestamp(),
            createdAt: serverTimestamp()
        });
        
        // Update last message in chat
        await updateLastMessage(chatId, messageData.text);
        
        return docRef.id;
    } catch (error) {
        console.error('Erro ao criar mensagem:', error);
        throw error;
    }
}

// READ: Get all messages from a chat
async function getMessages(chatId) {
    try {
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'asc'));
        const snapshot = await getDocs(q);
        
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return messages;
    } catch (error) {
        console.error('Erro ao buscar mensagens:', error);
        throw error;
    }
}

// READ: Get single message
async function getMessage(chatId, messageId) {
    try {
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
        const messageSnap = await getDoc(messageRef);
        
        if (messageSnap.exists()) {
            return { id: messageSnap.id, ...messageSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar mensagem:', error);
        throw error;
    }
}

// UPDATE: Edit an existing message
async function updateMessage(chatId, messageId, newText) {
    try {
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
        
        await updateDoc(messageRef, {
            text: newText,
            edited: true,
            editedAt: serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error('Erro ao atualizar mensagem:', error);
        throw error;
    }
}

// DELETE: Delete a message
async function deleteMessage(chatId, messageId) {
    try {
        const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
        await deleteDoc(messageRef);
        return true;
    } catch (error) {
        console.error('Erro ao deletar mensagem:', error);
        throw error;
    }
}

// LISTEN: Real-time listener for messages
function listenToMessages(chatId, callback) {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
        callback(snapshot);
    }, (error) => {
        console.error('Erro ao escutar mensagens:', error);
    });
}

// ==================== CHATS CRUD ====================

// CREATE: Create a new chat
async function createChat(participants, participantsData) {
    try {
        const chatsRef = collection(db, 'chats');
        const docRef = await addDoc(chatsRef, {
            participants,
            participantsData,
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Erro ao criar conversa:', error);
        throw error;
    }
}

// READ: Get user chats
async function getUserChats(userId) {
    try {
        const chatsRef = collection(db, 'chats');
        const q = query(
            chatsRef, 
            where('participants', 'array-contains', userId)
        );
        
        const snapshot = await getDocs(q);
        const chats = [];
        
        snapshot.forEach((doc) => {
            chats.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Sort by last message time (client-side)
        chats.sort((a, b) => {
            const timeA = a.lastMessageTime?.toMillis() || 0;
            const timeB = b.lastMessageTime?.toMillis() || 0;
            return timeB - timeA;
        });
        
        return chats;
    } catch (error) {
        console.error('Erro ao buscar conversas:', error);
        throw error;
    }
}

// READ: Get single chat
async function getChat(chatId) {
    try {
        const chatRef = doc(db, 'chats', chatId);
        const chatSnap = await getDoc(chatRef);
        
        if (chatSnap.exists()) {
            return { id: chatSnap.id, ...chatSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar conversa:', error);
        throw error;
    }
}

// UPDATE: Update last message in chat
async function updateLastMessage(chatId, lastMessage) {
    try {
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
            lastMessage,
            lastMessageTime: serverTimestamp()
        });
    } catch (error) {
        console.error('Erro ao atualizar última mensagem:', error);
        throw error;
    }
}

// DELETE: Delete a chat (and all messages)
async function deleteChat(chatId) {
    try {
        // First delete all messages
        const messagesRef = collection(db, 'chats', chatId, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        
        const deletePromises = [];
        messagesSnapshot.forEach((messageDoc) => {
            deletePromises.push(deleteDoc(messageDoc.ref));
        });
        
        await Promise.all(deletePromises);
        
        // Then delete the chat
        const chatRef = doc(db, 'chats', chatId);
        await deleteDoc(chatRef);
        
        return true;
    } catch (error) {
        console.error('Erro ao deletar conversa:', error);
        throw error;
    }
}

// LISTEN: Real-time listener for chats
function listenToChats(userId, callback) {
    const chatsRef = collection(db, 'chats');
    const q = query(
        chatsRef,
        where('participants', 'array-contains', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
        callback(snapshot);
    }, (error) => {
        console.error('Erro ao escutar conversas:', error);
    });
}

// ==================== USERS CRUD ====================

// READ: Get all users
async function getAllUsers(currentUserId) {
    try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        const users = [];
        snapshot.forEach((doc) => {
            // Exclude current user
            if (doc.id !== currentUserId) {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        });
        
        return users;
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
    }
}

// READ: Get single user
async function getUser(userId) {
    try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() };
        }
        return null;
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        throw error;
    }
}

// UPDATE: Update user profile
async function updateUserProfile(userId, updates) {
    try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, updates);
        return true;
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        throw error;
    }
}

// ==================== EXPORT TO NAMESPACE ====================

window.TreeApp.crud = {
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
};

export {
    // Messages
    createMessage,
    getMessages,
    getMessage,
    updateMessage,
    deleteMessage,
    listenToMessages,
    
    // Chats
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
};

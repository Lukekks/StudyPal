import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc, orderBy, onSnapshot, arrayRemove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { arrayUnion } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// Verifica se o Firebase já foi inicializado
let app;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

const storage = getStorage(app);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserFriends = [];
// Garantir que auth seja inicializado antes de usar
auth.onAuthStateChanged(user => {
    if (user) {
        // Usuário está autenticado
        loadUserProfile();
        loadUserFiles();
    } else {
        // Usuário não está autenticado
        window.location.href = '../../login/telaLogin.html';
    }
});

let currentEditTarget = '';
let currentFile = null;

// Função para obter o UID da URL
function getUidFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('uid');
}

function redirectToProfile() {
    const uid = getUidFromUrl();
    if (uid) {
        document.getElementById('profile-link').href = `profile.html?uid=${uid}`;
    }
}

function redirectToForum() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            document.getElementById('nav-logo').href = `../../forum/telaForum.html?uid=${user.uid}`;
            loadLoggedUserProfile(uid);
        } else {
            console.log('Nenhum usuário está logado');
            window.location.href = '../../login/telaLogin.html';
        }
    });
}

function loadLoggedUserProfile(uid) {
    getDoc(doc(db, "users", uid)).then(userDoc => {
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('profile-pic').src = userData.profilePicture || '../../images/fotoProfile.png';
        } else {
            console.log("Usuário logado não encontrado no Firestore.");
        }
    });
}

// Função para carregar perfil do usuário
// Atualize a função loadUserProfile para adicionar o listener para a aba "Arquivos"
// Função para carregar perfil do usuário
async function loadUserProfile() {
    const uid = getUidFromUrl();
    if (uid) {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('username').textContent = userData.username;
            document.getElementById('profile-img').src = userData.profilePicture || '../../images/fotoProfile.png';
            document.getElementById('profile-pic').src = userData.profilePicture || '../../images/fotoProfile.png';
            document.getElementById('banner-img').src = userData.bannerPicture || '../../images/carousel_img01.jpg';
            document.getElementById('status').textContent = userData.status || 'Status';
            document.getElementById('bio-text').textContent = userData.bio || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vestibulum convallis magna, quis tincidunt felis consequat eu.';
            document.getElementById('social-text').textContent = userData.socialLinks || 'Links para redes sociais';

            document.getElementById('groups-link').addEventListener('click', function() {
                if (document.getElementById('friends-tab-item')) {
                    document.getElementById('friends-tab-item').style.display = 'none';
                }
                if (document.getElementById('requests-tab-item')) {
                    document.getElementById('requests-tab-item').style.display = 'none';
                }
                if (document.getElementById('groups-tab-item')) {
                    document.getElementById('groups-tab-item').style.display = 'block';
                }
                if (document.getElementById('files-tab-item')) {
                    document.getElementById('files-tab-item').style.display = 'none';
                }
                if (document.getElementById('friends')) {
                    document.getElementById('friends').classList.remove('show', 'active');
                }
                if (document.getElementById('requests')) {
                    document.getElementById('requests').classList.remove('show', 'active');
                }
                if (document.getElementById('groups')) {
                    document.getElementById('groups').classList.add('show', 'active');
                }
                if (document.getElementById('files')) {
                    document.getElementById('files').classList.remove('show', 'active');
                }
                if (document.getElementById('search-bar')) {
                    document.getElementById('search-bar').style.display = 'none';
                }
                if (document.getElementById('create-group-btn')) {
                    document.getElementById('create-group-btn').style.display = 'block';
                }
            });

            document.getElementById('friends-link').addEventListener('click', function() {
                if (document.getElementById('friends-tab-item')) {
                    document.getElementById('friends-tab-item').style.display = 'block';
                }
                if (document.getElementById('requests-tab-item')) {
                    document.getElementById('requests-tab-item').style.display = 'block';
                }
                if (document.getElementById('groups-tab-item')) {
                    document.getElementById('groups-tab-item').style.display = 'none';
                }
                if (document.getElementById('files-tab-item')) {
                    document.getElementById('files-tab-item').style.display = 'none';
                }
                if (document.getElementById('friends')) {
                    document.getElementById('friends').classList.add('show', 'active');
                }
                if (document.getElementById('requests')) {
                    document.getElementById('requests').classList.remove('show', 'active');
                }
                if (document.getElementById('groups')) {
                    document.getElementById('groups').classList.remove('show', 'active');
                }
                if (document.getElementById('files')) {
                    document.getElementById('files').classList.remove('show', 'active');
                }
                if (document.getElementById('search-bar')) {
                    document.getElementById('search-bar').style.display = 'flex';
                }
                if (document.getElementById('create-group-btn')) {
                    document.getElementById('create-group-btn').style.display = 'none';
                }
            });

            document.getElementById('files-link').addEventListener('click', function() {
                if (document.getElementById('friends-tab-item')) {
                    document.getElementById('friends-tab-item').style.display = 'none';
                }
                if (document.getElementById('requests-tab-item')) {
                    document.getElementById('requests-tab-item').style.display = 'none';
                }
                if (document.getElementById('groups-tab-item')) {
                    document.getElementById('groups-tab-item').style.display = 'none';
                }
                if (document.getElementById('files-tab-item')) {
                    document.getElementById('files-tab-item').style.display = 'block';
                }
                if (document.getElementById('friends')) {
                    document.getElementById('friends').classList.remove('show', 'active');
                }
                if (document.getElementById('requests')) {
                    document.getElementById('requests').classList.remove('show', 'active');
                }
                if (document.getElementById('groups')) {
                    document.getElementById('groups').classList.remove('show', 'active');
                }
                if (document.getElementById('files')) {
                    document.getElementById('files').classList.add('show', 'active');
                }
                if (document.getElementById('search-bar')) {
                    document.getElementById('search-bar').style.display = 'none';
                }
                if (document.getElementById('create-group-btn')) {
                    document.getElementById('create-group-btn').style.display = 'none';
                }
            });

            const friendsListElement = document.getElementById('friends-list');
            const currentFriends = new Set();

            currentUserFriends = [];
            const addedFriends = new Set(); // Set para rastrear IDs de amigos já adicionados

            if (userData.friends && userData.friends.length > 0) {
                console.log(`Total de amigos encontrados: ${userData.friends.length}`);
                for (const friendId of userData.friends) {
                    // Verifique se o amigo já foi adicionado
                    if (addedFriends.has(friendId)) {
                        console.log(`Amigo duplicado ignorado: ${friendId}`);
                        continue; // Pule para o próximo amigo
                    }
                    addedFriends.add(friendId);

                    const friendDoc = await getDoc(doc(db, "users", friendId));
                    if (friendDoc.exists()) {
                        const friendData = friendDoc.data();
                        currentUserFriends.push({ ...friendData, uid: friendId });

                        console.log(`Amigo adicionado: ${friendId}`);

                        if (!currentFriends.has(friendId)) {
                            currentFriends.add(friendId);

                            const friendItem = document.createElement('div');
                            friendItem.classList.add('friend-item');
                            friendItem.innerHTML = `
                                <div class="d-flex align-items-center">
                                    <img src="${friendData.profilePicture || '../../images/fotoProfile.png'}" alt="User Image" class="img-fluid rounded-circle" style="width: 50px; height: 50px; margin-right: 10px;">
                                    <p>${friendData.username} <span>${friendData.status || 'Status'}</span></p>
                                </div>
                                <div>
                                    <button class="btn btn-primary">Enviar Mensagem</button>
                                    <button class="btn btn-danger">Desfazer Amizade</button>
                                </div>
                            `;
                            friendsListElement.appendChild(friendItem);

                            friendItem.querySelector('.btn-primary').addEventListener('click', () => {
                                openChatWindow(friendData.username, friendData.status, friendData.profilePicture);
                            });

                            friendItem.querySelector('.btn-danger').addEventListener('click', async () => {
                                await removeFriend(friendId);
                                alert('Amizade desfeita!');
                                window.location.reload();
                            });
                        }
                    }
                }
            }
            console.log(`Total de amigos adicionados: ${currentUserFriends.length}`);
            updateFriendCounter(); // Atualize o contador de amigos após carregar a lista de amigos
            loadUserFiles(); // Carregue os arquivos do usuário
        } else {
            console.log("Usuário não encontrado");
        }
    } else {
        console.log("Nenhum UID encontrado na URL");
    }
}



document.getElementById('profile-upload').addEventListener('change', function() {
    currentFile = this.files[0];
    openConfirmModal('profile-img', 'profilePicture');
});

document.getElementById('banner-upload').addEventListener('change', function() {
    currentFile = this.files[0];
    openConfirmModal('banner-img', 'bannerPicture');
});

document.getElementById('edit-username').addEventListener('click', function() {
    openEditModal('username');
});

document.getElementById('edit-status').addEventListener('click', function() {
    openEditModal('status');
});

document.getElementById('edit-bio').addEventListener('click', function() {
    openEditModal('bio-text');
});

document.getElementById('edit-social').addEventListener('click', function() {
    openEditModal('social-text');
});

document.getElementById('save-changes').addEventListener('click', async function() {
    const editText = document.getElementById('edit-text').value;
    const target = document.getElementById(currentEditTarget);
    target.textContent = editText;
    $('#editModal').modal('hide');
    if (currentEditTarget === 'bio-text') {
        await updateProfile('bio', editText);
    } else if (currentEditTarget === 'social-text') {
        await updateProfile('socialLinks', editText);
    } else if (currentEditTarget === 'username') {
        await updateProfile('username', editText);
        await updateProfile('usernameLowerCase', editText.trim().toLowerCase());
    } else if (currentEditTarget === 'status') {
        await updateProfile('status', editText);
    }
});

document.getElementById('confirm-change').addEventListener('click', async function() {
    const reader = new FileReader();
    reader.onload = async function(e) {
        document.getElementById(currentEditTarget).src = e.target.result;
        await updateProfile(currentEditTargetField, e.target.result);
        $('#confirmModal').modal('hide');
    }
    reader.readAsDataURL(currentFile);
});

let currentEditTargetField = '';

function openEditModal(targetId) {
    currentEditTarget = targetId;
    const text = document.getElementById(targetId).textContent;
    document.getElementById('edit-text').value = text;
    $('#editModal').modal('show');
}

function openConfirmModal(targetId, field) {
    currentEditTarget = targetId;
    currentEditTargetField = field;
    $('#confirmModal').modal('show');
}

// Função para abrir o modal de edição de grupo
async function openEditGroupModal(groupId) {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        document.getElementById('edit-group-id').value = groupId;
        document.getElementById('edit-group-name').value = groupData.groupName;
        document.getElementById('edit-group-description').value = groupData.groupDescription;
        $('#editGroupModal').modal('show');
    }
}


// Função para atualizar o perfil do usuário no Firestore
async function updateProfile(field, value) {
    const uid = getUidFromUrl();
    if (uid) {
        const userRef = doc(db, "users", uid);
        await updateDoc(userRef, {
            [field]: value
        });
    } else {
        console.log("Nenhum UID encontrado na URL");
    }
}

document.getElementById('save-edit-group-btn').addEventListener('click', async function() {
    const groupId = document.getElementById('edit-group-id').value;
    const groupName = document.getElementById('edit-group-name').value;
    const groupDescription = document.getElementById('edit-group-description').value;
    const groupPicture = document.getElementById('edit-group-picture').files[0];

    const groupRef = doc(db, "groups", groupId);
    await updateDoc(groupRef, {
        groupName: groupName,
        groupDescription: groupDescription
    });

    if (groupPicture) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            await updateDoc(groupRef, {
                groupPicture: e.target.result
            });
        }
        reader.readAsDataURL(groupPicture);
    }

    alert('Grupo atualizado com sucesso!');
    $('#editGroupModal').modal('hide');
    window.location.reload();
});

document.getElementById('save-file-btn').addEventListener('click', async () => {
    const fileName = document.getElementById('file-name').value;
    const fileUpload = document.getElementById('file-upload').files[0];
    
    if (fileName && fileUpload) {
        const uid = getUidFromUrl();
        const fileRef = ref(storage, `files/${uid}/${fileUpload.name}`);
        await uploadBytes(fileRef, fileUpload);
        const fileUrl = await getDownloadURL(fileRef);
        
        await addDoc(collection(db, "files"), {
            fileName: fileName,
            fileUrl: fileUrl,
            owner: uid,
            timestamp: new Date()
        });
        alert('Arquivo adicionado com sucesso!');
        $('#uploadFileModal').modal('hide');
        window.location.reload();
    } else {
        alert('Nome do arquivo e arquivo não podem estar vazios.');
    }
});

document.getElementById('save-edit-file-btn').addEventListener('click', async () => {
    const fileId = document.getElementById('edit-file-id').value;
    const newFileName = document.getElementById('edit-file-name').value;
    const newFileUpload = document.getElementById('edit-file-upload').files[0];

    const fileRefDoc = doc(db, "files", fileId);
    const fileDoc = await getDoc(fileRefDoc);
    const fileData = fileDoc.data();
    let newFileUrl = fileData.fileUrl;

    if (newFileUpload) {
        const uid = getUidFromUrl();
        const newFileRef = ref(storage, `files/${uid}/${newFileUpload.name}`);
        await uploadBytes(newFileRef, newFileUpload);
        newFileUrl = await getDownloadURL(newFileRef);
    }

    await updateDoc(fileRefDoc, {
        fileName: newFileName || fileData.fileName,
        fileUrl: newFileUrl,
        timestamp: new Date()
    });

    alert('Arquivo atualizado com sucesso!');
    $('#editFileModal').modal('hide');
    window.location.reload();
});

// Função para abrir janela de chat
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', function(event) {
        const friendItem = this.parentElement;
        const friendName = friendItem.getAttribute('data-friend-name');
        const friendStatus = friendItem.getAttribute('data-friend-status');
        const friendImg = friendItem.getAttribute('data-friend-img');
        openChatWindow(friendName, friendStatus, friendImg);
        event.stopPropagation();
    });
});

function openChatWindow(friendName, friendStatus, friendImg) {
    if (!friendName) return;

    const chatContainer = document.getElementById('chat-container');

    if (!document.getElementById(`chat-${friendName}`)) {
        const friend = currentUserFriends.find(friend => friend.username.trim() === friendName.trim());
        if (!friend) {
            console.error('Amigo não encontrado:', friendName);
            return;
        }

        const chatWindow = document.createElement('div');
        chatWindow.classList.add('chat-window');
        chatWindow.id = `chat-${friendName}`;
        chatWindow.innerHTML = `
            <div class="chat-header">
                <div class="d-flex align-items-center">
                    <img src="${friendImg}" alt="User Image">
                    <div>
                        <h4>${friendName}</h4>
                        <small>${friendStatus}</small>
                    </div>
                </div>
                <div class="chat-controls">
                    <button class="btn-minimize" data-friend-name="${friendName}">–</button>
                    <button class="btn-close" data-friend-name="${friendName}">X</button>
                </div>
            </div>
            <div class="chat-body"></div>
            <div class="chat-footer">
                <input type="text" placeholder="Digite sua mensagem...">
                <button class="btn-sentmsg" onclick="sendMessage('${friendName}')">Enviar</button>
            </div>
        `;
        chatContainer.appendChild(chatWindow);

        chatWindow.querySelector('.btn-minimize').addEventListener('click', function() {
            minimizeChatWindow(friendName);
        });

        chatWindow.querySelector('.btn-close').addEventListener('click', function() {
            closeChatWindow(friendName);
        });

        adjustChatWindowPositions();

        loadMessages(friendName);
    }
}

function closeChatWindow(friendName) {
    const chatWindow = document.getElementById(`chat-${friendName}`);
    if (chatWindow) {
        chatWindow.remove();
        adjustChatWindowPositions();
    }
}

function minimizeChatWindow(friendName) {
    const chatWindow = document.getElementById(`chat-${friendName}`);
    if (chatWindow) {
        chatWindow.classList.toggle('minimized');
    }
}

async function sendMessage(friendName) {
    const chatWindow = document.getElementById(`chat-${friendName}`);
    const input = chatWindow.querySelector('.chat-footer input');
    const message = input.value;

    if (message.trim()) {
        const chatBody = chatWindow.querySelector('.chat-body');
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'sent');
        messageElement.innerHTML = linkify(message);

        const timestampElement = document.createElement('div');
        timestampElement.classList.add('timestamp');
        timestampElement.innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageElement.appendChild(timestampElement);
        chatBody.appendChild(messageElement);
        input.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;

        const uid = getUidFromUrl();
        const friendId = currentUserFriends.find(friend => friend.username === friendName).uid;
        const chatId = uid < friendId ? `${uid}_${friendId}` : `${friendId}_${uid}`;
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
            sender: uid,
            message: message,
            timestamp: new Date()
        });
    }
}

// Tornar a função sendMessage globalmente acessível
window.sendMessage = sendMessage;

function linkify(text) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
}

// Função para carregar mensagens
async function loadMessages(friendName) {
    const chatWindow = document.getElementById(`chat-${friendName}`);
    const chatBody = chatWindow.querySelector('.chat-body');

    chatBody.innerHTML = '';

    const uid = getUidFromUrl();
    const friend = currentUserFriends.find(friend => friend.username.trim() === friendName.trim());
   
    if (!friend) {
        console.error('Amigo não encontrado:', friendName);
        return;
    }

    const friendId = friend.uid;
    const chatId = uid < friendId ? `${uid}_${friendId}` : `${friendId}_${uid}`;
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(docSnapshot => {
        const messageData = docSnapshot.data();
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.innerHTML = linkify(messageData.message);

        const timestampElement = document.createElement('div');
        timestampElement.classList.add('timestamp');
        timestampElement.innerText = new Date(messageData.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (messageData.sender === uid) {
            messageElement.classList.add('sent');
        } else {
            messageElement.classList.add('received');
        }

        messageElement.appendChild(timestampElement);
        chatBody.appendChild(messageElement);
    });

    chatBody.scrollTop = chatBody.scrollHeight;
}

function adjustChatWindowPositions() {
    const chatWindows = document.querySelectorAll('.chat-window');
    const chatContainer = document.getElementById('chat-container');
    let offset = 0;
    chatWindows.forEach(chatWindow => {
        chatWindow.style.right = `${offset}px`;
        offset += chatWindow.offsetWidth + 10;
    });
}

document.getElementById('search-btn').addEventListener('click', async () => {
    const searchInput = document.getElementById('search-input').value.trim().toLowerCase();
    console.log(`Buscando por: ${searchInput}`);
    if (searchInput) {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("usernameLowerCase", ">=", searchInput), where("usernameLowerCase", "<=", searchInput + '\uf8ff'));
        const querySnapshot = await getDocs(q);
        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = '';

        console.log(`Resultados da busca: ${querySnapshot.size}`);
        for (const doc of querySnapshot.docs) {
            const userData = doc.data();
            console.log(`Usuário encontrado:`, userData);

            const userItem = document.createElement('div');
            userItem.classList.add('friend-item');
            userItem.setAttribute('data-friend-name', userData.username);
            userItem.setAttribute('data-friend-status', userData.status || 'Status');
            userItem.setAttribute('data-friend-img', userData.profilePicture || '../../images/fotoProfile.png');
            userItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${userData.profilePicture || '../../images/fotoProfile.png'}" alt="User Image" class="img-fluid rounded-circle" style="width: 50px; height: 50px; margin-right: 10px;">
                    <p>${userData.username} <span>${userData.status || 'Status'}</span></p>
                </div>
                <div>
                    <button class="btn btn-primary">Visualizar Perfil</button>
                    <div class="friend-actions" style="display: inline-flex; align-items: center;"></div>
                </div>
            `;

            const uid = getUidFromUrl();

            // Verifique se já existe uma solicitação pendente
            const friendRequestsRef = collection(db, "friendRequests");
            const pendingRequestQuery = query(friendRequestsRef, where("requester", "==", uid), where("requestee", "==", doc.id), where("status", "==", "pending"));
            const pendingRequestSnapshot = await getDocs(pendingRequestQuery);

            // Verifique se já são amigos
            const isFriend = currentUserFriends.some(friend => friend.uid === doc.id);

            // Determina qual botão exibir
            const actionsContainer = userItem.querySelector('.friend-actions');
            if (isFriend) {
                actionsContainer.innerHTML = '<button class="btn btn-danger">Remover Amizade</button>';
            } else if (!pendingRequestSnapshot.empty) {
                actionsContainer.innerHTML = '<button class="btn btn-secondary" disabled>Solicitação Pendente</button>';
            } else {
                actionsContainer.innerHTML = '<button class="btn btn-success">Adicionar Amigo</button>';
            }

            resultsList.appendChild(userItem);

            userItem.querySelector('.btn-primary').addEventListener('click', () => {
                window.location.href = `../otherProfile/otherProfile.html?uid=${doc.id}`;
            });

            if (isFriend) {
                userItem.querySelector('.btn-danger').addEventListener('click', async () => {
                    await removeFriend(doc.id);
                    alert('Amizade removida!');
                    window.location.reload();
                });
            } else if (pendingRequestSnapshot.empty) {
                userItem.querySelector('.btn-success').addEventListener('click', async () => {
                    await sendFriendRequest(doc.id);
                    alert('Solicitação de amizade enviada!');
                    window.location.reload();
                });
            }
        }

        document.getElementById('search-results-container').style.display = 'block';
    }
});

async function sendFriendRequest(friendId) {
    const uid = getUidFromUrl();
    if (uid) {
        // Verifique se já existe uma solicitação pendente
        const friendRequestsRef = collection(db, "friendRequests");
        const q = query(friendRequestsRef, where("requester", "==", uid), where("requestee", "==", friendId), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            alert('Você já enviou uma solicitação de amizade para este usuário.');
            return;
        }

        await addDoc(friendRequestsRef, {
            requester: uid,
            requestee: friendId,
            status: "pending"
        });
        alert('Solicitação de amizade enviada!');
    } else {
        console.log("Nenhum UID encontrado na URL");
    }
}

async function removeFriend(friendId) {
    const uid = getUidFromUrl();
    if (uid) {
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const updatedFriends = userData.friends.filter(id => id !== friendId);
        await updateDoc(userRef, {
            friends: updatedFriends
        });
        const friendRef = doc(db, "users", friendId);
        const friendDoc = await getDoc(friendRef);
        const friendData = friendDoc.data();
        const updatedFriendFriends = friendData.friends.filter(id => id !== uid);
        await updateDoc(friendRef, {
            friends: updatedFriendFriends
        });
    } else {
        console.log("Nenhum UID encontrado na URL");
    }
}

// Função para carregar solicitações de amizade
async function loadFriendRequests() {
    const uid = getUidFromUrl();
    if (uid) {
        const friendRequestsRef = collection(db, "friendRequests");
        const q = query(friendRequestsRef, where("requestee", "==", uid), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);
        const requestsList = document.getElementById('requests-list');
        requestsList.innerHTML = '';

        let requestCount = 0; // Variável para contar as solicitações

        querySnapshot.forEach(async (docSnapshot) => {
            const requestData = docSnapshot.data();
            const requesterDoc = await getDoc(doc(db, "users", requestData.requester));
            if (requesterDoc.exists()) {
                const requesterData = requesterDoc.data();
                const requestItem = document.createElement('div');
                requestItem.classList.add('request-item');
                requestItem.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${requesterData.profilePicture || '../../images/fotoProfile.png'}" alt="User Image" class="img-fluid rounded-circle" style="width: 50px; height: 50px; margin-right: 10px;">
                        <p>${requesterData.username} <span>${requesterData.status || 'Status'}</span></p>
                    </div>
                    <div>
                        <button class="btn btn-success">Aceitar</button>
                        <button class="btn btn-danger">Recusar</button>
                    </div>
                `;
                requestsList.appendChild(requestItem);
                requestCount++; // Incrementa a contagem de solicitações

                requestItem.querySelector('.btn-success').addEventListener('click', async () => {
                    await acceptFriendRequest(docSnapshot.id, requestData.requester);
                });

                requestItem.querySelector('.btn-danger').addEventListener('click', async () => {
                    await deleteDoc(doc(db, "friendRequests", docSnapshot.id));
                    alert('Solicitação de amizade recusada!');
                    window.location.reload();
                });
            }
        });
        document.getElementById('requests-count').textContent = requestCount; // Atualize o contador de solicitações
    }
}

// Função para carregar arquivos do usuário
async function loadUserFiles() {
    const uid = getUidFromUrl();
    if (uid) {
        const filesRef = collection(db, "files");
        const q = query(filesRef, where("owner", "==", uid));
        const querySnapshot = await getDocs(q);
        const filesList = document.getElementById('files-list');
        filesList.innerHTML = '';

        querySnapshot.forEach(docSnapshot => {
            const fileData = docSnapshot.data();
            const timestamp = fileData.timestamp ? fileData.timestamp.toMillis() : Date.now();
            const fileDate = new Date(timestamp).toLocaleString();

            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');
            fileItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas fa-file-alt" style="margin-right: 10px;"></i>
                    <div>
                        <p>${fileData.fileName}</p>
                        <p class="file-date">${fileDate}</p>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="btn btn-primary">Editar Arquivo</button>
                    <a href="${fileData.fileUrl}" target="_blank" class="btn btn-success">Baixar Arquivo</a>
                    <button class="btn btn-danger">Excluir Arquivo</button>
                </div>
            `;
            filesList.appendChild(fileItem);

            fileItem.querySelector('.btn-primary').addEventListener('click', () => {
                openEditFileModal(docSnapshot.id, fileData.fileName, fileData.fileUrl);
            });

            fileItem.querySelector('.btn-danger').addEventListener('click', async () => {
                await deleteDoc(doc(db, "files", docSnapshot.id));
                alert('Arquivo excluído!');
                window.location.reload();
            });
        });

        updateFileCounter();
    } else {
        console.log("Nenhum UID encontrado na URL");
    }
}

// Função para abrir o modal de edição de arquivo
function openEditFileModal(fileId, currentFileName, currentFileUrl) {
    document.getElementById('edit-file-id').value = fileId;
    document.getElementById('edit-file-name').value = currentFileName;
    document.getElementById('edit-file-upload').value = ''; // Reset file input
    $('#editFileModal').modal('show');
}

// Atualizar contadores de amigos e solicitações de amizade individualmente
function updateFriendCounter() {
    const friendsCount = document.querySelectorAll('#friends-list .friend-item').length;
    document.getElementById('friends-count').textContent = friendsCount;
}

function updateFileCounter() {
    const filesCount = document.querySelectorAll('#files-list .file-item').length;
    document.getElementById('files-count').textContent = filesCount;
}

function updateRequestCounter(requestCount) {
    document.getElementById('requests-count').textContent = requestCount;
}

async function acceptFriendRequest(requestId, requesterId) {
    const uid = getUidFromUrl();
    if (uid) {
        const userRef = doc(db, "users", uid);
        const requesterRef = doc(db, "users", requesterId);

        await updateDoc(userRef, {
            friends: arrayUnion(requesterId)
        });

        await updateDoc(requesterRef, {
            friends: arrayUnion(uid)
        });

        await deleteDoc(doc(db, "friendRequests", requestId));
        alert('Amizade aceita!');
        window.location.reload();
    } else {
        console.log("Nenhum UID encontrado na URL");
    }
}

async function declineFriendRequest(requestId) {
    const requestRef = doc(db, "friendRequests", requestId);
    await deleteDoc(requestRef);
}

let currentUserGroups = [];

// Função para carregar grupos do usuário
async function loadUserGroups() {
    const uid = getUidFromUrl();
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        const groupList = document.getElementById('groups-list');
        groupList.innerHTML = '';

        if (userData.groups && userData.groups.length > 0) {
            for (const groupId of userData.groups) {
                const groupDoc = await getDoc(doc(db, "groups", groupId));

                if (groupDoc.exists()) {
                    const groupData = groupDoc.data();
                    const userRole = groupData.members.find(member => member.uid === uid).role;
                    const isAdmin = userRole === 'admin';

                    const groupItem = document.createElement('div');
                    groupItem.classList.add('group-item');
                    groupItem.innerHTML = `
                        <div class="d-flex align-items-center">
                            <a href="../../groups/groups.html?groupId=${groupId}">
                                <img src="${groupData.groupPicture || '../../images/fotoProfile.png'}" alt="Group Image" class="img-fluid rounded-circle" style="width: 50px; height: 50px; margin-right: 10px;">
                            </a>
                            <p>${groupData.groupName} <span>${isAdmin ? 'Administrador' : 'Membro'}</span></p>
                        </div>
                        <div>
                            ${isAdmin ? '<button class="btn btn-primary edit-group-btn">Editar</button>' : ''}
                            ${isAdmin ? '<button class="btn btn-danger delete-group-btn">Excluir</button>' : ''}
                            <button class="btn btn-warning leave-group-btn">Sair do Grupo</button>
                        </div>
                    `;

                    groupList.appendChild(groupItem);

                    if (isAdmin) {
                        groupItem.querySelector('.edit-group-btn').addEventListener('click', () => {
                            openEditGroupModal(groupId);
                        });

                        groupItem.querySelector('.delete-group-btn').addEventListener('click', async () => {
                            await deleteDoc(doc(db, "groups", groupId));
                            alert('Grupo excluído!');
                            window.location.reload();
                        });
                    }

                    groupItem.querySelector('.leave-group-btn').addEventListener('click', async () => {
                        await updateDoc(doc(db, "groups", groupId), {
                            members: arrayRemove({ uid: uid, role: userRole })
                        });
                        await updateDoc(userRef, {
                            groups: arrayRemove(groupId)
                        });
                        alert('Você saiu do grupo!');
                        window.location.reload();
                    });
                }
            }
        }
        updateGroupCounter(); // Atualize o contador de grupos após carregar a lista de grupos
    }
}

// Função para atualizar o contador de grupos
function updateGroupCounter() {
    const groupsCount = document.querySelectorAll('#groups-list .group-item').length;
    document.getElementById('groups-count').textContent = groupsCount;
}

// Função para sair do grupo
async function leaveGroup(groupId) {
    const uid = getUidFromUrl();
    if (uid) {
        const userRef = doc(db, "users", uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();
        const updatedGroups = userData.groups.filter(id => id !== groupId);
        await updateDoc(userRef, {
            groups: updatedGroups
        });
    } else {
        console.log("Nenhum UID encontrado na URL");
    }
}

document.getElementById('upload-file-btn').addEventListener('click', () => {
    $('#uploadFileModal').modal('show');
});

function editFile(fileId, currentFileName, currentFileUrl) {
    const newFileName = prompt("Digite o novo nome do arquivo:", currentFileName);
    const newFileUpload = document.createElement('input');
    newFileUpload.type = 'file';
    newFileUpload.style.display = 'none';
    document.body.appendChild(newFileUpload);
    newFileUpload.click();

    newFileUpload.addEventListener('change', async () => {
        const newFile = newFileUpload.files[0];
        const uid = getUidFromUrl();
        const storageRef = firebase.storage().ref();
        const fileRef = storageRef.child(`files/${uid}/${newFile.name}`);
        await fileRef.put(newFile);
        const newFileUrl = await fileRef.getDownloadURL();
        
        const fileRefDoc = doc(db, "files", fileId);
        await updateDoc(fileRefDoc, {
            fileName: newFileName || currentFileName,
            fileUrl: newFileUrl || currentFileUrl,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('Arquivo atualizado com sucesso!');
        window.location.reload();
    });
}

////////////////////////////////////////////////////////////////////////
// FUNÇÕES PARA NOTIFICAÇÕES
////////////////////////////////////////////////////////////////////////
async function listenForNotifications() {
    const uid = getUidFromUrl();
    if (uid) {
        // Escutar solicitações de amizade
        onSnapshot(query(collection(db, "friendRequests"), where("requestee", "==", uid), where("status", "==", "pending")), (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === "added") {
                    const requestData = change.doc.data();
                    const requesterDoc = await getDoc(doc(db, "users", requestData.requester));
                    const requesterData = requesterDoc.data();
                    showNotification(`${requesterData.username} enviou uma solicitação de amizade!`);
                }
            });
        });

        // Escutar alterações no status das solicitações de amizade
        onSnapshot(query(collection(db, "friendRequests"), where("requester", "==", uid), where("status", "in", ["accepted", "declined"])), (snapshot) => {
            snapshot.docChanges().forEach(async (change) => {
                if (change.type === "modified") {
                    const requestData = change.doc.data();
                    const requesteeDoc = await getDoc(doc(db, "users", requestData.requestee));
                    const requesteeData = requesteeDoc.data();
                    if (requestData.status === "accepted") {
                        showNotification(`${requesteeData.username} aceitou sua solicitação de amizade!`);
                    } else if (requestData.status === "declined") {
                        showNotification(`${requesteeData.username} recusou sua solicitação de amizade.`);
                    }
                }
            });
        });

        // Escutar mensagens recebidas
        const userFriendsRef = collection(db, "users", uid, "friends");
        const userFriendsSnapshot = await getDocs(userFriendsRef);

        userFriendsSnapshot.forEach((friendDoc) => {
            const friendId = friendDoc.id;
            const chatId = uid < friendId ? `${uid}_${friendId}` : `${friendId}_${uid}`;
            const messagesRef = collection(db, 'chats', chatId, 'messages');

            onSnapshot(query(messagesRef, orderBy('timestamp', 'desc'), limit(1)), (snapshot) => {
                snapshot.docChanges().forEach(async (change) => {
                    if (change.type === "added" && change.doc.data().sender !== uid) {
                        const messageData = change.doc.data();
                        const senderDoc = await getDoc(doc(db, "users", messageData.sender));
                        const senderData = senderDoc.data();
                        showNotification(`${senderData.username} enviou uma mensagem: ${messageData.message}`);
                    }
                });
            });
        });
    }
}

const notifications = new Set();

function showNotification(message) {
    if (notifications.has(message)) {
        return;
    }

    notifications.add(message);

    const notificationContainer = document.getElementById('notification-container');
    const notificationItem = document.createElement('div');
    notificationItem.classList.add('notification-item');
    notificationItem.innerHTML = `<p>${message}</p><button onclick="dismissNotification(this, '${message}')">Dismiss</button>`;
    notificationContainer.appendChild(notificationItem);
    notificationContainer.style.display = 'block';

    // Adicionar animação de fade-in para a notificação
    notificationItem.style.opacity = 0;
    setTimeout(() => {
        notificationItem.style.transition = 'opacity 0.5s';
        notificationItem.style.opacity = 1;
    }, 100);
}

function dismissNotification(button, message) {
    const notificationItem = button.parentElement;
    notificationItem.style.transition = 'opacity 0.5s';
    notificationItem.style.opacity = 0;
    setTimeout(() => {
        notificationItem.remove();
        notifications.delete(message);
        if (document.querySelectorAll('.notification-item').length === 0) {
            document.getElementById('notification-container').style.display = 'none';
        }
    }, 500);
}
// Atualize a função `DOMContentLoaded` para inicializar a aba de arquivos
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('groups-tab-item')) {
        document.getElementById('groups-tab-item').style.display = 'none';
    }
    if (document.getElementById('create-group-btn')) {
        document.getElementById('create-group-btn').style.display = 'none';
    }
    if (document.getElementById('files-tab-item')) {
        document.getElementById('files-tab-item').style.display = 'none';
    }
    loadFriendRequests();
    listenForNotifications();
    redirectToProfile();
    redirectToForum();
    loadUserGroups(); // Adicione esta linha para garantir que os grupos sejam carregados
});
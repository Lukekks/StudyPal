import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, updateDoc, query, orderBy, onSnapshot, arrayUnion, arrayRemove, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAlNrUBWw5szCdUW6FdvBPeoXjr0xVKYXI",
    authDomain: "studypal-dd642.firebaseapp.com",
    projectId: "studypal-dd642",
    storageBucket: "studypal-dd642.appspot.com",
    messagingSenderId: "335106462423",
    appId: "1:335106462423:web:7f902e7636490c2a49d692",
    measurementId: "G-MPMBDRTBJF"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

function redirectToProfile() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            document.getElementById('profile-link').href = `../profile/principal/profile.html?uid=${uid}`;
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
            const profilePic = userData.profilePicture || '/images/default-profile-pic.jpg';
            document.getElementById('profile-pic').src = profilePic; // Atualiza a imagem do perfil no menu
            document.getElementById('user-profile-pic').src = profilePic; // Atualiza a imagem no campo de envio de mensagens
        } else {
            console.log("Usuário logado não encontrado no Firestore.");
        }
    });
}

async function loadGroupData(groupId) {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        
        const groupNameElement = document.querySelector('.group-header h1');
        const groupPictureElement = document.querySelector('.group-header img');
        const groupDescriptionElement = document.querySelector('.info-card p');
        const navTitleElement = document.querySelector('.container-menu .container-nav-options ul li a');
        
        if (groupNameElement) {
            groupNameElement.textContent = groupData.groupName;
        }

        if (groupPictureElement) {
            groupPictureElement.src = groupData.groupPicture || '../../images/fotoProfile.png';
        }

        if (groupDescriptionElement) {
            groupDescriptionElement.textContent = groupData.groupDescription;
        }

        // Atualizar o título do grupo
        document.title = groupData.groupName; // Atualiza o título da página
        
        if (navTitleElement) {
            navTitleElement.textContent = groupData.groupName; // Atualiza o título do grupo no menu
        }

        // Verifica se o usuário atual é administrador
        const currentUser = auth.currentUser.uid;
        const isAdmin = groupData.members.some(member => member.uid === currentUser && member.role === 'admin');
        if (isAdmin) {
            document.getElementById('edit-group-btn').style.display = 'block';
            document.getElementById('add-member-btn').style.display = 'block';
            document.getElementById('edit-group-btn').addEventListener('click', () => {
                openEditGroupModal(groupId);
            });
            document.getElementById('add-member-btn').addEventListener('click', () => {
                $('#addMemberModal').modal('show');
            });
        } else {
            document.getElementById('edit-group-btn').style.display = 'none';
            document.getElementById('add-member-btn').style.display = 'none';
        }

        // Carrega os membros do grupo
        const membersContainer = document.getElementById('group-members');
        membersContainer.innerHTML = '';
        for (const member of groupData.members) {
            const memberDoc = await getDoc(doc(db, "users", member.uid));
            if (memberDoc.exists()) {
                const memberData = memberDoc.data();
                const roleText = member.role === 'admin' ? 'Admin' : 'Membro';
                const memberItem = document.createElement('div');
                memberItem.classList.add('member-item');
                memberItem.innerHTML = `
                    <div class="d-flex align-items-center">
                        <img src="${memberData.profilePicture || '../../images/fotoProfile.png'}" alt="User Image" class="img-fluid rounded-circle" style="width: 50px; height: 50px; margin-right: 10px;">
                        <p><strong>${memberData.username}</strong> <span class="role-text">${roleText}</span></p>
                    </div>
                    <div>
                        ${isAdmin ? `<button class="btn btn-danger btn-sm remove-member-btn" data-uid="${member.uid}" data-role="${member.role}">Remover Membro</button>` : ''}
                    </div>
                `;
                membersContainer.appendChild(memberItem);

                if (isAdmin) {
                    memberItem.querySelector('.remove-member-btn').addEventListener('click', () => {
                        const uid = member.uid;
                        const role = member.role;
                        openRemoveMemberModal(uid, role, groupId);
                    });
                }
            }
        }

        // Carrega as mensagens em tempo real
        loadMessages(groupId);
    } else {
        console.log("Grupo não encontrado");
    }
}


function closeAddMemberModal() {
    $('#addMemberModal').modal('hide');
}

document.getElementById('close-add-member-modal').addEventListener('click', closeAddMemberModal);

function closeEditGroupModal() {
    $('#editGroupModal').modal('hide');
}

document.getElementById('close-edit-group-modal').addEventListener('click', closeEditGroupModal);

function closeRemoveMemberModal() {
    $('#removeMemberModal').modal('hide');
}

document.getElementById('close-remove-member-modal').addEventListener('click', closeRemoveMemberModal);
document.getElementById('cancel-remove-member-btn').addEventListener('click', closeRemoveMemberModal);

function openEditGroupModal(groupId) {
    getDoc(doc(db, "groups", groupId)).then(groupDoc => {
        if (groupDoc.exists()) {
            const groupData = groupDoc.data();
            document.getElementById('edit-group-id').value = groupId;
            document.getElementById('edit-group-name').value = groupData.groupName;
            document.getElementById('edit-group-description').value = groupData.groupDescription;
            $('#editGroupModal').modal('show');
        }
    });
}

function openRemoveMemberModal(uid, role, groupId) {
    const confirmButton = document.getElementById('confirm-remove-member-btn');
    confirmButton.onclick = async function() {
        await updateDoc(doc(db, "groups", groupId), {
            members: arrayRemove({ uid: uid, role: role })
        });
        await updateDoc(doc(db, "users", uid), {
            groups: arrayRemove(groupId)
        });
        alert('Membro removido!');
        closeRemoveMemberModal();
        window.location.reload();
    };
    $('#removeMemberModal').modal('show');
}

document.addEventListener('DOMContentLoaded', () => {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
    if (groupId) {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                checkGroupMembership(groupId);
                loadGroupData(groupId);
            } else {
                window.location.href = '../../login/telaLogin.html';
            }
        });
    } else {
        window.location.href = `../profile/principal/profile.html?uid=${currentUser}`;
    }
    redirectToProfile();
});

async function handleEditGroup(event) {
    event.preventDefault();
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
}

async function handleLeaveGroup() {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
    const currentUser = auth.currentUser.uid;
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        await updateDoc(doc(db, "groups", groupId), {
            members: arrayRemove({ uid: currentUser, role: groupData.members.find(member => member.uid === currentUser).role })
        });
        await updateDoc(doc(db, "users", currentUser), {
            groups: arrayRemove(groupId)
        });
        alert('Você saiu do grupo!');
        window.location.href = `../profile/principal/profile.html?uid=${currentUser}`;
    }
}

document.getElementById('leave-group-btn').addEventListener('click', () => {
    $('#leaveGroupModal').modal('show');
});

document.getElementById('confirm-leave-group-btn').addEventListener('click', handleLeaveGroup);

async function checkGroupMembership(groupId) {
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    if (groupDoc.exists()) {
        const groupData = groupDoc.data();
        const currentUser = auth.currentUser.uid;
        const isMember = groupData.members.some(member => member.uid === currentUser);

        if (!isMember) {
            alert('Você não tem permissão para acessar este grupo.');
            window.location.href = `../profile/principal/profile.html?uid=${currentUser}`;
        }
    } else {
        console.log("Grupo não encontrado");
        window.location.href = `../profile/principal/profile.html?uid=${currentUser}`;
    }
}

async function searchUsers(queryString) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("usernameLowerCase", ">=", queryString), where("usernameLowerCase", "<=", queryString + "\uf8ff"));
    const querySnapshot = await getDocs(q);
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    const groupId = new URLSearchParams(window.location.search).get('groupId');
    const groupDoc = await getDoc(doc(db, "groups", groupId));
    const groupData = groupDoc.exists() ? groupDoc.data() : null;

    querySnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        const userItem = document.createElement('div');
        userItem.classList.add('search-result-item');

        const isMember = groupData && groupData.members.some(member => member.uid === userDoc.id);
        const buttonLabel = isMember ? 'Remover Membro' : 'Adicionar Membro';
        const buttonClass = isMember ? 'btn-danger' : 'btn-primary';

        userItem.innerHTML = `
            <div class="user-info">
                <img src="${userData.profilePicture || '../../images/fotoProfile.png'}" alt="User Image" class="img-fluid rounded-circle">
                <p>${userData.username}</p>
            </div>
            <button class="btn btn-sm ${buttonClass} member-action-btn" data-uid="${userDoc.id}">${buttonLabel}</button>
        `;

        resultsContainer.appendChild(userItem);

        userItem.querySelector('.member-action-btn').addEventListener('click', async (event) => {
            const userId = event.target.getAttribute('data-uid');
            if (isMember) {
                // Remove member logic
                await updateDoc(doc(db, "groups", groupId), {
                    members: arrayRemove({ uid: userId, role: 'member' })
                });
                await updateDoc(doc(db, "users", userId), {
                    groups: arrayRemove(groupId)
                });
                alert('Membro removido!');
            } else {
                // Add member logic
                await updateDoc(doc(db, "groups", groupId), {
                    members: arrayUnion({ uid: userId, role: 'member' })
                });
                await updateDoc(doc(db, "users", userId), {
                    groups: arrayUnion(groupId)
                });
                alert('Membro adicionado!');
            }
            window.location.reload();
        });
    });
}

document.getElementById('search-user-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const queryString = document.getElementById('search-user-input').value.trim().toLowerCase();
    searchUsers(queryString);
});

document.getElementById('edit-group-form').addEventListener('submit', handleEditGroup);

async function sendMessage() {
    const groupId = new URLSearchParams(window.location.search).get('groupId');
    const chatInput = document.getElementById('chat-input');
    const fileInput = document.getElementById('file-upload');
    const message = chatInput.value.trim();
    const file = fileInput.files[0];

    if (message || file) {
        const currentUser = auth.currentUser;
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            let fileURL = null;
            let fileName = null;

            if (file) {
                const storageRef = ref(storage, `uploads/${groupId}/${Date.now()}_${file.name}`);
                try {
                    const snapshot = await uploadBytes(storageRef, file);
                    fileURL = await getDownloadURL(snapshot.ref);
                    fileName = file.name;
                    fileInput.value = ''; // Limpa o campo de arquivo
                } catch (error) {
                    console.error("Erro ao fazer upload do arquivo:", error);
                    return;
                }
            }

            const messageData = {
                sender: currentUser.uid,
                senderName: userData.username || 'User',
                senderProfilePicture: userData.profilePicture || '/images/default-profile-pic.jpg',
                message: message,
                fileURL: fileURL,
                fileName: fileName,
                timestamp: new Date()
            };

            await addDoc(collection(db, "groups", groupId, "messages"), messageData);
            chatInput.value = ''; // Limpa o campo de entrada
        } else {
            console.log("No user data found for UID:", currentUser.uid);
        }
    }
}

function loadMessages(groupId) {
    const messagesRef = collection(db, "groups", groupId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    onSnapshot(q, (snapshot) => {
        const messagesWindow = document.getElementById('messages-window');
        messagesWindow.innerHTML = ''; // Limpa a janela de mensagens

        snapshot.forEach((doc) => {
            const messageData = doc.data();

            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.classList.add(messageData.sender === auth.currentUser.uid ? 'sent' : 'received');

            // Adiciona a formatação desejada
            const messageHtml = `
                <div class="message-header">
                    <img src="${messageData.senderProfilePicture || '/images/default-profile-pic.jpg'}" alt="Profile Picture">
                    <span>${messageData.senderName}</span>
                </div>
                <div class="message-content">${messageData.message}</div>
                ${messageData.fileURL ? `<a href="${messageData.fileURL}" target="_blank">${messageData.fileName}</a>` : ''}
                <div class="timestamp">${new Date(messageData.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            `;

            messageElement.innerHTML = messageHtml;
            messagesWindow.appendChild(messageElement);
        });

        // Rola a janela de mensagens para o final
        messagesWindow.scrollTop = messagesWindow.scrollHeight;
    });
}

document.getElementById('send-chat-btn').addEventListener('click', sendMessage);
document.getElementById('chat-input').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

document.getElementById('file-upload-btn').addEventListener('click', () => {
    document.getElementById('file-upload').click();
});

async function testConnection() {
    const storageRef = ref(storage, 'test.txt');
    try {
        await uploadBytes(storageRef, new Blob(['test'], { type: 'text/plain' }));
        const url = await getDownloadURL(storageRef);
        console.log('Connection test successful. URL:', url);
    } catch (error) {
        console.error('Connection test failed:', error);
    }
}

testConnection();
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, updateDoc, arrayRemove } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

function redirectToProfile() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            document.getElementById('profile-link').href = `../principal/profile.html?uid=${uid}`;
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

async function loadUserProfile(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        document.getElementById('username').textContent = userData.username;
        document.getElementById('profile-img').src = userData.profilePicture || '../../images/fotoProfile.png';
        document.getElementById('banner-img').src = userData.bannerPicture || '../../images/carousel_img01.jpg';
        document.getElementById('status').textContent = userData.status || 'Status';
        document.getElementById('bio-text').textContent = userData.bio || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vestibulum convallis magna, quis tincidunt felis consequat eu.';
        document.getElementById('social-text').textContent = userData.socialLinks || 'Links para redes sociais';
        checkFriendStatus(userData.friends || []);
        loadFriends(userData.friends || []);
    } else {
        console.log("Usuário não encontrado");
    }
}

async function checkFriendStatus(friendIds) {
    const currentUid = auth.currentUser.uid;
    const uid = getUidFromUrl();
    const friendBtn = document.getElementById('friend-btn');

    if (friendIds.includes(currentUid)) {
        friendBtn.textContent = 'Remover Amizade';
        friendBtn.classList.remove('btn-success');
        friendBtn.classList.add('btn-danger');
        friendBtn.addEventListener('click', async function() {
            await removeFriend(uid);
            alert('Amizade removida!');
            window.location.reload();
        });
    } else {
        friendBtn.textContent = 'Adicionar Amigo';
        friendBtn.classList.remove('btn-danger');
        friendBtn.classList.add('btn-success');
        friendBtn.addEventListener('click', async function() {
            await sendFriendRequest(uid);
            alert('Solicitação de amizade enviada!');
        });
    }
}

async function loadFriends(friendIds) {
    const friendsList = document.getElementById('friends-list');
    friendsList.innerHTML = '';
    const uniqueFriendIds = [...new Set(friendIds)]; // Usar um conjunto para garantir unicidade

    for (const friendId of uniqueFriendIds) {
        const friendDoc = await getDoc(doc(db, "users", friendId));
        if (friendDoc.exists()) {
            const friendData = friendDoc.data();
            const friendItem = document.createElement('div');
            friendItem.classList.add('friend-item');
            friendItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${friendData.profilePicture || '../../images/fotoProfile.png'}" alt="User Image" class="img-fluid rounded-circle" style="width: 50px; height: 50px; margin-right: 10px;">
                    <p>${friendData.username} <span>${friendData.status || 'Status'}</span></p>
                </div>
                <div>
                    <button class="btn btn-view-profile" data-uid="${friendId}">Visualizar Perfil</button>
                </div>
            `;
            friendsList.appendChild(friendItem);

            // Adicionar event listener para visualizar perfil
            friendItem.querySelector('.btn-view-profile').addEventListener('click', () => {
                window.location.href = `../otherProfile/otherProfile.html?uid=${friendId}`;
            });
        }
    }
}

async function sendFriendRequest(friendId) {
    const currentUid = auth.currentUser.uid;
    await addDoc(collection(db, "friendRequests"), {
        requester: currentUid,
        requestee: friendId,
        status: "pending"
    });
}

async function removeFriend(friendId) {
    const currentUid = auth.currentUser.uid;
    const userRef = doc(db, "users", currentUid);
    const friendRef = doc(db, "users", friendId);

    await updateDoc(userRef, {
        friends: arrayRemove(friendId)
    });

    await updateDoc(friendRef, {
        friends: arrayRemove(currentUid)
    });
}

function getUidFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('uid');
}

document.addEventListener('DOMContentLoaded', () => {
    redirectToProfile();
    const uid = getUidFromUrl();
    loadUserProfile(uid);
});
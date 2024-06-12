import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

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
            document.getElementById('profile-pic').src = userData.profilePicture || '../../images/fotoProfile.png';
        } else {
            console.log("Usuário logado não encontrado no Firestore.");
        }
    });
}

async function loadArticles() {
    const articlesCol = collection(db, "articles");
    const articleSnapshot = await getDocs(articlesCol);
    const articleList = articleSnapshot.docs.map(doc => doc.data());

    const articleContainer = document.getElementById("articles-container");
    articleContainer.innerHTML = '';
    articleList.forEach(article => {
        const articleDiv = document.createElement("div");
        articleDiv.classList.add("mb-4", "article-card");
        articleDiv.innerHTML = `
            <div class="article-icon">
                <i class="fas fa-file-alt fa-2x"></i>
            </div>
            <div class="article-content">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${article.description}</p>
                <a href="${article.fileUrl}" class="btn btn-primary btn-sm" target="_blank">Baixar PDF</a>
                <p class="card-text"><small class="text-muted">Autor: ${article.author}</small></p>
            </div>
        `;
        articleContainer.appendChild(articleDiv);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    redirectToProfile();
    loadArticles();

    const createArticleForm = document.getElementById("createArticleForm");
    createArticleForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const title = document.getElementById("articleTitle").value;
        const description = document.getElementById("articleDescription").value;
        const file = document.getElementById("articleFile").files[0];

        const user = auth.currentUser;
        if (user) {
            const uid = user.uid;
            const storageRef = ref(storage, `articles/${uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const fileUrl = await getDownloadURL(storageRef);

            await addDoc(collection(db, "articles"), {
                title: title,
                description: description,
                fileUrl: fileUrl,
                author: uid
            });

            alert("Artigo publicado com sucesso!");
            $('#createArticleModal').modal('hide');
            createArticleForm.reset();
            loadArticles(); // Recarrega os artigos sem precisar recarregar a página inteira
        } else {
            alert("Você precisa estar logado para publicar um artigo.");
        }
    });
});

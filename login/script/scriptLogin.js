import { auth } from './firebaseConfig.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            window.location.href = `../../forum/telaForum.html?uid=${user.uid}`;
        })
        .catch((error) => {
            console.error("Erro ao fazer login: ", error);
            alert("Erro ao fazer login: " + error.message);
        });
});

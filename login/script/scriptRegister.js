import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Regex para validar os requisitos da senha
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[\W_]).{6,}$/;

    if (password !== confirmPassword) {
        alert("As senhas não coincidem.");
        return;
    }

    if (!passwordRegex.test(password)) {
        alert("A senha deve ter pelo menos 6 caracteres, incluindo pelo menos 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            profilePicture: "../../images/fotoProfile.png" // Defina um valor padrão
        });

        // Verifique o UID do usuário
        console.log("User UID:", user.uid);

        // Verifique o URL gerado para o redirecionamento
        const profileUrl = `https://lukekks.github.io/forum/telaForum.html?uid=${user.uid}`;
        console.log("Redirection URL:", profileUrl);

        // Redireciona para a página de perfil do usuário usando seu UID
        window.location.replace(profileUrl);
    } catch (error) {
        console.error("Erro ao registrar: ", error);
        alert("Erro ao registrar: " + error.message);
    }
});

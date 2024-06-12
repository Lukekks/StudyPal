document.addEventListener('DOMContentLoaded', function() {
    const publishArticleBtn = document.getElementById('publishArticleBtn');

    publishArticleBtn.addEventListener('click', function() {
        alert('Redirecionando para a página de publicação de artigos...');
        window.location.href = '../pages/publicarArtigo.html';
    });
});

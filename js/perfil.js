function mudarAba(nomeAba) {
    const botoes = document.querySelectorAll('.aba-btn');
    const secoes = document.querySelectorAll('.conteudo-secao');

    // Oculta todas as seções
    secoes.forEach(secao => secao.style.display = 'none');
    
    // Remove a classe ativa de todos os botões e adiciona no correto
    botoes.forEach(botao => {
        botao.classList.remove('active');
        if(botao.getAttribute('onclick') && botao.getAttribute('onclick').includes(nomeAba)) {
            botao.classList.add('active');
        }
    });

    // Mostra a seção correspondente à aba clicada
    if (nomeAba === 'favoritos') {
        document.getElementById('aba-favoritos').style.display = 'block';
    } else if (nomeAba === 'assistidos') {
        document.getElementById('aba-assistidos').style.display = 'block';
    } else if (nomeAba === 'avaliacoes') {
        document.getElementById('aba-avaliacoes').style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const favoritosGrid = document.getElementById('favoritos-grid');
    const assistidosGrid = document.getElementById('assistidos-grid'); // Captura a nova grid
    const reviewsGrid = document.getElementById('reviews-grid');

    // 1. CONTROLAR LOGIN E NOME DO USUÁRIO
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));
    if (usuarioLogado) {
        const perfilNome = document.getElementById('perfil-nome');
        const btnLogin = document.getElementById('btn-login');
        
        if (perfilNome) perfilNome.textContent = usuarioLogado.username;
        if (btnLogin) {
            btnLogin.textContent = "Sair";
            btnLogin.href = "#";
            btnLogin.addEventListener('click', () => {
                localStorage.removeItem('usuario_logado');
                window.location.href = 'index.html';
            });
        }
    }

    // 2. RESGATAR DADOS DO LOCALSTORAGE
    const favoritos = JSON.parse(localStorage.getItem('anime_favoritos')) || [];
    const assistidos = JSON.parse(localStorage.getItem('anime_assistidos')) || [];
    const avaliacoes = JSON.parse(localStorage.getItem('anime_avaliacoes')) || [];

    // 3. ATUALIZAR OS CONTADORES DINAMICAMENTE
    const elementoContadorFavoritos = document.getElementById('total-favoritos');
    if (elementoContadorFavoritos) {
        elementoContadorFavoritos.innerText = favoritos.length;
    }

    const elementoContadorAssistidos = document.getElementById('total-assistidos');
    if (elementoContadorAssistidos) {
        elementoContadorAssistidos.innerText = assistidos.length;
    }

    // 4. RENDERIZAR GRADE DE FAVORITOS
    if (favoritosGrid) {
        if (favoritos.length === 0) {
            favoritosGrid.innerHTML = '<p class="loading">Nenhum anime favoritado ainda.</p>';
        } else {
            favoritosGrid.innerHTML = '';
            favoritos.forEach(anime => {
                const card = document.createElement('div');
                card.classList.add('card-anime');
                card.innerHTML = `
                    <img src="${anime.imagem}" alt="${anime.titulo}">
                    <div class="card-anime-info">
                        <h4 title="${anime.titulo}">${anime.titulo}</h4>
                        <p>⭐ ${anime.nota}</p>
                    </div>
                `;
                card.addEventListener('click', () => {
                    window.location.href = `anime.html?id=${anime.id}`;
                });
                favoritosGrid.appendChild(card);
            });
        }
    }

    // 5. RENDERIZAR GRADE DE ASSISTIDOS
    if (assistidosGrid) {
        if (assistidos.length === 0) {
            assistidosGrid.innerHTML = '<p class="loading">Nenhum anime marcado como assistido ainda.</p>';
        } else {
            assistidosGrid.innerHTML = '';
            assistidos.forEach(anime => {
                const card = document.createElement('div');
                card.classList.add('card-anime');
                card.innerHTML = `
                    <img src="${anime.imagem}" alt="${anime.titulo}">
                    <div class="card-anime-info">
                        <h4 title="${anime.titulo}">${anime.titulo}</h4>
                        <p>⭐ ${anime.nota}</p>
                    </div>
                `;
                card.addEventListener('click', () => {
                    window.location.href = `anime.html?id=${anime.id}`;
                });
                assistidosGrid.appendChild(card);
            });
        }
    }

    // 6. RENDERIZAR LISTA DE CRÍTICAS
    if (reviewsGrid) {
        if (avaliacoes.length === 0) {
            reviewsGrid.innerHTML = '<p class="loading">Você ainda não escreveu nenhuma crítica.</p>';
        } else {
            reviewsGrid.innerHTML = '';
            avaliacoes.forEach(review => {
                const numNota = parseInt(review.nota) || 5;
                const estrelas = '⭐'.repeat(numNota);

                const itemReview = document.createElement('div');
                itemReview.classList.add('review-item');
                itemReview.innerHTML = `
                    <h5>${review.animeTitulo}</h5>
                    <div class="review-nota">${estrelas} - em ${review.data}</div>
                    <p class="review-texto">"${review.texto}"</p>
                `;
                reviewsGrid.appendChild(itemReview);
            });
        }
    }
});
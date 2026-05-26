const API_URL = 'https://api.jikan.moe/v4';
const container = document.getElementById('anime-detalhes-container');

const urlParams = new URLSearchParams(window.location.search);
const animeId = urlParams.get('id');

if (!animeId) {
    window.location.href = 'index.html';
}

async function traduzirTexto(textoIngles) {
    if (!textoIngles) return 'Sinopse não disponível.';
    let textoParaTraduzir = textoIngles;
    if (textoIngles.length > 450) {
        textoParaTraduzir = textoIngles.substring(0, 450) + "...";
    }
    try {
        const urlTraducao = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textoParaTraduzir)}&langpair=en|pt-BR`;
        const response = await fetch(urlTraducao);
        if (!response.ok) throw new Error('Falha na resposta da API');
        const dados = await response.json();
        if (dados.responseData.translatedText.includes("QUERY LENGTH LIMIT")) return textoIngles;
        return dados.responseData.translatedText;
    } catch (erro) {
        return textoIngles;
    }
}

async function carregarDetalhesAnime() {
    container.innerHTML = `
        <div class="coluna-esquerda">
            <div class="skeleton skeleton-poster"></div>
        </div>
        <div class="coluna-direita">
            <div class="skeleton skeleton-text titulo"></div>
            <div class="skeleton skeleton-text meta"></div>
            <div class="skeleton skeleton-text"></div>
        </div>
    `;

    try {
        const response = await fetch(`${API_URL}/anime/${animeId}`);
        const resultado = await response.json();
        const anime = resultado.data;

        if (!anime) {
            container.innerHTML = '<p class="loading">Anime não encontrado.</p>';
            return;
        }

        document.title = `${anime.title} | Animeboxd`;
        const statusTraduzido = anime.status === 'Finished Airing' ? 'Finalizado' : 'Em lançamento';
        const sinopseTraduzida = await traduzirTexto(anime.synopsis);

        container.innerHTML = `
            <div class="coluna-esquerda">
                <img class="anime-poster" src="${anime.images.jpg.large_image_url}" alt="${anime.title}">
                <button class="btn-acao btn-favoritar" id="btn-favoritar">❤ Adicionar aos Favoritos</button>
                <button class="btn-acao btn-favoritar" id="btn-assistido" style="margin-top: 10px; background-color: #495057;">👁️ Marcar como Assistido</button>
            </div>

            <div class="coluna-direita">
                <h2>${anime.title}</h2>
                <div class="anime-meta">
                    <span>${anime.year || 'Ano N/A'}</span> | 
                    <span>${anime.episodes || '?'} episódios</span> | 
                    <span>Nota global: ⭐ ${anime.score || 'N/A'}</span> |
                    <span>${statusTraduzido}</span>
                </div>

                <p class="anime-sinopse">${sinopseTraduzida}</p>

                <div class="secao-avaliacao">
                    <h3>Deixe sua Crítica</h3>
                    <form id="form-review">
                        <div class="form-grupo">
                            <label for="nota-usuario">Sua nota (Estrelas):</label>
                            <select id="nota-usuario" required>
                                <option value="5">⭐⭐⭐⭐⭐ (Excelente)</option>
                                <option value="4">⭐⭐⭐⭐ (Muito Bom)</option>
                                <option value="3">⭐⭐⭐ (Bom)</option>
                                <option value="2">⭐⭐ (Regular)</option>
                                <option value="1">⭐ (Ruim)</option>
                            </select>
                        </div>
                        <div class="form-grupo">
                            <label for="texto-review">Sua opinião sobre o anime:</label>
                            <textarea id="texto-review" placeholder="Escreva o que achou..." required></textarea>
                        </div>
                        <button type="submit" class="btn-acao" style="background-color: var(--cor-destaque); color: white;">Salvar Avaliação</button>
                    </form>
                </div>
            </div>
        `;

        configurarEventosBotoes(anime);

    } catch (erro) {
        console.error(erro);
        container.innerHTML = '<p class="loading" style="color: #ff4d4d;">Erro ao carregar dados.</p>';
    }
}

function configurarEventosBotoes(anime) {
    const btnFavoritar = document.getElementById('btn-favoritar');
    const btnAssistido = document.getElementById('btn-assistido');
    const formReview = document.getElementById('form-review');

    const KEY_FAVORITOS = 'anime_favoritos';
    const KEY_ASSISTIDOS = 'anime_assistidos';
    const KEY_AVALIACOES = 'anime_avaliacoes';

    const temPopup = typeof mostrarNotificacao === 'function';

    // --- CONFIGURAÇÃO INICIAL DOS BOTÕES ---
    let favoritos = JSON.parse(localStorage.getItem(KEY_FAVORITOS)) || [];
    if (favoritos.some(fav => fav.id === anime.mal_id)) {
        btnFavoritar.textContent = '💔 Remover dos Favoritos';
        btnFavoritar.style.backgroundColor = '#dc3545';
    }

    let assistidos = JSON.parse(localStorage.getItem(KEY_ASSISTIDOS)) || [];
    if (assistidos.some(ast => ast.id === anime.mal_id)) {
        btnAssistido.textContent = '❌ Remover dos Assistidos';
        btnAssistido.style.backgroundColor = '#ff8000'; // Mesma cor de destaque da marca do app
    }

    // --- EVENTO: FAVORITAR ---
    btnFavoritar.addEventListener('click', () => {
        favoritos = JSON.parse(localStorage.getItem(KEY_FAVORITOS)) || [];
        const index = favoritos.findIndex(fav => fav.id === anime.mal_id);

        if (index === -1) {
            favoritos.push({
                id: anime.mal_id,
                titulo: anime.title,
                imagem: anime.images.jpg.image_url,
                nota: anime.score ? anime.score.toFixed(1) : 'N/A'
            });
            btnFavoritar.textContent = '💔 Remover dos Favoritos';
            btnFavoritar.style.backgroundColor = '#dc3545';
            if (temPopup) mostrarNotificacao(`${anime.title} adicionado aos favoritos!`, 'sucesso');
        } else {
            favoritos.splice(index, 1);
            btnFavoritar.textContent = '❤ Adicionar aos Favoritos';
            btnFavoritar.style.backgroundColor = '#20c997';
            if (temPopup) mostrarNotificacao(`${anime.title} removido dos favoritos.`, 'aviso');
        }
        localStorage.setItem(KEY_FAVORITOS, JSON.stringify(favoritos));
    });

    // --- EVENTO: ASSISTIDO ---
    btnAssistido.addEventListener('click', () => {
        assistidos = JSON.parse(localStorage.getItem(KEY_ASSISTIDOS)) || [];
        const index = assistidos.findIndex(ast => ast.id === anime.mal_id);

        if (index === -1) {
            assistidos.push({
                id: anime.mal_id,
                titulo: anime.title,
                imagem: anime.images.jpg.image_url,
                nota: anime.score ? anime.score.toFixed(1) : 'N/A'
            });
            btnAssistido.textContent = '❌ Remover dos Assistidos';
            btnAssistido.style.backgroundColor = '#ff8000';
            if (temPopup) mostrarNotificacao(`${anime.title} marcado como assistido!`, 'sucesso');
        } else {
            assistidos.splice(index, 1);
            btnAssistido.textContent = '👁️ Marcar como Assistido';
            btnAssistido.style.backgroundColor = '#495057';
            if (temPopup) mostrarNotificacao(`${anime.title} removido dos assistidos.`, 'aviso');
        }
        localStorage.setItem(KEY_ASSISTIDOS, JSON.stringify(assistidos));
    });

    // --- EVENTO: CRÍTICA ---
    formReview.addEventListener('submit', (e) => {
        e.preventDefault();
        const notaUsuario = parseInt(document.getElementById('nota-usuario').value);
        const textoReview = document.getElementById('texto-review').value;
        let avaliacoes = JSON.parse(localStorage.getItem(KEY_AVALIACOES)) || [];

        avaliacoes.unshift({
            animeId: anime.mal_id,
            animeTitulo: anime.title,
            nota: notaUsuario,
            texto: textoReview,
            data: new Date().toLocaleDateString('pt-BR')
        });
        
        localStorage.setItem(KEY_AVALIACOES, JSON.stringify(avaliacoes));
        if (temPopup) mostrarNotificacao('Sua crítica foi publicada com sucesso!', 'sucesso');
        formReview.reset();
    });
}

document.addEventListener('DOMContentLoaded', carregarDetalhesAnime);
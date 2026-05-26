// URL base da API Jikan (baseada no MyAnimeList)
const API_URL = 'https://api.jikan.moe/v4';

// Seleção de elementos do HTML para podermos manipular
const animesGrid = document.getElementById('animes-grid');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const sectionTitle = document.getElementById('section-title');

/* ==========================================================================
   1. FUNÇÃO PARA BUSCAR E EXIBIR OS ANIMES
   ========================================================================== */
async function carregarAnimes(endpoint, tituloSecao) {
    const listaAnimes = document.getElementById('animes-grid'); 
    if (!listaAnimes) return;

    // Atualiza o título da seção se o elemento existir no HTML
    if (sectionTitle && tituloSecao) {
        sectionTitle.textContent = tituloSecao;
    }

    // 1. INJETA O SKELETON: Cria caixas piscando enquanto a API não responde
    listaAnimes.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        listaAnimes.innerHTML += `<div class="skeleton skeleton-card"></div>`;
    }

    try {
        // CORREÇÃO AQUI: Junta a URL base com o endpoint desejado (ex: https://api.jikan.moe/v4/top/anime)
        const response = await fetch(`${API_URL}/${endpoint}`);
        
        if (!response.ok) {
            throw new Error('Erro na requisição da API');
        }

        const dados = await response.json();
        const animes = dados.data; 

        // 2. LIMPA OS SKELETONS: Só apaga o carregamento quando os dados reais chegam
        listaAnimes.innerHTML = ''; 

        if (!animes || animes.length === 0) {
            listaAnimes.innerHTML = '<p class="loading">Nenhum anime encontrado.</p>';
            return;
        }

        // 3. RENDERIZA OS CARDS REAIS
        animes.forEach(anime => {
            const card = document.createElement('div');
            card.classList.add('card-anime');
            
            const nota = anime.score ? anime.score.toFixed(1) : 'N/A';

            card.innerHTML = `
                <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
                <div class="card-anime-info">
                    <h4 title="${anime.title}">${anime.title}</h4>
                    <p>⭐ ${nota}</p>
                </div>
            `;

            card.addEventListener('click', () => {
                window.location.href = `anime.html?id=${anime.mal_id}`;
            });

            listaAnimes.appendChild(card);
        });

    } catch (erro) {
        console.error("Erro detalhado:", erro);
        listaAnimes.innerHTML = '<p class="loading" style="color: #ff4d4d;">Ops! Ocorreu um erro ao carregar os animes. Tente novamente mais tarde.</p>';
    }

    if (typeof atualizarNavbar === 'function') {
        atualizarNavbar();
    }
}

/* ==========================================================================
   2. SISTEMA DE BUSCA (PESQUISA)
   ========================================================================== */
function ejecutarBusca() {
    const termoDeBusca = searchInput.value.trim();

    if (termoDeBusca === '') {
        carregarAnimes('top/anime', 'Animes Mais Populares');
    } else {
        carregarAnimes(`anime?q=${termoDeBusca}`, `Resultados para: "${termoDeBusca}"`);
    }
}

searchButton.addEventListener('click', ejecutarBusca);

searchInput.addEventListener('keypress', (evento) => {
    if (evento.key === 'Enter') {
        ejecutarBusca();
    }
});

/* ==========================================================================
   3. INICIALIZAÇÃO DA PÁGINA
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    carregarAnimes('top/anime', 'Animes Mais Populares');
});

/* ==========================================================================
   4. SISTEMA DE FILTROS POR GÊNERO
   ========================================================================== */
function configurarFiltros() {
    const botoesFiltro = document.querySelectorAll('.btn-filtro');
    
    botoesFiltro.forEach(botao => {
        botao.addEventListener('click', () => {
            // 1. Remove a classe 'active' de todos os botões
            botoesFiltro.forEach(b => b.classList.remove('active'));
            
            // 2. Adiciona a classe 'active' no botão que foi clicado
            botao.classList.add('active');
            
            // 3. Pega o ID do gênero salvo no atributo 'data-id'
            const generoId = botao.getAttribute('data-id');
            const nomeGênero = botao.textContent;

            // Limpa o campo de busca para não confundir o usuário
            if (searchInput) searchInput.value = '';

            // 4. Decide qual URL chamar baseada no botão clicado
            if (generoId === 'populares') {
                carregarAnimes('top/anime', 'Animes Mais Populares');
            } else {
                // Filtra os animes pelo gênero e ordena pelos mais populares do gênero
                carregarAnimes(`anime?genres=${generoId}&order_by=popularity`, `Animes de ${nomeGênero}`);
            }
        });
    });
}

// Garante que os ouvintes dos filtros sejam configurados assim que a página carregar
document.addEventListener('DOMContentLoaded', () => {
    configurarFiltros();
});
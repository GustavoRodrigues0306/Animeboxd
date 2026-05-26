 
   //  1. ALTERNAR ENTRE LOGIN E CADASTRO 
   
function alternarFormularios(tipo) {
    const loginCont = document.getElementById('form-login-container');
    const cadastroCont = document.getElementById('form-cadastro-container');

    if (tipo === 'cadastro') {
        loginCont.style.display = 'none';
        cadastroCont.style.display = 'block';
        document.title = "Criar Conta | Animeboxd";
    } else {
        cadastroCont.style.display = 'none';
        loginCont.style.display = 'block';
        document.title = "Entrar | Animeboxd";
    }
}


// 2. PROCESSAR CADASTRO E LOGIN
   
document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro');
    const formLogin = document.getElementById('form-login');

    // EVENTO DE CADASTRO
    if (formCadastro) {
        formCadastro.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('cad-username').value.trim();
            const email = document.getElementById('cad-email').value.trim().toLowerCase();
            const senha = document.getElementById('cad-senha').value;

            // Criar um objeto de usuário
            const novoUsuario = { username, email, senha };

            // Salva as credenciais no LocalStorage
            localStorage.setItem('usuario_registrado', JSON.stringify(novoUsuario));
            
            alert('Conta criada com sucesso! Faça login para entrar.');
            formCadastro.reset();
            alternarFormularios('login'); // Manda ele para a tela de login
        });
    }

    // EVENTO DE LOGIN
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            const emailInformado = document.getElementById('login-email').value.trim().toLowerCase();
            const senhaInformada = document.getElementById('login-senha').value;

            // Busca se existe algum usuário cadastrado localmente
            const usuarioSalvo = JSON.parse(localStorage.getItem('usuario_registrado'));

            if (!usuarioSalvo) {
                alert('Nenhum usuário cadastrado neste navegador. Vá em Cadastre-se primeiro!');
                return;
            }

            // Valida e-mail e senha
            if (emailInformado === usuarioSalvo.email && senhaInformada === usuarioSalvo.senha) {
                // Cria um token de sessão ativa
                localStorage.setItem('usuario_logado', JSON.stringify({
                    username: usuarioSalvo.username,
                    email: usuarioSalvo.email
                }));

                alert(`Bem-vindo, ${usuarioSalvo.username}! Redirecionando...`);
                window.location.href = 'perfil.html'; // Manda para o Perfil
            } else {
                alert('E-mail ou senha incorretos! Tente novamente.');
            }
        });
    }
});


 //  3. CONTROLAR EXIBIÇÃO DA NAVBAR (LOGADO VS DESLOGADO)

function atualizarNavbar() {
    const btnLogin = document.getElementById('btn-login');
    if (!btnLogin) return; 

    const usuarioLogado = JSON.parse(localStorage.getItem('usuario_logado'));

    // Captura o link estático "Meu Perfil" na navbar (vamos buscar pelo texto do link)
    const linksNavbar = document.querySelectorAll('.navbar nav ul li a');
    let linkMeuPerfil = null;
    
    linksNavbar.forEach(link => {
        if (link.textContent.trim() === 'Meu Perfil') {
            linkMeuPerfil = link.parentElement; // Pega o elemento <li> correspondente
        }
    });

    if (usuarioLogado) {
        // 1. Se estiver logado, ESCONDE o link estático "Meu Perfil" para não duplicar
        if (linkMeuPerfil) {
            linkMeuPerfil.style.display = 'none';
        }

        // 2. Transforma o botão de login no botão do usuário customizado
        btnLogin.textContent = `👤 ${usuarioLogado.username}`;
        btnLogin.href = 'perfil.html';
        btnLogin.className = ''; 
        btnLogin.style.background = 'none';
        btnLogin.style.backgroundColor = '#6366f1'; // Um roxo elegante idêntico ao da imagem
        btnLogin.style.border = 'none';
        btnLogin.style.padding = '0.5rem 1rem';
        btnLogin.style.borderRadius = '4px';
        btnLogin.style.color = 'white';
        btnLogin.style.fontWeight = 'bold';
        
        // 3. Cria o botão de Sair se ele ainda não existir na tela
        const navUl = btnLogin.closest('ul');
        if (navUl && !document.getElementById('btn-sair')) {
            const liSair = document.createElement('li');
            liSair.innerHTML = `<a href="#" id="btn-sair" style="color: #ff4d4d; font-weight: bold; margin-left: 1rem;">Sair</a>`;
            navUl.appendChild(liSair);

            document.getElementById('btn-sair').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('usuario_logado'); 
                window.location.href = 'index.html'; 
            });
        }
    } else {
        // Se o usuário não estiver logado, garante que o link "Meu Perfil" apareça normalmente
        if (linkMeuPerfil) {
            linkMeuPerfil.style.display = 'block';
        }
    }
}

// Força a execução imediata E também no carregamento do DOM
atualizarNavbar();
document.addEventListener('DOMContentLoaded', atualizarNavbar);
window.addEventListener('load', atualizarNavbar);


 //  4. SISTEMA DE ALTERNÂNCIA DE TEMA (DARK / LIGHT MODE)
   
function inicializarTema() {
    const btnTema = document.getElementById('btn-tema');
    
    // Verifica se o usuário já tinha uma preferência salva
    const temaSalvo = localStorage.getItem('tema_preferido') || 'dark';
    
    // Aplica o tema salvo logo de início
    document.documentElement.setAttribute('data-theme', temaSalvo);
    if (btnTema) {
        btnTema.textContent = temaSalvo === 'light' ? '☀️' : '🌙';
    }

    // Configura o evento de clique caso o botão esteja na página atual
    if (btnTema) {
        // Remove ouvintes antigos para evitar duplicações indesejadas
        btnTema.replaceWith(btnTema.cloneNode(true));
        const novoBtnTema = document.getElementById('btn-tema');

        novoBtnTema.addEventListener('click', () => {
            const temaAtual = document.documentElement.getAttribute('data-theme');
            let novoTema = 'dark';

            if (temaAtual === 'dark') {
                novoTema = 'light';
            }

            // Aplica a alteração visual
            document.documentElement.setAttribute('data-theme', novoTema);
            novoBtnTema.textContent = novoTema === 'light' ? '☀️' : '🌙';
            
            // Grava no LocalStorage
            localStorage.setItem('tema_preferido', novoTema);
        });
    }
}

// Inicializa o tema imediatamente para evitar atrasos visuais na renderização
inicializarTema();
document.addEventListener('DOMContentLoaded', inicializarTema);
window.addEventListener('load', inicializarTema);


  // 5. GERADOR DE POPUPS AGRADÁVEIS (TOAST NOTIFICATIONS)
   
function mostrarNotificacao(mensagem, tipo = 'sucesso') {
    // 1. Cria o container de toasts se ele ainda não existir na página
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.classList.add('toast-container');
        document.body.appendChild(container);
    }

    // 2. Define o emoji baseado no tipo para ficar bem visual
    let emoji = '✨';
    if (tipo === 'sucesso') emoji = '✅';
    if (tipo === 'aviso') emoji = '⚠️';
    if (tipo === 'erro') emoji = '❌';

    // 3. Cria a estrutura do Toast
    const toast = document.createElement('div');
    toast.classList.add('toast', tipo);
    toast.innerHTML = `<span>${emoji}</span> <span>${mensagem}</span>`;

    // 4. Joga dentro do container
    container.appendChild(toast);

    // 5. Pequeno delay para disparar a animação do CSS
    setTimeout(() => {
        toast.classList.add('mostrar');
    }, 10);

    // 6. Remove o toast da tela após 3.5 segundos de forma suave
    setTimeout(() => {
        toast.classList.remove('mostrar');
        setTimeout(() => {
            toast.remove();
        }, 300); // Espera a transição de sumir terminar para deletar o HTML
    }, 3500);
}
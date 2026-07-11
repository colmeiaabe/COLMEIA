// pega o botão que ABRE o menu lateral e guarda na variavel 'abrir'
const abrir =
document.getElementById("cel-abrir");

// pega o botão que FECHA o menu lateral e guarda na variavel 'fechar'
const fechar =
document.getElementById("cel-fechar");

// pega o elemento so MENU lateral (a <nav>) e guarda na variavel
const menu =
document.getElementById("aba-cel");

// adicionar um "ouvinte de evento" (event listener) ao botão de abrir
// quando o botão for clicado, o menu vai ser exinido
abrir.addEventListener("click", () => {
  // remove a classe "fechado" (que provavelmente esconde o menu)
  menu.classList.remove("fechado");
  // adicionar a classe "aberto" (que provavelmente esconde o menu)
  menu.classList.add("aberto");
});

// adicionar outro ouvintede de evento ao botão de fechar
// quando o botão for clicado, o menu vai sumir novamente
fechar.addEventListener("click", () => {
  //remove a classe "aberto" (para esconder o meu)
  menu.classList.remove("aberto");
  // adicionar a classe "fechado" (para garantir que o menu fique invisivel)
  menu.classList.add("fechado");
});

// ====== animaçao ======
// essa parte controla a area da animação quando entra no site ou troca de pagina
function transicaoColmeia(callback) {
  // seleciona o elemento principal da animação (a tela que cobre tudo)
  const animacao = document.getElementById("animacaoTransicao");
  if (!animacao) {
    if (callback) callback();
    return;
  }

  // exibe a animação e depois fica oculta por padrão
  animacao.style.display = "flex";

  // remove e adiciona a classe "ativa" para reiniciar animação
  // isso garante que funcione toda vez que for chamada
  animacao.classList.remove("ativa");
  void animacao.offsetWidth; // força o navegador a redesenhar o elemento
  animacao.classList.add("ativa");

  // depois de 1.2 segundos esconde novamente
  // e executa o "callback"-- a função passada para mudar de pagina
  setTimeout(() => {
    animacao.style.display = "none";
    if (callback) callback();
  }, 1200);
}

// roda a animação de carregamento assim que a página abre (e some sozinha depois)
window.addEventListener("load", () => {
  transicaoColmeia();
});

// ======== EVENTOS DE CLIQUE NOS LINKS========
// aguarda todo o conteudo da pagina carregar
document.addEventListener("DOMContentLoaded", () => {

  // seleciona todos os links com a classe "link-pagina"
  // (essa classe é usada nos menus para ativar a animação)
  const links =
  document.querySelectorAll(".link-pagina");

  // para cada link encontrado...
  links.forEach(link => {
    // adiciona o evento de clique
    link.addEventListener("click", e => {
      e.preventDefault(); // impede a troca de pagina imediata

      // pega o destino do link (href)
      const destino = link.getAttribute("href");
      // Executa a animação e, quando ela termina, troca de pagina
      transicaoColmeia(() => {
        window.location.href = destino;
      });
    });
  });
});

// ====== animação da abelhinha guia (apenas na pagina de Cadastro) ======
const campos = document.querySelectorAll(".campo");
const abelha = document.getElementById("abelha");
const mensagem = document.getElementById("mensagem");
const btnProximo = document.getElementById("btnProximo");

let etapa = 0;

// só roda o fluxo do formulario guiado se os elementos existirem nesta pagina
// (evita erros em Index.html e Cursos.html, onde esses elementos não existem)
if (abelha && mensagem && btnProximo && campos.length > 0) {

  window.addEventListener("load", () => {
    setTimeout(() => iniciarEtapa(), 1000);
  });

  function iniciarEtapa() {
    if (etapa < campos.length) {
      campos.forEach(c => c.style.display = 'none');

      const atual = campos[etapa];
      atual.style.display = "flex";

      mensagem.textContent = atual.dataset.msg || "";
      mensagem.style.opacity = "1";
      abelha.style.opacity = "1";

      btnProximo.style.display = "inline-block";

      moverAbelha(atual);
    } else {
      mensagem.textContent = "cadastro concluido! indo para os cursos...";
      mensagem.style.opacity = "1";
      setTimeout(() => {
        window.location.href = "cursos.html";
      }, 2000);
    }
  }

  function moverAbelha(elemento) {
    const rect = elemento.getBoundingClientRect();
    const top = rect.top + window.scrollY - 80;
    const left = rect.left + rect.width / 2;

    abelha.style.transition = "transform 1s ease";

    abelha.style.transform = `translate(${left - window.innerWidth / 2}px, ${top - 100}px)`;
  }

  btnProximo.addEventListener("click", () => {
    const campoAtual = campos[etapa].querySelector("input, select, textarea");

    if (!campoAtual || campoAtual.value.trim() === "") {
      mensagem.textContent = "preencha o campo antes de continuar! 🐝";
      mensagem.style.opacity = "1";
      return;
    }

    mensagem.style.opacity = 0;
    abelha.style.opacity = 0;

    setTimeout(() => {
      campos[etapa].style.display = "none";
      etapa++;
      abelha.style.transition = "none";
      abelha.style.transform = "translate(0,0)";
      abelha.style.opacity = "0";
      setTimeout(() => iniciarEtapa(), 500);
    }, 600);
  });
}

// =====================================================================
// ====== SISTEMA DE MOEDAS FDI (Favor de Interação) ======
// =====================================================================
// Por enquanto tudo é salvo no localStorage (só no navegador da própria
// pessoa). Quando o site tiver banco de dados, é só trocar as funções
// "obterFDI / definirFDI / obterVideosComunidade / salvarVideosComunidade"
// abaixo por chamadas para a API do banco (ex: fetch para /api/fdi,
// /api/videos), mantendo o resto do código igual.
// =====================================================================

const CHAVE_FDI = "colmeia_fdi";       // chave usada no localStorage p/ o saldo
const CHAVE_VIDEOS = "colmeia_videos"; // chave usada no localStorage p/ os vídeos
const CUSTO_ASSISTIR = 1;              // quantos FDI custa assistir 1 vídeo da comunidade

// pega o saldo atual de FDI do usuário (0 se nunca teve nenhum)
function obterFDI() {
  return parseInt(localStorage.getItem(CHAVE_FDI)) || 0;
}

// grava um novo saldo de FDI e atualiza o numerinho na tela
function definirFDI(valor) {
  localStorage.setItem(CHAVE_FDI, valor);
  atualizarBadgeFDI();
}

// atualiza o texto do badge "🪙 X FDI" (existe em todas as páginas)
function atualizarBadgeFDI() {
  const badge = document.getElementById("fdiBalance");
  if (badge) badge.textContent = obterFDI();
}

// pega a lista de vídeos enviados pela comunidade
function obterVideosComunidade() {
  return JSON.parse(localStorage.getItem(CHAVE_VIDEOS) || "[]");
}

// salva a lista de vídeos enviados pela comunidade
function salvarVideosComunidade(lista) {
  localStorage.setItem(CHAVE_VIDEOS, JSON.stringify(lista));
}

// evita que texto digitado pelo usuário quebre o HTML da página (segurança básica)
function escaparTexto(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// desenha os cards de vídeo da comunidade na tela (só existe em Cursos.html)
function renderizarVideosComunidade() {
  const lista = document.getElementById("listaVideosComunidade");
  const semVideos = document.getElementById("semVideos");
  if (!lista) return; // essa seção só existe em Cursos.html

  const videos = obterVideosComunidade();
  lista.innerHTML = "";

  if (videos.length === 0) {
    if (semVideos) semVideos.style.display = "block";
    return;
  }
  if (semVideos) semVideos.style.display = "none";

  videos.forEach(video => {
    const card = document.createElement("div");
    card.className = "cardVideoComunidade";
    card.innerHTML = `
      <h3>${escaparTexto(video.titulo)}</h3>
      <p class="autorVideo">por ${escaparTexto(video.autor)}</p>
      <p class="descVideo">${escaparTexto(video.descricao)}</p>
      <button class="btnAssistirVideo" data-link="${escaparTexto(video.link)}">Assistir (custa ${CUSTO_ASSISTIR} 🪙)</button>
    `;
    lista.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // mostra o saldo de FDI assim que a página abre (funciona em qualquer página)
  atualizarBadgeFDI();

  // desenha os vídeos já enviados (se a página tiver essa seção)
  renderizarVideosComunidade();

  // ====== envio de um novo vídeo tutorial ======
  const formVideo = document.getElementById("formVideo");
  if (formVideo) {
    formVideo.addEventListener("submit", e => {
      e.preventDefault();

      const titulo = document.getElementById("tituloVideo").value.trim();
      const autor = document.getElementById("autorVideo").value.trim();
      const link = document.getElementById("linkVideo").value.trim();
      const descricao = document.getElementById("descVideo").value.trim();

      if (!titulo || !autor || !link || !descricao) return;

      const videos = obterVideosComunidade();
      videos.push({ id: Date.now(), titulo, autor, link, descricao });
      salvarVideosComunidade(videos);

      // recompensa quem enviou o vídeo com 1 FDI
      definirFDI(obterFDI() + 1);

      renderizarVideosComunidade();
      formVideo.reset();

      alert("Vídeo enviado! Você ganhou 1 🪙 FDI. Obrigado por alimentar a Colmeia! 🐝");
    });
  }

  // ====== clique em "Assistir" nos vídeos da comunidade ======
  // usa "delegação de evento" porque os cards são criados depois,
  // então não dá pra grudar o addEventListener direto neles
  const listaVideos = document.getElementById("listaVideosComunidade");
  if (listaVideos) {
    listaVideos.addEventListener("click", e => {
      if (!e.target.classList.contains("btnAssistirVideo")) return;

      const link = e.target.getAttribute("data-link");
      const saldo = obterFDI();

      if (saldo < CUSTO_ASSISTIR) {
        alert("Você não tem FDI suficiente! Envie um vídeo tutorial pra ganhar moedas 🐝");
        return;
      }

      definirFDI(saldo - CUSTO_ASSISTIR);
      window.open(link, "_blank");
    });
  }
});

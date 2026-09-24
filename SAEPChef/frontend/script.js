const API_URL = "/api";

let usuarios = [];
let receitas = [];
let usuarioAtual = null;
let filtroChef = null;

const muralReceitas = document.querySelector("#muralReceitas");
const modalLogin = document.querySelector("#modalLogin");
const formLogin = document.querySelector("#formLogin");

async function carregarUsuarios() {
  const resposta = await fetch(`${API_URL}/usuarios`);
  if (!resposta.ok) throw new Error("Não foi possível carregar os usuários.");
  usuarios = await resposta.json();
}

async function carregarReceitas() {
  const resposta = await fetch(`${API_URL}/receitas`);
  if (!resposta.ok) throw new Error("Não foi possível carregar as receitas.");

  const dados = await resposta.json();

  receitas = dados.map((r) => ({
    id: r.id_receita,
    titulo: r.titulo_receita,
    origem: r.origem_receita,
    chef: r.nome_usuario,
    chefId: r.id_usuario,
    imagem: r.url_imagem,
    favoritos: r.favoritos || []
  }));
}

function criarCartao(receita) {
  const favoritada = usuarioAtual && receita.favoritos.includes(usuarioAtual.id);

  return `<article class="cartao-receita">
    <div class="imagem-receita">
      <img src="${receita.imagem}" alt="Imagem da ${receita.titulo}">
      <div class="tooltip">
        <div>Receita publicada por: @${receita.chef}</div>
        <div>Origem: ${receita.origem}</div>
      </div>
    </div>
    <div class="dados-receita">
      <h2>${receita.titulo}</h2>
      <button class="favoritar ${favoritada ? "ativo" : ""}" data-id="${receita.id}" type="button" aria-label="Favoritar ${receita.titulo}">
        <span class="icone-estrela"></span>
        <span>${receita.favoritos.length}</span>
      </button>
    </div>
  </article>`;
}

function renderizarMural() {
  const visiveis = filtroChef
    ? receitas.filter((r) => r.chefId === filtroChef)
    : receitas;

  muralReceitas.innerHTML = visiveis.map(criarCartao).join("");
}

function abrirLogin() {
  modalLogin.classList.remove("escondido");
}

function fecharLogin() {
  modalLogin.classList.add("escondido");
  formLogin.reset();
  document.querySelector("#erroEmail").textContent = "";
  document.querySelector("#erroSenha").textContent = "";
  document.querySelector("#erroLogin").textContent = "";
}

function atualizarCabecalho() {
  const foto = document.querySelector("#fotoUsuario");
  const nome = document.querySelector("#nomeUsuario");
  const botao = document.querySelector("#botaoLogin");

  if (!usuarioAtual) {
    foto.src = "anexos_prova/imagens_usuarios/saepChef.jpg";
    nome.textContent = "@SAEPChef";
    botao.textContent = "Login";
    return;
  }

  foto.src = `anexos_prova/imagens_usuarios/${usuarioAtual.imagem}`;
  nome.textContent = `@${usuarioAtual.usuario}`;
  botao.textContent = "Logout";
}

async function entrar(evento) {
  evento.preventDefault();

  const email = document.querySelector("#email");
  const senha = document.querySelector("#senha");
  const formato = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  document.querySelector("#erroEmail").textContent = "";
  document.querySelector("#erroSenha").textContent = "";
  document.querySelector("#erroLogin").textContent = "";

  if (!formato.test(email.value.trim())) {
    document.querySelector("#erroEmail").textContent = "E-mail inválido ou vazio.";
    return;
  }

  if (!senha.value.trim()) {
    document.querySelector("#erroSenha").textContent = "A senha é obrigatória.";
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value.trim(),
        senha: senha.value
      })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      document.querySelector("#erroLogin").textContent = dados.erro || "Usuário não encontrado ou senha incorreta";
      return;
    }

    usuarioAtual = {
      id: dados.id_usuario,
      nome: dados.nome,
      usuario: dados.nome_usuario,
      email: dados.email,
      imagem: dados.imagem_usuario,
      tipo: dados.tipo
    };

    fecharLogin();
    atualizarCabecalho();
    renderizarMural();
  } catch (erro) {
    document.querySelector("#erroLogin").textContent = "Não foi possível conectar ao servidor.";
  }
}

function sair() {
  usuarioAtual = null;
  filtroChef = null;
  document.querySelector("#campoBusca").value = "";
  document.querySelector("#mensagemBusca").textContent = "";
  atualizarCabecalho();
  renderizarMural();
}

async function alternarFavorito(idReceita) {
  if (!usuarioAtual) {
    abrirLogin();
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/favoritos/alternar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idUsuario: usuarioAtual.id,
        idReceita
      })
    });

    if (!resposta.ok) throw new Error();

    await carregarReceitas();
    renderizarMural();
  } catch (erro) {
    alert("Não foi possível alterar o favorito.");
  }
}

function buscarChef(evento) {
  evento.preventDefault();

  if (!usuarioAtual) {
    abrirLogin();
    return;
  }

  const termo = document.querySelector("#campoBusca").value.trim().replace(/^@/, "").toLowerCase();

  if (!termo) {
    filtroChef = null;
    document.querySelector("#mensagemBusca").textContent = "";
    renderizarMural();
    return;
  }

  const chef = usuarios.find(
    (u) => u.tipo === "chef" && u.nome_usuario.toLowerCase() === termo
  );

  if (!chef) {
    filtroChef = -1;
    document.querySelector("#mensagemBusca").textContent = "Chef não encontrado";
  } else {
    filtroChef = chef.id_usuario;
    document.querySelector("#mensagemBusca").textContent = "";
  }

  renderizarMural();
}

function abrirPainel() {
  if (!usuarioAtual) {
    abrirLogin();
    return;
  }

  if (usuarioAtual.tipo !== "chef") return;

  const proprias = receitas.filter((r) => r.chefId === usuarioAtual.id);
  const total = proprias.reduce((soma, receita) => soma + receita.favoritos.length, 0);

  document.querySelector("#fotoPerfil").src = `anexos_prova/imagens_usuarios/${usuarioAtual.imagem}`;
  document.querySelector("#nomePerfil").textContent = `@${usuarioAtual.usuario}`;
  document.querySelector("#totalReceitas").textContent = proprias.length;
  document.querySelector("#totalFavoritos").textContent = total;
  document.querySelector("#painelPerfil").classList.add("aberto");
}

function fecharPainel() {
  document.querySelector("#painelPerfil").classList.remove("aberto");
}

function mostrarMinhasReceitas() {
  if (!usuarioAtual || usuarioAtual.tipo !== "chef") return;

  fecharPainel();
  document.querySelector("#secaoMural").classList.add("escondido");
  document.querySelector("#secaoMinhasReceitas").classList.remove("escondido");
  renderizarReceitasDoChef();
}

function voltarMural() {
  document.querySelector("#secaoMinhasReceitas").classList.add("escondido");
  document.querySelector("#secaoMural").classList.remove("escondido");
  renderizarMural();
}

function renderizarReceitasDoChef() {
  const lista = document.querySelector("#listaPropriasReceitas");
  const proprias = receitas.filter((r) => r.chefId === usuarioAtual.id);

  lista.innerHTML = proprias.map((r) => `
    <article class="receita-propria">
      <img src="${r.imagem}" alt="${r.titulo}">
      <div>
        <h3>${r.titulo}</h3>
        <button class="excluir-receita" data-id="${r.id}" type="button" aria-label="Excluir ${r.titulo}"></button>
      </div>
    </article>
  `).join("") || "<p>Nenhuma receita cadastrada.</p>";
}

async function cadastrarReceita(evento) {
  evento.preventDefault();

  if (!usuarioAtual || usuarioAtual.tipo !== "chef") return;

  const titulo = document.querySelector("#tituloReceita").value.trim();
  const origem = document.querySelector("#origemReceita").value.trim();
  const imagem = document.querySelector("#imagemReceita").files[0];

  document.querySelector("#erroTitulo").textContent = titulo ? "" : "Informe o título.";
  document.querySelector("#erroOrigem").textContent = origem ? "" : "Informe a origem.";
  document.querySelector("#erroImagem").textContent = imagem ? "" : "Selecione uma imagem.";

  if (!titulo || !origem || !imagem) return;

  const formatos = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  if (!formatos.includes(imagem.type)) {
    document.querySelector("#erroImagem").textContent = "Use JPG, JPEG, PNG, GIF ou WEBP.";
    return;
  }

  const leitor = new FileReader();

  leitor.onload = async () => {
    try {
      const resposta = await fetch(`${API_URL}/receitas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          origem,
          idUsuario: usuarioAtual.id,
          urlImagem: leitor.result
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        document.querySelector("#erroImagem").textContent = dados.erro || "Não foi possível cadastrar a receita.";
        return;
      }

      await carregarReceitas();
      renderizarReceitasDoChef();
      renderizarMural();
      evento.target.reset();
    } catch (erro) {
      document.querySelector("#erroImagem").textContent = "Não foi possível conectar ao servidor.";
    }
  };

  leitor.readAsDataURL(imagem);
}

async function excluirReceita(idReceita) {
  if (!usuarioAtual) return;

  try {
    const resposta = await fetch(`${API_URL}/receitas/${idReceita}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idUsuario: usuarioAtual.id })
    });

    if (!resposta.ok) {
      const dados = await resposta.json();
      alert(dados.erro || "Não foi possível excluir a receita.");
      return;
    }

    await carregarReceitas();
    renderizarReceitasDoChef();
    renderizarMural();
  } catch (erro) {
    alert("Não foi possível conectar ao servidor.");
  }
}

async function iniciar() {
  try {
    await Promise.all([carregarUsuarios(), carregarReceitas()]);
    atualizarCabecalho();
    renderizarMural();
  } catch (erro) {
    muralReceitas.innerHTML = "<p>Não foi possível carregar as receitas. Verifique se o backend e o banco de dados estão ligados.</p>";
  }
}

document.querySelector("#formLogin").addEventListener("submit", entrar);
document.querySelector("#fecharLogin").addEventListener("click", fecharLogin);
document.querySelector("#cancelarLogin").addEventListener("click", fecharLogin);
document.querySelector("#botaoLogin").addEventListener("click", () => usuarioAtual ? sair() : abrirLogin());
document.querySelector("#botaoPerfil").addEventListener("click", abrirPainel);
document.querySelector("#fecharPerfil").addEventListener("click", fecharPainel);
document.querySelector("#botaoSuasReceitas").addEventListener("click", mostrarMinhasReceitas);
document.querySelector("#voltarMural").addEventListener("click", voltarMural);
document.querySelector("#formBusca").addEventListener("submit", buscarChef);
document.querySelector("#formReceita").addEventListener("submit", cadastrarReceita);

muralReceitas.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".favoritar");
  if (botao) alternarFavorito(Number(botao.dataset.id));
});

document.querySelector("#listaPropriasReceitas").addEventListener("click", (evento) => {
  const botao = evento.target.closest(".excluir-receita");
  if (botao) excluirReceita(Number(botao.dataset.id));
});

iniciar();

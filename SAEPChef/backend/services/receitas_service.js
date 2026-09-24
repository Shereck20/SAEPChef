const repo=require("../repository/receitas_repository");
async function listar(){return repo.listar();}
async function listarPorChef(id){return repo.listarPorChef(id);}
async function criar(dados){if(!dados.titulo||!dados.origem||!dados.idUsuario||!dados.urlImagem)throw new Error("Dados obrigatórios ausentes.");return repo.criar(dados);}
async function excluir(id,idUsuario){return repo.excluir(id,idUsuario);}
module.exports={listar,listarPorChef,criar,excluir};

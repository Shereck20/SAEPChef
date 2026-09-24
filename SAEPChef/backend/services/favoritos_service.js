const repo=require("../repository/favoritos_repositoy");
async function alternar(idUsuario,idReceita){if(!idUsuario||!idReceita)throw new Error("Usuário e receita são obrigatórios.");return repo.alternar(idUsuario,idReceita);}
module.exports={alternar};

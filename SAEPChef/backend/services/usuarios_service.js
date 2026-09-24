const repo=require("../repository/usuarios_repository");
async function listar(){return repo.listar();}
async function login(email,senha){const u=await repo.buscarPorEmail(email);if(!u||u.senha!==senha)return null;const {senha:_,...seguro}=u;return seguro;}
module.exports={listar,login};

const service=require("../services/usuarios_service");
async function listar(req,res){try{res.json(await service.listar());}catch(e){res.status(500).json({erro:e.message});}}
async function login(req,res){try{const {email,senha}=req.body;const usuario=await service.login(email,senha);if(!usuario)return res.status(401).json({erro:"Usuário não encontrado ou senha incorreta"});res.json(usuario);}catch(e){res.status(500).json({erro:e.message});}}
module.exports={listar,login};

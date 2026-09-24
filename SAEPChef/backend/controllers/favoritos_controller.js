const service=require("../services/favoritos_service");
async function alternar(req,res){try{const ativo=await service.alternar(req.body.idUsuario,req.body.idReceita);res.json({ativo});}catch(e){res.status(400).json({erro:e.message});}}
module.exports={alternar};

const service=require("../services/receitas_service");
async function listar(req,res){try{res.json(await service.listar());}catch(e){res.status(500).json({erro:e.message});}}
async function listarPorChef(req,res){try{res.json(await service.listarPorChef(req.params.id));}catch(e){res.status(500).json({erro:e.message});}}
async function criar(req,res){try{res.status(201).json(await service.criar(req.body));}catch(e){res.status(400).json({erro:e.message});}}
async function excluir(req,res){try{const item=await service.excluir(req.params.id,req.body.idUsuario);if(!item)return res.status(404).json({erro:"Receita não encontrada."});res.json(item);}catch(e){res.status(500).json({erro:e.message});}}
module.exports={listar,listarPorChef,criar,excluir};

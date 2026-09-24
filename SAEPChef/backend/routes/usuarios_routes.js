const router=require("express").Router();const c=require("../controllers/usuarios_controller");router.get("/",c.listar);router.post("/login",c.login);module.exports=router;

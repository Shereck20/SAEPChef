const router=require("express").Router();const c=require("../controllers/favoritos_controller");router.post("/alternar",c.alternar);module.exports=router;

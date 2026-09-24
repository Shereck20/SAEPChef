const db=require("../config/db");
async function listarPorReceita(id){return (await db.query("SELECT id_usuario FROM favoritar WHERE id_receita=$1",[id])).rows.map(r=>r.id_usuario);}
async function alternar(idUsuario,idReceita){const existe=await db.query("SELECT id_favorito FROM favoritar WHERE id_usuario=$1 AND id_receita=$2",[idUsuario,idReceita]);if(existe.rowCount){await db.query("DELETE FROM favoritar WHERE id_favorito=$1",[existe.rows[0].id_favorito]);return false;}await db.query("INSERT INTO favoritar(id_usuario,id_receita) VALUES($1,$2)",[idUsuario,idReceita]);return true;}
module.exports={listarPorReceita,alternar};

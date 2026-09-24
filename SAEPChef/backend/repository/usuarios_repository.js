const db = require("../config/db");

async function listar() {
    return (await db.query(`
        SELECT id_usuario, nome, nome_usuario, email, imagem_usuario, tipo, created_at, updated_at
        FROM tb_usuario
        ORDER BY id_usuario
    `)).rows;
}

async function buscarPorEmail(email) {
    return (await db.query(`
        SELECT id_usuario, nome, nome_usuario, email, senha, imagem_usuario, tipo
        FROM tb_usuario
        WHERE email = $1
    `, [email])).rows[0];
}

module.exports = { listar, buscarPorEmail };

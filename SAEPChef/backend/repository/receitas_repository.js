const db = require("../config/db");

async function listar() {
  const q = await db.query(`
    SELECT
      r.id_receita,
      r.titulo_receita,
      r.origem_receita,
      r.id_usuario,
      r.url_imagem,
      u.nome_usuario,
      COALESCE(
        ARRAY_AGG(f.id_usuario) FILTER (WHERE f.id_usuario IS NOT NULL),
        ARRAY[]::integer[]
      ) AS favoritos
    FROM tb_receita r
    JOIN tb_usuario u ON u.id_usuario = r.id_usuario
    LEFT JOIN favoritar f ON f.id_receita = r.id_receita
    GROUP BY r.id_receita, u.nome_usuario
    ORDER BY r.id_receita
  `);

  return q.rows;
}

async function listarPorChef(id) {
  const q = await db.query(`
    SELECT
      r.id_receita,
      r.titulo_receita,
      r.origem_receita,
      r.id_usuario,
      r.url_imagem,
      COALESCE(
        ARRAY_AGG(f.id_usuario) FILTER (WHERE f.id_usuario IS NOT NULL),
        ARRAY[]::integer[]
      ) AS favoritos
    FROM tb_receita r
    LEFT JOIN favoritar f ON f.id_receita = r.id_receita
    WHERE r.id_usuario = $1
    GROUP BY r.id_receita
    ORDER BY r.id_receita
  `, [id]);

  return q.rows;
}

async function criar({ titulo, origem, idUsuario, urlImagem }) {
  const q = await db.query(`
    INSERT INTO tb_receita(titulo_receita, origem_receita, id_usuario, url_imagem)
    VALUES($1, $2, $3, $4)
    RETURNING *
  `, [titulo, origem, idUsuario, urlImagem]);

  return q.rows[0];
}

async function excluir(id, idUsuario) {
  const cliente = await db.connect();

  try {
    await cliente.query("BEGIN");

    const receita = await cliente.query(
      "SELECT id_receita FROM tb_receita WHERE id_receita=$1 AND id_usuario=$2",
      [id, idUsuario]
    );

    if (!receita.rowCount) {
      await cliente.query("ROLLBACK");
      return null;
    }

    await cliente.query("DELETE FROM favoritar WHERE id_receita=$1", [id]);
    const resultado = await cliente.query(
      "DELETE FROM tb_receita WHERE id_receita=$1 AND id_usuario=$2 RETURNING *",
      [id, idUsuario]
    );

    await cliente.query("COMMIT");
    return resultado.rows[0];
  } catch (erro) {
    await cliente.query("ROLLBACK");
    throw erro;
  } finally {
    cliente.release();
  }
}

module.exports = { listar, listarPorChef, criar, excluir };

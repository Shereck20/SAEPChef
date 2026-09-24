BEGIN;

DO $$ BEGIN
  CREATE TYPE tipo AS ENUM ('chef', 'comum');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.tb_usuario (
  id_usuario serial PRIMARY KEY,
  nome varchar(100) NOT NULL,
  nome_usuario varchar(100) NOT NULL,
  email text NOT NULL,
  senha text NOT NULL,
  imagem_usuario text NOT NULL,
  tipo tipo NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.tb_receita (
  id_receita serial PRIMARY KEY,
  titulo_receita varchar(100) NOT NULL,
  origem_receita text NOT NULL,
  id_usuario integer NOT NULL REFERENCES public.tb_usuario(id_usuario),
  url_imagem text NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.favoritar (
  id_favorito serial PRIMARY KEY,
  id_usuario integer NOT NULL REFERENCES public.tb_usuario(id_usuario),
  id_receita integer NOT NULL REFERENCES public.tb_receita(id_receita),
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_favoritar_usuario_receita ON public.favoritar (id_usuario, id_receita);

INSERT INTO tb_usuario(nome,nome_usuario,email,senha,imagem_usuario,tipo,created_at,updated_at)
SELECT v.nome, v.nome_usuario, v.email, v.senha, v.imagem_usuario, v.tipo::tipo, v.criado, v.criado
FROM (VALUES
  ('Chef Marco Bianchi','chef1','chef1@saepchef.com','123456','chef1.jpg','chef','2026-01-10 09:15:00'::timestamp),
  ('Chef Ana Ferreira','chef2','chef2@saepchef.com','123456','chef2.jpg','chef','2026-01-12 10:30:00'::timestamp),
  ('Chef Lucas Tanaka','chef3','chef3@saepchef.com','123456','chef3.jpg','chef','2026-01-14 14:20:00'::timestamp),
  ('Mariana Costa','usuario1','usuario1@gmail.com','123456','usuario1.jpg','comum','2026-01-16 08:45:00'::timestamp),
  ('Rafael Souza','usuario2','usuario2@gmail.com','123456','usuario2.jpg','comum','2026-01-18 11:00:00'::timestamp),
  ('Beatriz Lima','usuario3','usuario3@gmail.com','123456','usuario3.jpg','comum','2026-01-20 16:10:00'::timestamp)
) AS v(nome,nome_usuario,email,senha,imagem_usuario,tipo,criado)
WHERE NOT EXISTS (
  SELECT 1 FROM tb_usuario u WHERE u.nome_usuario = v.nome_usuario OR u.email = v.email
);

INSERT INTO tb_receita (titulo_receita, origem_receita, id_usuario, url_imagem, created_at, updated_at)
SELECT v.titulo, v.origem, u.id_usuario, v.imagem, v.criado, v.criado
FROM (VALUES
  ('Pizza Margherita', 'Itália', 'chef1', 'anexos_prova/receitas/receita1.jpg', '2026-01-21 09:00:00'::timestamp),
  ('Sushi Tradicional', 'Japão', 'chef2', 'anexos_prova/receitas/receita2.jpg', '2026-01-21 10:00:00'::timestamp),
  ('Feijoada Brasileira', 'Brasil', 'chef3', 'anexos_prova/receitas/receita3.jpg', '2026-01-21 11:00:00'::timestamp),
  ('Ratatouille', 'França', 'chef1', 'anexos_prova/receitas/receita4.jpg', '2026-01-21 12:00:00'::timestamp),
  ('Tacos Mexicanos', 'México', 'chef2', 'anexos_prova/receitas/receita5.jpg', '2026-01-21 13:00:00'::timestamp),
  ('Paella', 'Espanha', 'chef3', 'anexos_prova/receitas/receita6.jpg', '2026-01-21 14:00:00'::timestamp),
  ('Moussaka', 'Grécia', 'chef1', 'anexos_prova/receitas/receita7.jpg', '2026-01-21 15:00:00'::timestamp),
  ('Bacalhau à Brás', 'Portugal', 'chef2', 'anexos_prova/receitas/receita8.jpg', '2026-01-21 16:00:00'::timestamp),
  ('Bibimbap', 'Coreia do Sul', 'chef3', 'anexos_prova/receitas/receita9.jpg', '2026-01-21 17:00:00'::timestamp)
) AS v(titulo, origem, usuario, imagem, criado)
JOIN tb_usuario u ON u.nome_usuario = v.usuario
WHERE NOT EXISTS (
  SELECT 1 FROM tb_receita r WHERE r.titulo_receita = v.titulo
);

INSERT INTO favoritar (id_usuario, id_receita)
SELECT u.id_usuario, r.id_receita
FROM (VALUES
  ('usuario1', 'Pizza Margherita'),
  ('usuario2', 'Pizza Margherita'),
  ('chef1', 'Sushi Tradicional'),
  ('usuario1', 'Sushi Tradicional'),
  ('usuario3', 'Sushi Tradicional'),
  ('usuario1', 'Feijoada Brasileira'),
  ('usuario2', 'Ratatouille'),
  ('chef1', 'Tacos Mexicanos'),
  ('usuario3', 'Tacos Mexicanos'),
  ('usuario1', 'Paella'),
  ('usuario2', 'Paella'),
  ('usuario1', 'Bacalhau à Brás'),
  ('chef1', 'Bibimbap'),
  ('usuario2', 'Bibimbap')
) AS v(usuario, titulo)
JOIN tb_usuario u ON u.nome_usuario = v.usuario
JOIN tb_receita r ON r.titulo_receita = v.titulo
WHERE NOT EXISTS (
  SELECT 1
  FROM favoritar f
  WHERE f.id_usuario = u.id_usuario
    AND f.id_receita = r.id_receita
);

COMMIT;

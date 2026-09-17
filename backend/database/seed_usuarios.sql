-- =====================================================================
-- Taylor Tech - Usuario administrador padrao
--
-- Login inicial do painel:
--   E-mail: admin@taylortech.com
--   Senha:  TaylorTech@123
--
-- IMPORTANTE: troque essa senha assim que possivel na tela de Equipe
-- do painel administrativo.
-- =====================================================================

USE taylor_tech;

INSERT INTO usuarios (nome, email, senha_hash, cargo, permissoes)
VALUES (
  'Administrador',
  'admin@taylortech.com',
  '$2a$10$.m3Lxda0qu2IRCRhSo0gV.jzOVC/cl0XvDsWM3Cij/FRP6xd4TjCe',
  'Dono',
  JSON_ARRAY('ordens', 'financeiro', 'estoque', 'clientes', 'equipe')
)
ON DUPLICATE KEY UPDATE nome = nome;

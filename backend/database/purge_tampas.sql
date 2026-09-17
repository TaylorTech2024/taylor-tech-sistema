-- =====================================================================
-- Taylor Tech - Remove tampas traseiras do estoque
--
-- Rode este script uma unica vez em bancos que ja foram populados com
-- a versao antiga do seed.sql (que incluia peças de categoria
-- 'tampa_traseira'). Depois disso o sistema passa a trabalhar apenas
-- com tela e bateria.
-- =====================================================================

USE taylor_tech;

DELETE FROM estoque WHERE categoria = 'tampa_traseira';

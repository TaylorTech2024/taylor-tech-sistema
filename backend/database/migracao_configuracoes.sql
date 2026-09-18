-- =====================================================================
-- Taylor Tech - Migracao: Configuracoes, qualidade de peca e motivo
-- de cancelamento de OS.
--
-- Rode este script uma unica vez em bancos que ja existiam antes
-- dessas funcionalidades (schema.sql sozinho nao adiciona colunas em
-- tabelas que ja existem).
-- =====================================================================

USE taylor_tech;

CREATE TABLE IF NOT EXISTS configuracoes (
  id INT PRIMARY KEY DEFAULT 1,
  margem_bateria DECIMAL(10,2) NOT NULL DEFAULT 120.00,
  margem_tela_lcd DECIMAL(10,2) NOT NULL DEFAULT 150.00,
  margem_tela_oled DECIMAL(10,2) NOT NULL DEFAULT 200.00,
  margem_outro DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  garantia_dias INT NOT NULL DEFAULT 90,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO configuracoes (id) VALUES (1) ON DUPLICATE KEY UPDATE id = id;

ALTER TABLE estoque ADD COLUMN IF NOT EXISTS qualidade VARCHAR(40) NULL;

ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS motivo_cancelamento VARCHAR(255) NULL;

ALTER TABLE estoque ADD COLUMN IF NOT EXISTS preco_venda_manual DECIMAL(10,2) NULL;

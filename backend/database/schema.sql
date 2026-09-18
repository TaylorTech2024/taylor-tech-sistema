-- =====================================================================
-- Taylor Tech - Sistema de Gestao para Assistencia Tecnica
-- Script de criacao do banco de dados (MySQL 8+)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS taylor_tech
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taylor_tech;

-- ---------------------------------------------------------------------
-- Tabela: clientes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_clientes_whatsapp (whatsapp)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: estoque
-- Cada linha representa uma peca (tela ou bateria) para um modelo
-- especifico de aparelho. Por padrao o preco final cobrado do cliente
-- e "preco_custo + margem da categoria" (ver src/data/margens.js) e
-- muda automaticamente se a mao de obra for alterada em Configuracoes.
-- Se preco_venda_manual estiver preenchido, ele trava o preco final
-- dessa peca especifica, ignorando o calculo automatico.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estoque (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_peca VARCHAR(150) NOT NULL,
  marca VARCHAR(40) NOT NULL,
  modelo VARCHAR(80) NOT NULL,
  categoria ENUM('bateria', 'tela_lcd', 'tela_oled', 'outro') NOT NULL,
  qualidade VARCHAR(40) NULL,
  preco_custo DECIMAL(10,2) NOT NULL,
  preco_venda_manual DECIMAL(10,2) NULL,
  quantidade INT NOT NULL DEFAULT 0,
  estoque_minimo INT NOT NULL DEFAULT 3,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_estoque_marca_modelo (marca, modelo)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: ordens_servico
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ordens_servico (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  aparelho_marca VARCHAR(40) NOT NULL,
  aparelho_modelo VARCHAR(80) NOT NULL,
  peca_id INT NULL,
  servico_descricao VARCHAR(150) NOT NULL,
  valor_cobrado DECIMAL(10,2) NOT NULL,
  status ENUM('pendente', 'em_andamento', 'concluido', 'cancelado') NOT NULL DEFAULT 'pendente',
  origem ENUM('site', 'manual') NOT NULL DEFAULT 'site',
  observacoes TEXT NULL,
  motivo_cancelamento VARCHAR(255) NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  concluido_em TIMESTAMP NULL,
  CONSTRAINT fk_os_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_os_peca FOREIGN KEY (peca_id) REFERENCES estoque(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  KEY idx_os_status (status)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: os_checklist
-- Checklist de entrada do aparelho (vistoria tecnica formal).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS os_checklist (
  id INT AUTO_INCREMENT PRIMARY KEY,
  os_id INT NOT NULL,
  item VARCHAR(60) NOT NULL,
  status ENUM('ok', 'atencao', 'nao_testado') NOT NULL DEFAULT 'nao_testado',
  observacao VARCHAR(255) NULL,
  CONSTRAINT fk_checklist_os FOREIGN KEY (os_id) REFERENCES ordens_servico(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uq_checklist_os_item (os_id, item)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: financeiro
-- Uma linha é criada automaticamente (dentro de uma transacao) sempre
-- que uma OS é concluida, registrando faturamento, custo e lucro real.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS financeiro (
  id INT AUTO_INCREMENT PRIMARY KEY,
  os_id INT NOT NULL,
  descricao VARCHAR(150) NOT NULL,
  valor_entrada DECIMAL(10,2) NOT NULL,
  custo_peca DECIMAL(10,2) NOT NULL DEFAULT 0,
  lucro DECIMAL(10,2) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_financeiro_os FOREIGN KEY (os_id) REFERENCES ordens_servico(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: usuarios
-- Equipe com login e permissoes por modulo. cargo = 'Dono' sempre tem
-- acesso total, independente do array em permissoes.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  cargo VARCHAR(60) NOT NULL DEFAULT 'Tecnico',
  permissoes JSON NOT NULL,
  ativo TINYINT(1) NOT NULL DEFAULT 1,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: financeiro_despesas
-- Saidas gerais da loja (aluguel, contas, compra de peca em lote, etc.)
-- nao ligadas a uma OS especifica.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS financeiro_despesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  descricao VARCHAR(150) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_despesa DATE NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: contas_receber
-- Valores a receber de clientes (ex: pagamento parcelado/a prazo).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS contas_receber (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  descricao VARCHAR(150) NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  status ENUM('pendente', 'recebido') NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  recebido_em TIMESTAMP NULL,
  CONSTRAINT fk_receber_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------------------
-- Tabela: configuracoes
-- Linha unica (id = 1) com as margens de mao de obra e a garantia
-- padrao, editaveis pelo painel em vez de fixas no codigo.
-- ---------------------------------------------------------------------
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

-- ---------------------------------------------------------------------
-- Tabela: push_subscriptions
-- Inscricoes de notificacao push (Web Push) por dispositivo, usadas
-- para avisar a equipe quando um cliente pede um servico pela vitrine.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  endpoint TEXT NOT NULL,
  endpoint_hash CHAR(64) NOT NULL,
  p256dh VARCHAR(255) NOT NULL,
  auth VARCHAR(255) NOT NULL,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_push_endpoint_hash (endpoint_hash),
  CONSTRAINT fk_push_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

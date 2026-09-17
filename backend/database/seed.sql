-- =====================================================================
-- Taylor Tech - Seed de estoque (catalogo de pecas / servicos)
--
-- Custos (preco_custo) baseados na tabela de fornecedor "Rede Cell PE"
-- (telas, baterias Foxconn/Genioux/Skaiky e tampas). O preco final
-- cobrado do cliente NUNCA e gravado aqui: ele e calculado em tempo
-- real por (preco_custo + margem da categoria), ver src/data/margens.js.
-- =====================================================================

USE taylor_tech;

-- ---------------------------------------------------------------------
-- APPLE (iPhone)
-- ---------------------------------------------------------------------
INSERT INTO estoque (nome_peca, marca, modelo, categoria, preco_custo, quantidade, estoque_minimo) VALUES
('Tela LCD iPhone 11', 'Apple', 'iPhone 11', 'tela_lcd', 70.00, 8, 3),
('Bateria iPhone 11', 'Apple', 'iPhone 11', 'bateria', 135.00, 6, 3),
('Tampa Traseira iPhone 11', 'Apple', 'iPhone 11', 'tampa_traseira', 20.00, 10, 3),

('Tela LCD iPhone 11 Pro', 'Apple', 'iPhone 11 Pro', 'tela_lcd', 80.00, 5, 3),
('Bateria iPhone 11 Pro', 'Apple', 'iPhone 11 Pro', 'bateria', 165.00, 4, 3),
('Tampa Traseira iPhone 11 Pro', 'Apple', 'iPhone 11 Pro', 'tampa_traseira', 30.00, 7, 3),

('Tela OLED Soft iPhone 11 Pro Max', 'Apple', 'iPhone 11 Pro Max', 'tela_oled', 260.00, 3, 3),
('Bateria iPhone 11 Pro Max', 'Apple', 'iPhone 11 Pro Max', 'bateria', 165.00, 2, 3),
('Tampa Traseira iPhone 11 Pro Max', 'Apple', 'iPhone 11 Pro Max', 'tampa_traseira', 30.00, 6, 3),

('Tela LCD iPhone 12', 'Apple', 'iPhone 12', 'tela_lcd', 100.00, 9, 3),
('Bateria iPhone 12', 'Apple', 'iPhone 12', 'bateria', 160.00, 5, 3),
('Tampa Traseira iPhone 12', 'Apple', 'iPhone 12', 'tampa_traseira', 25.00, 8, 3),

('Tela OLED Soft iPhone 12 Pro', 'Apple', 'iPhone 12 Pro', 'tela_oled', 275.00, 4, 3),
('Bateria iPhone 12 Pro', 'Apple', 'iPhone 12 Pro', 'bateria', 160.00, 3, 3),
('Tampa Traseira iPhone 12 Pro', 'Apple', 'iPhone 12 Pro', 'tampa_traseira', 30.00, 5, 3),

('Tela OLED Soft iPhone 12 Pro Max', 'Apple', 'iPhone 12 Pro Max', 'tela_oled', 330.00, 2, 3),
('Bateria iPhone 12 Pro Max', 'Apple', 'iPhone 12 Pro Max', 'bateria', 185.00, 1, 3),
('Tampa Traseira iPhone 12 Pro Max', 'Apple', 'iPhone 12 Pro Max', 'tampa_traseira', 30.00, 4, 3),

('Tela LCD iPhone 12 Mini', 'Apple', 'iPhone 12 Mini', 'tela_lcd', 130.00, 3, 3),
('Bateria iPhone 12 Mini', 'Apple', 'iPhone 12 Mini', 'bateria', 130.00, 2, 3),

('Tela LCD iPhone 13', 'Apple', 'iPhone 13', 'tela_lcd', 110.00, 10, 3),
('Bateria iPhone 13', 'Apple', 'iPhone 13', 'bateria', 150.00, 6, 3),
('Tampa Traseira iPhone 13', 'Apple', 'iPhone 13', 'tampa_traseira', 25.00, 9, 3),

('Tela LCD iPhone 13 Mini', 'Apple', 'iPhone 13 Mini', 'tela_lcd', 160.00, 2, 3),
('Bateria iPhone 13 Mini', 'Apple', 'iPhone 13 Mini', 'bateria', 135.00, 3, 3),

('Tela OLED iPhone 13 Pro', 'Apple', 'iPhone 13 Pro', 'tela_oled', 380.00, 3, 3),
('Bateria iPhone 13 Pro', 'Apple', 'iPhone 13 Pro', 'bateria', 160.00, 4, 3),
('Tampa Traseira iPhone 13 Pro', 'Apple', 'iPhone 13 Pro', 'tampa_traseira', 35.00, 6, 3),

('Tela OLED Soft iPhone 13 Pro Max', 'Apple', 'iPhone 13 Pro Max', 'tela_oled', 370.00, 2, 3),
('Bateria iPhone 13 Pro Max', 'Apple', 'iPhone 13 Pro Max', 'bateria', 175.00, 3, 3),
('Tampa Traseira iPhone 13 Pro Max', 'Apple', 'iPhone 13 Pro Max', 'tampa_traseira', 35.00, 5, 3),

('Tela OLED Soft iPhone 14', 'Apple', 'iPhone 14', 'tela_oled', 290.00, 4, 3),
('Bateria iPhone 14', 'Apple', 'iPhone 14', 'bateria', 185.00, 5, 3),
('Tampa Traseira iPhone 14', 'Apple', 'iPhone 14', 'tampa_traseira', 40.00, 7, 3),

('Tela OLED Soft iPhone 14 Pro', 'Apple', 'iPhone 14 Pro', 'tela_oled', 415.00, 2, 3),
('Bateria iPhone 14 Pro', 'Apple', 'iPhone 14 Pro', 'bateria', 205.00, 3, 3),
('Tampa Traseira iPhone 14 Pro', 'Apple', 'iPhone 14 Pro', 'tampa_traseira', 35.00, 4, 3),

('Tela OLED Soft iPhone 14 Pro Max', 'Apple', 'iPhone 14 Pro Max', 'tela_oled', 450.00, 1, 3),
('Bateria iPhone 14 Pro Max', 'Apple', 'iPhone 14 Pro Max', 'bateria', 210.00, 2, 3),
('Tampa Traseira iPhone 14 Pro Max', 'Apple', 'iPhone 14 Pro Max', 'tampa_traseira', 35.00, 3, 3),

('Tela OLED Soft iPhone 15', 'Apple', 'iPhone 15', 'tela_oled', 390.00, 3, 3),
('Bateria iPhone 15', 'Apple', 'iPhone 15', 'bateria', 210.00, 4, 3),
('Tampa Premium iPhone 15 c/ Lente', 'Apple', 'iPhone 15', 'tampa_traseira', 85.00, 5, 3),

('Bateria iPhone 15 Pro', 'Apple', 'iPhone 15 Pro', 'bateria', 290.00, 2, 3),
('Tampa Premium iPhone 15 Pro c/ Lente', 'Apple', 'iPhone 15 Pro', 'tampa_traseira', 90.00, 3, 3),

('Tela OLED Soft iPhone 15 Pro Max', 'Apple', 'iPhone 15 Pro Max', 'tela_oled', 550.00, 1, 3),
('Bateria iPhone 15 Pro Max', 'Apple', 'iPhone 15 Pro Max', 'bateria', 245.00, 2, 3),
('Tampa Premium iPhone 15 Pro Max c/ Lente', 'Apple', 'iPhone 15 Pro Max', 'tampa_traseira', 100.00, 2, 3),

('Tela LCD iPhone XR', 'Apple', 'iPhone XR', 'tela_lcd', 70.00, 9, 3),
('Bateria iPhone XR', 'Apple', 'iPhone XR', 'bateria', 105.00, 7, 3),
('Tampa Traseira iPhone XR', 'Apple', 'iPhone XR', 'tampa_traseira', 20.00, 8, 3),

('Tela LCD iPhone SE 2020', 'Apple', 'iPhone SE 2020', 'tela_lcd', 60.00, 5, 3),
('Bateria iPhone SE 2020', 'Apple', 'iPhone SE 2020', 'bateria', 70.00, 4, 3);

-- ---------------------------------------------------------------------
-- SAMSUNG (Galaxy)
-- ---------------------------------------------------------------------
INSERT INTO estoque (nome_peca, marca, modelo, categoria, preco_custo, quantidade, estoque_minimo) VALUES
('Tela LCD Galaxy A05', 'Samsung', 'Galaxy A05', 'tela_lcd', 55.00, 8, 3),
('Bateria Galaxy A05', 'Samsung', 'Galaxy A05', 'bateria', 75.00, 6, 3),

('Tela LCD Galaxy A14 4G', 'Samsung', 'Galaxy A14', 'tela_lcd', 70.00, 7, 3),
('Bateria Galaxy A14', 'Samsung', 'Galaxy A14', 'bateria', 70.00, 5, 3),

('Tela OLED Galaxy A22 4G', 'Samsung', 'Galaxy A22 4G', 'tela_oled', 170.00, 2, 3),

('Tela OLED Galaxy A32 4G', 'Samsung', 'Galaxy A32 4G', 'tela_oled', 175.00, 3, 3),
('Bateria Galaxy A32 4G', 'Samsung', 'Galaxy A32 4G', 'bateria', 70.00, 4, 3),

('Tela LCD Galaxy A52', 'Samsung', 'Galaxy A52', 'tela_lcd', 90.00, 4, 3),
('Bateria Galaxy A52', 'Samsung', 'Galaxy A52', 'bateria', 70.00, 3, 3),

('Tela LCD Galaxy A54', 'Samsung', 'Galaxy A54', 'tela_lcd', 100.00, 2, 3),
('Bateria Galaxy A54 5G', 'Samsung', 'Galaxy A54', 'bateria', 65.00, 3, 3),

('Tela OLED Galaxy S20 FE 5G', 'Samsung', 'Galaxy S20 FE', 'tela_oled', 225.00, 2, 3),
('Bateria Galaxy S20 FE', 'Samsung', 'Galaxy S20 FE', 'bateria', 70.00, 3, 3),

('Tela OLED Diamonds Galaxy S21 FE', 'Samsung', 'Galaxy S21 FE', 'tela_oled', 245.00, 1, 3),
('Bateria Galaxy S21 FE', 'Samsung', 'Galaxy S21 FE', 'bateria', 70.00, 2, 3),

('Bateria Galaxy S22', 'Samsung', 'Galaxy S22', 'bateria', 70.00, 4, 3),

('Tela OLED Vivid Galaxy S23 Ultra', 'Samsung', 'Galaxy S23 Ultra', 'tela_oled', 1030.00, 1, 2);

-- ---------------------------------------------------------------------
-- MOTOROLA (Moto)
-- ---------------------------------------------------------------------
INSERT INTO estoque (nome_peca, marca, modelo, categoria, preco_custo, quantidade, estoque_minimo) VALUES
('Tela LCD Moto E13', 'Motorola', 'Moto E13', 'tela_lcd', 50.00, 6, 3),
('Bateria Moto E13', 'Motorola', 'Moto E13', 'bateria', 65.00, 5, 3),

('Tela LCD Moto G13', 'Motorola', 'Moto G13', 'tela_lcd', 50.00, 7, 3),
('Bateria Moto G13', 'Motorola', 'Moto G13', 'bateria', 65.00, 6, 3),

('Tela LCD Moto G22', 'Motorola', 'Moto G22', 'tela_lcd', 50.00, 5, 3),
('Bateria Moto G22', 'Motorola', 'Moto G22', 'bateria', 65.00, 4, 3),

('Tela OLED Diamonds Moto G60', 'Motorola', 'Moto G60', 'tela_oled', 70.00, 3, 3),
('Bateria Moto G60', 'Motorola', 'Moto G60', 'bateria', 70.00, 2, 3),

('Tela OLED Moto G41', 'Motorola', 'Moto G41', 'tela_oled', 165.00, 2, 3),
('Bateria Moto G41', 'Motorola', 'Moto G41', 'bateria', 70.00, 3, 3),

('Tela OLED Moto G72', 'Motorola', 'Moto G72', 'tela_oled', 175.00, 1, 3),
('Bateria Moto G72', 'Motorola', 'Moto G72', 'bateria', 70.00, 2, 3),

('Tela LCD Moto Edge 30 Pro', 'Motorola', 'Moto Edge 30', 'tela_lcd', 75.00, 2, 3),
('Bateria Moto Edge 30', 'Motorola', 'Moto Edge 30', 'bateria', 70.00, 2, 3),

('Tela LCD Moto G84 5G', 'Motorola', 'Moto G84 5G', 'tela_lcd', 65.00, 3, 3),

('Tela LCD Moto Edge 40 Neo', 'Motorola', 'Moto Edge 40 Neo', 'tela_lcd', 100.00, 2, 3);

-- ---------------------------------------------------------------------
-- XIAOMI (Redmi / Poco)
-- ---------------------------------------------------------------------
INSERT INTO estoque (nome_peca, marca, modelo, categoria, preco_custo, quantidade, estoque_minimo) VALUES
('Tela LCD Redmi 9', 'Xiaomi', 'Redmi 9', 'tela_lcd', 50.00, 6, 3),
('Bateria Redmi 9', 'Xiaomi', 'Redmi 9', 'bateria', 70.00, 5, 3),

('Tela LCD Redmi 9A/9C', 'Xiaomi', 'Redmi 9A/9C', 'tela_lcd', 50.00, 7, 3),
('Bateria Redmi 9A/9C', 'Xiaomi', 'Redmi 9A/9C', 'bateria', 70.00, 6, 3),

('Tela LCD Redmi Note 9', 'Xiaomi', 'Redmi Note 9', 'tela_lcd', 55.00, 5, 3),
('Bateria Redmi Note 9', 'Xiaomi', 'Redmi Note 9', 'bateria', 70.00, 4, 3),

('Tela LCD Redmi Note 10', 'Xiaomi', 'Redmi Note 10', 'tela_lcd', 55.00, 4, 3),
('Bateria Redmi Note 10', 'Xiaomi', 'Redmi Note 10', 'bateria', 70.00, 3, 3),

('Tela LCD Redmi Note 10 Pro', 'Xiaomi', 'Redmi Note 10 Pro', 'tela_lcd', 60.00, 3, 3),
('Bateria Redmi Note 10 Pro', 'Xiaomi', 'Redmi Note 10 Pro', 'bateria', 60.00, 2, 3),

('Tela LCD Poco X3', 'Xiaomi', 'Poco X3', 'tela_lcd', 65.00, 4, 3),
('Bateria Poco X3', 'Xiaomi', 'Poco X3', 'bateria', 70.00, 3, 3),

('Tela LCD Poco M3', 'Xiaomi', 'Poco M3', 'tela_lcd', 70.00, 2, 3),
('Bateria Poco M3', 'Xiaomi', 'Poco M3', 'bateria', 70.00, 3, 3),

('Tela LCD Redmi Note 11', 'Xiaomi', 'Redmi Note 11', 'tela_lcd', 60.00, 3, 3),
('Bateria Redmi Note 11', 'Xiaomi', 'Redmi Note 11', 'bateria', 70.00, 2, 3),

('Tela LCD Redmi Note 12', 'Xiaomi', 'Redmi Note 12', 'tela_lcd', 60.00, 2, 3),
('Bateria Redmi Note 12', 'Xiaomi', 'Redmi Note 12', 'bateria', 85.00, 1, 3),

('Tela LCD Poco X5 Pro', 'Xiaomi', 'Poco X5 Pro', 'tela_lcd', 60.00, 2, 3),
('Bateria Poco X5 Pro', 'Xiaomi', 'Poco X5 Pro', 'bateria', 90.00, 1, 3),

('Tela LCD Redmi Note 13 4G', 'Xiaomi', 'Redmi Note 13', 'tela_lcd', 60.00, 3, 3),
('Bateria Redmi Note 13', 'Xiaomi', 'Redmi Note 13', 'bateria', 70.00, 2, 3),

('Bateria Redmi 12C', 'Xiaomi', 'Redmi 12C', 'bateria', 70.00, 4, 3);

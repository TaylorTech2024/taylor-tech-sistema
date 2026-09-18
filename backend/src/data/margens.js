const pool = require('../config/db');

// Margens de mao de obra/lucro somadas ao preco de custo da peca
// (estoque.preco_custo) para chegar ao valor final "preco fechado"
// mostrado ao cliente. Ficam na tabela `configuracoes` (linha id=1),
// editaveis pelo painel em Configuracoes.
async function obterConfiguracoes() {
  const [[row]] = await pool.query(`SELECT * FROM configuracoes WHERE id = 1`);
  return {
    margens: {
      bateria: Number(row.margem_bateria),
      tela_lcd: Number(row.margem_tela_lcd),
      tela_oled: Number(row.margem_tela_oled),
      outro: Number(row.margem_outro)
    },
    garantia_dias: row.garantia_dias
  };
}

async function atualizarConfiguracoes({ margem_bateria, margem_tela_lcd, margem_tela_oled, margem_outro, garantia_dias }) {
  await pool.query(
    `UPDATE configuracoes SET
      margem_bateria = COALESCE(?, margem_bateria),
      margem_tela_lcd = COALESCE(?, margem_tela_lcd),
      margem_tela_oled = COALESCE(?, margem_tela_oled),
      margem_outro = COALESCE(?, margem_outro),
      garantia_dias = COALESCE(?, garantia_dias)
     WHERE id = 1`,
    [margem_bateria, margem_tela_lcd, margem_tela_oled, margem_outro, garantia_dias]
  );
}

// peca: objeto com preco_custo, categoria e (opcional) preco_venda_manual.
// Se preco_venda_manual estiver preenchido, ele trava o preco final dessa
// peca, ignorando o calculo automatico custo + margem.
function precoFinal(peca, margens) {
  if (peca.preco_venda_manual != null) {
    return Number(peca.preco_venda_manual);
  }
  const margem = margens[peca.categoria] ?? margens.outro;
  return Number((Number(peca.preco_custo) + margem).toFixed(2));
}

module.exports = { obterConfiguracoes, atualizarConfiguracoes, precoFinal };

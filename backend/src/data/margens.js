// Margens de mao de obra/lucro somadas ao preco de custo da peca (estoque.preco_custo)
// para chegar ao valor final "preco fechado" mostrado ao cliente.
const MARGENS = {
  bateria: 120,
  tela_lcd: 150,
  tela_oled: 200,
  tampa_traseira: 300,
  outro: 100
};

function precoFinal(precoCusto, categoria) {
  const margem = MARGENS[categoria] ?? MARGENS.outro;
  return Number((Number(precoCusto) + margem).toFixed(2));
}

module.exports = { MARGENS, precoFinal };

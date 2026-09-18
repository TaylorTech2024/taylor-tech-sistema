const { obterConfiguracoes, atualizarConfiguracoes } = require('../data/margens');

exports.obter = async (req, res) => {
  const config = await obterConfiguracoes();
  res.json(config);
};

exports.atualizar = async (req, res) => {
  const { margem_bateria, margem_tela_lcd, margem_tela_oled, margem_outro, garantia_dias } = req.body;
  await atualizarConfiguracoes({ margem_bateria, margem_tela_lcd, margem_tela_oled, margem_outro, garantia_dias });
  const config = await obterConfiguracoes();
  res.json(config);
};

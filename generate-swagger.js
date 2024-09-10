// Importa o módulo swagger-autogen para gerar a documentação Swagger
const swaggerAutogen = require('swagger-autogen')();
const path = require('path');

// Define o caminho de saída para o arquivo de documentação
const outputFile = path.join(__dirname, 'swagger_output.json');
// Define o caminho para o arquivo que contém as rotas e os comentários
const endpointsFiles = [path.join(__dirname, 'veterinario.js')];

// Define as informações da documentação Swagger
const doc = {
  info: {
    title: 'API de Pets',
    description: 'Uma API para gerenciar pets',
  },
  host: 'localhost:8000',
  schemes: ['http'],
};

// Gera o arquivo swagger_output.json e exibe uma mensagem ao concluir
swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Documentação Swagger gerada com sucesso!');
});

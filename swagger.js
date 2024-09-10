// Importa o módulo `swagger-autogen` e inicializa-o. O `swagger-autogen` é uma ferramenta para gerar documentação Swagger automaticamente.
const swaggerAutogen = require('swagger-autogen')();

// Importa o módulo `path`, que fornece utilitários para manipulação de caminhos de arquivos e diretórios.
const path = require('path');

// Define o caminho do arquivo onde a documentação Swagger será gerada. `__dirname` refere-se ao diretório onde o arquivo atual está localizado.
const outputFile = path.join(__dirname, 'swagger_output.json');

// Define os caminhos para os arquivos de rotas que serão analisados para gerar a documentação. No caso, está apontando para um arquivo específico (`veterinario.js`) que contém as rotas da API.
const endpointsFiles = [path.join(__dirname, 'veterinario.js')];

// Define a configuração da documentação Swagger. Isso inclui informações sobre a API, como título, descrição, host e esquemas.
const doc = {
  info: {
    // Título da documentação da API, que será exibido na interface do Swagger.
    title: 'API de Pets',
    // Descrição da API, fornecendo um breve resumo do que ela faz.
    description: 'Uma API para gerenciar pets',
  },
  // Define o host onde a API está rodando. Isso será usado na documentação para mostrar a URL base da API.
  host: 'localhost:8000',
  // Define os esquemas que a API suporta. Neste caso, está configurado para `http`, indicando que a API usa o protocolo HTTP.
  schemes: ['http'],
};

// Gera a documentação Swagger usando o `swagger-autogen`. 
// O primeiro parâmetro é o caminho do arquivo de saída, o segundo parâmetro é uma lista de arquivos que contêm as rotas da API,
// e o terceiro parâmetro é o objeto de configuração que define as informações da API.
swaggerAutogen(outputFile, endpointsFiles, doc);

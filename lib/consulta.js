require('dotenv').config();  // Carrega as variáveis de ambiente do arquivo .env
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Função para formatar a data no padrão BR (dd/mm/aaaa)
function formatDateToBR(dateString) {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

// Função principal para obter os dados do CPF
async function getDataByCPF(cpf) {
  try {
    const email = process.env.EMAIL;
    const senha = process.env.SENHA;
    const credentials = Buffer.from(`${email}:${senha}`).toString('base64');

    // Requisição para obter o token
    const loginResponse = await axios.post(
      'https://servicos-cloud.saude.gov.br/pni-bff/v1/autenticacao/tokenAcesso',
      null, // corpo da requisição vazio
      {
        headers: {
          'Host': 'servicos-cloud.saude.gov.br',
          'Connection': 'keep-alive',
          'Content-Length': '0',
          'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
          'accept': 'application/json',
          'X-Authorization': `Basic ${credentials}`,
          'sec-ch-ua-mobile': '?0',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          'sec-ch-ua-platform': 'Windows',
          'Origin': 'https://si-pni.saude.gov.br',
          'Sec-Fetch-Site': 'same-site',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Dest': 'empty',
          'Referer': 'https://si-pni.saude.gov.br/',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      }
    );

    // Extrai o accessToken da resposta
    const accessToken = loginResponse.data.accessToken;

    if (!accessToken) {
      throw new Error('Token de acesso não obtido');
    }

    // Requisição para obter os dados do CPF
    const secondRequestResponse = await axios.get(
      `https://servicos-cloud.saude.gov.br/pni-bff/v1/cidadao/cpf/${cpf}`,
      {
        headers: {
          'accept': 'application/json, text/plain, */*',
          'authorization': `Bearer ${accessToken}`,
          'sec-ch-ua': '"Not-A.Brand";v="99", "Chromium";v="124"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
          'referrer': 'https://si-pni.saude.gov.br/',
          'referrerPolicy': 'strict-origin-when-cross-origin',
          'mode': 'cors',
          'credentials': 'include'
        }
      }
    );

    // Extrai e processa os dados necessários da resposta
    const data = secondRequestResponse.data;

    if (!data.records || data.records.length === 0) {
      return `Registro não encontrado para o CPF: ${cpf}`;
    }

    const record = data.records[0];
    const endereco = record.endereco || {}; // Certifique-se de que "endereco" existe antes de acessar

    return {
      cpf: record.cpf,
      dataNascimento: formatDateToBR(record.dataNascimento),
      sexo: record.sexo,
      endereco: {
        logradouro: endereco.logradouro || 'Não informado',
        cep: endereco.cep || 'Não informado'
      }
    };
  } catch (error) {
    throw new Error(`Erro ao processar o CPF ${cpf}: ${error.message}`);
  }
}

// Exporta a função para ser utilizada em outros arquivos
module.exports = {
  getDataByCPF
};

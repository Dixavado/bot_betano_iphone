const path = require('path');
const fs = require('fs');
const { getDataByCPF } = require('./lib/consulta');
const { accessAndDumpPage } = require('./lib/utils');
const chalk = require('chalk');
const Table = require('cli-table3');

// Valores fixos para a função accessAndDumpPage
const email = 'l80lim3w3j@hotmail.com';
const mobilePhone = '61996644322';
const password = 'Dixavado71@';

// Função principal para processar CPFs a partir de um arquivo
async function processCPFsFromFile() {
  try {
    const filePath = path.join(__dirname, 'lista.txt');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const cpfs = fileContent.split('\n').map(cpf => cpf.trim()).filter(cpf => cpf);

    if (cpfs.length === 0) {
      console.log(chalk.yellow('Nenhum CPF encontrado no arquivo lista.txt'));
      return;
    }

    // Configuração da tabela para os dados consultados
    const consultationTable = new Table({
      head: [
        chalk.blue('Nome'),
        chalk.blue('CPF'),
        chalk.blue('Data de Nascimento'),
        chalk.blue('Sexo'),
        chalk.blue('Rua'),
        chalk.blue('Cidade'),
        chalk.blue('CEP')
      ],
      colWidths: [25, 15, 15, 10, 25, 20, 10]
    });

    // Configuração da tabela para o resultado final
    const resultTable = new Table({
      head: [
        chalk.green('Nome'),
        chalk.green('CPF'),
        chalk.green('Data de Nascimento'),
        chalk.green('Sexo'),
        chalk.green('Rua'),
        chalk.green('Cidade'),
        chalk.green('CEP')
      ],
      colWidths: [25, 15, 15, 10, 25, 20, 10]
    });

    for (const cpf of cpfs) {
      try {
        const result = await getDataByCPF(cpf);
        const { nome, cpf: cpfNumber, dataNascimento, sexo, endereco } = result;
        const { bairro, cidade, cep } = endereco;

        // Dividindo a data de nascimento em dia, mês e ano
        const [day, month, year] = dataNascimento.split('/');

        // Adiciona a linha à tabela de dados consultados
        consultationTable.push([
          nome,
          cpfNumber,
          `${day}/${month}/${year}`,
          sexo,
          bairro,
          cidade,
          cep
        ]);

        // Exibir dados consultados antes de iniciar o processo final
        console.log(chalk.green('Dados Consultados e Usados:'));
        console.log(consultationTable.toString());

        // Executar a função accessAndDumpPage com dados obtidos
        await accessAndDumpPage(email, day, month, year, cpfNumber, sexo.toLowerCase(), bairro, cidade, cep, mobilePhone, password);

        // Adicionar resultado ao resultado final (opcional, se necessário)
        resultTable.push([
          nome,
          cpfNumber,
          `${day}/${month}/${year}`,
          sexo,
          bairro,
          cidade,
          cep
        ]);

      } catch (error) {
        console.error(chalk.red(`Erro ao processar o CPF ${cpf}: ${error.message}`));
      }
    }

    // Exibe a tabela com todos os dados
    console.log(chalk.blue('\nTabela Final com Todos os Dados:'));
    console.log(resultTable.toString());

  } catch (error) {
    console.error(chalk.red('Erro ao processar a lista de CPFs:', error.message));
  }
}

// Executa a função principal
processCPFsFromFile();

const startAutomation = require('./lib/startAutomation');
const performAutomationValidation = require('./lib/performAutomationValidation');
const { getDataByCPF } = require('./lib/consulta'); // Importa a função de consulta
const { checkEmails } = require('./controllers/imapController'); // Importa o controlador IMAP
const fs = require('fs');
const readline = require('readline');

// Função para gerar números de telefone brasileiros com DDD e 9 dígitos aleatórios
const generateBrazilianPhoneNumber = () => {
    const ddDs = ['11', '21', '31', '41', '51', '61', '71', '81', '91']; // Exemplos de DDDs, adicione mais conforme necessário
    const randomDDD = ddDs[Math.floor(Math.random() * ddDs.length)];
    const randomPhone = Math.floor(100000000 + Math.random() * 900000000); // Gera 9 dígitos aleatórios
    return randomDDD + randomPhone.toString();
};

// Função para ler o arquivo lista.txt e retornar um array de CPFs
const readCPFsFromFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const cpfs = [];
        const rl = readline.createInterface({
            input: fs.createReadStream(filePath),
            crlfDelay: Infinity
        });

        rl.on('line', (line) => {
            cpfs.push(line.trim());
        });

        rl.on('close', () => {
            resolve(cpfs);
        });

        rl.on('error', (error) => {
            reject(error);
        });
    });
};

// Função para solicitar entrada do usuário no terminal
const promptUser = (question) => {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

(async () => {
    try {
        // Iniciar a automação e obter o driver
        const driver = await startAutomation();
        if (!driver) {
            console.error('Driver not initialized. Exiting...');
            return;
        }

        const cpfsFilePath = './data/lista.txt';
        const emailFilePath = './data/e-mail.txt';

        // Ler os CPFs e o e-mail e senha a partir dos arquivos
        const [cpfs, { email, password }] = await Promise.all([
            readCPFsFromFile(cpfsFilePath),
            readEmailFromFile(emailFilePath)
        ]);

        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);

        

        // Iterar sobre os CPFs e executar a automação para cada um
        for (const cpf of cpfs) {
            try {
                const data = await getDataByCPF(cpf);
                console.log(`Dados do CPF ${cpf}:`, data);

                // Dados fixos
                const password = 'Dixavado71@'; // Adicione o valor da senha aqui

                // Dados variáveis obtidos da consulta
                const day = data.dataNascimento.split('/')[0];
                const month = data.dataNascimento.split('/')[1];
                const year = data.dataNascimento.split('/')[2];
                const gender = data.sexo; // Assumindo que o retorno da API já está no formato 'M' ou 'F'
                const street = data.endereco.logradouro;
                const postalCode = data.endereco.cep;
                const city = 'Brasilia'; // Cidade fixada conforme o exemplo

                // Gerar telefone móvel dinâmico
                const mobilePhone = generateBrazilianPhoneNumber();

                await performAutomationValidation(driver, email, day, month, year, cpf, gender, street, city, postalCode, mobilePhone, password);
                // Verificar e-mail e obter o código de ativação
                const activationCode = await checkEmails();
                console.log(`Código de ativação: ${activationCode}`);

                // Solicitar ao usuário que insira o código de ativação
                const userInputCode = await promptUser('Insira o código de ativação: ');

                if (activationCode !== userInputCode) {
                    console.error('Código de ativação incorreto.');
                    return;
                }
            } catch (error) {
                console.error(`Erro ao processar o CPF ${cpf}:`, error.message);
            }
        }

        // Fechar o driver após a automação
        // await driver.deleteSession();
    } catch (e) {
        console.error('Error in automation process:', e);
    }
})();

const { remote } = require('webdriverio');
const fs = require('fs');
const path = require('path');

// Função para carregar configurações do arquivo config.json
function loadConfig() {
    const configPath = path.resolve(__dirname, '../config.json');
    const rawData = fs.readFileSync(configPath);
    return JSON.parse(rawData);
}

// Função para acessar a página e salvar o conteúdo
async function accessAndDumpPage(email, day, month, year, cpf, gender) {
    // Carregar configurações do arquivo config.json
    const config = loadConfig();

    // Configurações do driver
    const opts = {
        protocol: config.protocol,
        hostname: config.hostname,
        port: config.port,
        path: config.path,
        capabilities: {
            platformName: config.platformName,
            'appium:platformVersion': config.platformVersion,
            'appium:deviceName': config.deviceName,
            'appium:udid': config.udid,
            browserName: config.browserName,
            'appium:automationName': config.automationName,
            //'appium:showXcodeLog': true // Adiciona para mostrar logs do Xcode
        }
    };

    try {
        const driver = await remote(opts);

        // Acessar o site https://br.betano.com/
        await driver.url('https://br.betano.com');

        // Aguardar 5 segundos para garantir que a página carregue completamente
        await driver.pause(5000);
        
        // Acessar a página de registro
        await driver.url('https://br.betano.com/myaccount/register');
        
        // Aguardar pela presença do botão "Registrar com email"
        const buttonSelector = 'button[data-qa="email-registration"]';
        await driver.$(buttonSelector).waitForDisplayed({ timeout: 10000 });
        
        // Clicar no botão "Registrar com email"
        await driver.$(buttonSelector).click();

        // Aguardar 5 segundos para garantir que a ação seja concluída
        await driver.pause(5000);

        // Aguardar a presença do campo de entrada de email
        const emailInputSelector = 'input[data-qa="input"][type="email"]';
        const emailInput = await driver.$(emailInputSelector);
        await emailInput.waitForDisplayed({ timeout: 10000 });

        // Inserir o valor no campo de email
        await emailInput.setValue(email);

        // Aguardar 2 segundos para garantir que o valor seja inserido
        await driver.pause(2000);

        // Selecionar os valores da data de nascimento
        const daySelector = 'select[name="Day"]';
        const monthSelector = 'select[name="Month"]';
        const yearSelector = 'select[name="Year"]';

        // Definir os valores dos campos de data de nascimento
        await driver.$(daySelector).selectByAttribute('value', day);
        await driver.$(monthSelector).selectByAttribute('value', month);
        await driver.$(yearSelector).selectByAttribute('value', year);

        // Aguardar 2 segundos para garantir que os valores sejam definidos
        await driver.pause(2000);

        // Inserir o valor no campo de CPF
        const cpfInputSelector = 'input[id="tax-number"]';
        const cpfInput = await driver.$(cpfInputSelector);
        await cpfInput.setValue(cpf);

        // Aguardar 2 segundos para garantir que o valor seja inserido
        await driver.pause(2000);

        
        // Obter o HTML da página
        const pageContent = await driver.getPageSource();

        // Salvar o HTML em um arquivo
        const filePath = path.resolve(__dirname, '../dados.html');
        fs.writeFileSync(filePath, pageContent);

        console.log(`Dados da página salvos em ${filePath}`);

        // Clicar no botão "PRÓXIMA"
        
        
    } catch (e) {
        console.error('Error:', e);
    }
}

module.exports = { accessAndDumpPage };

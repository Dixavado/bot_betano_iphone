const { remote } = require('webdriverio');
const fs = require('fs');
const path = require('path');

// Função para carregar configurações do arquivo config.json
function loadConfig() {
    const configPath = path.resolve(__dirname, '../config.json');
    const rawData = fs.readFileSync(configPath);
    return JSON.parse(rawData);
}

// Função para iniciar a automação e acessar o Safari
async function startAutomation() {
    const config = loadConfig();

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

        // Passar o driver para a função de automação
        return driver;

    } catch (e) {
        console.error('Error starting automation:', e);
    }
}

// Função para aguardar pela presença de um seletor
async function waitForElement(driver, selector, timeout = 10000) {
    try {
        await driver.$(selector).waitForDisplayed({ timeout });
        return await driver.$(selector);
    } catch (error) {
        throw new Error(`Element with selector ${selector} not found within ${timeout} ms`);
    }
}

// Função para realizar a automação dentro do Safari
async function performAutomation(driver, email, day, month, year, cpf, gender) {
    try {
        // Aguardar pela presença do botão "Registrar com email"
        const buttonSelector = 'button[data-qa="email-registration"]';
        const registerButton = await waitForElement(driver, buttonSelector);

        // Clicar no botão "Registrar com email"
        await registerButton.click();

        // Aguardar 5 segundos para garantir que a ação seja concluída
        await driver.pause(5000);

        // Aguardar a presença do campo de entrada de email
        const emailInputSelector = 'input[data-qa="input"][type="email"]';
        const emailInput = await waitForElement(driver, emailInputSelector);

        // Inserir o valor no campo de email
        await emailInput.setValue(email);

        // Aguardar 2 segundos para garantir que o valor seja inserido
        await driver.pause(2000);

        // Selecionar os valores da data de nascimento
        const daySelector = 'select[name="Day"]';
        const monthSelector = 'select[name="Month"]';
        const yearSelector = 'select[name="Year"]';

        // Definir os valores dos campos de data de nascimento
        await (await waitForElement(driver, daySelector)).selectByAttribute('value', day);
        await (await waitForElement(driver, monthSelector)).selectByAttribute('value', month);
        await (await waitForElement(driver, yearSelector)).selectByAttribute('value', year);

        // Aguardar 2 segundos para garantir que os valores sejam definidos
        await driver.pause(2000);

        // Inserir o valor no campo de CPF
        const cpfInputSelector = 'input[id="tax-number"]';
        const cpfInput = await waitForElement(driver, cpfInputSelector);
        await cpfInput.setValue(cpf);

        // Aguardar 2 segundos para garantir que o valor seja inserido
        await driver.pause(2000);

        // Selecionar o gênero
        const genderSelector = gender === 'M' ? 'input[id="male"]' : 'input[id="female"]';
        const genderInput = await waitForElement(driver, genderSelector);
        await genderInput.click();

        // Aguardar 2 segundos para garantir que a ação seja concluída
        await driver.pause(2000);

        // Clicar no botão "PRÓXIMA"
        const nextButtonSelector = 'button[data-qa="next"]';
        const nextButton = await driver.$(nextButtonSelector);
        await nextButton.click();

        // Obter o HTML da página
        const pageContent = await driver.getPageSource();

        // Salvar o HTML em um arquivo
        const filePath = path.resolve(__dirname, '../dados.html');
        fs.writeFileSync(filePath, pageContent);

        console.log(`Dados da página salvos em ${filePath}`);

    } catch (e) {
        console.error('Error performing automation:', e);
    }
}

module.exports = { startAutomation, performAutomation };

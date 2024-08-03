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
        logLevel: 'silent',
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

module.exports = startAutomation;

const fs = require('fs');
const path = require('path');

// Função para realizar o dump do conteúdo da página e salvar no arquivo /data/dump.html
async function performDump(driver) {
    try {
        // Aguardar 5 segundos para garantir que a ação seja concluída
        await driver.pause(5000);

        // Valor do código a ser inserido
        const code = '16276';

        // Seletores dos campos de código
        const digitDivSelectors = [
            'div[data-qa="digit1"]',
            'div[data-qa="digit2"]',
            'div[data-qa="digit3"]',
            'div[data-qa="digit4"]',
            'div[data-qa="digit5"]'
        ];

        // Verificar se o número de seletores corresponde ao número de dígitos no código
        if (digitDivSelectors.length !== code.length) {
            throw new Error('Número de seletores não corresponde ao número de dígitos no código.');
        }

        // Inserir o valor do código em cada campo correspondente
        for (let i = 0; i < digitDivSelectors.length; i++) {
            const selector = digitDivSelectors[i];
            const digitDiv = await driver.$(selector);
            await driver.waitUntil(async () => {
                const isVisible = await digitDiv.isDisplayed();
                const isCorrectValue = await digitDiv.getText() === '';
                return isVisible && isCorrectValue;
            }, {
                timeout: 10000,
                timeoutMsg: `Campo ${selector} não está visível ou valor não é o esperado`
            });

            // Simular a digitação do dígito correspondente
            await digitDiv.click(); // Clique para ativar o campo
            await driver.keys(code[i]); // Simular digitação do dígito
        }

        await driver.pause(2000);

        // Seletor simplificado para o botão de envio
        const submitButtonSelector = 'button[data-qa="verification-submit"]';
        const submitButton = await driver.$(submitButtonSelector);
        await driver.waitUntil(async () => {
            return await submitButton.isDisplayed();
        }, {
            timeout: 10000,
            timeoutMsg: 'Botão de envio não está visível'
        });
        await submitButton.click();

        // Obter o conteúdo da página
        const pageContent = await driver.getPageSource();

        // Caminho para o arquivo de dump
        const dumpFilePath = path.join(__dirname, 'data', 'dump.html');

        // Garantir que o diretório /data exista
        fs.mkdirSync(path.dirname(dumpFilePath), { recursive: true });

        // Salvar o conteúdo da página no arquivo dump.html
        fs.writeFileSync(dumpFilePath, pageContent, 'utf-8');

        console.log(`Page content saved to ${dumpFilePath}`);
        return true;
        
    } catch (e) {
        console.error('Error performing automation:', e);
        return false;
    }
}

module.exports = performDump;

const fs = require('fs');
const path = require('path');

// Função para aguardar pela presença de um seletor
async function waitForElement(driver, selector, timeout = 10000) {
    try {
        await driver.$(selector).waitForDisplayed({ timeout });
        return await driver.$(selector);
    } catch (error) {
        throw new Error(`Element with selector ${selector} not found within ${timeout} ms`);
    }
}

// Função para aguardar pela presença de texto específico no HTML
async function waitForText(driver, text, timeout = 5000) {
    const endTime = Date.now() + timeout;
    while (Date.now() < endTime) {
        const pageContent = await driver.getPageSource();
        if (pageContent.includes(text)) {
            return true;
        }
        await driver.pause(1000); // Aguarda 1 segundo antes de verificar novamente
    }
    return false;
}

// Função para realizar a automação dentro do Safari
async function performMailCheck(driver, email) {
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

        // Aguardar 5 segundos para garantir que o registro seja processado
        await driver.pause(5000);

        // Verificar a presença do texto de erro
        const errorText = 'Este email já está sendo utilizado. Por favor, insira outro email ou <a id="emailErrorLink" href="https://br.betano.com/myaccount/forgotpassword" target="_blank"><strong>Redefinir senha</strong></a>';
        const isErrorPresent = await waitForText(driver, errorText, 5000);

        // Retornar verdadeiro se o e-mail estiver live, falso caso contrário
        return !isErrorPresent;
        
    } catch (e) {
        console.error('Error performing automation:', e);
        return false;
    }
}

module.exports = performMailCheck;

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

// Função para realizar a automação dentro do Safari
async function performAutomation(driver, email, day, month, year, cpf, gender, street, city, postalCode, mobilePhone, password) {
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

        await driver.pause(5000);

        // Preencher os campos adicionais
        const streetSelector = 'input[id="street"]';
        const citySelector = 'input[id="city"]';
        const postalCodeSelector = 'input[id="postalcode"]';
        const mobilePhoneSelector = 'input[id="mobilePhone"]';

        // Inserir os valores nos campos adicionais
        await driver.$(streetSelector).setValue(street);
        await driver.$(citySelector).setValue(city);
        await driver.$(postalCodeSelector).setValue(postalCode);
        await driver.$(mobilePhoneSelector).setValue(mobilePhone);

        // Aguardar 2 segundos para garantir que os valores sejam inseridos
        await driver.pause(2000);
        
        // Clicar no botão "PRÓXIMA"
        const nextButtonSelector1 = 'button[data-qa="next"]';
        const nextButton1 = await driver.$(nextButtonSelector1);
        await nextButton1.click();

        await driver.pause(2000);

        // Aguardar a presença do campo de senha
        const passwordInputSelector = 'input[name="Password"]';
        const passwordInput = await driver.$(passwordInputSelector);
        await passwordInput.waitForDisplayed({ timeout: 10000 });

        // Inserir o valor no campo de senha
        await passwordInput.setValue(password);

        await driver.pause(2000);

        // Clicar no botão "PRÓXIMA"
        const nextButtonSelector2 = 'button[data-qa="next"]';
        const nextButton2 = await driver.$(nextButtonSelector2);
        await nextButton2.click();

        await driver.pause(2000);

        // Marcar os checkboxes para termos e condições e ofertas
        const termsCheckboxSelector = 'input[id="terms-checkbox"]';
        const offersCheckboxSelector = 'input[id="offers"]';

        const termsCheckbox = await driver.$(termsCheckboxSelector);
        if (!(await termsCheckbox.isSelected())) {
            await termsCheckbox.click();
        }

        const offersCheckbox = await driver.$(offersCheckboxSelector);
        if (!(await offersCheckbox.isSelected())) {
            await offersCheckbox.click();
        }

        // Aguardar 2 segundos para garantir que os checkboxes sejam marcados
        await driver.pause(2000);

        // Clicar no botão "REGISTRAR"
        const submitButtonSelector = 'button[data-qa="submit-register"]';
        const submitButton = await driver.$(submitButtonSelector);
        await submitButton.click();

        // Aguardar 5 segundos para garantir que o registro seja processado
        await driver.pause(5000);

        console.log(`Cadastro feito, valide o e-mail`);

        // Adicionar os dados ao arquivo contas.txt
        const accountDetails = `${email}|${day}|${month}|${year}|${cpf}|${gender}|${street}|${city}|${postalCode}|${mobilePhone}|${password}\n`;
        const filePath = path.resolve(__dirname, '../data/contas_validar.txt');
        fs.appendFileSync(filePath, accountDetails);

    } catch (e) {
        console.error('Error performing automation:', e);
    }
}

module.exports = performAutomation;

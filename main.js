const { accessAndDumpPage } = require('./lib/utils');

// Valores a serem passados para a função
const email = 'hbkmichaelcollins1653@gmail.com';
const day = '19';
const month = '03';
const year = '1935';
const cpf = '021.140.709-72';
const gender = 'M';
const street = 'Rua 171';
const city = 'Setolandia';
const postalcode = '72880-622';
const mobilePhone = '61996644322';
const password = 'Dixavado71@';

// Executar a função para acessar a página e salvar o conteúdo
accessAndDumpPage(email, day, month, year, cpf, gender, street, city, postalcode, mobilePhone, password);

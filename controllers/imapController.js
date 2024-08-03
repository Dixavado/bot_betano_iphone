// lib/imapController.js
const Imap = require('imap');
const { simpleParser } = require('mailparser');

const imapConfig = {
  user: 'cczuna6ha@hotmail.com',
  password: 'PP0MBrmP7Qm',
  host: 'outlook.office365.com',
  port: 993,
  tls: true
};

const imap = new Imap(imapConfig);

function fetchEmails(folder) {
  return new Promise((resolve, reject) => {
    imap.openBox(folder, false, (err, box) => {
      if (err) {
        console.error(`Error opening box ${folder}: ${err}`);
        return reject(err);
      }

      const searchCriteria = ['ALL'];
      const fetchOptions = { bodies: '' };

      imap.search(searchCriteria, (err, results) => {
        if (err) {
          console.error(`Error searching emails in ${folder}: ${err}`);
          return reject(err);
        }

        if (results.length === 0) {
          console.log(`No emails found in ${folder}`);
          return resolve(null);
        }

        const fetch = imap.fetch(results, fetchOptions);
        fetch.once('message', (msg) => {
          msg.once('body', (stream) => {
            simpleParser(stream, (err, mail) => {
              if (err) {
                console.error(`Error parsing email: ${err}`);
                return reject(err);
              }

              if (mail.subject === 'Bem-vindo à Betano!' && mail.from.text === 'suporte@betano.com') {
                const activationCodeMatch = mail.text.match(/Código de ativação:\s*(\d+)/);
                const activationCode = activationCodeMatch ? activationCodeMatch[1] : 'Activation Code not found';
                resolve(activationCode);
              } else {
                resolve(null);
              }
            });
          });
        });
        fetch.once('end', () => {
          console.log(`Finished fetching emails from ${folder}`);
        });
      });
    });
  });
}

function checkEmails() {
  return new Promise((resolve, reject) => {
    const folders = ['INBOX', 'Junk', 'Deleted Items'];
    
    (async function checkFolder(index) {
      if (index >= folders.length) {
        setTimeout(() => checkFolder(0), 5000); // Recheck after 5 seconds if not found
        return;
      }

      try {
        const activationCode = await fetchEmails(folders[index]);
        if (activationCode) {
          imap.end();
          resolve(activationCode);
        } else {
          checkFolder(index + 1);
        }
      } catch (err) {
        reject(err);
      }
    })(0);
  });
}

module.exports = { checkEmails };

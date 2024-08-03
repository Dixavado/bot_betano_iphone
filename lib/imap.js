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

let latestEmail = null;
let emailFound = false;

function fetchEmails(folder, callback) {
  imap.openBox(folder, false, (err, box) => {
    if (err) {
      console.error(`Error opening box ${folder}: ${err}`);
      return callback(err);
    }

    const searchCriteria = ['ALL'];
    const fetchOptions = { bodies: '' };

    imap.search(searchCriteria, (err, results) => {
      if (err) {
        console.error(`Error searching emails in ${folder}: ${err}`);
        return callback(err);
      }

      if (results.length === 0) {
        console.log(`No emails found in ${folder}`);
        return callback();
      }

      const fetch = imap.fetch(results, fetchOptions);
      fetch.on('message', (msg, seqno) => {
        msg.on('body', (stream) => {
          simpleParser(stream, (err, mail) => {
            if (err) {
              console.error(`Error parsing email: ${err}`);
              return;
            }

            if (mail.subject === 'Bem-vindo à Betano!' && mail.from.text === 'suporte@betano.com') {
              // Compare dates
              if (!latestEmail || mail.date > latestEmail.date) {
                latestEmail = {
                  subject: mail.subject,
                  from: mail.from.text,
                  date: mail.date,
                  text: mail.text
                };

                // Extract activation code using regex
                const activationCodeMatch = mail.text.match(/Código de ativação:\s*(\d+)/);
                if (activationCodeMatch) {
                  latestEmail.activationCode = activationCodeMatch[1];
                  emailFound = true; // Set emailFound to true to stop checking
                } else {
                  latestEmail.activationCode = 'Activation Code not found';
                }
              }
            }
          });
        });
      });

      fetch.on('end', () => {
        console.log(`Finished fetching emails from ${folder}`);
        callback();
      });
    });
  });
}

function checkEmails() {
  fetchEmails('INBOX', () => {
    if (!emailFound) {
      fetchEmails('Junk', () => {
        if (!emailFound) {
          fetchEmails('Deleted Items', () => {
            if (!emailFound) {
              setTimeout(checkEmails, 5000); // Check again after 5 seconds
            }
          });
        }
      });
    } else {
      imap.end(); // End the connection if email is found
    }
  });
}

imap.once('ready', () => {
  checkEmails(); // Start checking for emails
});

imap.once('error', (err) => {
  console.error('IMAP Error:', err);
});

imap.once('end', () => {
  console.log('Connection ended');
  if (latestEmail) {
    // Display the latest email
    console.log(`Date: ${latestEmail.date}`);
    console.log(`Codigo: ${latestEmail.activationCode}`);
  } else {
    console.log('No relevant emails found');
  }
});

imap.connect();

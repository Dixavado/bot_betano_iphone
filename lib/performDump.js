const fs = require('fs');
const path = require('path');


// Função para realizar o dump do conteúdo da página e salvar no arquivo /data/dump.html
async function performDump(driver) {
    try {
        // Aguardar 5 segundos para garantir que a ação seja concluída
        await driver.pause(5000);

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

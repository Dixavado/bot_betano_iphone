const startAutomation = require('./lib/startAutomation');
const performDump = require('./lib/teste');

(async () => {
    try {
        // Iniciar a automação e obter o driver
        const driver = await startAutomation();
        if (!driver) {
            console.error('Driver not initialized. Exiting...');
            return;
        }
        await performDump(driver);

        // Fechar o driver após a automação
        //await driver.deleteSession();
    } catch (e) {
        console.error('Error in automation process:', e);
    }
})();

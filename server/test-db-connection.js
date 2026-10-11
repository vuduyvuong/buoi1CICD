const { verifyConnection, closePool } = require('./sqlserver');

(async () => {
  try {
    const info = await verifyConnection();
    console.log('Kết nối SQL Server thành công.');
    console.log(`Server: ${info.serverName}`);
    console.log(`Database: ${info.databaseName}`);
    console.log(`Số bảng: ${info.tableCount}`);
    console.log(`Schema hợp lệ: ${info.schemaReady ? 'Có' : 'Không'}`);
  } catch (error) {
    console.error('Không thể kết nối SQL Server.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await closePool().catch(() => null);
  }
})();

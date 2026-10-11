const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });

const PORT = Number(process.env.PORT || 4000);
const useSqlServer = String(process.env.DB_PROVIDER || 'json').toLowerCase() === 'mssql';
const target = useSqlServer ? require('./sql-app') : { app: require('./index'), initialize: async () => null };

target.initialize().then(() => {
  target.app.listen(PORT, () => {
    console.log(`BẢN SẮC API (${useSqlServer ? 'SQL Server' : 'JSON'}) đang chạy tại http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('Không thể khởi động backend:', error.message);
  process.exit(1);
});

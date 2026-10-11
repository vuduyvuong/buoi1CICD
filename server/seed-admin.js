const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env'), quiet: true });
const { sql, getPool, closePool } = require('./sqlserver');
const { hashPassword } = require('./security');

(async () => {
  try {
    const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = String(process.env.ADMIN_PASSWORD || '');
    if (!email || password.length < 8 || password === 'change-this-password') {
      throw new Error('Hãy đặt ADMIN_EMAIL và ADMIN_PASSWORD (ít nhất 8 ký tự, không dùng giá trị mẫu) trong .env.');
    }
    const pool = await getPool();
    await pool.request()
      .input('email', sql.VarChar(255), email)
      .input('name', sql.NVarChar(100), 'BẢN SẮC Admin')
      .input('hash', sql.VarChar(255), hashPassword(password))
      .query(`
        DECLARE @AdminRoleId TINYINT=(SELECT RoleId FROM dbo.Roles WHERE RoleCode='admin');
        IF @AdminRoleId IS NULL THROW 50010, N'Không tìm thấy role admin.', 1;
        IF EXISTS(SELECT 1 FROM dbo.Users WHERE Email=@email)
          UPDATE dbo.Users SET RoleId=@AdminRoleId,PasswordHash=@hash,Status='active',UpdatedAt=SYSUTCDATETIME() WHERE Email=@email;
        ELSE
          INSERT dbo.Users(RoleId,FullName,Email,PasswordHash,Status) VALUES(@AdminRoleId,@name,@email,@hash,'active');
        DELETE s FROM dbo.AuthSessions s JOIN dbo.Users u ON u.UserId=s.UserId WHERE u.Email=@email;
      `);
    console.log(`Đã đồng bộ tài khoản admin: ${email}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await closePool().catch(() => null);
  }
})();

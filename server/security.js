const crypto = require('crypto');

function hashPassword(password, salt) {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, actualSalt, 64).toString('hex');
  return `${actualSalt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const parts = stored.split(':');
    const candidate = hashPassword(password, parts[0]).split(':')[1];
    return crypto.timingSafeEqual(Buffer.from(parts[1], 'hex'), Buffer.from(candidate, 'hex'));
  } catch (error) { return false; }
}

function randomToken() { return crypto.randomBytes(32).toString('hex'); }
function tokenHash(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
function publicUser(user) { return { id: user.id, name: user.name, email: user.email, phone: user.phone || '', role: user.role || 'customer', createdAt: user.createdAt }; }

module.exports = { hashPassword, verifyPassword, randomToken, tokenHash, publicUser };

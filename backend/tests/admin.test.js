const request = require('supertest');
const app = require('../server.cjs');

describe('Admin API', () => {
  let adminToken;

  beforeAll(async () => {
    // Zaloguj admina i pobierz token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'adminpassword' });
    adminToken = res.body.token;
  });

  test('GET /api/admin/users - admin widzi listę użytkowników', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
  });
});
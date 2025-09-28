const request = require('supertest');
const app = require('../server.cjs');
const db = require('../db.cjs');

let jwtToken;
let refreshToken;

const testUser = {
  username: 'testuser',
  email: 'testuser@example.com',
  password: 'Test1234!'
};

afterAll(async () => {
  await db.query('DELETE FROM users WHERE username = $1', [testUser.username]);
  if (db.end) db.end();
});

describe('Auth & User Flow', () => {
  test('Rejestracja nowego użytkownika', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
  });

  test('Logowanie użytkownika i otrzymanie JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: testUser.username, password: testUser.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    jwtToken = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  test('Ochrona endpointów - brak tokena', async () => {
    const res = await request(app)
      .get('/api/music/releases');
    expect(res.statusCode).toBe(401);
  });

  test('Ochrona endpointów - poprawny token', async () => {
    const res = await request(app)
      .get('/api/music/releases')
      .set('Authorization', `Bearer ${jwtToken}`);
    expect([200, 404]).toContain(res.statusCode);
  });

  test('Odświeżanie tokena', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  // Dodaj testy ról jeśli masz role w systemie
  // test('Dostęp tylko dla admina', async () => { ... });
});
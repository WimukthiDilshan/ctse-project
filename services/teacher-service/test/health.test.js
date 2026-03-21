process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../server');

describe('Teacher Service health endpoint', () => {
    it('returns healthy response', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.text.toLowerCase()).toContain('healthy');
    });
});

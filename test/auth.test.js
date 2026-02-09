const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(chaiHttp);

// Mock environment variables for testing
process.env.MONGODB_URI = 'mongodb://localhost:27017/estatespace-test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.PORT = 8081;

const app = require('../src/server');
const User = require('../src/models/User');

describe('Authentication Endpoints', () => {
  // Clean up database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid credentials', (done) => {
      chai
        .request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('user');
          expect(res.body.user).to.have.property('email', 'test@example.com');
          expect(res.body.user).to.not.have.property('password');
          done();
        });
    });

    it('should return 400 for invalid email', (done) => {
      chai
        .request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should return 400 for short password', (done) => {
      chai
        .request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should return 409 for duplicate email', (done) => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
      };

      // Register first user
      chai
        .request(app)
        .post('/auth/register')
        .send(userData)
        .end(() => {
          // Try to register again with same email
          chai
            .request(app)
            .post('/auth/register')
            .send(userData)
            .end((err, res) => {
              expect(res).to.have.status(409);
              expect(res.body).to.have.property('error');
              done();
            });
        });
    });
  });

  describe('POST /auth/login', () => {
    beforeEach((done) => {
      // Create a user for login tests
      chai
        .request(app)
        .post('/auth/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .end(() => done());
    });

    it('should login with valid credentials', (done) => {
      chai
        .request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('token');
          expect(res.body).to.have.property('user');
          done();
        });
    });

    it('should return 401 for invalid email', (done) => {
      chai
        .request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123',
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should return 401 for invalid password', (done) => {
      chai
        .request(app)
        .post('/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword',
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('error');
          done();
        });
    });

    it('should return 400 for missing credentials', (done) => {
      chai
        .request(app)
        .post('/auth/login')
        .send({})
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('error');
          done();
        });
    });
  });
});

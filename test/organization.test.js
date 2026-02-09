const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(chaiHttp);

const app = require('../src/server');
const Organization = require('../src/models/Organization');
const User = require('../src/models/User');

describe('Organization Endpoints', () => {
  let authToken;
  let testOrgId;

  // Setup: Create a user and get auth token
  before((done) => {
    chai
      .request(app)
      .post('/auth/register')
      .send({
        email: 'orgtest@example.com',
        password: 'password123',
      })
      .end((err, res) => {
        chai
          .request(app)
          .post('/auth/login')
          .send({
            email: 'orgtest@example.com',
            password: 'password123',
          })
          .end((err, res) => {
            authToken = res.body.token;
            done();
          });
      });
  });

  // Clean up organizations before each test
  beforeEach(async () => {
    await Organization.deleteMany({});
  });

  describe('POST /organization', () => {
    it('should create a new organization with valid data', (done) => {
      chai
        .request(app)
        .post('/organization')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Organization',
          addresses: [
            {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'USA',
            },
          ],
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('name', 'Test Organization');
          expect(res.body).to.have.property('addresses');
          expect(res.body.addresses).to.have.lengthOf(1);
          testOrgId = res.body._id;
          done();
        });
    });

    it('should return 401 without auth token', (done) => {
      chai
        .request(app)
        .post('/organization')
        .send({
          name: 'Test Organization',
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should return 400 for missing name', (done) => {
      chai
        .request(app)
        .post('/organization')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          addresses: [],
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe('GET /organization', () => {
    beforeEach((done) => {
      // Create test organizations
      const orgs = [
        {
          name: 'Acme Corp',
          addresses: [
            {
              street: '100 Main St',
              city: 'Boston',
              state: 'MA',
              zip: '02101',
              country: 'USA',
            },
          ],
        },
        {
          name: 'Global Inc',
          addresses: [
            {
              street: '200 Oak Ave',
              city: 'San Francisco',
              state: 'CA',
              zip: '94102',
              country: 'USA',
            },
          ],
        },
      ];

      Organization.insertMany(orgs).then(() => done());
    });

    it('should get all organizations', (done) => {
      chai
        .request(app)
        .get('/organization')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          expect(res.body).to.have.lengthOf(2);
          done();
        });
    });

    it('should return 401 without auth token', (done) => {
      chai
        .request(app)
        .get('/organization')
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });

  describe('GET /organization/:id', () => {
    beforeEach((done) => {
      const org = new Organization({
        name: 'Test Org',
        addresses: [],
      });
      org.save().then((savedOrg) => {
        testOrgId = savedOrg._id;
        done();
      });
    });

    it('should get organization by ID', (done) => {
      chai
        .request(app)
        .get(`/organization/${testOrgId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name', 'Test Org');
          done();
        });
    });

    it('should return 404 for non-existent ID', (done) => {
      chai
        .request(app)
        .get('/organization/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('should return 400 for invalid ID format', (done) => {
      chai
        .request(app)
        .get('/organization/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe('PATCH /organization/:id', () => {
    beforeEach((done) => {
      const org = new Organization({
        name: 'Original Name',
        addresses: [
          {
            street: '100 Main St',
            city: 'Boston',
            state: 'MA',
            zip: '02101',
            country: 'USA',
          },
        ],
      });
      org.save().then((savedOrg) => {
        testOrgId = savedOrg._id;
        done();
      });
    });

    it('should update organization name using JSON Patch', (done) => {
      chai
        .request(app)
        .patch(`/organization/${testOrgId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send([
          {
            op: 'replace',
            path: '/name',
            value: 'Updated Name',
          },
        ])
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name', 'Updated Name');
          done();
        });
    });

    it('should add address using JSON Patch', (done) => {
      chai
        .request(app)
        .patch(`/organization/${testOrgId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send([
          {
            op: 'add',
            path: '/addresses/-',
            value: {
              street: '200 Oak Ave',
              city: 'New York',
              state: 'NY',
              zip: '10001',
              country: 'USA',
            },
          },
        ])
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.addresses).to.have.lengthOf(2);
          done();
        });
    });

    it('should return 404 for non-existent organization', (done) => {
      chai
        .request(app)
        .patch('/organization/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .send([
          {
            op: 'replace',
            path: '/name',
            value: 'New Name',
          },
        ])
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('should return 400 for invalid patch format', (done) => {
      chai
        .request(app)
        .patch(`/organization/${testOrgId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send([
          {
            op: 'invalid-op',
            path: '/name',
          },
        ])
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe('DELETE /organization/:id', () => {
    beforeEach((done) => {
      const org = new Organization({
        name: 'To Be Deleted',
        addresses: [],
      });
      org.save().then((savedOrg) => {
        testOrgId = savedOrg._id;
        done();
      });
    });

    it('should delete organization', (done) => {
      chai
        .request(app)
        .delete(`/organization/${testOrgId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('message');
          done();
        });
    });

    it('should return 404 for non-existent organization', (done) => {
      chai
        .request(app)
        .delete('/organization/507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it('should return 401 without auth token', (done) => {
      chai
        .request(app)
        .delete(`/organization/${testOrgId}`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });
  });
});

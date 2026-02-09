const { expect } = require('chai');
const User = require('../src/models/User');

describe('User Model', () => {
  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'plainPassword123',
      });

      await user.save();

      expect(user.password).to.not.equal('plainPassword123');
      expect(user.password).to.have.lengthOf.at.least(50); // bcrypt hashes are long
    });

    it('should not rehash password if not modified', async () => {
      const user = new User({
        email: 'test2@example.com',
        password: 'password123',
      });

      await user.save();
      const firstHash = user.password;

      user.email = 'updated@example.com';
      await user.save();

      expect(user.password).to.equal(firstHash);
    });
  });

  describe('Password Comparison', () => {
    it('should return true for correct password', async () => {
      const user = new User({
        email: 'test3@example.com',
        password: 'correctPassword',
      });

      await user.save();

      const isMatch = await user.comparePassword('correctPassword');
      expect(isMatch).to.be.true;
    });

    it('should return false for incorrect password', async () => {
      const user = new User({
        email: 'test4@example.com',
        password: 'correctPassword',
      });

      await user.save();

      const isMatch = await user.comparePassword('wrongPassword');
      expect(isMatch).to.be.false;
    });
  });
});

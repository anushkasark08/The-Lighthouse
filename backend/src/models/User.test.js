const User = require('./User');
const bcrypt = require('bcryptjs');

describe('User Model pre-save hook', () => {
  const runPreSave = async (user) => {
    await new Promise((resolve, reject) => {
      User.schema.s.hooks.execPre('save', user, [], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  test('should hash the password for a new user', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    });

    expect(user.isModified('password')).toBe(true);
    const originalPassword = user.password;

    await runPreSave(user);

    expect(user.password).not.toBe(originalPassword);
    expect(user.password.startsWith('$2a$')).toBe(true);
    
    const isMatch = await user.matchPassword(originalPassword);
    expect(isMatch).toBe(true);
  });

  test('should NOT rehash the password when password is NOT modified', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    });

    // Run first pre-save to hash password
    await runPreSave(user);
    const initialHash = user.password;

    // Spy on isModified to return false for password
    const isModifiedSpy = jest.spyOn(user, 'isModified').mockImplementation((path) => {
      if (path === 'password') return false;
      return true;
    });

    await runPreSave(user);

    // Verify it is unchanged immediately
    expect(user.password).toBe(initialHash);

    // Wait to verify no async background hashing happened
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(user.password).toBe(initialHash);

    isModifiedSpy.mockRestore();
  });

  test('should hash the new password when password is modified', async () => {
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '1234567890'
    });

    await runPreSave(user);
    const firstHash = user.password;

    // Change password
    user.password = 'newpassword123';
    // Spy on isModified to return true for password
    const isModifiedSpy = jest.spyOn(user, 'isModified').mockImplementation((path) => {
      if (path === 'password') return true;
      return true;
    });

    await runPreSave(user);

    expect(user.password).not.toBe(firstHash);
    expect(user.password).not.toBe('newpassword123');
    expect(user.password.startsWith('$2a$')).toBe(true);

    const isMatch = await user.matchPassword('newpassword123');
    expect(isMatch).toBe(true);

    isModifiedSpy.mockRestore();
  });
});

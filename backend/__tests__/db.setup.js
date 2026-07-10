const mongoose = require('mongoose');

// Mocked MongoDB setup/teardown for isolated test environments
const connect = async () => {
  // Simulate connecting to a mocked MongoDB
  jest.spyOn(mongoose, 'connect').mockResolvedValue(true);
  jest.spyOn(mongoose, 'disconnect').mockResolvedValue(true);
};

const close = async () => {
  await mongoose.disconnect();
};

const clear = async () => {
  // Simulate clearing database collections
};

// Dummy test to prevent Jest from complaining about empty test suite
describe('MongoDB Setup Helper', () => {
  test('mock setup runs correctly', () => {
    expect(true).toBe(true);
  });
});

module.exports = {
  connect,
  close,
  clear
};

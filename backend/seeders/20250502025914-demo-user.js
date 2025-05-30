'use strict';

const { User } = require('../models');     
const bcrypt = require("bcryptjs");        // Import bcrypt for password hashing

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;     // Define schema for production
}

module.exports = {
  async up (queryInterface, Sequelize) {
    await User.bulkCreate([                // Create multiple users at once
      {
        email: 'demo@user.io',
        username: 'Demo-lition',
        hashedPassword: bcrypt.hashSync('password')  // Hash password on the fly
      },
      {
        email: 'user1@user.io',
        username: 'FakeUser1',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        email: 'user2@user.io',
        username: 'FakeUser2',
        hashedPassword: bcrypt.hashSync('password3')
      }
    ], { validate: true });                // Run model validations on seed data
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] }  // Delete specific users
    }, {});
  }
};
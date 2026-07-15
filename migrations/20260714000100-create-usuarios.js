"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("usuarios", {
      id_usuario: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      correo: {
        type: Sequelize.STRING(120),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      fecha_registro: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("usuarios");
  }
};

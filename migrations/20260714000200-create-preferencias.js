"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("preferencias", {
      id_preferencia: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "usuarios",
          key: "id_usuario"
        },
        onDelete: "CASCADE"
      },
      tema: {
        type: Sequelize.STRING(20),
        defaultValue: "claro"
      },
      idioma: {
        type: Sequelize.STRING(20),
        defaultValue: "es"
      },
      notificaciones: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("preferencias");
  }
};

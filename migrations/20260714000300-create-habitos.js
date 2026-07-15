"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("habitos", {
      id_habito: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "usuarios",
          key: "id_usuario"
        },
        onDelete: "CASCADE"
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      categoria: {
        type: Sequelize.STRING(50)
      },
      frecuencia: {
        type: Sequelize.STRING(50)
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      fecha_creacion: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP")
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("habitos");
  }
};

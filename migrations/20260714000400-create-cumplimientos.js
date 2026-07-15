"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cumplimientos", {
      id_cumplimiento: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      id_habito: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "habitos",
          key: "id_habito"
        },
        onDelete: "CASCADE"
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      completado: {
        type: Sequelize.BOOLEAN
      }
    });

    await queryInterface.addConstraint("cumplimientos", {
      fields: ["id_habito", "fecha"],
      type: "unique",
      name: "uq_cumplimientos_habito_fecha"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("cumplimientos");
  }
};

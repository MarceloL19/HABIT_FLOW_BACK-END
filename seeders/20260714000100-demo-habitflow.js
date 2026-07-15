"use strict";

const passwordHash = "$2a$10$w22/mDOXSCSuY4EQYk8d1.xLUGiUIIn4vNNBWa9r.X1qxRqhNdPkq";

const fechaHaceDias = (dias) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
};

const fechaSqlHaceDias = (dias) => {
  return fechaHaceDias(dias).toISOString().slice(0, 10);
};

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("usuarios", [
      {
        id_usuario: 1,
        nombre: "Marcelo Loayza",
        correo: "marcelo@test.com",
        password: passwordHash,
        fecha_registro: new Date()
      },
      {
        id_usuario: 2,
        nombre: "Mariana Torres",
        correo: "mariana@test.com",
        password: passwordHash,
        fecha_registro: new Date()
      },
      {
        id_usuario: 3,
        nombre: "Carlos Rivas",
        correo: "carlos@test.com",
        password: passwordHash,
        fecha_registro: new Date()
      }
    ]);

    await queryInterface.bulkInsert("preferencias", [
      { id_preferencia: 1, id_usuario: 1, tema: "claro", idioma: "es", notificaciones: true },
      { id_preferencia: 2, id_usuario: 2, tema: "oscuro", idioma: "es", notificaciones: true },
      { id_preferencia: 3, id_usuario: 3, tema: "claro", idioma: "en", notificaciones: false }
    ]);

    await queryInterface.bulkInsert("habitos", [
      {
        id_habito: 1,
        id_usuario: 1,
        nombre: "Beber agua",
        descripcion: "Tomar 8 vasos de agua al dia",
        categoria: "Salud",
        frecuencia: "Diaria",
        activo: true,
        fecha_creacion: fechaHaceDias(15)
      },
      {
        id_habito: 2,
        id_usuario: 1,
        nombre: "Estudiar programacion",
        descripcion: "Repasar React y backend durante 30 minutos",
        categoria: "Estudio",
        frecuencia: "Diaria",
        activo: true,
        fecha_creacion: fechaHaceDias(12)
      },
      {
        id_habito: 3,
        id_usuario: 1,
        nombre: "Ordenar escritorio",
        descripcion: "Mantener limpio el espacio de estudio",
        categoria: "Personal",
        frecuencia: "Diaria",
        activo: true,
        fecha_creacion: fechaHaceDias(8)
      },
      {
        id_habito: 4,
        id_usuario: 2,
        nombre: "Caminar 30 minutos",
        descripcion: "Salir a caminar despues del trabajo",
        categoria: "Deporte",
        frecuencia: "Diaria",
        activo: true,
        fecha_creacion: fechaHaceDias(10)
      },
      {
        id_habito: 5,
        id_usuario: 2,
        nombre: "Leer antes de dormir",
        descripcion: "Leer 15 paginas de un libro",
        categoria: "Personal",
        frecuencia: "Diaria",
        activo: true,
        fecha_creacion: fechaHaceDias(7)
      },
      {
        id_habito: 6,
        id_usuario: 3,
        nombre: "Practicar ingles",
        descripcion: "Repasar vocabulario y escuchar un podcast",
        categoria: "Estudio",
        frecuencia: "Diaria",
        activo: true,
        fecha_creacion: fechaHaceDias(14)
      },
      {
        id_habito: 7,
        id_usuario: 3,
        nombre: "Ejercicios de fuerza",
        descripcion: "Completar una rutina corta en casa",
        categoria: "Deporte",
        frecuencia: "Semanal",
        activo: true,
        fecha_creacion: fechaHaceDias(9)
      }
    ]);

    await queryInterface.bulkInsert("cumplimientos", [
      { id_cumplimiento: 1, id_habito: 1, fecha: fechaSqlHaceDias(0), completado: true },
      { id_cumplimiento: 2, id_habito: 1, fecha: fechaSqlHaceDias(1), completado: true },
      { id_cumplimiento: 3, id_habito: 1, fecha: fechaSqlHaceDias(2), completado: true },
      { id_cumplimiento: 4, id_habito: 2, fecha: fechaSqlHaceDias(0), completado: true },
      { id_cumplimiento: 5, id_habito: 2, fecha: fechaSqlHaceDias(1), completado: true },
      { id_cumplimiento: 6, id_habito: 3, fecha: fechaSqlHaceDias(1), completado: true },
      { id_cumplimiento: 7, id_habito: 4, fecha: fechaSqlHaceDias(0), completado: true },
      { id_cumplimiento: 8, id_habito: 4, fecha: fechaSqlHaceDias(1), completado: true },
      { id_cumplimiento: 9, id_habito: 5, fecha: fechaSqlHaceDias(2), completado: true },
      { id_cumplimiento: 10, id_habito: 6, fecha: fechaSqlHaceDias(0), completado: true },
      { id_cumplimiento: 11, id_habito: 6, fecha: fechaSqlHaceDias(1), completado: true },
      { id_cumplimiento: 12, id_habito: 7, fecha: fechaSqlHaceDias(3), completado: true }
    ]);

    await queryInterface.sequelize.query("SELECT setval('usuarios_id_usuario_seq', (SELECT MAX(id_usuario) FROM usuarios));");
    await queryInterface.sequelize.query("SELECT setval('preferencias_id_preferencia_seq', (SELECT MAX(id_preferencia) FROM preferencias));");
    await queryInterface.sequelize.query("SELECT setval('habitos_id_habito_seq', (SELECT MAX(id_habito) FROM habitos));");
    await queryInterface.sequelize.query("SELECT setval('cumplimientos_id_cumplimiento_seq', (SELECT MAX(id_cumplimiento) FROM cumplimientos));");
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("cumplimientos", null, {});
    await queryInterface.bulkDelete("habitos", null, {});
    await queryInterface.bulkDelete("preferencias", null, {});
    await queryInterface.bulkDelete("usuarios", null, {});
  }
};

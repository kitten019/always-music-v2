 
const { Pool } = require("pg");

//Las credenciales se cambian de acuerdo al usuario que tengas en postgres sql en user y password
const config = {
  host: "localhost",
  database: "always_music",
  user: "postgres",
  password: "xxxxxxx",
  port: 5432,
};

const pool = new Pool(config);

//Función para captura y manejo de errores
const manejoErrores = (err, pool, tabla) => {
  switch (err.code) {
    case "28P01":
      console.log(
        "Autentificacion password falló o no existe usuario: " +
          pool.options.user
      );
      break;
    case "42P01":
      console.log("No existe la tabla [" + tabla + "] consultada");
      break;
    case "3D000":
      console.log("Base de Datos [" + pool.options.database + "] no existe");
      break;
    case "ENOTFOUND":
      console.log(
        "Error en valor usado como localhost: " + pool.options.localhost
      );
      break;
    case "ECONNREFUSED":
      console.log(
        "Error en el puerto de conexion a BD, usando: " + pool.options.port
      );
      break;
    default:
      console.log("Error interno del servidor ");
      break;
  }
};

const argumentos = process.argv.slice(2);

const funcion = argumentos[0];
const nombre = argumentos[1];
const rut = argumentos[2];
const curso = argumentos[3];
const nivel = argumentos[4];

//Función para crear nuevo estudiante
const nuevoEstudiante = async ({ nombre, rut, curso, nivel }) => {
  try {
    const result = await pool.query({
      rowMode: "array",
      text: "insert into estudiantes values ($1, $2, $3, $4) returning *",
      values: [nombre, rut, curso, nivel],
    });
    result.rowCount == 0
      ? console.log(`El rut ya existe en la tabla.`)
      : console.log("Estudiante creado con exito", result.rows[0]);
  } catch (err) {
    console.error("Codigo del error: ", err.code);
    manejoErrores(err, pool, "estudiantes");
  }
};

//Función para consultar todos los estudiantes registrados
const consultaEstudiantes = async () => {
  try {
    const result = await pool.query({
      rowMode: "array",
      text: "select * from estudiantes",
    });
    result.rowCount == 0
      ? console.log(`No hay estudiantes registrados en la tabla.`)
      : console.log("Registro actual de Estudiantes", result.rows); //Retorna todos los estudiantes registrados
  } catch (err) {
    console.error("Codigo del error: ", err.code);
    manejoErrores(err, pool, "estudiantes");
  }
};

//Función para editar estudiante accediendo mediante su rut (id)
const editarEstudiante = async ({ nombre, rut, curso, nivel }) => {
  try {
    const result = await pool.query({
      rowMode: "array",
      text: "update estudiantes set nombre=$1, curso=$3, nivel=$4 where rut=$2 returning *",
      values: [nombre, rut, curso, nivel],
    });
    result.rowCount == 0
      ? console.log(`El rut ${rut} no existe en el registro.`)
      : console.log("Estudiante editado con exito", result.rows[0]);
  } catch (err) {
    console.error("Codigo del error: ", err.code);
    manejoErrores(err, pool, "estudiantes");
  }
};

//Consultar por rut de un alumno/a
const consultaRutEstudiante = async ({ rut }) => {
  try {
    const result = await pool.query({
      rowMode: "array",
      text: "select * from estudiantes  where rut=$1",
      values: [rut],
    });
    result.rowCount == 0
      ? console.log(`El rut ${rut} no existe en la tabla.`)
      : console.log("Estudiante consultado", result.rows[0]);
  } catch (err) {
    console.error("Codigo del error: ", err.code);
    manejoErrores(err, pool, "estudiantes");
  }
};

//Eliminar por rut (id) a un alumno/a
const eliminarEstudiante = async ({ rut }) => {
  try {
    const result = await pool.query({
      rowMode: "array",
      text: "delete from estudiantes  where rut=$1",
      values: [rut],
    });
    result.rowCount == 0
      ? console.log(`El rut ${rut} no existe en la tabla.`)
      : console.log("Registro de estudiante eliminado", result.rowCount); //Cuenta la cantidad de registros eliminados
  } catch (err) {
    console.error("Codigo del error: ", err.code);
    manejoErrores(err, pool, "estudiantes");
  }
};

const funciones = {
  nuevoEstudiante: nuevoEstudiante,
  consultaEstudiantes: consultaEstudiantes,
  editarEstudiante: editarEstudiante,
  consultaRutEstudiante: consultaRutEstudiante,
  eliminarEstudiante: eliminarEstudiante,
};

const arreglo = Object.keys(funciones);

//Ejecución de funciones solicitadas
(async () => {
  if (funcion == "nuevo") {
    nuevoEstudiante({
      nombre,
      rut,
      curso,
      nivel,
    });
  } else if (funcion == "consulta") {
    consultaEstudiantes();
  } else if (funcion == "consultarut") {
    const rut = nombre; 
    consultaRutEstudiante({ rut });
  } else if (funcion == "editar") {
    editarEstudiante({ nombre, rut, curso, nivel });
  } else if (funcion == "eliminar") {
    const rut = nombre; 
    eliminarEstudiante({ rut });
  }
})();

//Ejemplos para aplicar
//node index.js nuevo 'Violeta Parr' '18564159-K' guitarra 6
//node index.js consulta
//node index.js editar 'Violeta Parr' '18564159-K' guitarra 7
//node index.js consultarut '18564159-K'
//node index.js eliminar '18564159-K'
//node index.js nuevo 'Luka Couffaine' '21356835-8' guitarra 10
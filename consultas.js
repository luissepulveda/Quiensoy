const { Pool } = require('pg')

const pool = new Pool({
    user:'postgres',
    host: 'localhost',
    password: '8964',
    database:'skatepark',
    port: 5432
})

const getUsers = async function(){
    const sqlQuery= {
        text: ' SELECT * FROM skaters'
    }
    const result = await pool.query(sqlQuery)
    return result.rows
}

const nuevoUsuario = async function(email, nombre, pass, anios, especialidad, ruta){
    const sqlQuery = {
        text: `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) values ($1, $2, $3, $4, $5, $6, false) RETURNING*`,
        values: [email, nombre, pass, anios, especialidad, ruta]
    }
    const result = await pool.query(sqlQuery)
    return result.rows[0]
}

const getUser = async function(email, pass){
    const sqlQuery = {
        text: 'SELECT * FROM skaters where email = $1 and password=$2',
        values: [email, pass]
    }
    const data = await pool.query(sqlQuery)
    return data.rows[0]
}

const modificarUser = async function(email, nombre, pass, anios, especialidad){
    const sqlQuery = {
        text: `UPDATE skaters set nombre='${nombre}', password='${pass}', anos_experiencia='${anios}', especialidad='${especialidad}' where email ='${email}' RETURNING*`,
    }
    const data = await pool.query(sqlQuery)
    return data.rows[0]
}

const eliminarUsuario = async function(id){
    const sqlQuery = {
        text: `DELETE from skaters where id = '${id}' RETURNING*`
    }
    const result = await pool.query(sqlQuery)
    return result.rows[0]
}

const cambiarEstado = async function(id, estado){
    const sqlQuery= {
        text: `UPDATE skaters set estado=${estado} where id=${id}`
    }
    const result = await pool.query(sqlQuery)
    return result.rows[0]
}

module.exports = {getUsers, nuevoUsuario, getUser, modificarUser, eliminarUsuario, cambiarEstado}
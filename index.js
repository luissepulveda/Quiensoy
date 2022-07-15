const express = require('express')
const app = express()
const exphbs = require('express-handlebars')
const jwt = require('jsonwebtoken')
const expFileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const path = require('path')
const { getUsers, nuevoUsuario, getUser, modificarUser, eliminarUsuario, cambiarEstado} = require('./consultas.js')
const secretKey = 'Secreto'

app.listen(3000, console.log("Servidor ON"))

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))
app.use(expFileUpload({
    limits: 500000,
    abortOnLimit: true,
    responseOnLimit: 'Limite permitido excedido'
}))
    app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"))
app.engine("handlebars", exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: `${__dirname}/views/mainLayout`
}))
app.set("view engine", "handlebars")

app.get("/", async function(req, res){
    const usuario = await getUsers()
    res.render("index", { usuario })
})

app.get("/Registro", async function(req, res){
    res.render("Registro")
})
app.post("/usuario", async function(req, res){
    const { email, nombre, password, anios, especialidad} = req.body
    const { foto } = req.files
    const { name } = foto
    const ruta = `/uploads/${name}`
    const datos = await nuevoUsuario(email, nombre, password, anios, especialidad, ruta)
    foto.mv(`${__dirname}/public/uploads/${name}`, async function(err){
        res.send(datos)
    })

})

app.get("/Admin", async function(req, res){
    const usuarios = await getUsers()
    res.render("Admin", { usuarios })
})

app.put("/Admin", async function(req, res){
    const { id, estado } = req.body
    console.log(req.body)
    const datos = await cambiarEstado(id, estado)
    res.send(datos)
})

app.get("/Login", async function(req, res){
    res.render("Login")
})

app.post("/user", async function(req, res){
    const { email, pass } = req.body
    const usuario = await getUser(email, pass)
    const tokenn = {
        exp: Math.floor(Date.now() / 1000) + 180,
        data: usuario
    }
        if(usuario){
            const token = jwt.sign(tokenn, secretKey)
            res.send(token)
        }else{
            res.status(401).send({
                error: 'Usuario no existe!!',
                code: 401
            })
        }
})

app.get("/Datos", async function(req, res){
    const { token } = req.query
    jwt.verify(token, secretKey, async function(err, decode){
        const { data } = decode
        err ? res.status(401).send(res.send({
            error: '401 Unauthorized',
            code: 401,
            token_error: err.message
        }))
        : res.render("Datos", {data})
    })
})

app.put("/Datos", async function(req, res){
    const {nombre, pass, anios, especialidad, email} = req.body
    try {
        const usuario = await modificarUser(email, nombre, pass, anios, especialidad)
        res.status(200).send(usuario)
    } catch (error) {
        res.status(500).send({
            error: 'Algo salio mal!!',
            code: 500
        })
    }
})

app.delete("/Eliminar", async function(req, res){
    const { idd } = req.body
    const datos = await eliminarUsuario(idd)
    res.send(datos)
})

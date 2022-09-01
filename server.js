const {Server:HttpServer} = require('http');
const {Server:iOServer} = require('socket.io');
const app = require('./app.js');
const Contenedor = require("./contenedor")

const httpServer = new HttpServer(app);
const io = new iOServer(httpServer)

let products = new Contenedor('./productos.txt');

let messages = new Contenedor('./mensajes.txt');


const PORT = 8080;

const server = httpServer.listen(PORT,()=>{
console.log(`Servidor escuchando por el puerto ${PORT}`);
})
server.on("error",err=>console.log(`Error en el servidor: ${err}`))


io.on('connection',(socket)=>{
    console.log('se conecto un cliente');

    //obtener todo los mensajes
    let mensajes = messages.getAll();
    mensajes.then(m=>{
        socket.emit('messages',m)
    }).catch(error=>{
        console.log(error);
    })

    //obtener todo los produstos
    let prod = products.getAll();
    prod.then(m=>{
        socket.emit('productos',m)
    }).catch(error=>{
        console.log(error);
    })


    socket.on('new-message',async(data)=>{
        await messages.save(data);
        let mens = messages.getAll()
        mens.then(d=>{
            io.sockets.emit('messages',d)
        }) 
    })  
    
    socket.on('new-product',async(data)=>{
        await products.save(data);
        let p = products.getAll()
        p.then(d=>{
            io.sockets.emit('productos',d)
        }) 
    }) 
});
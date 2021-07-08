const express = require('express')
const {v4: uuidv4} = require('uuid')
//v4 = gera um nunmero aleatorio

const app = express()

app.use(express.json())

const customers = []

app.post('/account', (req, res) => {
    const {cpf, name} = req.body;
    const id = uuidv4();

    customers.push({
        cpf,
        name,
        id,
        statement: []
    })

    //201 - quando um dado é criado
    return res.status(201).send();


})

app.listen(3000)
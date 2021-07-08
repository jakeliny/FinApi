const express = require('express')
const {v4: uuidv4} = require('uuid')
//v4 = gera um nunmero aleatorio

const app = express()

app.use(express.json())

const customers = []

//middleware
function verifyIfExistsAccountCPF(req, res, next){
    const {cpf} = req.params

    const customer = customers.find(customer => customer.cpf === cpf)

    if(!customer){
        return res.status(400).json({error: "Customer not found"})
    }

    //adicionando um element no req
    req.customer = customer

    return next()
}

app.post('/account', (req, res) => {
    const {cpf, name} = req.body;

    //Verificar se ja existe um cliente com esse cpf
    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    )

    if(customerAlreadyExists){
        return res.status(400).json({error: "Customer already exists!"})
    }


    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    })

    //201 - quando um dado é criado
    return res.status(201).send();


})

app.get('/statement/:cpf', verifyIfExistsAccountCPF, (req, res) => {
    const {customer} = req;
    return res.json(customer.statement)
})

app.listen(3000)
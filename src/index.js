const { response } = require('express')
const express = require('express')
const {v4: uuidv4} = require('uuid')
//v4 = gera um nunmero aleatorio

const app = express()

app.use(express.json())

const customers = []

//middleware
function verifyIfExistsAccountCPF(req, res, next){
    const {cpf} = req.headers

    const customer = customers.find(customer => customer.cpf === cpf)

    if(!customer){
        return res.status(400).json({error: "Customer not found"})
    }

    //adicionando um element no req
    req.customer = customer

    return next()
}

function getBalance(statement){
    return statement.reduce( (acc, operation) => {
        if(operation.type === 'credit'){
            return acc + operation.amount
        }else{
            return acc - operation.amount
        }
    }, 0)
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

app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
    const {customer} = req;
    return res.json(customer.statement)
})

app.post('/deposit', verifyIfExistsAccountCPF, (req, res)=>{
    const {description, amount} = req.body

    const {customer} = req

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    }

    customer.statement.push(statementOperation)

    return res.status(201).send()
})

app.post('/withdraw', verifyIfExistsAccountCPF, (req, res)=>{
    const { amount } = req.body
    const {customer} = req

    const balance = getBalance(customer.statement)

    if(balance < amount){
        return res.status(400).json({error: "Insufficient funds!"})
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation)

    return res.status(201).send()

})


app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {
    const {customer} = req;
    const { date } = req.query

    //Para buscar pelo dia independente da hora da transação
    const dateFormat = new Date(date + " 00:00")

    //Usar padrão 2021-12-31
    const statement = customer.statement.filter(statement => statement.created_at.toDateString() === new Date(dateFormat).toDateString())

    return res.json(statement)
})

app.put('/account', verifyIfExistsAccountCPF, (req, res) => {
    const {name} = req.body
    const {customer} = req

    customer.name = name

    return res.status(201).send()
})

app.get('/account', verifyIfExistsAccountCPF, (req, res) => {
    const {customer} = req
    return res.json(customer)
})

app.delete('/account', verifyIfExistsAccountCPF, (req, res) => {
    const {customer} = req

    //params: onde inicia, ate onde vai remomver
    customers.splice(customer, 1)

    return res.json(customers)
})

app.get('/balance', verifyIfExistsAccountCPF, (req,res) => {
    const {customer} = req

    const balance = getBalance(customer.statement)

    return res.json(balance)
})

app.listen(3000)
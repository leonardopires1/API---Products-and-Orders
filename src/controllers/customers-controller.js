const Customer = require('../models/Customer');

const customersController = {
    // GET /customers
    index: async (req, res) => {
        const customers = await Customer.findAll()
        res.json(customers)
    },

    // GET /customers/:id
    show: async (req, res) => {
        const customer = await Customer.findById(+req.params.id) 
        if (customer === null) return res.status(404).json({ Error: "customer not found!"})
        res.json(customer)
    },

    // POST /customers
    create: async (req, res) => {
        const customer = await Customer.create(req.body)
        res.status(201).json(customer)
    },

    // PUT /customers/:id
    update: async (req, res) => {
        const updatedCustomer = await Customer.update(+req.params.id, req.body)
        if (updatedCustomer === null) return res.status(404).json({ Message: "Customer not found!"})
        res.json(updatedCustomer)
    },

    // DELETE /customers/:id
    delete: async (req, res) => {
        const result = await Customer.delete(+req.params.id)
        res.json(result)
    },
};

module.exports = customersController
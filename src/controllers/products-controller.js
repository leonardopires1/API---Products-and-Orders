const Product = require("../models/Product")

const productsController = {
  // GET /products
  index: async (req, res) => {
    const products = await Product.findAll()
    res.json(products)
  },

  // POST /products
  create: async (req, res) => {
    const newProduct = await Product.create(req.body)
    res.status(201).json(newProduct)
  },

  // GET /products/:id
  show: async (req, res) => {
    const product = await Product.findById(+Preq.params.id)
    if (product === null) return res.status(404).json({ message: "Product not found!" })
    res.json(product)
  },

  // PUT /products/:id
  update: async (req, res) => {
    const updatedProduct = await Product.update(parseInt(+req.params.id), req.body)
    if (updatedProduct === null) return res.status(404).json({ message: "Product not found!" })
    res.json(updatedProduct)
  },

  // DELETE /products/:id
  delete: async (req, res) => {
    const result = await Product.delete(parseInt(+req.params.id))
    res.json(result)
  },
}

module.exports = productsController
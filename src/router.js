const { Router } = require("express");
const productsController = require("./controllers/products-controller");
const customersController = require("./controllers/customers-controller")
const ordersController = require("./controllers/orders-controller")

const router = Router();

// PRODUTOS
router.get("/products", productsController.index);
router.get("/products/:id", productsController.show);
router.post("/products", productsController.create);
router.put("/products/:id", productsController.update);
router.delete("/products/:id", productsController.delete);

// CUSTOMERS
router.get("/customers", customersController.index)
router.get("/customers/:id", customersController.show)
router.post("/customers", customersController.create)
router.put("/customers/:id", customersController.update)
router.delete("/customers/:id", customersController.delete)

// ORDERS
router.get("/orders", ordersController.index)
router.post("/orders", ordersController.create)
router.get("/orders/:id", ordersController.show)
router.delete("/orders/:id", ordersController.delete)

module.exports = router;
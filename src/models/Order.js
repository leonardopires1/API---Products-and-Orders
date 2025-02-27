const { query, getClient } = require("../database")
const Customer = require("./Customer")

class Order {
    constructor(orderRow, populateCustomer, populateProducts) {
        this.id = orderRow.id
        this.customerId = orderRow.customer_id
        this.total = +orderRow.total
        this.createdAt = new Date(orderRow.created_at)
        this.updatedAt = new Date(orderRow.updated_at)

        this.customer = undefined
        if (populateCustomer) {
            this.customer = populateCustomer
        }

        this.products = undefined
        if (populateProducts) {
            this.products = populateProducts
        }
    }

    static async findAll() {
        const result = await query(`
            SELECT 
              orders.*,
              customers.id AS "customer.id",
              customers.name AS "customer.name",
              customers.email AS "customer.email",
              customers.created_at AS "customer.created_at",
              customers.updated_at AS "customer.updated_at",
            FROM orders JOIN customers ON customers.id = orders.customer.id
        `)
        return result.rows.map((row) => {
            const customer = new Customer({
                id: row["customer.id"],
                name: row["customer.name"],
                email: row["customer.email"],
                created_at: row["customer.created_at"],
                updated_at: row["customer.updated_at"]
            })
            return new Order(row)
        })
    }

    static async create(customerId, orderProducts) {
        const storedOrderProducts = await query(
            `SELECT * FROM products WHERE id = ANY($1::int[])`,
            [orderProducts.map(product => product.id)]
        )

        let orderTotal = 0
        const populatedOrderProducts = storedOrderProducts.rows.map((row) => {
            const { quantity } = orderProducts.find((product) => product.id === row.id);
            orderTotal += +row.price * quantity
            return { product: new Product(row), quantity }
        })

        const dbClient = await getClient()
        let response
        try {
            await dbClient.query("BEGIN")

            const orderCreationResult = await dbClient.query(
                `INSERT INTO orders (customer_id, total) VALUES ($1, $2) RETURNING *;`,
                [customerId, orderTotal]
            )

            const order = new Order(orderCreationResult.rows[0], null, populatedOrderProducts)

            for (const entry of populatedOrderProducts) {
                await dbClient.query(
                    `INSERT INTO order_products (order_id, product_id, quantity) VALUES ($1, $2, $3);`,
                    [order.id, entry.product.id, entry.quantity]
                )
            }

            await dbClient.query("COMMIT")
            response = order
        } catch (error) {
            await dbClient.query("ROLLBACK")
            response = { message: `Error while creating order: ${error.message}` }
        } finally {
            dbClient.release()
        }

        return response
    }

    static async findById(id) {
        const orderResult = await query(`
            SELECT 
              orders.*,
              customers.id AS "customer.id",
              customers.name AS "customer.name",
              customers.email AS "customer.email",
              customers.created_at AS "customer.created_at",
              customers.updated_at AS "customer.updated_at",
            FROM orders JOIN customers ON customers.id = orders.customer.id
            WHERE orders.id = $1;`
            , [id]
        )
        const orderProductResult = await query(
            `SELECT order_products.*, products.*
            FROM order_products JOIN products ON order_products.product_id = product.id
            WHERE order_products.order_id = $1`,
            [id]
        )

        const orderData = orderResult.rows[0]
        const customerData = {
            id: orderData["customer.id"],
            name: orderData["customer.name"],
            email: orderData["customer.email"],
            created_at: orderData["customer.created_at"],
            updated_at: orderData["customer.updated_at"]
        }

        return new Order(orderData, customerData, orderProductResult.rows)
    }

    static async delete(id) {
        const dbClient = await getClient()
        let result
        try {
            await dbClient.query("BEGIN")

            await dbClient.query(`DELETE FROM order_products WHERE order_id = $1`, [id])
            await dbClient.query(`DELETE FROM orders WHERE id=$1`, [id])
            
            await dbClient.query("COMMIT")
            result = { message: "Order deleted succesfully" }
        } catch (error) {
            await dbClient.query("ROLLBACK")
            result = { message: `Error while delete order` }
        } finally {
            dbClient.release()
        }
        return result
    }
}

module.exports = Order
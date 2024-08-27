const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { fetchProducts, fetchProductById } = require('./services/productService');

const app = express();
const PORT = 3000;
const TEST_SERVER_URL = 'http://localhost:3001';

async function register() { 
}

register();

app.use(async (req, res, next) => {
    await register();
    next();
});

app.get('/categories/:categoryname/products', async (req, res) => {
    const { categoryname } = req.params;
    const { n = 10, page = 1, sortBy = 'rating', order = 'desc' } = req.query;
    const limit = Math.min(n, 10);
    const offset = (page - 1) * limit;

    try {
        const products = await fetchProducts(categoryname);
        products.sort((a, b) => {
            if (order === 'asc') {
                return a[sortBy] - b[sortBy];
            } else {
                return b[sortBy] - a[sortBy];
            }
        });

        const paginatedProducts = products.slice(offset, offset + limit);
        const result = paginatedProducts.map(product => ({ ...product, id: uuidv4() }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
    }
});

app.get('/categories/:categoryname/products/:productid', async (req, res) => {
    const { categoryname, productid } = req.params;

    try {
        const product = await fetchProductById(categoryname, productid);

        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error fetching product details' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

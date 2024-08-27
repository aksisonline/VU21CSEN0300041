const request = require('supertest');
const express = require('express');
const { fetchProducts, fetchProductById } = require('../productService');

const app = express();
const PORT = 3000;

// Mock the productService functions
jest.mock('../productService');

app.use(express.json());

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

describe('GET /categories/:categoryname/products', () => {
    it('should return a list of products', async () => {
        const mockProducts = [
            { id: '1', name: 'Product1', rating: 5 },
            { id: '2', name: 'Product2', rating: 4 },
        ];

        fetchProducts.mockResolvedValue(mockProducts);

        const response = await request(app).get('/categories/category1/products').query({ n: 2, page: 1, sortBy: 'rating', order: 'desc' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockProducts.map(product => ({ ...product, id: expect.any(String) })));
    });

    it('should handle errors', async () => {
        fetchProducts.mockRejectedValue(new Error('Error fetching products'));

        const response = await request(app).get('/categories/category1/products');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error fetching products' });
    });
});

describe('GET /categories/:categoryname/products/:productid', () => {
    it('should return a single product', async () => {
        const mockProduct = { id: '1', name: 'Product1', rating: 5 };

        fetchProductById.mockResolvedValue(mockProduct);

        const response = await request(app).get('/categories/category1/products/1');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockProduct);
    });

    it('should return 404 if product not found', async () => {
        fetchProductById.mockResolvedValue(null);

        const response = await request(app).get('/categories/category1/products/999');

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Product not found' });
    });

    it('should handle errors', async () => {
        fetchProductById.mockRejectedValue(new Error('Error fetching product details'));

        const response = await request(app).get('/categories/category1/products/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ error: 'Error fetching product details' });
    });
});

const axios = require('axios');
const TEST_SERVER_URL = 'http://localhost:3001/';

async function fetchProducts(categoryname) {
    try {
        const urls = [
            `${TEST_SERVER_URL}/company1/categories/${categoryname}/products`,
            `${TEST_SERVER_URL}/company2/categories/${categoryname}/products`,
            `${TEST_SERVER_URL}/company3/categories/${categoryname}/products`,
            `${TEST_SERVER_URL}/company4/categories/${categoryname}/products`,
            `${TEST_SERVER_URL}/company5/categories/${categoryname}/products`
        ];

        const responses = await Promise.all(urls.map(url => axios.get(url)));
        const data = responses.flatMap(response => response.data);

        return data;
    } catch (error) {
        throw new Error('Error fetching products');
    }
}

async function fetchProductById(categoryname, productid) {
    try {
        const products = await fetchProducts(categoryname);
        return products.find(p => p.id === productid);
    } catch (error) {
        throw new Error('Error fetching product details');
    }
}

module.exports = { fetchProducts, fetchProductById };

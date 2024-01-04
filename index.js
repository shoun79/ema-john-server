const express = require('express');
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


//middleware
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cg7riyw.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri);

async function dbConnect() {
    try {
        await client.connect();
        const productCollection = client.db("emaJohnDB").collection("products");

        app.get('/products', async (req, res) => {
            const page = parseInt(req.query.page) || 0;
            const limit = parseInt(req.query.limit) || 10;
            const startIndex = page * limit;
            const result = await productCollection.find().skip(startIndex).limit(limit).toArray();
            res.send(result);
        })

        app.get('/totalProducts', async (req, res) => {
            const result = await productCollection.estimatedDocumentCount();
            res.send({ totalProducts: result })
        })

        app.post('/productByIds', async (req, res) => {
            const cartProductsIds = req.body;
            if (!cartProductsIds || !Array.isArray(cartProductsIds) || cartProductsIds.length === 0) {
                return res.status(400).json({ error: 'Invalid product IDs provided' });
            }

            const objectIds = cartProductsIds.map(id => new ObjectId(id));
            const query = { _id: { $in: objectIds } };
            const result = await productCollection.find(query).toArray();
            res.send(result)

        })

        console.log("Db connected ....!");
    } catch (error) {
        console.log(error);
    }
};

dbConnect();





app.get('/', (req, res) => {
    res.send('ema john server is running...');
})

app.listen(port, () => {
    console.log(`ema john server is running on ${port}`);
})
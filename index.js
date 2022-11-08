const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uqseuad.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const serviceList = client.db('ourService').collection('services');
        const reviewCollection = client.db('ourService').collection('review');

        app.post('/allServices', async(req, res) =>{
            const query = req.body;
            const result = await serviceList.insertOne(query);
            res.send(result);
        })
        app.get('/services', async(req, res) =>{
            const query = {};
            const cursor = serviceList.find(query);
            const result = await cursor.limit(3).toArray();
            res.send(result);
        });

        app.get('/allServices', async(req, res) =>{
            const query = {};
            const cursor = serviceList.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/allServices/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await serviceList.findOne(query);
            res.send(result);
        });

        app.post('/review', async (req, res) =>{
            const query = req.body;
            const result = await reviewCollection.insertOne(query);
            res.send(result);
        });

        app.get('/review', async(req, res) =>{
            const query = {};
            if(req.query.email){
                query ={
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

    }
    finally{

    }
}
run().catch(error => console.error(error))



app.get('/', (req, res) =>{
    res.send('wifi service is running')
});

app.listen(port, () =>{
    console.log(`port is running on ${port}`)
});
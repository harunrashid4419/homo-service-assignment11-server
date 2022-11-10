const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uqseuad.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        res.status(401).send({message: 'unauthorized access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.SECRET_TOKEN, function(error, decoded) {
        if(error){
            res.status(403).send({message: 'unauthorized access'})
        }
        req.decoded = decoded;
        next();
    })
    
}

async function run(){
    try{
        const serviceList = client.db('ourService').collection('services');
        const reviewCollection = client.db('ourService').collection('review');

        // user add service
        app.post('/allServices', async(req, res) =>{
            const query = req.body;
            const result = await serviceList.insertOne(query);
            res.send(result);
        });

        // get 3 service
        app.get('/services', async(req, res) =>{
            const query = {};
            const cursor = serviceList.find(query);
            const result = await cursor.limit(3).toArray();
            res.send(result);
        });

        // get all service
        app.get('/allServices', async(req, res) =>{
            const query = {};
            const cursor = serviceList.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // get specific service
        app.get('/allServices/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await serviceList.findOne(query);
            res.send(result);
        });

        // user review get
        app.post('/review', async (req, res) =>{
            const query = req.body;
            const result = await reviewCollection.insertOne(query);
            res.send(result);
        });

        // email query and show review
        app.get('/review', verifyJWT, async(req, res) =>{
            const decoded = req.decoded;
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'});
            }

            let query = {};
            if(req.query.email){
                query ={
                    email: req.query.email
                }
            }
            const cursor = reviewCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });        

        // review delete
        app.delete('/review/:id', async (req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });

        // get specific review
        app.get('/review/:id', async (req, res) =>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const result = await reviewCollection.findOne(filter);
            res.send(result);
        });

        // update review
        app.put('/review/:id', async (req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const userReview = req.body;
            const option = {upsert: true};
            const updateUser = {
                $set: {
                    review: userReview.review,
                }
            }
            const result = await reviewCollection.updateOne(query, updateUser, option);
            res.send(result);
        });

        // jwt token
        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.SECRET_TOKEN, {expiresIn: '1h'});
            res.send({token});
        });

    }
    finally{

    }
}
run().catch(error => console.error(error))



app.get('/', (req, res) =>{
    res.send('freeze service is running')
});

app.listen(port, () =>{
    console.log(`port is running on ${port}`)
});
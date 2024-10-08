const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// middleware

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Add localhost to the allowed origins
      "https://react-tourism-management-auth.web.app",
      "https://tourism-management-server-sandy.vercel.app"
    ],
  })
);
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.svv3meu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const touristsSpotCollection = client.db('touristSpotDB').collection('touristSpot');
    const userCollection = client.db('touristSpotDB').collection('user');
    const countryCollection = client.db('touristSpotDB').collection('country');

    app.get('/spots', async(req, res)=>{
        const { search = "" } = req.query;

          const query = {
        $or: [
          { tourists_spot_name: { $regex: search, $options: "i" } },
          { country_Name: { $regex: search, $options: "i" } },
          { seasonality: { $regex: search, $options: "i" } },
        ],
      };

        const cursor = touristsSpotCollection.find(query);
        
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/spots/:id', async(req, res) =>{
        const id = req.params.id;
        const query= {_id: new ObjectId(id)}
        const result = await touristsSpotCollection.findOne(query);
        res.send(result);
    })

app.post('/spots', async(req, res)=>{
    const newSpot = req.body;
    console.log(newSpot);
    const result = await touristsSpotCollection.insertOne(newSpot);
    res.send(result);
})

app.get("/myLists/:email", async(req, res)=>{
    console.log(req.params.email);
    const result = await touristsSpotCollection.find({email: req.params.email}).toArray();
    res.send(result);
})

app.put('/spots/:id', async(req, res) =>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = {upsert: true};
    const updatedSpots = req.body;
    const spots ={
        $set: {
            tourists_spot_name :updatedSpots.tourists_spot_name,
            country_Name: updatedSpots.country_Name,
             location: updatedSpots.location,
              description:updatedSpots.description,
               average_cost:updatedSpots.average_cost,
               seasonality:updatedSpots.seasonality,
                travel_time:updatedSpots.travel_time,
                 totalVisitorsPerYear:updatedSpots.totalVisitorsPerYear
        }
    }
    const result = await touristsSpotCollection.updateOne(filter, spots, options);
    res.send(result);
})

app.delete('/spots/:id', async(req, res) =>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await touristsSpotCollection.deleteOne(query);
    res.send(result);
})

app.post('/user', async(req, res) =>{
    const user = req.body;
    console.log(user);
    const result = await userCollection.insertOne(user);
    res.send(result);
})
 
app.post('/country', async(req, res) =>{
    const country = req.body;
    const result = await countryCollection.insertOne(country);
    res.send(result);
})

app.get('/country', async(req, res) =>{
    const cursor = countryCollection.find()
    const result = await cursor.toArray();
    res.send(result);
})

app.get()

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) =>{
    res.send('tourism management server is running')
})

app.listen(port, () =>{
    console.log(`Tourism management server is running on port: ${port}`)
})
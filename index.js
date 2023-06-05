const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.pr3rbd0.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const taskCollection = client.db("taskDB").collection("tasks");


    //task get
    app.get("/tasks",async (req,res) => {
      const result = await taskCollection.find({}).toArray();
      res.send(result)
    })
    // task post 
    app.post('/tasks', async (req,res)=> {
      const newTask = req.body;
      const result = await taskCollection.insertOne(newTask);
      res.send(result)
    })

    // get single task
    app.get("/tasks/:id", async (req,res) => {
      const id = req.params.id;
      const query  = {_id: new ObjectId(id)}
      const result = await taskCollection.findOne(query);
      res.send(result)
    })


    //update task with put method
    app.put("/tasks/:id", async (req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const taskItem = req.body;
      const options = { upsert: true };
      const taskUpdate = {
        $set: {
          title: taskItem.title,
          date: taskItem.date,
          details:taskItem.details,
          status: taskItem.status,
        },
      };

      const result = await taskCollection.updateOne(filter, taskUpdate, options);
      res.send(result)
    })


    //task delete
    app.delete("/tasks/:id", async (req,res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await taskCollection.deleteOne(query);
      res.send(result)
    })


    //update status with patch method
    app.patch("/tasks/:id", async(req,res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const {status} = req.body;

      const taskStatus = status === "completed" ? "uncompleted" : "completed";
      const replaceStatus = {
      $set: {
        status: taskStatus
      },
    };

      const result = await taskCollection.updateOne(filter, replaceStatus);
      res.send(result)
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/",(req,res) => {
    res.send('welcome task manager app server')
})

app.listen(port,(req,res) => {
    console.log(`task manager app running`);
})
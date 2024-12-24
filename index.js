require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri =`mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.epzmh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection



    // create db collection 
    const tutorialsCollections = client.db("FluentZen_admin").collection("FluentZen_Tutorials");
    const bookedTutorCollections = client.db("FluentZen_admin").collection("my_booked_tutor");


    
    // post tutorials data on db 
    app.post('/add-tutorials', async(req, res)=>{
        const tutorial = req.body;
        const result = await tutorialsCollections.insertOne(tutorial);
        res.send(result);
    })

    // get all tutors 
    app.get('/find-tutors', async(req, res)=>{
      const tutors = tutorialsCollections.find()
      const result = await tutors.toArray()
      res.send(result)
    })

    // find tutorial by id
    app.get("/tutor/details/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await tutorialsCollections.findOne(query);
      res.send(result);
    })


    // add booked tutor in a new collection
    app.post("/booked-tutor", async(req, res)=>{
      const tutors = req.body;
      const result = await bookedTutorCollections.insertOne(tutors);
      res.send(result);
    })

    app.get('/my-booked-tutor', async(req, res)=>{
      const tutors = bookedTutorCollections.find()
      const result = await tutors.toArray()
      res.send(result)
    })

    // find my add tutorials by using email
    app.get("/my-tutorials", async(req, res)=>{
      const user = req.query.email;
      const query = {email: user}
      const result = await tutorialsCollections.find(query).toArray()
      res.send(result)
    })


    // delete tutorials from collection by searching id
    app.delete("/delete-tutorial/:id", async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await tutorialsCollections.deleteOne(query)
      res.send(result)
    })

    // update a tutorial user added from the add tutorial page 
    app.patch('/update-tutorial/:id', async(req, res)=>{
      const id = req.params.id;
      const tutorial = req.body;
      const filter = {_id : new ObjectId(id)}
      const options = {upsert: false}
      const updatedTutorial = {
        $set:{
          name: tutorial.name,
          email: tutorial.email,
          image: tutorial.image,
          language: tutorial.language,
          price: tutorial.price,
          description: tutorial.description,
          review: tutorial.review,
        }
      }
      const result = await tutorialsCollections.updateOne(filter, updatedTutorial, options);
      res.send(result)
    });

    // update the review bassed on user Given Rivew
    app.patch("/tutor-review/:id", async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const tutorial = await tutorialsCollections.findOne(filter)
      const reviewValue = tutorial.review+1
      const options = {upsert: false}
      const updatedReview = {
        $set:{
          review: reviewValue,
        }
      }
      const result = await tutorialsCollections.updateOne(filter, updatedReview, options);
      res.send(result)
    })



    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("FluentZen server is running");
});

app.listen(port, () => {
  console.log(`server is running on port:${port}`);
});
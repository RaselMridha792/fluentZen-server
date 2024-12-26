require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://assignment-11-2478a.web.app",
      "https://assignment-11-2478a.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.epzmh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();
    // Send a ping to confirm a successful connection

    // create db collection
    const tutorialsCollections = client
      .db("FluentZen_admin")
      .collection("FluentZen_Tutorials");
    const bookedTutorCollections = client
      .db("FluentZen_admin")
      .collection("my_booked_tutor");

    // jwt related api
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV=== 'production',
          sameSite: process.env.NODE_ENV=== 'production' ? 'none' : 'strict',
        })
        .send({ success: true });
    });

    app.post("/logout", (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure:  process.env.NODE_ENV=== 'production',
          sameSite: process.env.NODE_ENV=== 'production' ? 'none' : 'strict',
        })
        .send({ success: true });
    });

    // verify token middleware function
    const verifyToken = (req, res, next) => {
      const token = req.cookies.token;

      if (!token) {
        return res.status(401).send({ message: "unauthorized access" });
      }

      // verify token
      if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).send({ message: "unauthorized token" });
          }
          req.user = decoded;
          next();
        });
      }
    };

    // post tutorials data on db
    app.post("/add-tutorials", verifyToken, async (req, res) => {
      const tutorial = req.body;
      const result = await tutorialsCollections.insertOne(tutorial);
      res.send(result);
    });

    // get all tutors
    app.get("/find-tutors", async (req, res) => {
      const tutors = tutorialsCollections.find();
      const result = await tutors.toArray();
      res.send(result);
    });

    // find tutorial by id
    app.get("/tutor/details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tutorialsCollections.findOne(query);
      res.send(result);
    });

    // add booked tutor in a new collection
    app.post("/booked-tutor", verifyToken, async (req, res) => {
      const tutors = req.body;
      const result = await bookedTutorCollections.insertOne(tutors);
      res.send(result);
    });

    app.get("/my-booked-tutor", verifyToken, async (req, res) => {
      const user = req.query.email;
      const query = { email: user };

      if (req.user.email !== user) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const tutors = bookedTutorCollections.find(query);
      const result = await tutors.toArray();
      res.send(result);
    });

    // find my add tutorials by using email
    app.get("/my-tutorials", verifyToken, async (req, res) => {
      const user = req.query.email;
      const query = { email: user };

      if (req.user.email !== user) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const result = await tutorialsCollections.find(query).toArray();
      res.send(result);
    });

    // delete tutorials from collection by searching id
    app.delete("/delete-tutorial/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tutorialsCollections.deleteOne(query);
      res.send(result);
    });

    // update a tutorial user added from the add tutorial page
    app.patch("/update-tutorial/:id", verifyToken, async (req, res) => {
      const id = req.params.id;
      const tutorial = req.body;
      const filter = { _id: new ObjectId(id) };

      if (req.user.email !== tutorial.email) {
        return res.status(403).send({ message: "forbidden access" });
      }
      const options = { upsert: false };
      const updatedTutorial = {
        $set: {
          name: tutorial.name,
          email: tutorial.email,
          image: tutorial.image,
          language: tutorial.language,
          price: tutorial.price,
          description: tutorial.description,
          review: tutorial.review,
        },
      };
      const result = await tutorialsCollections.updateOne(
        filter,
        updatedTutorial,
        options
      );
      res.send(result);
    });

    // update the review bassed on user Given Rivew
    app.patch("/tutor-review/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const tutorial = await tutorialsCollections.findOne(filter);
      const reviewValue = tutorial.review + 1;
      const options = { upsert: false };
      const updatedReview = {
        $set: {
          review: reviewValue,
        },
      };
      const result = await tutorialsCollections.updateOne(
        filter,
        updatedReview,
        options
      );
      res.send(result);
    });

    // for booked database update
    app.patch("/booked-tutor-review/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { tutor_id: id };
      const tutorial = await bookedTutorCollections.findOne(filter);
      const reviewValue = tutorial.review + 1;
      const options = { upsert: false };
      const updatedReview = {
        $set: {
          review: reviewValue,
        },
      };
      const result = await bookedTutorCollections.updateOne(
        filter,
        updatedReview,
        options
      );
      res.send(result);
    });

    // get data using categories
    app.get("/find-tutors/:category", async (req, res) => {
      const category = req.params.category;
      const query = { language: category };
      const result = await tutorialsCollections.find(query).toArray();
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
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

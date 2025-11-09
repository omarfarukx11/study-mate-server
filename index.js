const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000;

const uri = "mongodb+srv://study_partner:tWOPAy4Haw63qMCn@cluster0.oyyjehq.mongodb.net/?appName=Cluster0";

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("smart server is running");
});


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    await client.connect();

    
    const db = client.db("studyPartner_db")
    const partnersCollection = db.collection("studyPartner")

     app.get('/studyPartner', async (req, res) => {
        const ProjectField = {
            name : 1,
            profileImage : 1,
            skill : 1,
            subject : 1,
            rating : 1,

        }
      const cursor = partnersCollection.find().sort({rating : 1}).limit(3).project(ProjectField)
      const result = await cursor.toArray()
      res.send(result)
      
    }
    )

    app.post("/studyPartner", async(req , res) => {
        const newPartner = req.body;
        const result = await partnersCollection.insertOne(newPartner);
        res.send(result)
    })







    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);






app.listen(port, () => {
  console.log(`server is running on ${port}`);
});

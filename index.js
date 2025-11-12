const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

const uri =
  "mongodb+srv://study_partner:tWOPAy4Haw63qMCn@cluster0.oyyjehq.mongodb.net/?appName=Cluster0";

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
  },
});
async function run() {
  try {
    await client.connect();
    const db = client.db("studyPartner_db");
    const partnersCollection = db.collection("studyPartner");
    const reviewCollection = db.collection("review");
    const requestCollection = db.collection("request");

    //Partners APIs
    app.get("/findPartner", async (req, res) => {
      const cursor = partnersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/findPartner/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await partnersCollection.findOne(query);
      res.send(result);
    });


// update APIS 
    app.patch("/updatePartner/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const filter = { _id: new ObjectId(id) };
    const updatePartner = {
      $set: {
        name: updatedData.name,
        profileImage: updatedData.profileImage,
        subject: updatedData.subject,
        skill: updatedData.skill,
        studyMode: updatedData.studyMode,
        availabilityTime: updatedData.availabilityTime,
        location: updatedData.location,
        experienceLevel: updatedData.experienceLevel,
        rating: updatedData.rating,
        email: updatedData.email,
      },
    };

    const result = await partnersCollection.updateOne(filter, updatePartner);

    if (result.modifiedCount > 0) {
      res.send({ success: true, message: "Partner updated successfully!" });
    } else {
      res.send({ success: false, message: "No changes were made." });
    }
  } catch (error) {
    console.error("Error updating partner:", error);
    res.status(500).send({ success: false, message: "Failed to update partner." });
  }
});

    // studyPartners APIs
    app.get("/studyPartner", async (req, res) => {
      const ProjectField = {
        name: 1,
        profileImage: 1,
        skill: 1,
        subject: 1,
        rating: 1,
      };
      const cursor = partnersCollection
        .find()
        .sort({ rating: -1 })
        .limit(3)
        .project(ProjectField);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/studyPartner/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await partnersCollection.findOne(query);
      res.send(result);
    });
    app.post("/studyPartner", async (req, res) => {
      const newPartner = req.body;
      const result = await partnersCollection.insertOne(newPartner);
      res.send(result);
    });

    // reviews api
    app.get("/review", async (req, res) => {
      const cursor = reviewCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Send Partner Request API
    app.get("/request", async (req, res) => {
      const cursor = requestCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/request/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/request/:id", async (req, res) => {
      const partnerId = req.params.id;
      const email = req.body.email;

      const partner = await partnersCollection.findOne({
        _id: new ObjectId(partnerId),
      });

      if (!partner) {
        return res.status(404).send({ error: "Partner not found" });
      }

      const existingRequest = await requestCollection.findOne({
        partnerId: partner._id,
        userEmail: email,
      });

      if (existingRequest) {
        return res
          .status(400)
          .send({ error: "You already sent request to this partner" });
      }

      await partnersCollection.updateOne(
        { _id: new ObjectId(partnerId) },
        { $inc: { partnerCount: 1 } }
      );

      const requestData = {
        partnerId: partner._id,
        partnerName: partner.name,
        partnerEmail: partner.email,
        userEmail: email,
        createdAt: new Date(),
      };

      const result = await requestCollection.insertOne(requestData);

      res.send({
        success: true,
        message: "Partner request sent successfully",
        insertedId: result.insertedId,
      });
    });


    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );


  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});

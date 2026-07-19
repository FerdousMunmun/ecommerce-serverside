const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


// start point
const express = require("express");
const dontenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");
import type {
  Request,
  Response,
  NextFunction,
} from "express";



interface AuthRequest extends Request {
  user?: any;
}

dontenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());

app.use(cors())





app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})
app.get("/", (req: Request, res: Response)=> {
  res.send("Server is running fine!");
});

// mongodb start
const uri = process.env.MONGO_DB_URI!;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// jwt create

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);


const verifyToken = async ( req: AuthRequest,
  res: Response,
  next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {

    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;

    next();
  } catch (error: any) {
        console.error(error);

    return res.status(403).json({
      msg: "Unauthorized"
    });
  }
};


async function run() {
  try {

    // await client.connect();

    // mongodbcollection
    console.log("MongoDB Connected");
    const db = client.db("ecommerce_db");



    const productsCollection = db.collection("products");
const bookingsCollection = db.collection("bookings");


type Request = import("express").Request;
type Response = import("express").Response;

app.get("/products", async (req: Request, res: Response) => {
  try {
    const products = await productsCollection.find().toArray();

    res.send(products);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch products",
    });
  }
});


app.get("/products/new-arrivals", async (req: Request, res: Response) => {
  try {
    const products = await productsCollection
      .find({ isNew: true })
      .limit(8)
      .toArray();

    res.send(products);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch new arrivals",
    });
  }
});
 





    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.error);
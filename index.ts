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

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
console.log("Gemini Key:", process.env.GEMINI_API_KEY);
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
const cartCollection = db.collection("cart");
const ordersCollection = db.collection("orders");


type Request = import("express").Request;
type Response = import("express").Response;

app.get("/products", async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 6;
    const search = (req.query.search as string) || "";
    const sort = (req.query.sort as string) || "newest";
    const category = (req.query.category as string) || "";

    const skip = (page - 1) * limit;

    const query: any = {};

if (search) {
  query.name = {
    $regex: search,
    $options: "i",
  };
}

if (category) {
  query.category = category;
}
      

      let sortOption = {};

switch (sort) {
  case "price-asc":
    sortOption = { price: 1 };
    break;

  case "price-desc":
    sortOption = { price: -1 };
    break;

  case "name-asc":
    sortOption = { name: 1 };
    break;

  default:
    sortOption = { _id: -1 };
}

    const products = await productsCollection
  .find(query)
  .sort(sortOption)
  .skip(skip)
  .limit(limit)
  .toArray();
    const total = await productsCollection.countDocuments(query);

    res.send({
      products,
      total,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch products",
    });
  }
});



app.get("/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await productsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return res.status(404).send({
        success: false,
        message: "Product not found",
      });
    }

    res.send(product);
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to fetch product",
    });
  }
});
app.post("/cart", async (req: Request, res: Response) => {
  try {
    const cartItem = req.body;

    const existing = await cartCollection.findOne({
      _id: cartItem._id,
    });

    if (existing) {
      return res.status(400).send({
        success: false,
        message: "Product already exists in cart",
      });
    }

    const result = await cartCollection.insertOne(cartItem);

    res.send({
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Failed to add product",
    });
  }
});


app.get("/cart", async(req: Request, res: Response) => {
  try {
    const result = await cartCollection.find().toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch cart items",
    });
  }
});

app.get("/cart", async (req: Request, res: Response) => {
  try {
    const result = await cartCollection.find().toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to fetch cart items",
    });
  }
});

app.delete("/cart/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const result = await cartCollection.deleteOne({
      _id: id,
    });

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to delete product",
    });
  }
});


app.patch("/cart/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { quantity } = req.body;

    const result = await cartCollection.updateOne(
      { _id: id },
      {
        $set: {
          quantity,
        },
      }
    );

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to update quantity",
    });
  }
});

app.post("/orders", async (req: Request, res: Response) => {
  try {
    const order = req.body;

    order.createdAt = new Date();

    const result = await ordersCollection.insertOne(order);

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to place order" });
  }
});
app.post("/orders", async(req: Request, res: Response)  => {
  try {
    const order = req.body;

    order.createdAt = new Date();

    const result = await ordersCollection.insertOne(order);

    await cartCollection.deleteMany({});

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Failed to place order" });
  }
});
app.post("/ai/generate-content", async (req: Request, res: Response) => {
  try {
    const { productName, category, keywords, tone, length } = req.body;

    const prompt = `
Write a ${length} ${tone} product description.

Product Name: ${productName}
Category: ${category}
Keywords: ${keywords}

Return only the product description.
`;

    const result = await ai.models.generateContent({
  model: "gemini-2.0-flash",
   contents: prompt,
    });

    res.send({
      success: true,
      content: result.text,
    });

  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Failed to generate content",
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
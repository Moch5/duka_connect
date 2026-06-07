// IMPORTS & APP SETUP-----------------------------
// import "dotenv/config";


import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });


import express from "express";
import { getAccessToken } from "./auth.js";
import stkroute from "./mpesa.js";

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;



// PRODUCT DATA------------------------------------

const products = [
  { id: 1, name: "Sugar", price: 180, description: "1kg sugar" },
  { id: 2, name: "Milk", price: 60, description: "Fresh milk" },
  { id: 3, name: "Bread", price: 70, description: "Brown bread" },
  { id: 4, name: "Ugali Flour", price: 120, description: "2kg jogoo flour" },
  { id: 5, name: "Sukuma Wiki", price: 30, description: "Fresh sukuma bunch" },
  { id: 6, name: "Kericho Gold", price: 200, description: "Kenyan strong tea leaves" }
];

const orders = [];


// GENERAL ROUTES-----------------------------------


// Root endpoint
app.get("/", (_req, res) => {
  res.json({ message: "Duka Connect API" });
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

//MPESA AUTH TOKEN
app.get("/token", async (req, res) => {
  try {
    const token = await getAccessToken();

    if (!token) {
      console.log("Token generation failed"); // for backend
      return res.status(500).json({           //for frontend
        error: "Failed to generate access token"
      });
    }

    res.json({ access_token: token });

  } catch (error) {
    console.log("Token error:", error); 

    res.status(500).json({
      error: "Server error while generating token"
    });
  }
});


// STK PUSH ROUTE
app.use("/", stkroute);

// PRODUCT ROUTES--------------------------------------


// Get all products
app.get("/products", (_req, res) => {
  res.status(200).json(products);
});

// Get one product by ID
app.get("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);

  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({
      error: "Product not found"
    });
  }

  res.status(200).json(product);
});

// Create a product
app.post("/products", (req, res) => {
  const { name, price, description } = req.body;

  // Validation
  if (
    !name ||!description || typeof price !== "number" || price <= 0 ) {
    return res.status(400).json({
      error: "Invalid or missing required fields"
    });
  }

  const newProduct = {
    id: products.length + 1,
    name,
    price,
    description
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
});


// ORDER ROUTES---------------------------------------------


// Get all orders
app.get("/orders", (_req, res) => {
  res.status(200).json(orders);
});

// Create an order
app.post("/orders", (req, res) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds)) {
    return res.status(400).json({
      error: "productIds must be an array"
    });
  }

  let total = 0;
  const productNames = [];

  for (const id of productIds) {
    const product = products.find(p => p.id === id);

    if (!product) {
      return res.status(404).json({
        error: `Product ${id} not found`
      });
    }

    total += product.price;
    productNames.push(product.name);
  }

  const newOrder = {
    id: orders.length + 1,
    productIds,
    products: productNames,
    total
  };

  orders.push(newOrder);

  res.status(201).json(newOrder);
});


// GET A SINGLE ORDER---------------


app.get("/orders/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const order = orders.find(o => o.id === id); //search for the order with the given id

    if (!order) {
        return res.status(404).json({
            error: "Order not found" //return 404 if order not found
        });
    }

    res.status(200).json(order); //return the order if found
});



// START SERVER ------------------------

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
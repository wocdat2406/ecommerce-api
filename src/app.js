const express = require("express");
require("dotenv").config();

const prisma = require("./config/prisma");
const productRoutes = require("./routes/product.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();

app.use(express.json());

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API is running"
  });
});

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "OK",
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "disconnected"
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
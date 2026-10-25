const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/product.controller");

const verifyToken = require("../middleware/auth.middleware");

router.get("/", getAllProducts);
router.get("/:id", getProductById);

router.post("/", verifyToken, createProduct);
router.put("/:id", verifyToken, updateProduct);
router.delete("/:id", verifyToken, deleteProduct);

module.exports = router;
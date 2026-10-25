const express = require("express");
const router = express.Router();

const {
  createOrder
} = require("../controllers/order.controller");

const verifyToken = require("../middleware/auth.middleware");

router.post("/", verifyToken, createOrder);

module.exports = router;
const prisma = require("../config/prisma");

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Cannot get products"
    });
  }
};

const getProductById = async (req, res) => {
  try {
    const pid = parseInt(req.params.id);

    const product = await prisma.product.findUnique({
      where: {
        pid: pid
      }
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Cannot get product"
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { pname, price, quantity } = req.body;

    const product = await prisma.product.create({
      data: {
        pname,
        price,
        quantity
      }
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Cannot create product"
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const pid = parseInt(req.params.id);
    const { pname, price, quantity } = req.body;

    const product = await prisma.product.update({
      where: {
        pid: pid
      },
      data: {
        pname,
        price,
        quantity
      }
    });

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Cannot update product"
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const pid = parseInt(req.params.id);

    await prisma.product.delete({
      where: {
        pid: pid
      }
    });

    res.status(200).json({
      message: "Product deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: "Cannot delete product"
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
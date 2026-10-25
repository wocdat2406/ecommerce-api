const prisma = require("../config/prisma");

const createOrder = async (req, res) => {
  try {
    // Lấy uid của người dùng từ JWT
    const uid = req.user.uid;

    // Lấy danh sách sản phẩm khách hàng muốn đặt
    const { items } = req.body;

    // 1. Kiểm tra items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order must contain at least one product"
      });
    }

    // 2. Kiểm tra pid và quantity
    for (const item of items) {
      if (
        !Number.isInteger(item.pid) ||
        !Number.isInteger(item.quantity) ||
        item.quantity <= 0
      ) {
        return res.status(400).json({
          message: "Invalid product id or quantity"
        });
      }
    }

    // 3. Lấy danh sách pid
    const productIds = items.map((item) => item.pid);

    // 4. Không cho Product bị trùng trong cùng Order
    const uniqueProductIds = [...new Set(productIds)];

    if (uniqueProductIds.length !== productIds.length) {
      return res.status(400).json({
        message: "Duplicate products are not allowed"
      });
    }

    // 5. Tìm Product trong database
    const products = await prisma.product.findMany({
      where: {
        pid: {
          in: productIds
        }
      }
    });

    // 6. Kiểm tra Product có tồn tại
    if (products.length !== productIds.length) {
      return res.status(404).json({
        message: "One or more products not found"
      });
    }

    // 7. Kiểm tra tồn kho
    for (const item of items) {
      const product = products.find(
        (p) => p.pid === item.pid
      );

      if (item.quantity > product.quantity) {
        return res.status(400).json({
          message: `Not enough stock for product: ${product.pname}`
        });
      }
    }

    // 8. Transaction
    // Tạo Order + OrderDetail + trừ tồn kho + tạo Shipment
    const result = await prisma.$transaction(async (tx) => {

      // 8.1. Tạo Order và OrderDetail
      const newOrder = await tx.order.create({
        data: {
          uid: uid,

          // Thời gian đặt hàng hiện tại
          createat: new Date(),

          orderDetails: {
            create: items.map((item) => {
              const product = products.find(
                (p) => p.pid === item.pid
              );

              return {
                pid: item.pid,
                quantity: item.quantity,

                // Giá lấy trực tiếp từ database
                price: product.price
              };
            })
          }
        },

        include: {
          orderDetails: true
        }
      });

      // 8.2. Trừ tồn kho
      for (const item of items) {
        await tx.product.update({
          where: {
            pid: item.pid
          },

          data: {
            quantity: {
              decrement: item.quantity
            }
          }
        });
      }

      // 8.3. Tạo Shipment cho Order vừa tạo
      const shipment = await tx.shipment.create({
        data: {
          oid: newOrder.oid,
          status: "PENDING"
        }
      });

      // Trả cả Order và Shipment ra khỏi transaction
      return {
        order: newOrder,
        shipment: shipment
      };
    });

    // 9. Trả kết quả
    res.status(201).json({
      message: "Order created successfully",
      order: result.order,
      shipment: result.shipment
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Cannot create order"
    });
  }
};

module.exports = {
  createOrder
};
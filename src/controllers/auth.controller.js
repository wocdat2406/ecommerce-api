const prisma = require("../config/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ==========================
// REGISTER
// ==========================
const register = async (req, res) => {
  try {
    const {
      username,
      fullname,
      password
    } = req.body;

    // 1. Kiểm tra dữ liệu bắt buộc
    if (!username || !fullname || !password) {
      return res.status(400).json({
        message: "Username, fullname and password are required"
      });
    }

    // 2. Kiểm tra username đã tồn tại chưa
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists"
      });
    }

    // 3. Tìm Role có tên normal
    const normalRole = await prisma.role.findFirst({
      where: {
        rolename: "normal"
      }
    });

    if (!normalRole) {
      return res.status(500).json({
        message: "Normal role not found"
      });
    }

    // 4. Tìm Membership có score = 10
    const defaultMembership = await prisma.memberShip.findFirst({
      where: {
        score: 10
      }
    });

    if (!defaultMembership) {
      return res.status(500).json({
        message: "Default membership with score 10 not found"
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // 6. Tạo User
    // roleid và mid được backend tự động gán
    const user = await prisma.user.create({
      data: {
        username: username,
        fullname: fullname,
        password: hashedPassword,

        roleid: normalRole.roleid,
        mid: defaultMembership.mid
      }
    });

    // 7. Trả kết quả
    res.status(201).json({
      message: "Register successfully",

      user: {
        uid: user.uid,
        username: user.username,
        fullname: user.fullname,

        role: normalRole.rolename,
        score: defaultMembership.score
      }
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Cannot register user"
    });
  }
};


// ==========================
// LOGIN
// ==========================
const login = async (req, res) => {
  try {
    const {
      username,
      password
    } = req.body;

    // 1. Kiểm tra dữ liệu
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    // 2. Tìm User
    const user = await prisma.user.findFirst({
      where: {
        username: username
      }
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // 3. Kiểm tra password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid username or password"
      });
    }

    // 4. Tạo JWT
    const token = jwt.sign(
      {
        uid: user.uid,
        username: user.username,
        roleid: user.roleid
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1h"
      }
    );

    // 5. Trả token
    res.status(200).json({
      message: "Login successfully",
      token: token
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Cannot login"
    });
  }
};


module.exports = {
  register,
  login
};
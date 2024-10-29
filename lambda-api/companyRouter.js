require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise"); // mysql2 패키지 불러오기
const bcrypt = require("bcrypt"); // 비밀번호 해싱을 위한 패키지 불러오기
const bodyParser = require("body-parser"); // json 파싱

const router = express.Router();
const cors = require("cors"); // cors 패키지 불러오기
const { message } = require("antd");
router.use(cors());
router.use(bodyParser.json());

// MySQL 연결 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// 로그인 처리 함수
router.post("/login", async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ error: "user_id and password are required" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // user_id로 사용자 검색
    const query = "SELECT * FROM company WHERE user_id = ?";
    const [rows] = await connection.execute(query, [user_id]);

    // 사용자가 없는 경우
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid user_id or password" });
    }

    const user = rows[0];

    // 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid user_id or password" });
    }

    // 로그인 성공
    res.json({
      status: "success",
      message: "Login successful",
      userId: user.id,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ status: "error", error: "Database error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

// company table list를 불러오는 함수
router.get("/list", async (req, res) => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query("SELECT * FROM company"); // 'your_table_name'을 실제 테이블 이름으로 변경
    res.json(rows);
  } catch (error) {
    console.error("MySQL query error: ", error);
    res.status(500).json({ error: "Database query error" });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

// POST 요청을 받아 데이터를 삽입하는 엔드포인트 생성
router.post("/add", async (req, res) => {
  const { user_id, password, email, company_name, user_name, address, phone } =
    req.body;

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash(password, 10);

  // 필수 필드가 누락된 경우 에러 응답
  if (!user_id || !password || !email || !company_name || !user_name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await mysql.createConnection(dbConfig);

    // 데이터 삽입 쿼리 실행
    const query = `
        INSERT INTO company (user_id, password, email, company_name, user_name, address, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
    const [result] = await connection.execute(query, [
      user_id,
      hashedPassword,
      email,
      company_name,
      user_name,
      address,
      phone,
    ]);

    // 성공 응답
    res.status(201).json({
      status: "success",
      message: "User added successfully",
      user_id: result.insertId,
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({
      status: "error",
      error: "Database error",
      message: error.sqlMessage,
    });
  } finally {
    if (connection) await connection.end(); // 연결 종료
  }
});

module.exports = router;

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser"); // json 파싱
const cors = require("cors");
const { pool, getConnection } = require("../controller/mysql");
const {
  formatDateToYYYYMMDD,
  formatDateTime,
} = require("../controller/common");
const { verifyToken } = require("../controller/auth");

const router = express.Router();
router.use(cors());
router.use(bodyParser.json());

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product(AI Type) 정보 관련 API
 */

/**
 * @swagger
 * /product/list:
 *   get:
 *     tags: [Product]
 *     summary: Product(AI Type) 리스트
 *     description: Product(AI Type) 리스트
 *     responses:
 *       200:
 *         description: Product(AI Type) 리스트 성공
 *       500:
 *         description: Product(AI Type) 리스트
 * */
router.get("/list", verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.query("SELECT * FROM product"); // 'your_table_name'을 실제 테이블 이름으로 변경
    res.status(200).json(rows);
  } catch (error) {
    console.error("MySQL query error: ", error);
    res.status(500).json({ error: "Database query error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
  }
});

/**
 * @swagger
 * /product/add:
 *   post:
 *     tags: [Product]
 *     summary: Product(AI Type) 등록
 *     description: Product(AI Type) 등록
 *     parameters:
 *       - in: body
 *         name: body
 *         description: Product(AI Type) 등록
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *     responses:
 *       200:
 *         description: Product(AI Type) 등록 성공
 *       500:
 *         description: Product(AI Type) 등록
 * */
router.post("/add", verifyToken, async (req, res) => {
  let connection;
  try {
    const { name, description = "", limit_month = 0 } = req.body;

    // 데이터베이스 연결
    connection = await getConnection();

    // product 등록 쿼리
    const insertQuery = `
      INSERT INTO product (name, description, created_at, limit_month)
      VALUES (?, ?, ?, ?)
    `;

    const nowDate = formatDateTime(new Date());

    console.log(nowDate);

    const [result] = await connection.execute(insertQuery, [
      name,
      description,
      nowDate,
      limit_month,
    ]);

    if (result.affectedRows === 0) {
      throw new Error("Failed to register product");
    }

    // 성공 응답
    res.status(200).json({ message: "Product registered successfully" });
  } catch (error) {
    console.error("Error registering product:", error);
    res.status(500).json({ error: "Error registering product" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
  }
});

/**
 * @swagger
 * /product/update/{id}:
 *   put:
 *     tags: [Product]
 *     summary: Product(AI Type) 정보 변경
 *     description: Product(AI Type) 정보 변경
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Product(AI Type) ID
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: body
 *         name: body
 *         description: Product(AI Type) 정보 변경
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *     responses:
 *       200:
 *         description: Product(AI Type) 정보 변경 성공
 *       500:
 *         description: Product(AI Type) 정보 변경
 * */
router.put("/update/:id", verifyToken, async (req, res) => {
  const id = req.params.id; // URL에서 row id를 가져옵니다.
  const { name, description = "", limit_month = 0 } = req.body;

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // 이력 변경 쿼리
    const updateQuery = `
      UPDATE product
      SET name = ?, description = ?, updated_at = ?, limit_month = ?
      WHERE id = ?
    `;

    const nowDate = formatDateTime(new Date());

    // 업데이트 쿼리 실행
    await connection.execute(updateQuery, [
      name,
      description,
      nowDate,
      limit_month,
      id,
    ]);

    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) await connection.release(); // 연결 종료
  }
});

/**
 * @swagger
 * /product/delete/{id}:
 *   delete:
 *     tags: [Product]
 *     summary: Product(AI Type) 정보 삭제
 *     description: Product(AI Type) 정보제
 *     parameters:
 *       - in: path
 *         name: id
 *         description: Product(AI Type) ID
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Product(AI Type) 정보 삭제 성공
 *       500:
 *         description: Product(AI Type) 정보제
 * */
// router.delete("/delete/:id", verifyToken, async (req, res) => {
//   const id = req.params.id; // URL에서 row id를 가져옵니다.

//   let connection;
//   try {
//     // 데이터베이스 연결
//     connection = await getConnection();

//     // 이력 삭제 쿼리
//     const deleteQuery = "DELETE FROM product WHERE id = ?";

//     // 삭제 쿼리 실행
//     await connection.execute(deleteQuery, [id]);

//     res.status(200).json({ message: "Product deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   } finally {
//     if (connection) await connection.release(); // 연결 종료
//   }
// });

/**
 * @swagger
 * /product/delete/{name}:
 *   delete:
 *     tags: [Product]
 *     summary: Product(AI Type) 정보 삭제
 *     description: Product(AI Type) 정보 제거
 *     parameters:
 *       - in: path
 *         name: name
 *         description: Product(AI Type) 이름
 *         required: true
 *         schema:
 *           type: string
 *         example: name
 *     responses:
 *       200:
 *         description: Product(AI Type) 정보 제거 성공
 *       401:
 *         description: ProductType에 사용되고 있는 경우, 삭제 제한
 *         code: "PRODUCT_IN_USE"
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Database error
 */
router.delete("/delete/:name", verifyToken, async (req, res) => {
  const { name } = req.params;

  let connection;

  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // LicenseManagement 테이블에서 ProductType에 `name`이 포함된 경우 확인
    const [licenseResults] = await connection.query(
      `
      SELECT pk FROM LicenseManagement 
      WHERE FIND_IN_SET(?, ProductType) > 0
    `,
      [name]
    );

    console.log("licenseResults:", licenseResults);

    if (licenseResults.length > 0) {
      // ProductType에 사용되고 있는 경우, 삭제 제한 응답
      return res.status(401).json({
        error:
          "Cannot delete product with name in use in LicenseManagement ProductType field.",
        code: "PRODUCT_IN_USE",
      });
    }

    // product 테이블에서 삭제 진행
    const [deleteResult] = await connection.query(
      "DELETE FROM product WHERE name = ?",
      [name]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

module.exports = router;

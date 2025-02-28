require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser"); // json 파싱
const cors = require("cors");
const { pool, getConnection } = require("../controller/mysql");
const {
  formatDateToYYYYMMDD,
  formatDateTime,
  formatFromGMT,
} = require("../controller/common");
const { verifyToken } = require("../controller/auth");

const router = express.Router();
router.use(cors());
router.use(bodyParser.json());

/**
 * @swagger
 * tags:
 *   name: License
 *   description: License 정보 관련 API
 */

/**
 * @swagger
 * /license/list:
 *   get:
 *     tags: [License]
 *     summary: License 조회
 *     description: license table list를 조회
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: license table list를 조회
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               pk:
 *                 type: integer
 *                 description: license pk
 *               DealerCompany:
 *                 type: string
 *                 description: DealerCompany
 *               Company:
 *                 type: string
 *                 description: Company
 *               Country:
 *                 type: string
 *                 description: Country
 *               AIType:
 *                 type: string
 *                 description: AIType
 *               Hospital:
 *                 type: string
 *                 description: Hospital
 *               UserEmail:
 *                 type: string
 *                 description: UserEmail
 *               HardWareInfo:
 *                 type: string
 *                 description: HardWareInfo
 *               DetectorSerialNumber:
 *                 type: string
 *                 description: DetectorSerialNumber
 *               UpdatedAt:
 *                 type: string
 *                 description: UpdatedAt
 *       500:
 *         description: Database error
 *       404:
 *         description: User not found
 *       400:
 *         description: Missing required fields
 *       403:
 *         description: Unauthorized
 */
router.get("/list", verifyToken, async (req, res) => {
  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // LicenseManagement 테이블의 모든 데이터를 가져오는 쿼리
    const [rows] = await connection.execute("SELECT * FROM LicenseManagement");

    //data 예시
    // const data = {
    //   pk: 1,
    //   DealerCompany: "Example Dealer",
    //   Company: "Example Company",
    //   Country: "Example Country",
    //   AIType: "Example AIType",
    //   Hospital: "Example Hospital",
    //   UserEmail: "user@example.com",
    //   HardWareInfo: "Example Hardware Info",
    //   DetectorSerialNumber: "SN123456789",
    //   LocalActivateStartDate: "2024-09-30T23:00:00.000Z",
    //   LocalTerminateDate: "2025-09-30T15:00:00.000Z",
    //   UTCActivateStartDate: "2024-09-30T15:00:00.000Z",
    //   UTCTerminateDate: "2025-09-30T15:00:00.000Z",
    //   ActivateCount: 5,
    //   UniqueCode: "UNIQUECODE123",
    //   UpdatedAt: null,
    // };

    // 결과를 클라이언트에 JSON 형식으로 반환
    res.status(200).json({
      message: "Data fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      status: "error",
      message: "Database error",
      error: error.message,
    });
  } finally {
    // 데이터베이스 연결 해제
    if (connection) await connection.release();
  }
});

router.get("/active-list", verifyToken, async (req, res) => {
  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // LicenseManagement 테이블의 모든 데이터를 가져오는 쿼리
    const [rows] = await connection.execute(
      "SELECT * FROM LicenseManagement WHERE Deleted = 0"
    );

    // 결과를 클라이언트에 JSON 형식으로 반환
    res.status(200).json({
      message: "Data fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      status: "error",
      message: "Database error",
      error: error.message,
    });
  } finally {
    // 데이터베이스 연결 해제
    if (connection) await connection.release();
  }
});

/**
 * @swagger
 * /license/list/{pk}:
 *   get:
 *     tags: [License]
 *     summary: License 조회
 *     description: license table list를 조회
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: UniqueCode
 *         schema:
 *           type: string
 *         required: true
 *         description: UniqueCode
 *         example: "RADISENTECH"
 *     responses:
 *       200:
 *         description: license table list를 조회
 *         schema:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               pk:
 *                 type: integer
 *                 description: license pk
 *               DealerCompany:
 *                 type: string
 *                 description: DealerCompany
 *               Company:
 *                 type: string
 *                 description: Company
 *               Country:
 *                 type: string
 *                 description: Country
 *               AIType:
 *                 type: string
 *                 description: AIType
 *               Hospital:
 *                 type: string
 *                 description: Hospital
 *               UserEmail:
 *                 type: string
 *                 description: UserEmail
 *               HardWareInfo:
 *                 type: string
 *                 description: HardWareInfo
 *               DetectorSerialNumber:
 *                 type: string
 *                 description: DetectorSerialNumber
 *               LocalActivateStartDate:
 *                 type: string
 *                 description: LocalActivateStartDate
 *               LocalTerminateDate:
 *                 type: string
 *                 description: LocalTerminateDate
 *               UTCActivateStartDate:
 *                 type: string
 *                 description: UTCActivateStartDate
 *               UTCTerminateDate:
 *                 type: string
 *                 description: UTCTerminateDate
 *               ActivateCount:
 *                 type: integer
 *                 description: ActivateCount
 *               UniqueCode:
 *                 type: string
 *                 description: UniqueCode
 *               UpdatedAt:
 *                 type: string
 *                 description: UpdatedAt
 *       500:
 *         description: Database error
 *       403:
 *         description: Unauthorized
 * */
router.get("/list/:UniqueCode", verifyToken, async (req, res) => {
  console.log(req.params.UniqueCode);
  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // LicenseManagement 테이블의 모든 데이터를 가져오는 쿼리
    const [rows] = await connection.execute(
      "SELECT * FROM LicenseManagement WHERE UniqueCode = ? AND Deleted = 0",
      [req.params.UniqueCode]
    );

    // 결과를 클라이언트에 JSON 형식으로 반환
    res.status(200).json({
      message: "Data fetched successfully",
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      status: "error",
      message: "Database error",
      error: error.message,
    });
  } finally {
    // 데이터베이스 연결 해제
    if (connection) await connection.release();
  }
});

/**
 * @swagger
 * /license/add:
 *   post:
 *     tags: [License]
 *     summary: License 추가
 *     description: license table에 데이터 추가
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: body
 *         description: License 추가 요청데이터
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             DealerCompany:
 *               type: string
 *               description: DealerCompany
 *             Company:
 *               type: string
 *               description: Company
 *             Country:
 *               type: string
 *               description: Country
 *             AIType:
 *               type: string
 *
 *             Hospital:
 *               type: string
 *               description: Hospital
 *             UserEmail:
 *               type: string
 *               description: UserEmail
 *             HardWareInfo:
 *               type: string
 *               description: HardWareInfo
 *             DetectorSerialNumber:
 *               type: string
 *               description: DetectorSerialNumber
 *             LocalActivateStartDate:
 *               type: string
 *               description: LocalActivateStartDate
 *             LocalTerminateDate:
 *               type: string
 *               description: LocalTerminateDate
 *             UTCActivateStartDate:
 *               type: string
 *               description: UTCActivateStartDate
 *             UTCTerminateDate:
 *               type: string
 *               description: UTCTerminateDate
 *             ActivateCount:
 *               type: integer
 *               description: ActivateCount
 *             UniqueCode:
 *               type: string
 *               description: UniqueCode
 *             UpdatedAt:
 *               type: string
 *               description: UpdatedAt
 *     responses:
 *       200:
 *         description: license table에 데이터 추가
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               description: status
 *             message:
 *               type: string
 *               description: message
 *             data:
 *               type: object
 *               properties:
 *                 pk:
 *                   type: integer
 *                   description: license pk
 *       500:
 *         description: Database error
 *
 *       400:
 *         description: Bad Request
 *       403:
 *         description: Unauthorized
 * */
router.post("/add", verifyToken, async (req, res) => {
  /*
  DealerCompany: 'Radisen',
  Company: 'FastFive',
  Country: 'Korea',
  AIType: 'Chest',
  Hospital: 'Hospital',
  UserEmail: 'test@example.com',
  UserName: 'name',
  HardWareInfo: '1234',
  DetectorSerialNumber: '1234',
  date_range: [ '2024-11-01T06:28:50.925Z', '2024-11-29T15:00:00.000Z' ],
  UniqueCode: 'Code',
  LocalActivateStartDate: '2024-11-01',
  LocalTerminateDate: '2024-11-30',
  UTCActivateStartDate: '2024-11-01T06:28:50.925Z',
  UTCTerminateDate: '2024-11-29T15:00:00.000Z'
  */

  const {
    DealerCompany,
    Company,
    Country,
    AIType,
    Hospital,
    UserEmail,
    UserName,
    HardWareInfo,
    DetectorSerialNumber,
    UniqueCode,
    LocalActivateStartDate,
    LocalTerminateDate,
    UTCActivateStartDate,
    UTCTerminateDate,
    ProductType,
  } = req.body;

  // 필수 필드 확인
  if (
    !DealerCompany ||
    !Company ||
    !Country ||
    !AIType ||
    !Hospital ||
    !UniqueCode ||
    !LocalActivateStartDate ||
    !LocalTerminateDate ||
    !UTCActivateStartDate ||
    !UTCTerminateDate
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;
  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // LicenseManagement 테이블에 데이터 추가하는 쿼리
    const insertQuery = `
      INSERT INTO LicenseManagement
      (DealerCompany, Company, Country, AIType, Hospital, UserEmail, UserName, HardWareInfo, DetectorSerialNumber, LocalActivateStartDate, LocalTerminateDate, UTCActivateStartDate, UTCTerminateDate, UniqueCode, ActivateCount, ProductType)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `;

    const parameters = [
      DealerCompany,
      Company,
      Country,
      AIType,
      Hospital,
      UserEmail || null, // null로 처리
      UserName || null, // null로 처리
      HardWareInfo || null, // null로 처리
      DetectorSerialNumber || null, // null로 처리
      LocalActivateStartDate,
      LocalTerminateDate,
      UTCActivateStartDate,
      UTCTerminateDate,
      UniqueCode,
      ProductType || null,
    ]?.map((param) => (param === undefined ? null : param)); // undefined를 null로 변경

    const [result] = await connection.execute(insertQuery, parameters);

    console.log("Rows inserted:", result.affectedRows);
    res.status(200).json({
      message: "Data added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({
      status: "error",
      message: "Database error",
      error: error.message,
    });
  } finally {
    // 데이터베이스 연결 해제
    if (connection) await connection.release();
  }
});

/**
 * @swagger
 * /license/update-subscription/{pk}:
 *   put:
 *     summary: expire date update
 *     description: 특정 ID의 ExpireDate를 기준으로 LocalTerminateDate와 UTCTerminateDate를 업데이트하는 엔드포인트
 *     tags: [License]
 *     parameters:
 *       - in: path
 *         name: pk
 *         schema:
 *           type: integer
 *         required: true
 *         description: LicenseManagement pk
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           properties:
 *             ExpireDate:
 *               type: string
 *               description: LicenseManagement ExpireDate
 *             UniqueCode:
 *               type: string
 *               description: LicenseManagement UniqueCode
 *         required: true
 *         description: LicenseManagement ExpireDate
 *     responses:
 *       200:
 *         description: SUCCESS
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Database error
 *       404:
 *         description: LicenseManagement NOT FOUND
 */
router.put("/update-subscription/:pk", verifyToken, async (req, res) => {
  const { pk } = req.params;
  const { localTime, utcTime, localExpireDate, utcExpireDate, UniqueCode } =
    req.body;

  console.log(localTime, utcTime, localExpireDate, utcExpireDate, UniqueCode);

  // 요청 유효성 검사
  if (!utcTime || !utcExpireDate || !UniqueCode) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let connection;

  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // ExpireDate 변환: LocalTerminateDate와 UTCTerminateDate 계산
    // const expireDateObj = new Date(ExpireDate);
    // const localTerminateDate = expireDateObj.toISOString().split("T")[0]; // Local 날짜
    // const utcTerminateDate = formatDateToYYYYMMDD(expireDateObj);

    // const nowDate = formatDateTime(new Date());

    // UTC 기준 DateTime 계산
    // const utcNowDate = formatFromGMT(nowDate);

    // console.log("LocalUpdateDate:", nowDate);
    // console.log("UTCUpdateDate:", utcNowDate);

    // 업데이트 쿼리 작성
    const updateQuery = `
      UPDATE LicenseManagement 
      SET 
        LocalTerminateDate = ?, 
        UTCTerminateDate = ?,
        ActivateCount = ActivateCount + 1,
        UniqueCode = ?,
        UpdatedAt = ?,
        UTCUpdatedAt = ?
      WHERE pk = ?
    `;

    // 현재 ExpireDate 가져오기
    const [currentRows] = await connection.execute(
      "SELECT LocalTerminateDate, UTCTerminateDate, ActivateCount FROM LicenseManagement WHERE pk = ?",
      [pk]
    );

    if (currentRows.length === 0) {
      return res.status(401).json({ error: "License not found" });
    }

    const currentExpireDate = new Date(currentRows[0].UTCTerminateDate);

    console.log(formatDateTime(currentExpireDate), utcExpireDate);

    // 이전과 새로운 ExpireDate 비교
    if (formatDateTime(currentExpireDate) === utcExpireDate) {
      return res.status(402).json({
        error: "No changes made. ExpireDate is the same.",
      });
    }

    // license_history 테이블에 데이터 삽입
    const insertHistoryQuery = `
      INSERT INTO license_history (license_pk, description, previous_expire_date, new_expire_date, unique_code, update_date)
      VALUES (?, 'ExpireDate updated', ?, ?, ?, ?);
    `;
    await connection.execute(insertHistoryQuery, [
      pk,
      formatDateTime(currentExpireDate),
      utcExpireDate,
      UniqueCode,
      utcTime,
    ]);

    // 업데이트 쿼리 실행
    await connection.execute(updateQuery, [
      localExpireDate,
      utcExpireDate,
      UniqueCode,
      localTime,
      utcTime,
      pk,
    ]);

    res.status(200).json({
      message: "Subscription updated successfully",
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // 데이터베이스 연결 종료
    if (connection) {
      await connection.release();
      console.log("Connection closed");
    }
  }
});

/**
 * @swagger
 * /license/update-license/{pk}:
 *   put:
 *     summary: Update user data
 *     tags:
 *       - License
 *     parameters:
 *       - in: path
 *         name: pk
 *         schema:
 *           type: integer
 *           description: License pk
 *         required: true
 *         description: License pk
 *       - in: body
 *         name: body
 *         schema:
 *           type: object
 *           properties:
 *             Country:
 *               type: string
 *             Hospital:
 *               type: string
 *             UserName:
 *               type: string
 *             UserEmail:
 *               type: string
 *         description: Update license data
 *     responses:
 *       200:
 *         description: SUCCESS
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Database error
 *       404:
 *         description: LicenseManagement NOT FOUND
 */
router.put("/update-license/:pk", verifyToken, async (req, res) => {
  const { pk } = req.params;
  const { Company, Country, Hospital, UserName, UserEmail } = req.body;

  // 요청 유효성 검사
  if (!pk || !Company || !Country || !Hospital || !UserName || !UserEmail) {
    return res.status(400).json({ error: "All fields are required" });
  }

  let connection;

  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // 업데이트 쿼리 작성
    const updateQuery = `
      UPDATE LicenseManagement
      SET 
        Country = ?, 
        Hospital = ?, 
        UserName = ?, 
        UserEmail = ?, 
        Company = ?
      WHERE pk = ?
    `;

    // 현재 데이터 가져오기
    const [currentRows] = await connection.execute(
      "SELECT Country, Hospital, UserName, UserEmail, Company FROM LicenseManagement WHERE pk = ?",
      [pk]
    );

    if (currentRows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const currentData = currentRows[0];

    // 변경 여부 확인
    if (
      currentData.Country === Country &&
      currentData.Hospital === Hospital &&
      currentData.UserName === UserName &&
      currentData.UserEmail === UserEmail &&
      currentData.Company === Company
    ) {
      return res
        .status(402)
        .json({ error: "No changes made. Data is the same." });
    }

    // 업데이트 실행
    await connection.execute(updateQuery, [
      Country,
      Hospital,
      UserName,
      UserEmail,
      Company,
      pk,
    ]);

    res.status(200).json({
      message: "User data updated successfully",
    });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // 데이터베이스 연결 종료
    if (connection) {
      await connection.release();
      console.log("Connection closed");
    }
  }
});

/**
 * @swagger
 * /license/withdrawal-subscription/{pk}:
 *   put:
 *     summary: 청약 철회
 *     description: 라이센스 목록 삭제
 *     tags: [License]
 *     parameters:
 *       - in: path
 *         name: pk
 *         schema:
 *           type: integer
 *         required: true
 *         description: LicenseManagement pk
 *     responses:
 *       200:
 *         description: SUCCESS
 *       500:
 *         description: Database error
 *       403:
 *         description: Forbidden
 * */
router.put("/withdrawal-subscription/:pk", verifyToken, async (req, res) => {
  const { pk } = req.params;
  console.log("license_pk:", pk);

  let connection;

  try {
    connection = await getConnection();
    // 업데이트 쿼리 작성
    const updateQuery = `
      UPDATE LicenseManagement 
      SET 
        ActivateCount = ActivateCount - 1,
        Deleted = 1
      WHERE pk = ?
    `;

    const nowDate = formatDateTime(new Date());

    // license_history 테이블에 데이터 삽입
    const insertHistoryQuery = `
      INSERT INTO license_history (license_pk, description, deleted, update_date)
      VALUES (?, "Subscription withdrawn", 1, ?);
    `;

    // 업데이트 쿼리 실행
    await connection.execute(updateQuery, [pk]);
    await connection.execute(insertHistoryQuery, [pk, nowDate]);

    res.status(200).json({ message: "Subscription withdrawn successfully" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) {
      await connection.release();
      console.log("Connection closed");
    }
  }
});

/**
 * @swagger
 * /license/license-history/{pk}:
 *   get:
 *     summary: license_history
 *     description: 특정 license_pk의 변경 이력 조회
 *     tags: [License]
 *     parameters:
 *       - in: path
 *         name: pk
 *         schema:
 *           type: integer
 *         required: true
 *         description: license_history pk
 *     responses:
 *       200:
 *         description: SUCCESS
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Database error
 *       404:
 *         description: license_history NOT FOUND
 */
router.get("/license-history/:pk", verifyToken, async (req, res) => {
  const { pk } = req.params;

  let connection;

  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // license_history에서 특정 license_pk의 변경 이력 조회
    const [historyRows] = await connection.execute(
      "SELECT * FROM license_history WHERE license_pk = ? ORDER BY update_date DESC",
      [pk]
    );

    if (historyRows.length === 0) {
      return res
        .status(404)
        .json({ message: "No history found for this license." });
    }

    res.status(200).json(historyRows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // 데이터베이스 연결 종료
    if (connection) {
      await connection.release();
      console.log("Connection closed");
    }
  }
});

/**
 * @swagger
 * /license/is-activated-aitype/{AIType}:
 *   get:
 *     summary: license_history
 *     description: 특정 AIType의 변경 이력 조회
 *     tags: [License]
 *     parameters:
 *       - in: path
 *         name: AIType
 *         schema:
 *           type: string
 *         required: true
 *         description: AIType
 *     responses:
 *       200:
 *         description: SUCCESS
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Database error
 *       404:
 *         description: license_history NOT FOUND
 * */
router.get("/is-activated-aitype/:AIType", verifyToken, async (req, res) => {
  const { AIType } = req.params;

  let connection;

  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // LicenseManagement에서 발급된 AIType이 있는지 조회(현재 활성화 되어있는 리스트 중)
    const [rows] = await connection.execute(
      "SELECT * FROM LicenseManagement WHERE AIType = ? AND Deleted = 0",
      [AIType]
    );

    // 발급되지 않았다면 404
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No history found for this license." });
    }

    // 발급된것이 있다면 리스트로 전달
    res.status(200).json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // 데이터베이스 연결 종료
    if (connection) {
      await connection.release();
      console.log("Connection closed");
    }
  }
});

// 특정 AI Type의 리스트만 가지고 오는 함수
router.post("/is-activated-aitype-list", verifyToken, async (req, res) => {
  const { AIType, UniqueCode } = req.body;

  let connection;

  try {
    // 데이터베이스 연결
    connection = await getConnection();

    // LicenseManagement에서 발급된 AIType이 있는지 조회(현재 활성화 되어있는 리스트 중)
    const [rows] = await connection.execute(
      "SELECT * FROM LicenseManagement WHERE AIType = ? AND UniqueCode = ? AND Deleted = 0",
      [AIType, UniqueCode]
    );

    // 발급되지 않았다면 201
    if (rows.length === 0) {
      return res
        .status(201)
        .json({ message: "No history found for this license." });
    }

    // 발급된것이다면 리스트로 전달
    res.status(200).json(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    // 데이터베이스 연결 종료
    if (connection) {
      await connection.release();
      console.log("Connection closed");
    }
  }
});
module.exports = router;

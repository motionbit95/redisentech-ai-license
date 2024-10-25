import React, { useEffect, useState } from "react";
import License from "./page/license";
import {
  Button,
  Col,
  Layout,
  Menu,
  Result,
  Row,
  Space,
  Typography,
} from "antd";
import { Footer, Header } from "antd/es/layout/layout";
import { useLocation, useNavigate } from "react-router-dom";
import Company from "./page/company";

const items = [
  {
    key: "license",
    label: "License List",
  },
  {
    key: "company",
    label: "Company List",
  },
  {
    key: "statistics",
    label: "Statistics",
    disabled: true,
  },
];

function App({ page }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 로그인 페이지에서 라이센스 페이지로 이동할 때 로그인 플래그를 받습니다.
  const [isLoggedIn, setIsLoggedIn] = useState(location.state?.isLoggedIn);

  useEffect(() => {
    // 로그인 된 사용자의 경우 lisecse 페이지로 리다이렉트
    if (isLoggedIn && window.location.pathname === "/") {
      navigate("/license");
    }

    // 페이지를 로드할 때 로그인 토큰을 확인하여 기 로그인 사용자의 경우 로그인을 처리합니다.
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Space size={"large"} direction="vertical">
        <Header
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Col span={12}>
            <Menu
              theme="dark"
              mode="horizontal"
              defaultSelectedKeys={["license"]}
              items={items}
              style={{ flex: 1, minWidth: 0 }}
              onClick={({ key }) => {
                navigate(`/${key}`);
              }}
            />
          </Col>
          <Col span={12} style={{ textAlign: "right" }}>
            {isLoggedIn ? (
              <Button
                onClick={() => {
                  setIsLoggedIn(false);
                  navigate("/");
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => {
                  navigate("/login");
                }}
              >
                Login
              </Button>
            )}
          </Col>
        </Header>
        {/* 로그인 되어있지 않은 사용자의 경우 접근 제한 / 로그인 유도 */}
        {!isLoggedIn ? (
          <div>
            <Result
              status="403"
              title="403"
              subTitle="Sorry, you are not authorized to access this page."
              extra={
                <Button type="primary" onClick={() => navigate("/login")}>
                  Login Account
                </Button>
              }
            />
          </div>
        ) : (
          <>
            {page === "license" && <License />}
            {page === "company" && <Company />}
          </>
        )}
        <Footer
          style={{
            textAlign: "center",
          }}
        >
          ©2024 Created by RediSen
        </Footer>
      </Space>
    </Layout>
  );
}

export default App;

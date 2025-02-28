import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Descriptions,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { AxiosGet, AxiosPost, AxiosPut } from "../api";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { CloseOutlined } from "@ant-design/icons";

const LicenseHistoryModal = (props) => {
  const navigate = useNavigate();
  const { title, data, onCancel } = props;
  const [history, setHistoryList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [selectedAIType, setSelectedAIType] = useState(null);
  const [licenseCnt, setLicenseCnt] = useState([]);
  const [filteredTotalLicenseCnt, setFilteredTotalLicenseCnt] = useState(0);
  const [filteredUsedLicenseCnt, setFilteredUsedLicenseCnt] = useState(0);

  // admin pk 의 ID 찾기
  const AdminID = ({ admin_pk }) => {
    const [admin_id, setAdminID] = useState(null);
    useEffect(() => {
      if (admin_pk) {
        AxiosGet(`/company/${admin_pk}`).then((response) => {
          if (response.status === 200) {
            setAdminID(response.data.user_id);
          }
        });
      }
    }, []);
    return <div>{admin_id}</div>;
  };

  const fetchLicenseCnt = async () => {
    try {
      const result = await AxiosGet(`/company/license-cnt/${data?.id}`);
      if (result.status === 200) {
        setLicenseCnt(result.data);
        // setHistoryList(result.data);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        navigate("/login");
      }
    }
  };
  useEffect(() => {
    // 라이센스 Count를 가지고오는 함수 호출
    if (data) {
      fetchLicenseCnt();
    }
  }, [data]);

  const fetchFilteredAITypeList = async () => {
    try {
      AxiosPost(`/license/is-activated-aitype-list`, {
        AIType: selectedAIType,
        UniqueCode: data?.unique_code,
      }).then((response) => {
        if (response?.status === 201) {
          // 발급된 것이 없음
          setFilteredUsedLicenseCnt(0);
        } else {
          setFilteredUsedLicenseCnt(response.data.length);
        }
      });
    } catch (error) {
      if (error.response?.status === 403) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    // 여기서 리스트 가지고 오기
    if (selectedAIType) {
      let data = licenseCnt.filter((item) => item.ai_type === selectedAIType);
      if (data[0]?.license_cnt > 0) {
        setFilteredTotalLicenseCnt(data[0]?.license_cnt);
      } else {
        setFilteredTotalLicenseCnt(0);
      }
      fetchFilteredAITypeList();
    }
  }, [selectedAIType, licenseCnt]);

  const fetchHistoryList = async (data) => {
    setLoading(true);
    if (data) {
      try {
        const result = await AxiosGet(`/company/generate-history/${data?.id}`);
        if (result.status === 200) {
          const sortedData = result.data.sort(
            (a, b) => new Date(b.create_time) - new Date(a.create_time)
          );
          setHistoryList(sortedData);
          setLoading(false);
        } else {
          setLoading(false);
          throw new Error("Unauthorized");
        }
      } catch (error) {
        if (error.response?.status === 403) {
          navigate("/login");
        } else if (error.response?.status === 404) {
          message.error(error.response.data.error);
          setHistoryList([]);
          setLoading(false);
        } else {
          console.error("Error:", error);
          setLoading(false);
        }
      }
    }
    setLoading(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
    fetchHistoryList(data);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    // AI Type 필터가 변경될 때
    if (!filters.ai_type) {
      setSelectedAIType(null); // AI Type 필터 해제 시
    } else if (filters.ai_type.length > 0) {
      setSelectedAIType(filters.ai_type[0]); // 필터가 있을 때
    }
  };

  const handleHistoryCancel = (history) => {
    // 여기도 라이센스 수에 따라 처리해야함
    let ai_license = licenseCnt.find(
      (item) => item.ai_type === history.ai_type
    );
    let total_license_cnt = ai_license.license_cnt;
    // 현재 해당 유니크 코드로 등록된 라이선스 수량
    let used_license_cnt = 0;
    AxiosPost(`/license/is-activated-aitype-list`, {
      AIType: history.ai_type,
      UniqueCode: data?.unique_code,
    }).then((response) => {
      if (response?.status === 201) {
        used_license_cnt = 0;
      } else {
        used_license_cnt = response.data.length;
      }
    });

    if (
      total_license_cnt - used_license_cnt <
      history.new_cnt - history.prev_cnt
    ) {
      message.error(
        "The number of licenses to be canceled is greater than the number of licenses currently in use."
      );
      return;
    }
    // 이관 데이터를 취소하는 과정 예외처리 추가
    if (history?.description === "Transfer") {
      // 재이관
      setLoading(true);
      AxiosPost("/company/transfer-cancel", {
        sourceId: history?.source_id,
        targetId: history?.target_id,
      })
        .then((response) => {
          fetchHistoryList(props.data);
          onCancel();
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    } else {
      AxiosGet("/company/user-info")
        .then((response) => {
          if (response.status === 200) {
            AxiosPut(`/company/update-license/${data.id}`, {
              license_cnt: history?.prev_cnt - history?.new_cnt,
              description: "Generated Canceled",
              canceled: 1,
              admin_id: response.data.id,
              ai_type: history?.ai_type,
              company_pk: data.id,
            })
              .then((response) => {
                setLoading(true);
                AxiosPut(`/company/history-cancel/${history?.id}`, {
                  canceled: 1,
                }).then((response) => {
                  // 히스토리 데이터는 부모 테이블에서 받아온 데이터 기준으로 다시 받아와야하므로 props로 받아온 데이터를 넘긴다
                  // 여기 함수에서 받은 data는 X 버튼을 클릭한 행의 데이터임.
                  fetchHistoryList(props.data);
                  onCancel();
                  setLoading(false);
                });
              })
              .catch((error) => {
                console.error(error);
                setLoading(false);
              });

            fetchFilteredAITypeList();
          }
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    }

    fetchLicenseCnt();
  };

  // table column
  const historyColumns = [
    {
      title: "No.",
      render: (text, record, index) => index + 1,
      fixed: "left",
      width: 50,
    },
    {
      title: "Update Time",
      dataIndex: "create_time",
      key: "create_time",

      render: (text) => (text ? dayjs(text).format("MM-DD-YYYY HH:mm:ss") : ""),
    },
    {
      title: "AI Type",
      dataIndex: "ai_type",
      key: "ai_type",

      filters: data?.product?.map((type) => ({ text: type, value: type })),
      // filters: [{ text: "AI", value: "AI" }],
      onFilter: (value, record) => {
        return record.ai_type === value; // 필터링 로직
      },
      filterMultiple: false, // 다중 선택 비활성화
    },
    {
      title: "Previous",
      dataIndex: "prev_cnt",
      key: "prev_cnt",
    },
    {
      title: "Added",
      dataIndex: "new_cnt",
      key: "new_cnt",
      render: (text, record, index) => (
        <Typography.Text
          style={{ color: text - record.prev_cnt > 0 ? "#40a9ff" : "#ff4d4f" }}
        >
          {text - record.prev_cnt}
        </Typography.Text>
      ),
    },
    {
      title: "Total",
      dataIndex: "new_cnt",
      key: "new_cnt",
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
    },
    {
      title: "Target",
      dataIndex: "target",
      key: "target",
    },
    {
      title: "Admin",
      dataIndex: "admin_id",
      key: "admin_id",
      render: (text) => <AdminID admin_pk={text} />,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",

      render: (text, record, index) => (
        <Tag
          color={
            text.includes("Canceled")
              ? "red"
              : text === "Generated"
              ? "green"
              : "blue"
          }
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Action",
      dataIndex: "canceled",
      key: "canceled",
      render: (text, record, index) => (
        <Button
          disabled={text === 1 ? true : false}
          danger
          size="small"
          style={{
            display: record.description === "Transfer" ? "none" : "block",
          }}
          onClick={() => handleHistoryCancel(record)}
        >
          <CloseOutlined />
        </Button>
      ),
    },
  ];

  return (
    <>
      <Col
        style={{
          cursor: "pointer",
          color: "#1890ff",
          fontWeight: "bold",
          textDecoration: "underline",
        }}
        onClick={showModal}
      >
        {title}
      </Col>
      <Modal
        title={`[${data?.user_name}] License Generate History`}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        centered
        width={1000}
        footer={null}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          <Descriptions
            bordered
            column={4}
            size="small"
            labelStyle={{ fontWeight: "bold" }}
          >
            <Descriptions.Item label="AI Type">
              {selectedAIType ? selectedAIType : "All"}
            </Descriptions.Item>
            <Descriptions.Item label="Used">
              {selectedAIType ? filteredUsedLicenseCnt : data?.use_cnt || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Remaining">
              {selectedAIType
                ? filteredTotalLicenseCnt - filteredUsedLicenseCnt
                : data?.license_cnt - (data?.use_cnt || 0)}
            </Descriptions.Item>
            <Descriptions.Item label="Total">
              {selectedAIType ? filteredTotalLicenseCnt : data?.license_cnt}
            </Descriptions.Item>
          </Descriptions>
          <Table
            dataSource={history}
            size="small"
            columns={historyColumns}
            loading={loading}
            pagination={{
              defaultCurrent: 1,
              defaultPageSize: 10,
              showSizeChanger: true,
            }}
            onChange={handleTableChange} // 필터 및 정렬 상태 변경 처리
          />
        </Space>
      </Modal>
    </>
  );
};

export default LicenseHistoryModal;

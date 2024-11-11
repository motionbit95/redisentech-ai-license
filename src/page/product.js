import React, { useRef, useState } from "react";
import {
  Button,
  Input,
  Layout,
  Result,
  Popconfirm,
  Row,
  Space,
  Table,
} from "antd";
import Highlighter from "react-highlight-words";
import { SearchOutlined } from "@ant-design/icons";
import CompanyEdit from "../modal/drawer";
import { useNavigate } from "react-router-dom";
import { log } from "../api";
import ProductEdit from "../modal/product-Edit";
import ProductAdd from "../modal/product-Add";
const { Content } = Layout;

const Product = (props) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});

  const [selectedProduct, setSelectedProduct] = useState(null); // 선택된 product data
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // 로딩 플래그

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const handleChange = (pagination, filters, sorter) => {
    log("Various parameters", pagination, filters, sorter);
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={"Search " + dataIndex}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            {"Search"}
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            {"Reset"}
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            {"Close"}
          </Button>
        </Space>
      </div>
    ),

    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      (record[dataIndex] ? record[dataIndex].toString() : "")
        .toLowerCase()
        .includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{
            backgroundColor: "#ffc069",
            padding: 0,
          }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const getColumnFilterProps = (dataIndex) => ({
    filteredValue: filteredInfo[dataIndex] || [],
    onFilter: (value, record) => record[dataIndex] === value,
    filterSearch: true,
    ellipsis: true,
    // filters: list // filter options 설정
    //   .map((item) => item[dataIndex])
    //   .filter((value, index, self) => self.indexOf(value) === index)
    //   .map((value) => ({ text: value, value })),
    filters: list
      .map((item) => item[dataIndex])
      .filter((value, index, self) => self.indexOf(value) === index)
      .map((value) => ({
        text:
          value.toString() === "D"
            ? "Developer"
            : value === "Y"
            ? "Admin"
            : "Dealer",
        value,
      })),
  });

  // table column
  const companyColumns = [
    {
      title: "No.",
      render: (text, record, index) => index + 1,
      fixed: "left",
      width: 50,
    },
    {
      title: "Product",
      dataIndex: "product_name",
      key: "product_name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const onSelectChange = (newSelectedRowKeys) => {
    log("selectedRowKeys changed: ", newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
    log(list.find((c) => c.key === newSelectedRowKeys[0]));
    setSelectedProduct(list.find((c) => c.key === newSelectedRowKeys[0]));
  };

  const rowSelection = {
    type: "radio",
    selectedRowKeys,
    onChange: onSelectChange,
  };
  const hasSelected = selectedRowKeys.length > 0;

  return (
    <>
      {error ? (
        <Result
          status="403"
          title={error.code}
          subTitle={error.message}
          extra={
            <Button type="primary" onClick={() => navigate("/login")}>
              Login Account
            </Button>
          }
        />
      ) : (
        <Content
          style={{
            padding: "48px",
          }}
        >
          <Space size={"large"} direction="vertical" className="w-full">
            <Table
              rowSelection={rowSelection}
              loading={loading}
              title={() => (
                <Row justify={"space-between"}>
                  <div></div>
                  <Space>
                    <ProductAdd
                      disabled={!hasSelected}
                      onAddFinish={() => console.log("add")}
                    />
                    <Button
                      disabled={!hasSelected}
                      onClick={() => setSelectedRowKeys([])}
                    >
                      Cancel
                    </Button>
                    <ProductEdit
                      disabled={!hasSelected}
                      data={selectedProduct}
                      setLoading={setLoading}
                    />
                    <Popconfirm
                      title="Delete the Product?"
                      description={
                        "Are you sure you want to delete this product?"
                      }
                      onConfirm={console.log("delete")}
                      onCancel={() => {}}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button disabled={!hasSelected}>Delete</Button>
                    </Popconfirm>
                  </Space>
                </Row>
              )}
              pagination={{
                defaultCurrent: 1,
                defaultPageSize: 10,
                showSizeChanger: true,
              }}
              columns={companyColumns}
              dataSource={list}
              scroll={{
                x: "max-content",
              }}
              onChange={handleChange}
            />
          </Space>
        </Content>
      )}
    </>
  );
};

export default Product;

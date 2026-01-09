/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  ConfigProvider,
  Popconfirm,
  Space,
  Table,
  Tag,
  Select,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import { callDeleteFlightSeat, callFetchFlightSeat } from "@/config/api";
import { toast } from "react-toastify";
import vi_VN from "antd/locale/vi_VN";
import ModalFlightSeatUpsert from "./ModalFlightSeatUpsert";

interface IProps {
  flight?: any | null;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export interface IMeta {
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
}

const FlightSeatTable = (props: IProps) => {
  const { flight, canCreate, canUpdate, canDelete } = props;

  const [data, setData] = useState([]);
  const [meta, setMeta] = useState<IMeta>({
    currentPage: 1,
    itemsPerPage: 10,
    totalPages: 0,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dataInit, setDataInit] = useState({});
  const [seatClassFilter, setSeatClassFilter] = useState<string | undefined>(
    undefined
  );

  const handleDeleteFlightSeat = async (id: number | undefined) => {
    if (id) {
      const res: any = await callDeleteFlightSeat(id);
      if (res?.isSuccess) {
        await handleGetFlightSeat(
          `current=${meta.currentPage}&pageSize=${
            meta.itemsPerPage
          }&flight_id=${flight.id}&sort=created_at-desc${
            seatClassFilter ? `&seat_class=${seatClassFilter}` : ""
          }`
        );
        toast.success("Xóa flight seat thành công", {
          position: "bottom-right",
        });
      } else {
        toast.error("Có lỗi xảy ra", {
          position: "bottom-right",
        });
      }
    }
  };

  const columns: TableProps<any>["columns"] = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Số ghế",
      dataIndex: "seat_number",
    },
    {
      title: "Hạng ghế",
      dataIndex: "seat_class",
      // Remove filters vì giờ lọc server-side
    },
    {
      title: "Có sẵn",
      dataIndex: "is_available",
      render: (_, record) => (
        <Tag color={record.is_available ? "green" : "red"}>
          {record.is_available ? "Có" : "Không"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "created_at",
      sorter: true,
      render: (_, record) => {
        return <>{dayjs(record.created_at).format("DD-MM-YYYY HH:mm:ss")}</>;
      },
    },
    ...(canUpdate || canDelete
      ? [
          {
            title: "Hành động",
            width: 50,
            render: (_: any, record: any) => (
              <Space>
                {canUpdate && (
                  <EditOutlined
                    style={{
                      fontSize: 20,
                      color: "#ffa500",
                    }}
                    type=""
                    onClick={() => {
                      setIsModalOpen(true);
                      setDataInit(record);
                    }}
                  />
                )}

                {canDelete && (
                  <Popconfirm
                    placement="leftTop"
                    title={"Xác nhận xóa flight seat"}
                    description={"Bạn chắc chắn muốn xóa flight seat"}
                    onConfirm={() => handleDeleteFlightSeat(record.id)}
                    okText={"Xác nhận"}
                    cancelText={"Hủy"}
                  >
                    <span style={{ cursor: "pointer", margin: "0 10px" }}>
                      <DeleteOutlined
                        style={{
                          fontSize: 20,
                          color: "#ff4d4f",
                        }}
                      />
                    </span>
                  </Popconfirm>
                )}
              </Space>
            ),
          },
        ]
      : []),
  ];

  const handleGetFlightSeat = async (query: string) => {
    setIsLoading(true);
    try {
      const res: any = await callFetchFlightSeat(query);
      setData(res.data);
      setMeta(res.meta);
    } catch (error: any) {
      toast.error(error.message, {
        position: "bottom-right",
      });
    }
    setIsLoading(false);
  };

  const handleChange = async (pagination: any) => {
    const { current, pageSize } = pagination;
    await handleGetFlightSeat(
      `current=${current}&pageSize=${pageSize}&flight_id=${
        flight.id
      }&sort=created_at-desc${
        seatClassFilter ? `&seat_class=${seatClassFilter}` : ""
      }`
    );
  };

  useEffect(() => {
    if (flight?.id) {
      handleGetFlightSeat(
        `current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&flight_id=${
          flight.id
        }&sort=created_at-desc${
          seatClassFilter ? `&seat_class=${seatClassFilter}` : ""
        }`
      );
    }
  }, [flight?.id]);

  return (
    <div>
      <h2 className="text-[16px] font-semibold">Danh sách ghế cụ thể</h2>
      <div className="flex items-center justify-between gap-[10px] mb-[10px]">
        <div>
          <label>Lọc theo hạng ghế: </label>
          <Select
            placeholder="Chọn hạng ghế"
            allowClear
            style={{ width: 150 }}
            value={seatClassFilter}
            onChange={(value) => {
              setSeatClassFilter(value);
              // Reset về page 1 khi filter
              setMeta((prev) => ({ ...prev, currentPage: 1 }));
              handleGetFlightSeat(
                `current=1&pageSize=${meta.itemsPerPage}&flight_id=${
                  flight.id
                }&sort=created_at-desc${value ? `&seat_class=${value}` : ""}`
              );
            }}
          >
            {flight?.seat_classes?.map((sc: any) => (
              <Select.Option key={sc.seat_class} value={sc.seat_class}>
                {sc.seat_class}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="flex gap-[10px]">
          {canCreate && (
            <Button
              type="primary"
              onClick={() => {
                setIsModalOpen(true);
                setDataInit({});
              }}
            >
              Thêm mới
            </Button>
          )}

          <ReloadOutlined
            onClick={() =>
              handleGetFlightSeat(
                `current=${meta.currentPage}&pageSize=${
                  meta.itemsPerPage
                }&flight_id=${flight.id}&sort=created_at-desc${
                  seatClassFilter ? `&seat_class=${seatClassFilter}` : ""
                }`
              )
            }
            className="text-[18px] px-[6px] cursor-pointer"
          />
        </div>
      </div>
      <div className="mt-[10px]">
        <ConfigProvider locale={vi_VN}>
          <Table
            scroll={{ x: true }}
            className="table-ele"
            loading={isLoading}
            pagination={{
              current: meta?.currentPage,
              pageSize: meta?.itemsPerPage,
              showSizeChanger: true,
              total: meta?.totalItems,
              showTotal: (total, range) => {
                return (
                  <div>
                    {" "}
                    {range[0]}-{range[1]} trên {total} bản ghi
                  </div>
                );
              },
            }}
            onChange={handleChange}
            columns={columns}
            dataSource={data} // Remove filter client-side
          />
        </ConfigProvider>
      </div>
      <ModalFlightSeatUpsert
        flight={flight}
        isModalOpen={isModalOpen}
        dataInit={dataInit}
        setDataInit={setDataInit}
        setIsModalOpen={setIsModalOpen}
        handleGetFlightSeat={handleGetFlightSeat}
        meta={meta}
      />
    </div>
  );
};

export default FlightSeatTable;

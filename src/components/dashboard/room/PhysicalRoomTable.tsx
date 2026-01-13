/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Popconfirm, Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import type { TableProps } from "antd";
import { callDeletePhysicalRoom, callFetchPhysicalRoom } from "@/config/api";
import { toast } from "react-toastify";
import vi_VN from "antd/locale/vi_VN";
import ModalPhysicalRoomUpsert from "./ModalPhysicalRoomUpsert";

interface IProps {
  room?: any | null;
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

const PhysicalRoomTable = (props: IProps) => {
  const { room, canCreate, canUpdate, canDelete } = props;

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

  const handleDeletePhysicalRoom = async (id: number | undefined) => {
    if (id) {
      const res: any = await callDeletePhysicalRoom(id);
      if (res?.isSuccess) {
        await handleGetPhysicalRoom(
          `current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&room_id=${room.id}&sort=created_at-desc`
        );
        toast.success("Xóa physical room thành công", {
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
      title: "Mã phòng",
      dataIndex: "code",
    },
    {
      title: "Tầng",
      dataIndex: "floor",
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
                    title={"Xác nhận xóa physical room"}
                    description={"Bạn chắc chắn muốn xóa physical room"}
                    onConfirm={() => handleDeletePhysicalRoom(record.id)}
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

  const handleGetPhysicalRoom = async (query: string) => {
    setIsLoading(true);
    try {
      const res: any = await callFetchPhysicalRoom(query);
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
    await handleGetPhysicalRoom(
      `current=${current}&pageSize=${pageSize}&room_id=${room.id}&sort=created_at-desc`
    );
  };

  useEffect(() => {
    if (room?.id) {
      handleGetPhysicalRoom(
        `current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&room_id=${room.id}&sort=created_at-desc`
      );
    }
  }, [room?.id]);

  return (
    <div>
      <h2 className="text-[16px] font-semibold">Danh sách các phòng vật lý</h2>
      <div className="flex items-center justify-end gap-[10px]">
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
            handleGetPhysicalRoom(
              `current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&room_id=${room.id}&sort=created_at-desc`
            )
          }
          className="text-[18px] px-[6px] cursor-pointer"
        />
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
            dataSource={data}
          />
        </ConfigProvider>
      </div>
      <ModalPhysicalRoomUpsert
        room={room}
        isModalOpen={isModalOpen}
        dataInit={dataInit}
        setDataInit={setDataInit}
        setIsModalOpen={setIsModalOpen}
        handleGetPhysicalRoom={handleGetPhysicalRoom}
        meta={meta}
      />
    </div>
  );
};

export default PhysicalRoomTable;

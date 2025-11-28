
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Popconfirm, Space, Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { DeleteOutlined, EditOutlined, ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { callDeleteRoomAmenity, callFetchRoomAmenity } from "@/config/api";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import ModalRoomAmenityUpsert from "./ModalRoomAmenityUpsert";

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

const RoomAmenityTable = (props: IProps) => {
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

    const handleDeleteRoomAmenity = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteRoomAmenity(id);
            if (res?.isSuccess) {
                await handleGetRoomAmenity(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&room_id=${room.id}&sort=created_at-desc`);
                toast.success("Xóa room amenity thành công", {
                    position: "bottom-right",
                });
            } else {
                toast.error("Có lỗi xảy ra", {
                    position: "bottom-right",
                });
            }
        }
    }

    const columns: TableProps<any>['columns'] = [
        {
            title: "ID",
            dataIndex: 'id',
        },
        {
            title: "Tên tiện nghi",
            dataIndex: 'name',
        },
        {
            title: "Ngày tạo",
            dataIndex: 'created_at',
            sorter: true,
            render: (_, record) => {
                return (
                    <>{dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        ...((canUpdate || canDelete) ? [{

            title: "Hành động",
            width: 50,
            render: (_: any, record: any) => (
                <Space>
                    {canUpdate && <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setIsModalOpen(true);
                            setDataInit(record);
                        }}
                    />}

                    {canDelete && <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa room amenity"}
                        description={"Bạn chắc chắn muốn xóa room amenity"}
                        onConfirm={() => handleDeleteRoomAmenity(record.id)}
                        okText={"Xác nhận"}
                        cancelText={"Hủy"}
                    >
                        <span style={{ cursor: "pointer", margin: "0 10px" }}>
                            <DeleteOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#ff4d4f',
                                }}
                            />
                        </span>
                    </Popconfirm>}


                </Space>
            ),

        }] : []),
    ];

    const handleGetRoomAmenity = async (query: string) => {
        setIsLoading(true);
        try {
            const res: any = await callFetchRoomAmenity(query);
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
        const { current, pageSize } = pagination

        await handleGetRoomAmenity(`current=${current}&pageSize=${pageSize}&room_id=${room.id}&sort=created_at-desc`);
    };

    useEffect(() => {
        if (room?.id) {
            handleGetRoomAmenity(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&room_id=${room.id}&sort=created_at-desc`);
        }
    }, [room?.id]);

    return (
        <div>
            <h2 className="text-[16px] font-semibold">Danh sách các tiện nghi</h2>
            <div className="flex items-center justify-end gap-[10px]">
                {canCreate && <Button
                    type="primary"
                    onClick={() => {
                        setIsModalOpen(true);
                        setDataInit({});
                    }}>
                    Thêm mới
                </Button>}

                <ReloadOutlined
                    onClick={() => handleGetRoomAmenity(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&room_id=${room.id}&sort=created_at-desc`)}
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
            <ModalRoomAmenityUpsert
                room={room}
                isModalOpen={isModalOpen}
                dataInit={dataInit}
                setDataInit={setDataInit}
                setIsModalOpen={setIsModalOpen}
                handleGetRoomAmenity={handleGetRoomAmenity}
                meta={meta}
            />
        </div>
    )
}

export default RoomAmenityTable
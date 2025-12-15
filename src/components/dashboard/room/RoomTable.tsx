
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigProvider, Table, Tag } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ReloadOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { callFetchRoomAdmin } from "@/config/api";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { formatCurrency } from "@/utils/formatCurrency";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalRoomDetail from "./ModalRoomDetail";

interface IProps {
    hotel?: any | null;
}

export interface IMeta {
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
}

const RoomTable = (props: IProps) => {
    const { hotel } = props;

    const [data, setData] = useState([]);
    const [meta, setMeta] = useState<IMeta>({
        currentPage: 1,
        itemsPerPage: 10,
        totalPages: 0,
        totalItems: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [dataInit, setDataInit] = useState({});

    const columns: TableProps<any>['columns'] = [
        {
            title: "ID",
            dataIndex: 'id',
        },
        {
            title: "Ảnh",
            dataIndex: 'image',
            render: (_, record) => {
                return (
                    <img src={`${import.meta.env.VITE_BE_URL}${record?.images?.[0]?.image}`} />
                )
            },
            width: 150
        },
        {
            title: 'Loại phòng',
            dataIndex: 'room_type',
            render: (_, record) => {
                return (
                    <div onClick={() => {
                        setDataInit(record)
                        setIsModalDetailOpen(true)
                    }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <div>
                            <p className="text-[18px] font-semibold">{`${record?.room_type}`}</p>
                            <p className="">Số giường: {`${record?.beds}`}</p>
                            <p className="">Diện tích: {`${record?.area_m2}`} m²</p>
                            <p className="">Giá mỗi đêm: {`${formatCurrency(record?.price_per_night)}`}đ</p>
                            {record.available ? <div>
                                <Tag color="green">Có sẵn</Tag>
                            </div> : <div>
                                <Tag color="red">Hết chỗ</Tag>
                            </div>}
                            {record?.has_promotion && <div className="mt-[4px]"><Tag color="#87d068">Đang khuyến mãi</Tag></div>}

                        </div>
                        <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
                            <HiOutlineCursorClick />
                            <span>Click để xem chi tiết</span>
                        </div>
                    </div>
                )
            },
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            render: (_, record) => {
                return (
                    <div className="line-clamp-6 w-[200px]">{record.description}</div>
                )
            },
        },
        {
            title: 'Không gian',
            dataIndex: 'space',
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <ul>
                            <li>- Tổng: {record?.total_rooms} phòng</li>
                            <li>- Khả dụng: {record?.available_rooms} phòng</li>
                            <li>- {record?.adults_capacity} người lớn</li>
                            <li>- {record?.children_capacity} trẻ em</li>
                        </ul>
                    </div>
                )
            },
        },
        {
            title: "Thời gian",
            dataIndex: 'created_at',
            sorter: true,
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <ul>
                            <li>- Ngày tạo: {dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</li>
                            <li>- Ngày bắt đầu: {dayjs(record.start_date).format('DD-MM-YYYY HH:mm:ss')}</li>
                            <li>- Ngày kết thúc: {dayjs(record.end_date).format('DD-MM-YYYY HH:mm:ss')}</li>
                        </ul>
                    </div>
                )
            },
        },
    ];

    const handleGetRoom = async (query: string) => {
        setIsLoading(true);
        try {
            const res: any = await callFetchRoomAdmin(query);
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

        await handleGetRoom(`current=${current}&pageSize=${pageSize}&hotel_id=${hotel.id}&sort=id-desc`);
    };

    useEffect(() => {
        if (hotel?.id) {
            handleGetRoom(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&hotel_id=${hotel.id}&sort=id-desc`);
        }
    }, [hotel?.id]);

    return (
        <div>
            <h2 className="text-[16px] font-semibold">Danh sách các phòng</h2>
            <div className="flex items-center justify-end gap-[10px]">
                <ReloadOutlined
                    onClick={() => handleGetRoom(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&hotel_id=${hotel.id}&sort=id-desc`)}
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
            <ModalRoomDetail
                room={dataInit}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    )
}

export default RoomTable
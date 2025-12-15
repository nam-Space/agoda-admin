/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, Popconfirm, Space, Tag } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteRoom } from "../../../config/api";
import DataTable from "../../antd/Table";
import { getImage } from "@/utils/imageUrl";
import { ROLE } from "@/constants/role";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/formatCurrency";
import { fetchRoom } from "@/redux/slice/roomSlide";
import ModalRoom from "./ModalRoom";
import ModalRoomDetail from "./ModalRoomDetail";
import { HiOutlineCursorClick } from "react-icons/hi";

export default function Room() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.room.isFetching);
    const meta = useAppSelector(state => state.room.meta);
    const rooms = useAppSelector(state => state.room.data);
    const dispatch = useAppDispatch();

    const handleDeleteRoom = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteRoom(id);
            if (res?.isSuccess) {
                toast.success("Xóa room thành công", {
                    position: "bottom-right",
                });
                reloadTable();
            } else {
                toast.error("Có lỗi xảy ra", {
                    position: "bottom-right",
                });
            }
        }
    }

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<any>[] = [
        {
            title: "ID",
            dataIndex: 'id',
            hideInSearch: true,
        },
        {
            title: "Ảnh",
            dataIndex: 'image',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <img src={`${import.meta.env.VITE_BE_URL}${record?.images?.[0]?.image}`} />
                )
            },
            hideInSearch: true,
            width: 120
        },
        {
            title: 'Loại phòng',
            dataIndex: 'room_type',
            sorter: true,
            render: (_text, record, _index, _action) => {
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
            title: 'Khách sạn',
            dataIndex: 'hotel',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.hotel?.thumbnail)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.hotel?.name}`}</p>
                        </div>
                    </div>
                )
            },
            width: 200
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="line-clamp-6 w-[200px]">{record.description}</div>
                )
            },
            width: 200
        },
        {
            title: 'Không gian',
            dataIndex: 'space',
            sorter: true,
            render: (_text, record, _index, _action) => {
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
            render: (_text, record, _index, _action) => {
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
            hideInSearch: true,
        },
        {

            title: "Hành động",
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setOpenModal(true);
                            setDataInit(entity);
                        }}
                    />

                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa phòng"}
                        description={"Bạn chắc chắn muốn xóa phòng"}
                        onConfirm={() => handleDeleteRoom(entity.id)}
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
                    </Popconfirm>
                </Space>
            ),

        },
    ];

    const buildQuery = (params: any, _sort: any, _filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`
        if (clone.name) {
            temp += `&name=${clone.name}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }
        if (user.role === ROLE.OWNER) {
            temp += `&owner_id=${user.id}`
        }

        temp += `&sort=id-desc`

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách room"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={rooms}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchRoom({ query }))
                }}
                scroll={{ x: true }}
                pagination={
                    {
                        current: meta.currentPage,
                        pageSize: meta.itemsPerPage,
                        showSizeChanger: true,
                        total: meta.totalItems,
                        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} bản ghi</div>) }
                    }
                }
                rowSelection={false}
                toolBarRender={(_action, _rows): any => {
                    return (
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => setOpenModal(true)}
                        >
                            <span>
                                Thêm mới
                            </span>
                        </Button>
                    );
                }}
            />
            <ModalRoom
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ModalRoomDetail room={dataInit} isModalOpen={isModalDetailOpen} setIsModalOpen={setIsModalDetailOpen} />
        </div>
    );
}

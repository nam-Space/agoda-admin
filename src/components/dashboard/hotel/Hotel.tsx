/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, message, notification, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteCity, callDeleteHotel } from "../../../config/api";
import DataTable from "../../antd/Table";
import { fetchCity } from "@/redux/slice/citySlide";
import { fetchHotel } from "@/redux/slice/hotelSlide";
import ModalHotel from "./ModalHotel";
import { getUserAvatar } from "@/utils/imageUrl";
export default function Hotel() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.hotel.isFetching);
    const meta = useAppSelector(state => state.hotel.meta);
    const hotels = useAppSelector(state => state.hotel.data);
    const dispatch = useAppDispatch();

    const handleDeleteHotel = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteHotel(id);
            if (res?.isSuccess) {
                message.success('Xóa hotel thành công');
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
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
            title: "Thành phố",
            dataIndex: 'city',
            sorter: true,
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div>{record?.city?.name}</div>
                )
            },
        },
        {
            title: "Ảnh",
            dataIndex: 'image',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <img src={`${import.meta.env.VITE_BE_URL}${record?.images?.[0]?.image}`} />
                )
            },
            hideInSearch: true,
            width: 150
        },
        {
            title: "Tên khách sạn",
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: 'Chủ khách sạn',
            dataIndex: 'owner',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    // <div className="line-clamp-6">{record?.owner?.first_name} {record?.owner?.last_name}</div>
                    record?.owner ? <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(record?.owner?.avatar)}
                            className="min-w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.owner?.first_name} ${record?.owner?.last_name}`}</p>
                            <p className="leading-[20px] text-[#929292]">{`@${record?.owner?.username}`}</p>
                        </div>
                    </div> : <div></div>
                )
            },
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'location',
            sorter: true,
            width: 150
        },
        {
            title: 'Vị trí',
            dataIndex: 'google-map',
            sorter: true,
            render: (text, record, index, action) => {
                const mapUrl = `https://maps.google.com/maps?q=${record.lat},${record.lng}&hl=vi&z=18&output=embed`;

                return (
                    <div>
                        <iframe
                            width="250"
                            height="200"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={mapUrl}
                            allowFullScreen
                            aria-hidden="false"
                            tabIndex={0}
                        ></iframe>
                    </div>
                )
            },
        },
        {
            title: 'Điểm',
            dataIndex: 'point',
            sorter: true,
        },
        {
            title: 'Sao trung bình',
            dataIndex: 'avg_star',
            sorter: true,
        },
        {
            title: "Ngày tạo",
            dataIndex: 'created_at',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</>
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
                        title={"Xác nhận xóa khách sạn"}
                        description={"Bạn chắc chắn muốn xóa khách sạn"}
                        onConfirm={() => handleDeleteHotel(entity.id)}
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

    const buildQuery = (params: any, sort: any, filter: any) => {
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

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách hotel"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={hotels}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchHotel({ query }))
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
            <ModalHotel
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}

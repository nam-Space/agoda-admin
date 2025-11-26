/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, notification, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import DataTable from "../../antd/Table";
import { getImage } from "@/utils/imageUrl";
import { toast } from "react-toastify";
import { callDeleteAircraft } from "@/config/api";
import { fetchAircraft } from "@/redux/slice/aircraftSlide";
import ModalAircraft from "./ModalAircraft";
import { AIRCRAFT_STATUS_VI } from "@/constants/airline";

export default function Aircraft() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.aircraft.isFetching);
    const meta = useAppSelector(state => state.aircraft.meta);
    const aircrafts = useAppSelector(state => state.aircraft.data);
    const dispatch = useAppDispatch();

    const handleDeleteAircraft = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteAircraft(id);
            if (res?.isSuccess) {
                toast.success("Xóa aircraft thành công", {
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
            title: "Mẫu",
            dataIndex: 'model',
            sorter: true,
        },
        {
            title: "Hãng hàng không",
            dataIndex: 'airline',
            sorter: true,
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.airline?.logo)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.airline?.name}`}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Số đăng ký",
            dataIndex: 'registration_number',
            sorter: true,
        },
        {
            title: "Tổng số ghế",
            dataIndex: 'total_seats',
            sorter: true,
        },
        {
            title: "Số ghế phổ thông",
            dataIndex: 'economy_seats',
            sorter: true,
        },
        {
            title: "Số ghế hạng thượng gia",
            dataIndex: 'business_seats',
            sorter: true,
        },
        {
            title: "Số ghế hạng nhất",
            dataIndex: 'first_class_seats',
            sorter: true,
        },
        {
            title: "Năm sản xuất",
            dataIndex: 'manufacture_year',
            sorter: true,
        },
        {
            title: "Trạng thái",
            dataIndex: 'is_active',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{AIRCRAFT_STATUS_VI[record.is_active]}</>
                )
            },
            hideInSearch: true,
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
                        title={"Xác nhận xóa aircraft"}
                        description={"Bạn chắc chắn muốn xóa aircraft"}
                        onConfirm={() => handleDeleteAircraft(entity.id)}
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
        if (clone.model) {
            temp += `&model=${clone.model}`
        }
        if (clone.registration_number) {
            temp += `&registration_number=${clone.registration_number}`
        }

        temp += `&sort=id-desc`

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách aircraft"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={aircrafts}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchAircraft({ query }))
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
            <ModalAircraft
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}

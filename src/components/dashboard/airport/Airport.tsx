/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Button, message, notification, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteAirport } from "../../../config/api";
import DataTable from "../../antd/Table";
import { fetchAirport } from "@/redux/slice/airportSlide";
import ModalAirport from "./ModalAirport";
import { toast } from "react-toastify";

export default function Airport() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.airport.isFetching);
    const meta = useAppSelector(state => state.airport.meta);
    const airports = useAppSelector(state => state.airport.data);
    const dispatch = useAppDispatch();

    const handleDeleteAirport = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteAirport(id);
            if (res?.isSuccess) {
                toast.success("Xóa airport thành công", {
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
            title: "Tên",
            dataIndex: 'name',
            sorter: true,
        },
        {
            title: "Mã",
            dataIndex: 'code',
            sorter: true,
        },
        {
            title: "Địa điểm",
            dataIndex: 'location',
            sorter: true,
        },
        {
            title: 'Thành phố',
            dataIndex: 'city',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div className="line-clamp-6">{record?.city?.name}</div>
                )
            },
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div className="line-clamp-6 w-[350px]">{record.description}</div>
                )
            },
            width: 400
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
                        title={"Xác nhận xóa airport"}
                        description={"Bạn chắc chắn muốn xóa airport"}
                        onConfirm={() => handleDeleteAirport(entity.id)}
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
        if (clone.location) {
            temp += `&location=${clone.location}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }

        temp += `&sort=id-desc`

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách airport"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={airports}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchAirport({ query }))
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
            <ModalAirport
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}

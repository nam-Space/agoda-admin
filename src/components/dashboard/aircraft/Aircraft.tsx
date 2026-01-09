/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Input, Popconfirm, Select, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import DataTable from "../../antd/Table";
import { getImage } from "@/utils/imageUrl";
import { toast } from "react-toastify";
import { callDeleteAircraft, callFetchAirline } from "@/config/api";
import { fetchAircraft } from "@/redux/slice/aircraftSlide";
import ModalAircraft from "./ModalAircraft";
import { AIRCRAFT_STATUS_VI } from "@/constants/airline";
import { ROLE } from "@/constants/role";
import _ from "lodash";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalAircraftDetail from "./ModalAircraftDetail";

interface IProps {
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export default function Aircraft(props: IProps) {
    const { canCreate, canUpdate, canDelete } = props
    const user = useAppSelector(state => state.account.user)
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.aircraft.isFetching);
    const meta = useAppSelector(state => state.aircraft.meta);
    const aircrafts = useAppSelector(state => state.aircraft.data);
    const dispatch = useAppDispatch();

    const [airlines, setAirlines] = useState([])

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

    const handleGetAirline = async (query: string) => {
        const res: any = await callFetchAirline(query)
        if (res.isSuccess) {
            setAirlines(res.data)
        }
    }

    useEffect(() => {
        if (user.role === ROLE.ADMIN || user.role === ROLE.MARKETING_MANAGER) {
            handleGetAirline(`current=1&pageSize=1000`)
        }
        else if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            handleGetAirline(`current=1&pageSize=1000&flight_operations_staff_id=${user.id}`)
        }
        else if (user.role === ROLE.AIRLINE_TICKETING_STAFF) {
            if (user.flight_operation_manager?.id) {
                handleGetAirline(`current=1&pageSize=1000&flight_operations_staff_id=${user.flight_operation_manager.id}`)
            }
        }
    }, [])

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<any>[] = [
        {
            title: "ID",
            dataIndex: 'id',
            hideInSearch: true,
            sorter: true,
        },
        {
            title: "Mẫu",
            dataIndex: 'model',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div onClick={() => {
                        setDataInit(record)
                        setIsModalDetailOpen(true)
                    }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <div>
                            <p className="leading-[20px]">{`${record?.model}`}</p>
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
            title: "Hãng hàng không",
            dataIndex: 'airline',
            render: (_text, record, _index, _action) => {
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
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Hãng hàng không"
                            allowClear
                            value={value.airline_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, airline_id: val }
                                ])
                            }
                            options={airlines.map((item: any) => ({
                                label: <div className="flex items-center gap-[10px]">
                                    <img
                                        src={getImage(item?.logo)}
                                        className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                    />
                                    <div>
                                        <p className="leading-[20px]">{`${item?.name}`}</p>
                                    </div>
                                </div>,
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8, height: 60 }}
                        />


                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => confirm()}
                            >
                                Tìm
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    clearFilters?.();
                                    confirm();
                                }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                );
            },
            onFilter: () => true, // bắt buộc để Antd không filter local
            hideInSearch: true
        },
        {
            title: "Số đăng ký",
            dataIndex: 'registration_number',
            sorter: true,
        },
        {
            title: "Ghế ngồi",
            dataIndex: 'seats',
            render: (_text, record, _index, _action) => {
                return (
                    <div>
                        <p className="leading-[20px]">- Tổng số ghế: {`${record?.total_seats}`}</p>
                        <p className="leading-[20px]">- Số ghế phổ thông: {`${record?.economy_seats}`}</p>
                        <p className="leading-[20px]">- Số ghế hạng thượng gia: {`${record?.business_seats}`}</p>
                        <p className="leading-[20px]">- Số ghế hạng nhất: {`${record?.first_class_seats}`}</p>
                    </div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Input
                            placeholder="Tổng số ghế từ"
                            type="number"
                            value={value.min_total_seats}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_total_seats: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Tổng số ghế đến"
                            type="number"
                            value={value.max_total_seats}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_total_seats: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Số ghế phổ thông từ"
                            type="number"
                            value={value.min_economy_seats}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_economy_seats: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Số ghế phổ thông đến"
                            type="number"
                            value={value.max_economy_seats}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_economy_seats: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Số ghế hạng thượng gia từ"
                            type="number"
                            value={value.min_business_seats}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_business_seats: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Số ghế hạng thượng gia đến"
                            type="number"
                            value={value.max_business_seats}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_business_seats: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Số ghế hạng nhất từ"
                            type="number"
                            value={value.min_first_class_seats}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_first_class_seats: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Số ghế hạng nhất đến"
                            type="number"
                            value={value.max_first_class_seats}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_first_class_seats: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => confirm()}
                            >
                                Tìm
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    clearFilters?.();
                                    confirm();
                                }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                );
            },
            onFilter: () => true, // bắt buộc để Antd không filter local
            hideInSearch: true
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
            render: (_text, record, _index, _action) => {
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
            render: (_text, record, _index, _action) => {
                return (
                    <>{dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
            hideInSearch: true,
        },
        ...((canUpdate || canDelete) ? [{
            title: "Hành động",
            hideInSearch: true,
            width: 50,
            render: (_value: any, entity: any, _index: any, _action: any) => (
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

        }] : [{}])
    ];

    const buildQuery = (params: any, _sort: any, _filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`
        if (_filter?.airline?.[0]?.airline_id) {
            temp += `&airline_id=${_filter?.airline?.[0]?.airline_id}`
        }
        if (_filter?.seats?.[0]?.min_total_seats) {
            temp += `&min_total_seats=${_filter?.seats?.[0]?.min_total_seats}`
        }
        if (_filter?.seats?.[0]?.max_total_seats) {
            temp += `&max_total_seats=${_filter?.seats?.[0]?.max_total_seats}`
        }
        if (_filter?.seats?.[0]?.min_economy_seats) {
            temp += `&min_economy_seats=${_filter?.seats?.[0]?.min_economy_seats}`
        }
        if (_filter?.seats?.[0]?.max_economy_seats) {
            temp += `&max_economy_seats=${_filter?.seats?.[0]?.max_economy_seats}`
        }
        if (_filter?.seats?.[0]?.min_business_seats) {
            temp += `&min_business_seats=${_filter?.seats?.[0]?.min_business_seats}`
        }
        if (_filter?.seats?.[0]?.max_business_seats) {
            temp += `&max_business_seats=${_filter?.seats?.[0]?.max_business_seats}`
        }
        if (_filter?.seats?.[0]?.min_first_class_seats) {
            temp += `&min_first_class_seats=${_filter?.seats?.[0]?.min_first_class_seats}`
        }
        if (_filter?.seats?.[0]?.max_first_class_seats) {
            temp += `&max_first_class_seats=${_filter?.seats?.[0]?.max_first_class_seats}`
        }
        if (clone.model) {
            temp += `&model=${clone.model}`
        }
        if (clone.registration_number) {
            temp += `&registration_number=${clone.registration_number}`
        }
        if (clone.manufacture_year) {
            temp += `&manufacture_year=${clone.manufacture_year}`
        }
        if (clone.is_active) {
            temp += `&is_active=${clone.is_active}`
        }

        if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            temp += `&flight_operations_staff_id=${user.id}`
        }
        else if (user.role === ROLE.AIRLINE_TICKETING_STAFF) {
            if (user.flight_operation_manager?.id) {
                temp += `&flight_operations_staff_id=${user.flight_operation_manager.id}`
            }
        }

        // sort
        if (_.isEmpty(_sort)) {
            temp += `&sort=id-desc`
        }
        else {
            Object.entries(_sort).map(([key, val]) => {
                temp += `&sort=${key}-${val === "ascend" ? "asc" : "desc"}`
            })
        }

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
                        canCreate ? <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => setOpenModal(true)}
                        >
                            <span>
                                Thêm mới
                            </span>
                        </Button> : null
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
            <ModalAircraftDetail
                aircraft={dataInit}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    );
}

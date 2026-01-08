/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Input, Popconfirm, Select, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import DataTable from "../../antd/Table";
import { getImage } from "@/utils/imageUrl";
import { toast } from "react-toastify";
import { callDeleteFlight, callFetchAircraft, callFetchAirline, callFetchAirport } from "@/config/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { fetchFlight } from "@/redux/slice/flightSlide";
import { BAGGAGE_INCLUDED_VI } from "@/constants/airline";
import ModalFlight from "./ModalFlight";
import dayjs from "dayjs";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalFlightDetail from "@/components/payment/flight/ModalFlightDetail";
import { ROLE } from "@/constants/role";
import _ from "lodash";

interface IProps {
    canCreate?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export default function Flight(props: IProps) {
    const { canCreate, canUpdate, canDelete } = props;
    const user = useAppSelector(state => state.account.user)
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.flight.isFetching);
    const meta = useAppSelector(state => state.flight.meta);
    const flights = useAppSelector(state => state.flight.data);
    const dispatch = useAppDispatch();

    const [airlines, setAirlines] = useState([])
    const [aircrafts, setAircrafts] = useState([])
    const [airports, setAirports] = useState([])

    const handleDeleteFlight = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteFlight(id);
            if (res?.isSuccess) {
                toast.success("Xóa flight thành công", {
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

    const handleGetAircraft = async (query: string) => {
        const res: any = await callFetchAircraft(query)
        if (res.isSuccess) {
            setAircrafts(res.data)
        }
    }

    const handleGetAirport = async (query: string) => {
        const res: any = await callFetchAirport(query)
        if (res.isSuccess) {
            setAirports(res.data)
        }
    }

    useEffect(() => {
        handleGetAirline(`current=1&pageSize=1000`)
        handleGetAircraft(`current=1&pageSize=1000`)
        handleGetAirport(`current=1&pageSize=1000`)
    }, [])


    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<any>[] = [
        {
            title: "ID",
            dataIndex: 'id',
            hideInSearch: true,
            sorter: true
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
                            onChange={async (val: any) => {
                                setSelectedKeys([
                                    { ...value, airline_id: val }
                                ])
                                if (val) {
                                    await handleGetAircraft(`current=1&pageSize=1000&airline_id=${val}`)
                                }
                                else {
                                    await handleGetAircraft(`current=1&pageSize=1000`)
                                }
                            }}
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
            title: "Máy bay",
            dataIndex: 'aircraft',
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <div>
                            <p className="leading-[20px]">{`${record?.aircraft?.model}`}</p>
                        </div>
                    </div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Máy bay"
                            allowClear
                            value={value.aircraft_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, aircraft_id: val }
                                ])
                            }
                            options={aircrafts.map((item: any) => ({
                                label: item.model,
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8 }}
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
            title: "Chuyến bay",
            dataIndex: 'flight',
            render: (_text, record, _index, _action) => {
                if (record.legs?.length === 0) return <div></div>

                const recordLegSorted = [...record.legs].sort((a: any, b: any) =>
                    new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime() // giảm dần
                );

                const firstLeg = recordLegSorted[0];
                const lastLeg = recordLegSorted[recordLegSorted.length - 1];

                return (
                    <div onClick={() => {
                        setDataInit(record)
                        setIsModalDetailOpen(true)
                    }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <div>
                            <div className="flex items-center gap-[6px]">
                                <img src={getImage(record?.airline?.logo)} alt={record?.airline?.name} className="w-[24px]" />
                                <p className="text-[12px] text-gray-500">{record?.airline?.name}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-base">{dayjs(firstLeg?.departure_time).format("HH:ss")} → {dayjs(lastLeg?.arrival_time).format("HH:ss")}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">{dayjs(firstLeg?.departure_time).format("DD/MM/YYYY")} - {dayjs(lastLeg?.arrival_time).format("DD/MM/YYYY")}</p>
                            </div>
                            <div className="flex items-center gap-[10px]">
                                <p className="font-semibold leading-[20px]">{`${firstLeg?.departure_airport?.name}`}</p>
                                →
                                <p className="font-semibold leading-[20px]">{`${lastLeg?.arrival_airport?.name}`}</p>
                            </div>
                        </div>
                        <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
                            <HiOutlineCursorClick />
                            <span>Click để xem chi tiết</span>
                        </div>
                    </div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Địa điểm xuất phát"
                            allowClear
                            value={value.departure_airport_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, departure_airport_id: val }
                                ])
                            }
                            options={airports.map((item: any) => ({
                                label: item.name,
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8 }}
                        />
                        <Select
                            placeholder="Địa điểm hạ cánh"
                            allowClear
                            value={value.arrival_airport_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, arrival_airport_id: val }
                                ])
                            }
                            options={airports.map((item: any) => ({
                                label: item.name,
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8 }}
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
            width: 200
        },
        {
            title: "Tổng thời gian",
            dataIndex: 'total_duration',
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {record.total_duration} phút
                    </div>
                )
            },
            sorter: true,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Input
                            placeholder="Tổng thời gian từ"
                            type="number"
                            value={value.min_total_duration}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_total_duration: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Tổng thời gian đến"
                            type="number"
                            value={value.max_total_duration}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_total_duration: e.target.value }
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
            title: "Bao gồm hành lý",
            dataIndex: 'baggage_included',
            hideInSearch: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {BAGGAGE_INCLUDED_VI[record.baggage_included]}
                    </div>
                )
            },
        },
        {
            title: "Số điểm dừng",
            dataIndex: 'stops',
            sorter: true,
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Input
                            placeholder="Số điểm dừng từ"
                            type="number"
                            value={value.min_stops}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_stops: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Số điểm dừng đến"
                            type="number"
                            value={value.max_stops}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_stops: e.target.value }
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
            title: "Giá tiền cơ sở",
            dataIndex: 'base_price',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {formatCurrency(record?.base_price)}đ
                    </div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Input
                            placeholder="Giá tiền cơ sở từ"
                            type="number"
                            value={value.min_base_price}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_base_price: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Giá tiền cơ sở đến"
                            type="number"
                            value={value.max_base_price}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_base_price: e.target.value }
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
            title: "Ngày tạo",
            dataIndex: 'created_at',
            sorter: true,
            render: (_text, record) => {
                return (
                    <>{dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
        },
        ...((canUpdate || canDelete) ? [{
            title: "Hành động",
            hideInSearch: true,
            width: 50,
            render: (_value: any, entity: any, _index: any, _action: any) => (
                <Space>
                    {canUpdate && <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setOpenModal(true);
                            setDataInit(entity);
                        }}
                    />}

                    {canDelete && <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa flight"}
                        description={"Bạn chắc chắn muốn xóa flight"}
                        onConfirm={() => handleDeleteFlight(entity.id)}
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

        if (_filter?.aircraft?.[0]?.aircraft_id) {
            temp += `&aircraft_id=${_filter?.aircraft?.[0]?.aircraft_id}`
        }

        if (_filter?.flight?.[0]?.departure_airport_id) {
            temp += `&departure_airport_id=${_filter?.flight?.[0]?.departure_airport_id}`
        }
        if (_filter?.flight?.[0]?.arrival_airport_id) {
            temp += `&arrival_airport_id=${_filter?.flight?.[0]?.arrival_airport_id}`
        }

        if (_filter?.total_duration?.[0]?.min_total_duration) {
            temp += `&min_total_duration=${_filter?.total_duration?.[0]?.min_total_duration}`
        }
        if (_filter?.total_duration?.[0]?.max_total_duration) {
            temp += `&max_total_duration=${_filter?.total_duration?.[0]?.max_total_duration}`
        }

        if (_filter?.stops?.[0]?.min_stops) {
            temp += `&min_stops=${_filter?.stops?.[0]?.min_stops}`
        }
        if (_filter?.stops?.[0]?.max_stops) {
            temp += `&max_stops=${_filter?.stops?.[0]?.max_stops}`
        }
        if (_filter?.base_price?.[0]?.min_base_price) {
            temp += `&min_base_price=${_filter?.base_price?.[0]?.min_base_price}`
        }
        if (_filter?.base_price?.[0]?.max_base_price) {
            temp += `&max_base_price=${_filter?.base_price?.[0]?.max_base_price}`
        }

        if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            temp += `&flight_operations_staff_id=${user.id}`
        }

        else if (user.role === ROLE.AIRLINE_TICKETING_STAFF) {
            temp += `&flight_operations_staff_id=${user.flight_operation_manager?.id}`
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
                headerTitle={"Danh sách flight"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={flights}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchFlight({ query }))
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
            <ModalFlight
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ModalFlightDetail
                flight={dataInit}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    );
}

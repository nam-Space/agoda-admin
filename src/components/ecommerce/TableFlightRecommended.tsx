/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callFetchFlight } from "@/config/api";
import { BAGGAGE_INCLUDED_VI } from "@/constants/airline";
import { useAppSelector } from "@/redux/hooks";
import { formatCurrency } from "@/utils/formatCurrency";
import { getImage } from "@/utils/imageUrl";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import DataTable from "../antd/Table";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalFlightDetail from "../payment/flight/ModalFlightDetail";
import { ROLE } from "@/constants/role";


const TableFlightRecommended = () => {
    const user = useAppSelector(state => state.account.user)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState<any>({});

    const tableRef = useRef<ActionType>(null);

    const [flights, setFlights] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [meta, setMeta] = useState({
        "totalItems": 0,
        "currentPage": 1,
        "itemsPerPage": 5,
        "totalPages": 1
    })

    const columns: ProColumns<any>[] = [
        {
            title: "ID",
            dataIndex: 'id',
            hideInSearch: true,
        },
        {
            title: "Hãng hàng không",
            dataIndex: 'airline',
            sorter: true,
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
            hideInSearch: true,
        },
        {
            title: "Máy bay",
            dataIndex: 'aircraft',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <div>
                            <p className="leading-[20px]">{`${record?.aircraft?.model}`}</p>
                        </div>
                    </div>
                )
            },
            hideInSearch: true,
        },
        {
            title: "Chuyến bay",
            dataIndex: 'flight',
            sorter: true,
            render: (_text, record, _index, _action) => {
                if (record.legs?.length === 0) return <div></div>

                const recordLegSorted = [...record.legs].sort((a: any, b: any) =>
                    new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime() // giảm dần
                );

                const firstLeg = recordLegSorted[0];
                const lastLeg = recordLegSorted[recordLegSorted.length - 1];

                return (
                    <div onClick={() => {
                        setSelectedFlight(record)
                        setIsModalOpen(true)
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
            hideInSearch: true,
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
        },
        {
            title: "Bao gồm hành lý",
            dataIndex: 'baggage_included',
            sorter: true,
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
            hideInSearch: true,
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

        if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            temp += `&flight_operations_staff_id=${user.id}`
        }
        else if (user.role === ROLE.AIRLINE_TICKETING_STAFF) {
            temp += `&flight_operations_staff_id=${user.flight_operation_manager?.id}`
        }

        temp += `&sort=id-desc`

        return temp;
    }

    const handleGetFlights = async (query: string) => {
        setIsLoading(true)
        const res: any = await callFetchFlight(query)
        setIsLoading(false)
        if (res.isSuccess) {
            setFlights(res.data)
            setMeta(res.meta)
        }
    }

    return (
        <div className='mt-3 border border-gray-200 dark:border-gray-800'>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách chuyến bay phổ biến"}
                rowKey="id"
                loading={isLoading}
                columns={columns}
                dataSource={flights}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    handleGetFlights(query)
                }}
                search={false}
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
            />
            <ModalFlightDetail
                flight={selectedFlight}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
            />
        </div>
    )
}

export default TableFlightRecommended
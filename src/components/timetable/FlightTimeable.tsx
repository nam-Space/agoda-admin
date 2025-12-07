/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import { ICitySelect } from "../ecommerce/MonthlySalesChart";
import { ROLE } from "@/constants/role";
import { getUserAvatar } from "@/utils/imageUrl";
import { callFetchAirline, callFetchFlight, callFetchUser } from "@/config/api";
import dayjs, { Dayjs } from "dayjs";
import { Calendar, CalendarProps, Popover, Tag } from "antd";
import { DebounceSelect } from "../antd/DebounceSelect";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalFlightDetail from "../payment/flight/ModalFlightDetail";


const FlightTimetable = () => {
    const user = useAppSelector(state => state.account.user)
    const [flights, setFlights] = useState([])
    const [airline, setAirline] = useState<ICitySelect>({
        label: "",
        value: 0,
        key: 0,
    });
    const [selectedFlight, setSelectedFlight] = useState({});
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const [flightOperationManager, setFlightOperationManager] = useState<ICitySelect>({
        label: user.role === ROLE.FLIGHT_OPERATION_STAFF ? <div className="flex items-center gap-[10px]">
            <img
                src={getUserAvatar(user.avatar)}
                className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
            />
            <div>
                <p className="leading-[20px]">{`${user.first_name} ${user.last_name}`}</p>
                <p className="leading-[20px] text-[#929292]">{`@${user.username}`}</p>
            </div>
        </div> : user.role === ROLE.AIRLINE_TICKETING_STAFF ? <div className="flex items-center gap-[10px]">
            <img
                src={getUserAvatar(user.flight_operation_manager?.avatar)}
                className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
            />
            <div>
                <p className="leading-[20px]">{`${user.flight_operation_manager?.first_name} ${user.flight_operation_manager?.last_name}`}</p>
                <p className="leading-[20px] text-[#929292]">{`@${user.flight_operation_manager?.username}`}</p>
            </div>
        </div> : "",
        value: user.role === ROLE.FLIGHT_OPERATION_STAFF ? user.id : (user.role === ROLE.AIRLINE_TICKETING_STAFF ? user.flight_operation_manager?.id : 0),
        key: user.role === ROLE.FLIGHT_OPERATION_STAFF ? user.id : (user.role === ROLE.AIRLINE_TICKETING_STAFF ? user.flight_operation_manager?.id : 0),
    });

    async function fetchFlightOperationManagerList(): Promise<ICitySelect[]> {
        let query = `&role=${ROLE.FLIGHT_OPERATION_STAFF}`
        if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            query = `&username=${user.username}`
        }
        if (user.role === ROLE.AIRLINE_TICKETING_STAFF) {
            query = `&username=${user.flight_operation_manager?.username}`
        }
        const res: any = await callFetchUser(`current=1&pageSize=1000${query}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label: <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(item.avatar)}
                            className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]">{`${item.first_name} ${item.last_name}`}</p>
                            <p className="leading-[20px] text-[#929292]">{`@${item.username}`}</p>
                        </div>
                    </div>,
                    value: item.id
                }
            })
            return temp;
        } else return [];
    }

    async function fetchAirlineList(): Promise<ICitySelect[]> {
        let query = ``
        if (flightOperationManager.value) {
            query = `&flight_operations_staff_id=${flightOperationManager.value}`
        }
        else if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            query = `&flight_operations_staff_id=${user.id}`
        }
        else if (user.role === ROLE.AIRLINE_TICKETING_STAFF) {
            query = `&flight_operations_staff_id=${user.flight_operation_manager?.id}`
        }
        const res: any = await callFetchAirline(`current=1&pageSize=1000${query}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label:
                        <div className="flex gap-3">
                            <div className="relative w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                    src={`${import.meta.env.VITE_BE_URL}${item?.logo}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                    {
                                        item?.name
                                    }
                                </h4>
                            </div>
                        </div>,
                    value: item.id
                }
            })
            return temp;
        } else return [];
    }

    const handleGetFlight = async (query: string) => {
        const res: any = await callFetchFlight(query)
        if (res.isSuccess) {
            setFlights(res.data)
        }
    }

    useEffect(() => {
        let bossQuery = ``
        let serviceQuery = ``

        if (flightOperationManager.value || airline.value) {
            if (flightOperationManager.value) {
                bossQuery = `&flight_operations_staff_id=${flightOperationManager.value}`
            }
            if (airline.value) {
                serviceQuery = `&airline_id=${airline.value}`
            }
            handleGetFlight(`current=1&pageSize=1000&${bossQuery}${serviceQuery}`)
        }
    }, [flightOperationManager, airline])

    const getListData = (value: Dayjs) => {
        const listFlights = flights.filter((flight: any) => {
            if (flight?.legs?.length) {
                const recordLegSorted = [...flight.legs].sort((a: any, b: any) =>
                    new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime() // giảm dần
                );
                const leg = dayjs(recordLegSorted[0].departure_time).format('YYYY-MM-DD') === value.format('YYYY-MM-DD')
                return leg
            }
            return false
        })
        return listFlights;
    };

    const getMonthData = (value: Dayjs) => {
        if (value.month() === 8) {
            return 1394;
        }
    };

    const monthCellRender = (value: Dayjs) => {
        const num = getMonthData(value);
        return num ? (
            <div className="notes-month">
                <section>{num}</section>
                <span>Backlog number</span>
            </div>
        ) : null;
    };

    const content = (listFlights: any) => {
        return (<div className="flex flex-col gap-[10px]">
            {listFlights.map((flight: any) => {
                const recordLegSorted = [...flight.legs].sort((a: any, b: any) =>
                    new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime() // giảm dần
                );
                const firstLeg = recordLegSorted[0];
                const lastLeg = recordLegSorted[recordLegSorted.length - 1];
                return (
                    <div onClick={() => {
                        setSelectedFlight(flight)
                        setIsModalDetailOpen(true)
                    }} className="flex flex-col gap-[10px]">
                        <div className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                            <div>
                                <div>
                                    <Tag color="#2db7f5">1 chiều</Tag>
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
                    </div>
                )
            })}
        </div>)
    }

    const dateCellRender = (value: Dayjs) => {
        const listFlights = getListData(value);
        if (listFlights.length === 0) return <div></div>
        return (
            <Popover content={content(listFlights)} title="Lịch trình">
                <div className="flex flex-col gap-[10px]">
                    {listFlights.map((flight: any) => {
                        const recordLegSorted = [...flight.legs].sort((a: any, b: any) =>
                            new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime() // giảm dần
                        );
                        const firstLeg = recordLegSorted[0];
                        const lastLeg = recordLegSorted[recordLegSorted.length - 1];
                        return (
                            <div onClick={() => {
                                setSelectedFlight(flight)
                                setIsModalDetailOpen(true)
                            }} className="flex flex-col gap-[10px]">
                                <div className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                                    <div>
                                        <div>
                                            <Tag color="#2db7f5">1 chiều</Tag>
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
                            </div>
                        )
                    })}
                </div>
            </Popover>
        );
    };

    const cellRender: CalendarProps<Dayjs>['cellRender'] = (current, info) => {
        if (info.type === 'date') {
            return dateCellRender(current);
        }
        if (info.type === 'month') {
            return monthCellRender(current);
        }
        return info.originNode;
    };

    return (
        <div>
            <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                    <label>Người vận hành chuyến bay</label>
                    <div className="mt-2">
                        <DebounceSelect
                            allowClear
                            defaultValue={flightOperationManager}
                            value={flightOperationManager}
                            placeholder={<span>Chọn người vận hành chuyến bay</span>}
                            fetchOptions={fetchFlightOperationManagerList}
                            onChange={(newValue: any) => {
                                setFlightOperationManager({
                                    key: newValue?.key,
                                    label: newValue?.label,
                                    value: newValue?.value
                                });
                            }}
                            disabled={user.role === ROLE.OWNER}
                            className="w-full !h-[60px]"
                        />
                    </div>
                </div>
                <div>
                    <label>Hãng hàng không</label>
                    <div className="mt-2">
                        <DebounceSelect
                            allowClear
                            defaultValue={airline}
                            value={airline}
                            placeholder={<span>Chọn hãng hàng không</span>}
                            fetchOptions={fetchAirlineList}
                            onChange={(newValue: any) => {
                                setAirline({
                                    key: newValue?.key,
                                    label: newValue?.label,
                                    value: newValue?.value
                                });
                            }}
                            className="w-full !h-[60px]"
                        />
                    </div>
                </div>
            </div>
            <div className="mt-3">
                <Calendar cellRender={cellRender} />
            </div>
            <ModalFlightDetail
                flight={selectedFlight}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    )
}

export default FlightTimetable
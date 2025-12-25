/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useRef, useState } from "react";
import { ICitySelect } from "../ecommerce/MonthlySalesChart";
import { ROLE } from "@/constants/role";
import { getUserAvatar } from "@/utils/imageUrl";
import { callFetchHotel, callFetchPayment, callFetchUser } from "@/config/api";
import { SERVICE_TYPE } from "@/constants/booking";
import dayjs, { Dayjs } from "dayjs";
import { Badge, Calendar, CalendarMode, CalendarProps, ConfigProvider, Popover, Spin } from "antd";
import { DebounceSelect } from "../antd/DebounceSelect";
import { PAYMENT_STATUS } from "@/constants/payment";
import { Star } from "lucide-react";
import vi_VN from 'antd/locale/vi_VN';

const RoomTimetable = () => {
    const user = useAppSelector(state => state.account.user)
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(false)
    const [owner, setOwner] = useState<ICitySelect>({
        label: user.role === ROLE.OWNER ? <div className="flex items-center gap-[10px]">
            <img
                src={getUserAvatar(user.avatar)}
                className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
            />
            <div>
                <p className="leading-[20px]">{`${user.first_name} ${user.last_name}`}</p>
                <p className="leading-[20px] text-[#929292]">{`@${user.username}`}</p>
            </div>
        </div> : user.role === ROLE.HOTEL_STAFF ? <div className="flex items-center gap-[10px]">
            <img
                src={getUserAvatar(user.manager?.avatar)}
                className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
            />
            <div>
                <p className="leading-[20px]">{`${user.manager?.first_name} ${user.manager?.last_name}`}</p>
                <p className="leading-[20px] text-[#929292]">{`@${user.manager?.username}`}</p>
            </div>
        </div> : "",
        value: user.role === ROLE.OWNER ? user.id : (user.role === ROLE.HOTEL_STAFF ? user.manager?.id : 0),
        key: user.role === ROLE.OWNER ? user.id : (user.role === ROLE.HOTEL_STAFF ? user.manager?.id : 0),
    });

    const [hotel, setHotel] = useState<ICitySelect>({
        label: "",
        value: 0,
        key: 0,
    });

    const minDayRef = useRef<Dayjs | null>(null);
    const maxDayRef = useRef<Dayjs | null>(null);

    const [firstVisibleDay, setFirstVisibleDay] = useState<Dayjs | null>(null);
    const [lastVisibleDay, setLastVisibleDay] = useState<Dayjs | null>(null);

    const resetRange = () => {
        minDayRef.current = null;
        maxDayRef.current = null;
    };

    const commitRange = () => {
        if (minDayRef.current && maxDayRef.current) {
            setFirstVisibleDay(minDayRef.current);
            setLastVisibleDay(maxDayRef.current);
        }
    };

    async function fetchOwnerList(): Promise<ICitySelect[]> {
        let query = `&role=${ROLE.OWNER}`
        if (user.role === ROLE.OWNER) {
            query = `&username=${user.username}`
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

    async function fetchHotelList(): Promise<ICitySelect[]> {
        let query = ``
        if (owner.value) {
            query = `&ownerId=${owner.value}`
        }
        else if (user.role === ROLE.OWNER) {
            query = `&ownerId=${user.id}`
        }
        else if (user.role === ROLE.HOTEL_STAFF) {
            if (user.manager?.id) {
                query = `&ownerId=${user.manager.id}`
            }
        }
        const res: any = await callFetchHotel(`current=1&pageSize=1000${query}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label: <div className="flex gap-3">
                        <div className="relative w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
                            <img
                                src={`${import.meta.env.VITE_BE_URL}${item?.images?.[0]?.image}`}
                                className="w-full h-full object-cover"
                                alt={item?.name}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                {item?.name}
                            </h4>
                            <div className="flex items-center gap-1 text-xs">
                                <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                                <span className="font-semibold">
                                    {item?.avg_star?.toFixed(1)}
                                </span>
                                <span className="text-gray-500">
                                    {item?.review_count || 0} lượt đánh giá
                                </span>
                            </div>
                        </div>
                    </div>,
                    value: item.id
                }
            })
            return temp;
        } else return [];
    }

    const handleGetPayment = async (query: string) => {
        setLoading(true)
        const res: any = await callFetchPayment(query)
        if (res.isSuccess) {
            setPayments(res.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        if ((owner.value || hotel.value) && firstVisibleDay && lastVisibleDay) {
            let bossQuery = ``
            let serviceQuery = ``
            if (owner.value) {
                bossQuery = `&owner_hotel_id=${owner.value}`
            }
            if (hotel.value) {
                serviceQuery = `&hotel_id=${hotel.value}`
            }
            handleGetPayment(`current=1&pageSize=1000${bossQuery}&booking__service_type=${SERVICE_TYPE.HOTEL}${serviceQuery}&status=${PAYMENT_STATUS.SUCCESS}&min_time_checkin_room=${firstVisibleDay.format("YYYY-MM-DD")}&max_time_checkin_room=${lastVisibleDay.format("YYYY-MM-DD")}&sort=created_at-asc`)
        }
    }, [owner, hotel, firstVisibleDay, lastVisibleDay])

    // 🔥 LẦN ĐẦU VÀO MÀN HÌNH
    useEffect(() => {
        // đợi Calendar render xong lần đầu
        setTimeout(() => {
            commitRange()
        });
    }, []);

    const getListData = (value: Dayjs) => {
        const listPayment = payments.filter(
            (payment: any) =>
                payment?.booking?.room_details?.[0]?.check_in &&
                (dayjs(payment.booking.room_details[0].check_in).format('YYYY-MM-DD') === value.format('YYYY-MM-DD'))
        )
        return listPayment;
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

    const content = (listPayment: any) => (
        <div className="flex flex-col gap-[10px]">
            {listPayment.map((payment: any) => (
                payment?.booking?.user?.id ? (<div>
                    <Badge status={"success"} className="font-semibold" text={`${dayjs(payment.booking.room_details[0].check_in).format("YYYY-MM-DD HH:mm")} → ${dayjs(payment.booking.room_details[0].check_out).format("YYYY-MM-DD HH:mm")}`} />
                    <div className="flex items-center gap-[20px] mt-[4px]">
                        <div className="flex items-center gap-[10px]">
                            <img
                                src={getUserAvatar(payment.booking.user.avatar)}
                                className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                            />
                            <div>
                                <p className="leading-[20px]">{`${payment.booking.user.first_name} ${payment.booking.user.last_name}`}</p>
                                <p className="leading-[20px] text-[#929292]">{`@${payment.booking.user.username}`}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                    src={`${import.meta.env.VITE_BE_URL}${payment.booking?.room_details?.[0]?.room?.images?.[0]?.image}`}
                                    className="w-full h-full object-cover"
                                    alt={payment.booking?.room_details?.[0]?.room?.room_type}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm text-gray-900 line-clamp-2 mb-1">
                                    <span className="font-semibold">{payment.booking?.room_details?.[0]?.room?.hotel?.name}</span>
                                    {" "}<span>({payment.booking?.room_details?.[0]?.room?.room_type})</span>
                                </h4>
                                <div className="flex items-center gap-1 text-xs">
                                    <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                                    <span className="font-semibold">
                                        {payment.booking?.room_details?.[0]?.room?.hotel?.avg_star?.toFixed(1)}
                                    </span>
                                    <span className="text-gray-500">
                                        {payment.booking?.room_details?.[0]?.room?.hotel?.review_count || 0} lượt đánh giá
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>) : (
                    <div>
                        <Badge status={"success"} className="font-semibold" text={`${dayjs(payment.booking.room_details[0].check_in).format("YYYY-MM-DD HH:mm")} → ${dayjs(payment.booking.room_details[0].check_out).format("YYYY-MM-DD HH:mm")}`} />
                        <div className="flex items-center gap-[20px] mt-[4px]">
                            <div className="flex items-center gap-[10px]">
                                <img
                                    src={getUserAvatar(payment.booking.guest_info.avatar)}
                                    className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                />
                                <div>
                                    <p className="leading-[20px]"><span className="font-bold">Khách ngoài:</span> {payment.booking.guest_info.full_name}</p>
                                    <p className="leading-[20px] text-[#929292]">{payment.booking.guest_info.email}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="relative w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
                                    <img
                                        src={`${import.meta.env.VITE_BE_URL}${payment.booking?.room_details?.[0]?.room?.images?.[0]?.image}`}
                                        className="w-full h-full object-cover"
                                        alt={payment.booking?.room_details?.[0]?.room?.room_type}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                        {payment.booking?.room_details?.[0]?.room?.hotel?.name}
                                    </h4>
                                    <div className="flex items-center gap-1 text-xs">
                                        <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                                        <span className="font-semibold">
                                            {payment.booking?.room_details?.[0]?.room?.hotel?.avg_star?.toFixed(1)}
                                        </span>
                                        <span className="text-gray-500">
                                            {payment.booking?.room_details?.[0]?.room?.hotel?.review_count || 0} lượt đánh giá
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            ))}
        </div>
    );

    const dateCellRender = (value: Dayjs) => {
        if (!minDayRef.current || value.isBefore(minDayRef.current)) {
            minDayRef.current = value;
        }

        if (!maxDayRef.current || value.isAfter(maxDayRef.current)) {
            maxDayRef.current = value;
        }

        const listPayment = getListData(value);
        return (
            <Popover content={content(listPayment)} title="Lịch trình">
                <div className="flex flex-col gap-[10px]">
                    {listPayment.map((payment: any) => (
                        payment?.booking?.user?.id ? (<div>
                            <Badge status={"success"} className="font-semibold" text={`${dayjs(payment.booking.room_details[0].check_in).format("YYYY-MM-DD HH:mm")} → ${dayjs(payment.booking.room_details[0].check_out).format("YYYY-MM-DD HH:mm")}`} />
                            <div className="flex items-center">
                                <div className="flex items-center gap-[10px]">
                                    <img
                                        src={getUserAvatar(payment.booking.user.avatar)}
                                        className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                    />
                                    <div>
                                        <p className="leading-[20px]">{`${payment.booking.user.first_name} ${payment.booking.user.last_name}`}</p>
                                        <p className="leading-[20px] text-[#929292]">{`@${payment.booking.user.username}`}</p>
                                    </div>
                                </div>
                            </div>

                        </div>) : (
                            <div>
                                <Badge status={"success"} className="font-semibold" text={`${dayjs(payment.booking.room_details[0].check_in).format("YYYY-MM-DD HH:mm")} → ${dayjs(payment.booking.room_details[0].check_out).format("YYYY-MM-DD HH:mm")}`} />
                                <div className="flex items-center gap-[10px]">
                                    <img
                                        src={getUserAvatar(payment.booking.guest_info.avatar)}
                                        className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                    />
                                    <div>
                                        <p className="leading-[20px]"><span className="font-bold">Khách ngoài:</span> {payment.booking.guest_info.full_name}</p>
                                        <p className="leading-[20px] text-[#929292]">{payment.booking.guest_info.email}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    ))}
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

    const handlePanelChange = (_date: Dayjs, selectInfo: CalendarMode) => {
        if (selectInfo === "month") {
            resetRange();

            // ⏱ đợi Calendar render xong
            setTimeout(() => {
                commitRange()
            });
        }
    }

    return (
        <div>
            <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                    <label>Chủ khách sạn</label>
                    <div className="mt-2">
                        <DebounceSelect
                            allowClear
                            defaultValue={owner}
                            value={owner}
                            placeholder={<span>Chọn chủ khách sạn</span>}
                            fetchOptions={fetchOwnerList}
                            onChange={(newValue: any) => {
                                setOwner({
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
                    <label>Khách sạn</label>
                    <div className="mt-2">
                        <DebounceSelect
                            allowClear
                            defaultValue={hotel}
                            value={hotel}
                            placeholder={<span>Chọn khách sạn</span>}
                            fetchOptions={fetchHotelList}
                            onChange={(newValue: any) => {
                                setHotel({
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
            <div className="mt-3 relative">
                <ConfigProvider locale={vi_VN}>
                    <Calendar
                        cellRender={cellRender}
                        disabledDate={() => loading}
                        className={`${loading ? 'opacity-50' : ''}`}
                        onPanelChange={handlePanelChange}
                    />
                </ConfigProvider>
                {loading && <Spin size="large" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
            </div>
        </div>
    )
}

export default RoomTimetable
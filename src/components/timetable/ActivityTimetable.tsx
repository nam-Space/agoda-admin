/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from "@/redux/hooks";
import { ICitySelect } from "../ecommerce/MonthlySalesChart";
import { useEffect, useState } from "react";
import { callFetchActivity, callFetchPayment, callFetchUser } from "@/config/api";
import { ROLE } from "@/constants/role";
import { getUserAvatar } from "@/utils/imageUrl";
import dayjs, { Dayjs } from "dayjs";
import { Calendar, CalendarProps, Popover } from "antd";
import { DebounceSelect } from "../antd/DebounceSelect";
import { SERVICE_TYPE } from "@/constants/booking";
import { PAYMENT_STATUS } from "@/constants/payment";
import { Star } from "lucide-react";


const ActivityTimetable = () => {
    const user = useAppSelector(state => state.account.user)
    const [payments, setPayments] = useState([])
    const [eventOrganizer, setEventOrganizer] = useState<ICitySelect>({
        label: user.role === ROLE.EVENT_ORGANIZER ? <div className="flex items-center gap-[10px]">
            <img
                src={getUserAvatar(user.avatar)}
                className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
            />
            <div>
                <p className="leading-[20px]">{`${user.first_name} ${user.last_name}`}</p>
                <p className="leading-[20px] text-[#929292]">{`@${user.username}`}</p>
            </div>
        </div> : "",
        value: user.role === ROLE.EVENT_ORGANIZER ? user.id : 0,
        key: user.role === ROLE.EVENT_ORGANIZER ? user.id : 0,
    });

    const [activity, setActivity] = useState<ICitySelect>({
        label: "",
        value: 0,
        key: 0,
    });

    async function fetchEventOrganizerList(): Promise<ICitySelect[]> {
        let query = `&role=${ROLE.EVENT_ORGANIZER}`
        if (user.role === ROLE.EVENT_ORGANIZER) {
            query += `&username=${user.username}`
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

    async function fetchActivityList(): Promise<ICitySelect[]> {
        let query = ``
        if (eventOrganizer.value) {
            query = `&event_organizer_id=${eventOrganizer.value}`
        }
        else if (user.role === ROLE.EVENT_ORGANIZER) {
            query = `&event_organizer_id=${user.id}`
        }
        const res: any = await callFetchActivity(`current=1&pageSize=1000${query}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label:
                        <div className="flex gap-3">
                            <div className="relative w-[40px] min-w-[40px] max-w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                    src={`${import.meta.env.VITE_BE_URL}${item?.images?.[0]?.image}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                    {
                                        item?.name
                                    }
                                </h4>
                                <div className="flex items-center gap-1 text-xs">
                                    <Star className="w-3 h-3 fill-orange-500 text-orange-500" />

                                    <span className="font-semibold">
                                        {
                                            item?.avg_star?.toFixed(1)
                                        }
                                    </span>
                                    <span className="text-gray-500">
                                        {
                                            item?.review_count || 0
                                        } lượt đánh giá
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
        const res: any = await callFetchPayment(query)
        if (res.isSuccess) {
            setPayments(res.data)
        }
    }

    useEffect(() => {
        let bossQuery = ``
        let serviceQuery = ``

        if (eventOrganizer.value || activity.value) {
            if (eventOrganizer.value) {
                bossQuery = `&event_organizer_activity_id=${eventOrganizer.value}`
            }
            if (activity.value) {
                serviceQuery = `&activity_id=${activity.value}`
            }
            handleGetPayment(`current=1&pageSize=1000${bossQuery}&booking__service_type=${SERVICE_TYPE.ACTIVITY}${serviceQuery}&status=${PAYMENT_STATUS.SUCCESS}&sort=created_at-asc`)
        }

    }, [eventOrganizer, activity])

    const getListData = (value: Dayjs) => {
        const listPayment = payments.filter(
            (payment: any) =>
                payment?.booking?.activity_date_detail?.[0]?.date_launch &&
                (dayjs(payment.booking.activity_date_detail[0].date_launch).format('YYYY-MM-DD') === value.format('YYYY-MM-DD'))
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
                payment?.booking?.user?.id ? (
                    <div className="flex items-center gap-[10px]">
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
                        →
                        <div className="flex gap-3">
                            <div className="relative w-[40px] min-w-[40px] max-w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                    src={`${import.meta.env.VITE_BE_URL}${payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.thumbnail}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                    {
                                        payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.name
                                    }
                                </h4>
                                <div className="flex items-center gap-1 text-xs">
                                    <Star className="w-3 h-3 fill-orange-500 text-orange-500" />

                                    <span className="font-semibold">
                                        {
                                            payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.avg_star?.toFixed(1)
                                        }
                                    </span>
                                    <span className="text-gray-500">
                                        {
                                            payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.review_count || 0
                                        } lượt đánh giá
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>) : (
                    <div className="flex items-center gap-[10px]">
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
                        →
                        <div className="flex gap-3">
                            <div className="relative w-[40px] min-w-[40px] max-w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                    src={`${import.meta.env.VITE_BE_URL}${payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.thumbnail}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                    {
                                        payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.name
                                    }
                                </h4>
                                <div className="flex items-center gap-1 text-xs">
                                    <Star className="w-3 h-3 fill-orange-500 text-orange-500" />

                                    <span className="font-semibold">
                                        {
                                            payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.avg_star?.toFixed(1)
                                        }
                                    </span>
                                    <span className="text-gray-500">
                                        {
                                            payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.review_count || 0
                                        } lượt đánh giá
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            ))}
        </div>
    );

    const dateCellRender = (value: Dayjs) => {
        const listPayment = getListData(value);
        return (
            <Popover content={content(listPayment)} title="Lịch trình">
                <div className="flex flex-col gap-[10px]">
                    {listPayment.map((payment: any) => (
                        payment?.booking?.user?.id ? (
                            <div className="flex items-center gap-[10px]">
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
                                →
                                <div className="flex gap-3">
                                    <div className="relative w-[40px] min-w-[40px] max-w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
                                        <img
                                            src={`${import.meta.env.VITE_BE_URL}${payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.thumbnail}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                            {
                                                payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.name
                                            }
                                        </h4>
                                        <div className="flex items-center gap-1 text-xs">
                                            <Star className="w-3 h-3 fill-orange-500 text-orange-500" />

                                            <span className="font-semibold">
                                                {
                                                    payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.avg_star?.toFixed(1)
                                                }
                                            </span>
                                            <span className="text-gray-500">
                                                {
                                                    payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.review_count || 0
                                                } lượt đánh giá
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>) : (
                            <div className="flex items-center gap-[10px]">
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
                                →
                                <div className="flex gap-3">
                                    <div className="relative w-[40px] min-w-[40px] max-w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
                                        <img
                                            src={`${import.meta.env.VITE_BE_URL}${payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.thumbnail}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
                                            {
                                                payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.name
                                            }
                                        </h4>
                                        <div className="flex items-center gap-1 text-xs">
                                            <Star className="w-3 h-3 fill-orange-500 text-orange-500" />

                                            <span className="font-semibold">
                                                {
                                                    payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.avg_star?.toFixed(1)
                                                }
                                            </span>
                                            <span className="text-gray-500">
                                                {
                                                    payment?.booking?.activity_date_detail?.[0]?.activity_date?.activity_package?.activity?.review_count || 0
                                                } lượt đánh giá
                                            </span>
                                        </div>
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

    return (
        <div>
            <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                    <label>Người tổ chức sự kiện</label>
                    <div className="mt-2">
                        <DebounceSelect
                            allowClear
                            defaultValue={eventOrganizer}
                            value={eventOrganizer}
                            placeholder={<span>Chọn người tổ chức sự kiện</span>}
                            fetchOptions={fetchEventOrganizerList}
                            onChange={(newValue: any) => {
                                setEventOrganizer({
                                    key: newValue?.key,
                                    label: newValue?.label,
                                    value: newValue?.value
                                });
                            }}
                            disabled={user.role === ROLE.EVENT_ORGANIZER}
                            className="w-full !h-[60px]"
                        />
                    </div>
                </div>
                <div>
                    <label>Hoạt động</label>
                    <div className="mt-2">
                        <DebounceSelect
                            allowClear
                            defaultValue={activity}
                            value={activity}
                            placeholder={<span>Chọn hoạt động</span>}
                            fetchOptions={fetchActivityList}
                            onChange={(newValue: any) => {
                                setActivity({
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
        </div>
    )
}

export default ActivityTimetable
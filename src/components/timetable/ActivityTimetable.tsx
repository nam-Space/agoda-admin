/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from "@/redux/hooks";
import { ICitySelect } from "../ecommerce/MonthlySalesChart";
import { useEffect, useState } from "react";
import { callFetchPayment, callFetchUser } from "@/config/api";
import { ROLE } from "@/constants/role";
import { getUserAvatar } from "@/utils/imageUrl";
import dayjs, { Dayjs } from "dayjs";
import { Calendar, CalendarProps, Popover } from "antd";
import { DebounceSelect } from "../antd/DebounceSelect";
import { SERVICE_TYPE } from "@/constants/booking";
import { PAYMENT_STATUS } from "@/constants/payment";


const ActivityTimetable = () => {
    const user = useAppSelector(state => state.account.user)
    const [payments, setPayments] = useState([])
    const [eventOrganizer, setEventOrganizer] = useState<ICitySelect>({
        label: user.role === ROLE.EVENT_ORGANIZER ? <div className="flex items-center gap-[10px]">
            <img
                src={getUserAvatar(user.avatar)}
                className="w-[40px] h-[40px] object-cover rounded-[50%]"
            />
            <div>
                <p className="leading-[20px]">{`${user.first_name} ${user.last_name}`}</p>
                <p className="leading-[20px] text-[#929292]">{`@${user.username}`}</p>
            </div>
        </div> : "",
        value: user.role === ROLE.EVENT_ORGANIZER ? user.id : 0,
        key: user.role === ROLE.EVENT_ORGANIZER ? user.id : 0,
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
                            className="w-[40px] h-[40px] object-cover rounded-[50%]"
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

    const handleGetPayment = async (query: string) => {
        const res: any = await callFetchPayment(query)
        if (res.isSuccess) {
            setPayments(res.data)
        }
    }

    useEffect(() => {
        if (eventOrganizer.value) {
            handleGetPayment(`current=1&pageSize=1000&event_organizer_activity_id=${eventOrganizer.value}&booking__service_type=${SERVICE_TYPE.ACTIVITY}&status=${PAYMENT_STATUS.SUCCESS}&sort=created_at-asc`)
        }
    }, [eventOrganizer])

    const getListData = (value: Dayjs) => {
        const listPayment = payments.filter(
            (payment: any) =>
                payment?.booking?.activity_date_detail?.date_launch &&
                (dayjs(payment.booking.activity_date_detail.date_launch).format('YYYY-MM-DD') === value.format('YYYY-MM-DD'))
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
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(payment.booking.user.avatar)}
                            className="w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]">{`${payment.booking.user.first_name} ${payment.booking.user.last_name}`}</p>
                            <p className="leading-[20px] text-[#929292]">{`@${payment.booking.user.username}`}</p>
                        </div>
                    </div>
                </div>) : (
                    <div>
                        {payment.booking.guest_info.full_name}
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
                        payment?.booking?.user?.id ? (<div>
                            <div className="flex items-center gap-[10px]">
                                <img
                                    src={getUserAvatar(payment.booking.user.avatar)}
                                    className="w-[40px] h-[40px] object-cover rounded-[50%]"
                                />
                                <div>
                                    <p className="leading-[20px]">{`${payment.booking.user.first_name} ${payment.booking.user.last_name}`}</p>
                                    <p className="leading-[20px] text-[#929292]">{`@${payment.booking.user.username}`}</p>
                                </div>
                            </div>
                        </div>) : (
                            <div>
                                {payment.booking.guest_info.full_name}
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

            </div>
            <div className="mt-3">
                <Calendar cellRender={cellRender} />
            </div>
        </div>
    )
}

export default ActivityTimetable
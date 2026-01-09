/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge, Calendar, CalendarMode, CalendarProps, ConfigProvider, Popover, Spin } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { ICitySelect } from "../ecommerce/MonthlySalesChart";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";
import { getUserAvatar } from "@/utils/imageUrl";
import { callFetchCar, callFetchPayment, callFetchUser } from "@/config/api";
import { DebounceSelect } from "../antd/DebounceSelect";
import { SERVICE_TYPE } from "@/constants/booking";
import { PAYMENT_STATUS } from "@/constants/payment";
import vi_VN from 'antd/locale/vi_VN';


const CarTimetable = () => {
    const user = useAppSelector(state => state.account.user)
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(false)
    const [driver, setDriver] = useState<ICitySelect>({
        label: user.role === ROLE.DRIVER ? <div className="flex items-center gap-[10px]">
            <img
                src={getUserAvatar(user.avatar)}
                className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
            />
            <div>
                <p className="leading-[20px]">{`${user.first_name} ${user.last_name}`}</p>
                <p className="leading-[20px] text-[#929292]">{`@${user.username}`}</p>
            </div>
        </div> : "",
        value: user.role === ROLE.DRIVER ? user.id : 0,
        key: user.role === ROLE.DRIVER ? user.id : 0,
    });

    const [car, setCar] = useState<ICitySelect>({
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

    async function fetchDriverList(): Promise<ICitySelect[]> {
        let query = `&role=${ROLE.DRIVER}`
        if (user.role === ROLE.DRIVER) {
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

    async function fetchCarList(): Promise<ICitySelect[]> {
        let query = ``
        if (driver.value) {
            query = `&user_id=${driver.value}`
        }
        else if (user.role === ROLE.DRIVER) {
            query = `&user_id=${user.id}`
        }
        const res: any = await callFetchCar(`current=1&pageSize=1000${query}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label:
                        <div className="flex gap-3">
                            <img
                                src={`${import.meta.env.VITE_BE_URL}${item?.image}`}
                                alt={item.name}
                                width={60}
                                height={40}
                                className="object-contain"
                            />
                            <div>
                                <div className="font-medium text-sm">
                                    {
                                        item
                                            ?.name
                                    }
                                </div>
                                <div className="text-xs text-gray-500">
                                    {
                                        item
                                            ?.description
                                    }
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
        if ((driver.value || car.value) && firstVisibleDay && lastVisibleDay) {
            let bossQuery = ``
            let serviceQuery = ``
            if (driver.value) {
                bossQuery = `&driver_id=${driver.value}`
            }
            if (car.value) {
                serviceQuery = `&car_id=${car.value}`
            }
            handleGetPayment(`current=1&pageSize=1000${bossQuery}&booking__service_type=${SERVICE_TYPE.CAR}${serviceQuery}&status=${PAYMENT_STATUS.SUCCESS}&min_pickup_datetime_car=${firstVisibleDay.format("YYYY-MM-DD")}&max_pickup_datetime_car=${lastVisibleDay.format("YYYY-MM-DD")}&sort=booking__car_detail__pickup_datetime-asc`)
        }
    }, [driver, car, firstVisibleDay, lastVisibleDay])

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
                payment?.booking?.car_detail?.[0]?.pickup_datetime &&
                (dayjs(payment.booking.car_detail[0].pickup_datetime).format('YYYY-MM-DD') === value.format('YYYY-MM-DD'))
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
                    <Badge status={"success"} className="font-semibold" text={`${dayjs(payment.booking.car_detail[0].pickup_datetime).format("HH:mm")} (${payment.booking.car_detail[0].pickup_location} → ${payment.booking.car_detail[0].dropoff_location})`} />
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
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                            <img
                                src={`${import.meta.env.VITE_BE_URL}${payment.booking?.car_detail?.[0]?.car?.image}`}
                                alt={
                                    payment.booking?.car_detail?.[0]?.car
                                        ?.name
                                }
                                width={60}
                                height={40}
                                className="object-contain"
                            />
                            <div>
                                <div className="font-medium text-sm">
                                    {
                                        payment.booking?.car_detail?.[0]?.car
                                            ?.name
                                    }
                                </div>
                                <div className="text-xs text-gray-500">
                                    {
                                        payment.booking?.car_detail?.[0]?.car
                                            ?.description
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>) : (
                    <div>
                        <Badge status={"success"} className="font-semibold" text={`${dayjs(payment.booking.car_detail[0].pickup_datetime).format("HH:mm")} (${payment.booking.car_detail[0].pickup_location} → ${payment.booking.car_detail[0].dropoff_location})`} />
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
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                                <img
                                    src={`${import.meta.env.VITE_BE_URL}${payment.booking?.car_detail?.[0]?.car?.image}`}
                                    alt={
                                        payment.booking?.car_detail?.[0]?.car
                                            ?.name
                                    }
                                    width={60}
                                    height={40}
                                    className="object-contain"
                                />
                                <div>
                                    <div className="font-medium text-sm">
                                        {
                                            payment.booking?.car_detail?.[0]?.car
                                                ?.name
                                        }
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {
                                            payment.booking?.car_detail?.[0]?.car
                                                ?.description
                                        }
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
                            <Badge status={"success"} className="font-semibold" text={`${dayjs(payment.booking.car_detail[0].pickup_datetime).format("HH:mm")} (${payment.booking.car_detail[0].pickup_location} → ${payment.booking.car_detail[0].dropoff_location})`} />
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
                        </div>) : (
                            <div>
                                <Badge status={"success"} className="font-semibold" text={`${dayjs(payment.booking.car_detail[0].pickup_datetime).format("HH:mm")} (${payment.booking.car_detail[0].pickup_location} → ${payment.booking.car_detail[0].dropoff_location})`} />
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
            <div className="mt-3 grid grid-cols-3 gap-4">
                <div>
                    <label>Tài xế</label>
                    <div className="mt-2">
                        <DebounceSelect
                            allowClear
                            defaultValue={driver}
                            value={driver}
                            placeholder={<span>Chọn tài xế</span>}
                            fetchOptions={fetchDriverList}
                            onChange={(newValue: any) => {
                                setDriver({
                                    key: newValue?.key,
                                    label: newValue?.label,
                                    value: newValue?.value
                                });
                            }}
                            disabled={user.role === ROLE.DRIVER}
                            className="w-full !h-[60px]"
                        />
                    </div>
                </div>
                <div>
                    <label>Xe taxi</label>
                    <div className="mt-2">
                        <DebounceSelect
                            allowClear
                            defaultValue={car}
                            value={car}
                            placeholder={<span>Chọn xe taxi</span>}
                            fetchOptions={fetchCarList}
                            onChange={(newValue: any) => {
                                setCar({
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

export default CarTimetable
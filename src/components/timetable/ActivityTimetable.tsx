/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAppSelector } from "@/redux/hooks";
import { ICitySelect } from "../ecommerce/MonthlySalesChart";
import { useEffect, useRef, useState } from "react";
import { callFetchActivity, callFetchActivityDate, callFetchActivityPackage, callFetchUser } from "@/config/api";
import { ROLE } from "@/constants/role";
import { getImage, getUserAvatar } from "@/utils/imageUrl";
import dayjs, { Dayjs } from "dayjs";
import { Calendar, CalendarMode, CalendarProps, ConfigProvider, Popover, Spin } from "antd";
import { DebounceSelect } from "../antd/DebounceSelect";
import { Star } from "lucide-react";
import ModalActivityDateDetail from "../dashboard/activity-date/ModalActivityDateDetail";
import vi_VN from 'antd/locale/vi_VN';

const ActivityTimetable = () => {
    const user = useAppSelector(state => state.account.user)
    const [activitiesDates, setActivitiesDates] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedActivityDate, setSelectedActivityDate] = useState({});
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
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

    const [activityPackage, setActivityPackage] = useState<ICitySelect>({
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

    async function fetchActivityPackageList(): Promise<ICitySelect[]> {
        let query = ``
        if (eventOrganizer.value) {
            query = `&event_organizer_id=${eventOrganizer.value}`
        }
        else if (user.role === ROLE.EVENT_ORGANIZER) {
            query = `&event_organizer_id=${user.id}`
        }

        if (activity.value) {
            query += `&activity_id=${activity.value}`
        }
        const res: any = await callFetchActivityPackage(`current=1&pageSize=1000${query}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label:
                        <div className="flex gap-3">
                            <h4>
                                {
                                    item?.name
                                }
                            </h4>
                        </div>,
                    value: item.id
                }
            })
            return temp;
        } else return [];
    }

    const handleGetActivityDate = async (query: string) => {
        setLoading(true)
        const res: any = await callFetchActivityDate(query)
        if (res.isSuccess) {
            setActivitiesDates(res.data)
        }
        setLoading(false)
    }

    useEffect(() => {
        if (eventOrganizer.value && activity.value && firstVisibleDay && lastVisibleDay) {
            let bossQuery = ``
            let serviceQuery = ``
            // if (eventOrganizer.value) {
            bossQuery = `&event_organizer_id=${eventOrganizer.value}`
            // }
            // if (activity.value) {
            serviceQuery = `&activity_id=${activity.value}`
            // }
            if (activityPackage.value) {
                serviceQuery += `&activity_package_id=${activityPackage.value}`
            }
            handleGetActivityDate(`current=1&pageSize=1000${bossQuery}${serviceQuery}&min_date_launch=${firstVisibleDay.format("YYYY-MM-DD")}&max_date_launch=${lastVisibleDay.format("YYYY-MM-DD")}`)
        }


    }, [eventOrganizer, activity, activityPackage, firstVisibleDay, lastVisibleDay])

    // 🔥 LẦN ĐẦU VÀO MÀN HÌNH
    useEffect(() => {
        // đợi Calendar render xong lần đầu
        setTimeout(() => {
            commitRange()
        });
    }, []);

    const getListData = (value: Dayjs) => {
        const listPayment = activitiesDates.filter(
            (activityDate: any) =>
                (dayjs(activityDate.date_launch).format('YYYY-MM-DD') === value.format('YYYY-MM-DD'))
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

    const content = (listActivitiesDates: any) => (
        <div className="grid grid-cols-4 gap-[10px] max-w-[900px]">
            {listActivitiesDates.map((activityDate: any, index: number) => (
                <div onClick={() => {
                    setSelectedActivityDate(activityDate)
                    setIsModalDetailOpen(true)
                }} key={index} className="p-[10px] rounded-[4px] flex items-center gap-[10px] hover:bg-gray-200 transition-all duration-150 cursor-pointer">
                    <img
                        src={getImage(activityDate?.activity_package?.activity?.thumbnail)}
                        className="w-[70px] h-[50px] object-cover"
                    />
                    <div>
                        {activityDate?.activity_package?.name}
                    </div>
                </div>
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
        const listActivitiesDates = getListData(value);
        return (
            <Popover content={content(listActivitiesDates)} title="Lịch trình">
                {listActivitiesDates.map((activityDate: any, index) => (
                    <div key={index} className="flex items-center gap-[10px]">
                        <img
                            src={getImage(activityDate?.activity_package?.activity?.thumbnail)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            {activityDate?.activity_package?.name}
                        </div>
                    </div>
                ))}
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
                <div>
                    <label>Gói của hoạt động</label>
                    <div className="mt-2">
                        <DebounceSelect
                            allowClear
                            defaultValue={activity}
                            value={activity}
                            placeholder={<span>Chọn gói của hoạt động</span>}
                            fetchOptions={fetchActivityPackageList}
                            onChange={(newValue: any) => {
                                setActivityPackage({
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
            <ModalActivityDateDetail
                activityDate={selectedActivityDate}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    )
}

export default ActivityTimetable
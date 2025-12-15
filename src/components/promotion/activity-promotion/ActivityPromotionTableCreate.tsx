/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, DatePicker, InputNumber, Popconfirm, Select, Space, Table } from "antd";
import { useEffect, useRef, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { nanoid } from 'nanoid';
import { callFetchActivity, callFetchActivityDate, callFetchActivityPackage } from "@/config/api";
import { getImage } from "@/utils/imageUrl";
import dayjs from "dayjs";
import type { Dayjs } from 'dayjs'
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
const { RangePicker } = DatePicker;

interface IProps {
    activityDateData?: any | null;
    setActivityDateData?: any | null;
}

const ActivityPromotionTableCreate = (props: IProps) => {
    const { activityDateData: data, setActivityDateData: setData } = props;

    const user = useAppSelector(state => state.account.user)

    const containerRef = useRef<HTMLDivElement>(null);
    const [activities, setActivities] = useState<any[]>([])
    const [activityPackages, setActivityPackages] = useState<any[]>([])
    const [activityDates, setActivityDates] = useState<any[]>([])

    const [form, setForm] = useState<any>({
        id: "",
        action: 'ADD',
        activity_id: 0,
        activity: {},
        activity_package_id: 0,
        activity_package: {},
        activity_date_id: 0,
        activity_date: {},
        discount_percent: 0,
        discount_amount: 0
    })

    const [listActivityDatesSelected, setListActivityDatesSelected] = useState<any[]>([])

    const handleDeleteActivityPromotion = async (record: any) => {
        setData((prev: any) => prev.filter((item: any) => item.id !== record.id));
    }


    const columns: TableProps<any>['columns'] = [
        {
            title: "STT",
            dataIndex: 'stt',
            render: (_text, _record, index) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {data.length - index}
                    </div>
                )
            },
        },
        {
            title: "Hoạt động",
            dataIndex: 'activity',
            render: (_text, record, _index) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.activity?.images?.[0]?.image)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.activity?.name}`}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Gói hoạt động",
            dataIndex: 'activity_package',
            render: (_text, record, _index) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <div>
                            <p className="leading-[20px]">{`${record?.activity_package?.name}`}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Ngày tổ chức",
            dataIndex: 'activity_date',
            render: (_text, record, _index) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <div>
                            <p className="leading-[20px]">{`${dayjs(record?.activity_date?.date_launch).format("YYYY-MM-DD")}`}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Phần trăm giảm giá",
            dataIndex: 'discount_percent',
            render: (_text, record, _index) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {record?.discount_percent}%
                    </div>
                )
            },
        },
        {
            title: "Tiền giảm giá",
            dataIndex: 'discount_amount',
            render: (_text, record, _index) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {record?.discount_amount}đ
                    </div>
                )
            },
        },
        {

            title: "Hành động",
            width: 50,
            render: (_text, record) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setForm({
                                ...record,
                                action: 'EDIT',
                                activity_date: record.activity_date,
                                activity_date_id: record.activity_date_id,
                            });
                            containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                    />

                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa activity promotion"}
                        description={"Bạn chắc chắn muốn xóa activity promotion"}
                        onConfirm={() => handleDeleteActivityPromotion(record)}
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

    const handleGetActivity = async (query: string) => {
        const res = await callFetchActivity(query)
        if (res.data) {
            setActivities(res.data)
        }
    }

    const handleGetActivityPackage = async (query: string) => {
        const res = await callFetchActivityPackage(query)
        if (res.data) {
            setActivityPackages(res.data)
        }
    }

    const handleGetActivityDate = async (query: string) => {
        const res = await callFetchActivityDate(query)
        if (res.data) {
            setActivityDates(res.data)
        }
    }

    useEffect(() => {
        let bossQuery = ``
        if (user.role === ROLE.EVENT_ORGANIZER) {
            bossQuery += `&event_organizer_id=${user.id}`
        }
        handleGetActivity(`current=1&pageSize=1000${bossQuery}`)
    }, [])

    useEffect(() => {
        if (form.activity_id) {
            handleGetActivityPackage(`current=1&pageSize=1000&activity_id=${form.activity_id}`)
        }
    }, [form.activity_id])

    useEffect(() => {
        if (form.activity_package_id) {
            handleGetActivityDate(`current=1&pageSize=1000&activity_package_id=${form.activity_package_id}&min_date_launch=${dayjs(Date.now()).format("YYYY-MM-DD")}`)
        }
    }, [form.activity_package_id])

    const handleSubmit = () => {
        if (!form.activity_id) {
            toast.error("Vui lòng chọn hoạt động", {
                position: "bottom-right",
            });
            return;
        }
        if (!form.activity_package_id) {
            toast.error("Vui lòng chọn gói hoạt động", {
                position: "bottom-right",
            });
            return;
        }

        if (form.action === "ADD") {
            if (!(listActivityDatesSelected?.length)) {
                toast.error("Vui lòng khoảng thời gian", {
                    position: "bottom-right",
                });
                return;
            }
            const reversedListActivityDates = [...listActivityDatesSelected].reverse();
            setData((prev: any) => [...reversedListActivityDates.map(activityDate => {
                return {
                    ...form,
                    id: nanoid(10),
                    activity_date_id: activityDate.id,
                    activity_date: activityDate,
                }
            }), ...prev])
            toast.success("Thêm khuyễn mãi hoạt động thành công", {
                position: "bottom-right",
            });
        }
        else {
            setData((prev: any) => prev.map((item: any) => {
                if (item.id === form.id) {
                    return form;
                }
                return item;
            }))
            toast.success("Sửa khuyễn mãi hoạt động thành công", {
                position: "bottom-right",
            });
        }

        setForm({
            id: "",
            action: 'ADD',
            activity_id: 0,
            activity: {},
            activity_package_id: 0,
            activity_package: {},
            activity_date_id: 0,
            activity_date: {},
            discount_percent: 0,
            discount_amount: 0
        })
        setListActivityDatesSelected([])
    }

    const handleDisableDate = (currentDate: Dayjs) => {
        const activity_date = activityDates.some(
            (activities_date) =>
                activities_date.date_launch.substring(0, 10) ===
                dayjs(currentDate).format("YYYY-MM-DD")
        );
        return !activity_date;
    };

    const handleChangeDateRangePicker = (dates: any) => {
        const startDate = dayjs(dates[0])
        const endDate = dayjs(dates[1])
        const newActDateList = activityDates.filter(item => {
            const launchDate = dayjs(item.date_launch);
            return launchDate.isSameOrAfter(startDate, "day") &&
                launchDate.isSameOrBefore(endDate, "day");
        });

        setListActivityDatesSelected(newActDateList)
    }

    return (
        <div ref={containerRef} className="p-[20px] rounded-[10px] bg-gray-100">
            <div className="border-b-[1px] border-gray-300 pb-[20px]">
                <h2 className="text-[16px] font-semibold">Hoạt động</h2>
                <div>
                    <div className="mt-[10px] grid grid-cols-2 gap-[20px]">
                        <div>
                            <label>Hoạt động</label>
                            <div className="mt-[4px]">
                                <ConfigProvider locale={vi_VN}>
                                    <Select
                                        style={{ width: '100%', height: 70 }}
                                        allowClear
                                        options={activities.map(item => {
                                            return {
                                                label: <div className="flex items-center gap-[10px]">
                                                    <img
                                                        src={getImage(item?.images?.[0]?.image)}
                                                        className="w-[70px] h-[50px] object-cover"
                                                    />
                                                    <div>
                                                        <p className="leading-[20px]">{`${item?.name}`}</p>
                                                    </div>
                                                </div>,
                                                value: item.id,
                                                data: item
                                            }
                                        })}
                                        onChange={(val, option: any) => {
                                            setForm({
                                                ...form,
                                                activity_id: val,
                                                activity: option.data,
                                                activity_package_id: 0,
                                                activity_package: {},
                                                activity_date_id: 0,
                                                activity_date: {},
                                            })
                                        }}
                                        value={form.activity_id || null}
                                        placeholder="Chọn hoạt động"
                                    />
                                </ConfigProvider>
                            </div>
                        </div>
                        <div>
                            <label>Gói hoạt động</label>
                            <div className="mt-[4px]">
                                <ConfigProvider locale={vi_VN}>
                                    <Select
                                        style={{ width: '100%' }}
                                        allowClear
                                        options={activityPackages.map(item => {
                                            return {
                                                label: <div className="flex items-center gap-[10px]">
                                                    <div>
                                                        <p className="leading-[20px]">{`${item?.name}`}</p>
                                                    </div>
                                                </div>,
                                                value: item.id,
                                                data: item
                                            }
                                        })}
                                        onChange={(val, option: any) => {
                                            setForm({
                                                ...form,
                                                activity_package_id: val,
                                                activity_package: option.data,
                                                activity_date_id: 0,
                                                activity_date: {},
                                            })
                                        }}
                                        value={form.activity_package_id || null}
                                        placeholder="Chọn gói hoạt động"
                                    />
                                </ConfigProvider>
                            </div>
                        </div>
                        <div>
                            <label>Ngày tổ chức</label>
                            <div className="mt-[4px]">
                                <ConfigProvider locale={vi_VN}>
                                    {form.action === 'ADD' ? <RangePicker
                                        disabledDate={(currentDate) => handleDisableDate(currentDate)}
                                        className="w-full"
                                        onChange={handleChangeDateRangePicker}
                                        value={listActivityDatesSelected.length ? [dayjs(listActivityDatesSelected[0].date_launch), dayjs(listActivityDatesSelected[listActivityDatesSelected.length - 1].date_launch)] : null}
                                    /> : <DatePicker
                                        disabled
                                        value={form.activity_date?.date_launch ? dayjs(form.activity_date.date_launch) : null}
                                        className="w-full"
                                    />}

                                </ConfigProvider>
                            </div>
                        </div>
                        <div>
                            <label>Phần trăm giảm giá</label>
                            <div className="mt-[4px]">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Nhập thông tin"
                                    formatter={(value) => `${value}%`}
                                    onChange={val => setForm({
                                        ...form,
                                        discount_percent: val as number
                                    })}
                                    value={form.discount_percent}
                                />
                            </div>
                        </div>
                        <div>
                            <label>Tiền giảm giá</label>
                            <div className="mt-[4px]">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Nhập thông tin"
                                    formatter={(value) => `${value}đ`}
                                    onChange={val => setForm({
                                        ...form,
                                        discount_amount: val as number
                                    })}
                                    value={form.discount_amount}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-[10px]">
                        <Button type="primary" style={{ backgroundColor: form.action === 'EDIT' ? '#6607f5' : '#068428' }} onClick={handleSubmit} icon={form.action === 'EDIT' ? <EditOutlined /> : <PlusOutlined />}>{form.action === 'EDIT' ? 'Sửa' : 'Thêm'} hoạt động</Button>
                    </div>
                </div>
            </div>
            <div className="mt-[20px]">
                <ConfigProvider locale={vi_VN}>
                    <Table
                        className="table-ele"
                        columns={columns}
                        dataSource={data}
                    />
                </ConfigProvider>
            </div>
        </div>
    )
}

export default ActivityPromotionTableCreate
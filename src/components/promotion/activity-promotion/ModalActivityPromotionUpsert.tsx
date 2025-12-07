
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callUpdateActivityPromotion, callFetchActivity, callFetchActivityPackage, callFetchActivityDate, callCreateBulkActivityPromotion } from "@/config/api";
import { ConfigProvider, DatePicker, InputNumber, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { getImage } from "@/utils/imageUrl";
import { IMeta } from "./ActivityPromotionTable";
import dayjs from "dayjs";
import type { Dayjs } from 'dayjs'
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

const { RangePicker } = DatePicker;

interface IProps {
    promotion?: any;
    isModalOpen: boolean;
    setIsModalOpen: any;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    handleGetActivityPromotion: any
    meta: IMeta
}

const ModalActivityPromotionUpsert = (props: IProps) => {
    const {
        promotion,
        isModalOpen,
        dataInit,
        setDataInit,
        setIsModalOpen,
        handleGetActivityPromotion,
        meta
    } = props;

    const user = useAppSelector(state => state.account.user)

    const [activities, setActivities] = useState<any[]>([])
    const [activityPackages, setActivityPackages] = useState<any[]>([])
    const [activityDates, setActivityDates] = useState<any[]>([])

    const [form, setForm] = useState<any>({
        promotion: 0,
        activity_id: 0,
        activity: {},
        activity_package_id: 0,
        activity_package: {},
        activity_date_id: 0,
        activity_date: {},
        discount_percent: 0,
        discount_amount: 0
    });

    const [listActivityDatesSelected, setListActivityDatesSelected] = useState<any[]>([])

    useEffect(() => {
        if (dataInit?.id, promotion?.id) {
            setForm({
                ...form,
                promotion: promotion.id,
                activity_id: dataInit?.activity_date?.activity_package?.activity?.id,
                activity: dataInit?.activity_date?.activity_package?.activity,
                activity_package_id: dataInit?.activity_date?.activity_package?.id,
                activity_package: dataInit?.activity_date?.activity_package,
                activity_date_id: dataInit?.activity_date?.id,
                activity_date: dataInit?.activity_date,
                discount_percent: dataInit?.discount_percent,
                discount_amount: dataInit?.discount_amount,
            });
        }

    }, [dataInit, promotion]);

    const handleSubmit = async () => {
        if (dataInit?.id) {
            const res: any = await callUpdateActivityPromotion(dataInit.id, {
                promotion: form.promotion,
                activity_date: form.activity_date_id,
                discount_percent: form.discount_percent,
                discount_amount: form.discount_amount,
            });
            if (res.isSuccess) {
                toast.success("Sửa activity promotion thành công!", {
                    position: "bottom-right",
                });
            }
        } else {
            const res: any = await callCreateBulkActivityPromotion({
                items: listActivityDatesSelected.map(activityDate => {
                    return {
                        promotion_id: form.promotion,
                        activity_date_id: activityDate.id,
                        discount_percent: form.discount_percent,
                        discount_amount: form.discount_amount,
                    }
                })
            });
            if (res.isSuccess) {
                toast.success("Thêm mới activity promotion thành công!", {
                    position: "bottom-right",
                });
            }
        }

        handleReset()
        await handleGetActivityPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`);
    };

    const handleReset = () => {
        setIsModalOpen(false);
        setDataInit({});
        setForm({
            promotion: 0,
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

    const handleGetActivity = async (query: string) => {
        const res: any = await callFetchActivity(query);
        if (res.isSuccess) {
            setActivities(res.data);
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
        handleGetActivity(`current=1&pageSize=1000${bossQuery}`);
    }, []);

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
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={`${dataInit?.id ? "Sửa" : "Tạo mới"} activity promotion`}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    handleReset()
                }}
                width={900}
            >
                <div className="mt-[10px] grid grid-cols-2 gap-[20px]">
                    <div>
                        <label>Hoạt động</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full !h-[70px]"
                                placeholder="Chọn hoạt động"
                                onChange={(val, option: any) => setForm({
                                    ...form,
                                    activity_id: val,
                                    activity: option.data,
                                    activity_package_id: 0,
                                    activity_package: {},
                                    activity_date_id: 0,
                                    activity_date: {},
                                })}
                                value={form.activity_id || null}
                                options={activities.map((item: any) => {
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
                                        data: item,
                                    }
                                })}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Gói hoạt động</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full"
                                placeholder="Chọn hoạt động"
                                onChange={(val, option: any) => setForm({
                                    ...form,
                                    activity_package_id: val,
                                    activity_package: option.data,
                                    activity_date_id: 0,
                                    activity_date: {},
                                })}
                                value={form.activity_package_id || null}
                                options={activityPackages.map((item: any) => {
                                    return {
                                        label: <div className="flex items-center gap-[10px]">
                                            <div>
                                                <p className="leading-[20px]">{`${item?.name}`}</p>
                                            </div>
                                        </div>,
                                        value: item.id,
                                        data: item,
                                    }
                                })}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Ngày tổ chức</label>
                        <div className="mt-[4px]">
                            <ConfigProvider locale={vi_VN}>
                                {!(dataInit?.id) ? <RangePicker
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
            </Modal>
        </ConfigProvider>
    );
};

export default ModalActivityPromotionUpsert;

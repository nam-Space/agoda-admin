/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callCreateSeatClassPricing, callUpdateSeatClassPricing } from "@/config/api";
import { ConfigProvider, Input, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { IMeta } from "../flight-leg/FlightLegTable";
import { HAS_FREE_DRINK_VI, HAS_LOUNGE_ACCESS_VI, HAS_MEAL_VI, HAS_POWER_OUTLET_VI, HAS_PRIORITY_BOARDING_VI, SEAT_CLASS, SEAT_CLASS_VI } from "@/constants/airline";


interface IProps {
    flight?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    handleGetSeatClassPricing: any
    meta: IMeta
}

const ModalSeatClassPricingUpsert = (props: IProps) => {
    const {
        flight,
        isModalOpen,
        dataInit,
        setDataInit,
        setIsModalOpen,
        handleGetSeatClassPricing,
        meta
    } = props;
    const [form, setForm] = useState({
        seat_class: SEAT_CLASS.economy,
        multiplier: 1,
        capacity: 0,
        available_seats: 0,
        has_meal: false,
        has_free_drink: false,
        has_lounge_access: false,
        has_power_outlet: false,
        has_priority_boarding: false,
    });

    useEffect(() => {
        if (dataInit?.id) {
            setForm({
                ...form,
                seat_class: dataInit.seat_class,
                multiplier: dataInit.multiplier,
                capacity: dataInit.capacity,
                available_seats: dataInit.available_seats,
                has_meal: dataInit.has_meal,
                has_free_drink: dataInit.has_free_drink,
                has_lounge_access: dataInit.has_lounge_access,
                has_power_outlet: dataInit.has_power_outlet,
                has_priority_boarding: dataInit.has_priority_boarding,
            });
        }

    }, [dataInit]);

    const handleSubmit = async () => {
        if (dataInit?.id) {
            const res: any = await callUpdateSeatClassPricing(dataInit.id, {
                flight_id: flight.id,
                seat_class: form.seat_class,
                multiplier: form.multiplier,
                capacity: form.capacity,
                available_seats: form.available_seats,
                has_meal: form.has_meal,
                has_free_drink: form.has_free_drink,
                has_lounge_access: form.has_lounge_access,
                has_power_outlet: form.has_power_outlet,
                has_priority_boarding: form.has_priority_boarding,
            });
            if (res.isSuccess) {
                toast.success("Sửa seat class thành công!", {
                    position: "bottom-right",
                });
            }
        } else {
            const res: any = await callCreateSeatClassPricing({
                flight_id: flight.id,
                seat_class: form.seat_class,
                multiplier: form.multiplier,
                capacity: form.capacity,
                available_seats: form.available_seats,
                has_meal: form.has_meal,
                has_free_drink: form.has_free_drink,
                has_lounge_access: form.has_lounge_access,
                has_power_outlet: form.has_power_outlet,
                has_priority_boarding: form.has_priority_boarding,
            });
            if (res.isSuccess) {
                toast.success("Thêm mới seat class thành công!", {
                    position: "bottom-right",
                });
            }
        }

        setIsModalOpen(false);
        setDataInit({});
        setForm({
            seat_class: SEAT_CLASS.economy,
            multiplier: 1,
            capacity: 0,
            available_seats: 0,
            has_meal: false,
            has_free_drink: false,
            has_lounge_access: false,
            has_power_outlet: false,
            has_priority_boarding: false,
        })
        await handleGetSeatClassPricing(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&flight_id=${flight.id}`);
    };

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={`${dataInit?.id ? "Sửa" : "Tạo mới"} seat class`}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalOpen(false);
                    setDataInit({});
                }}
            >
                <div className="mt-[10px] grid grid-cols-2 gap-[20px]">
                    <div>
                        <label>Loại ghế</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full"
                                placeholder="Chọn loại ghế"
                                onChange={(val) => {
                                    setForm({
                                        ...form,
                                        seat_class: val,
                                    })
                                }}
                                value={form.seat_class}
                                options={Object.entries(SEAT_CLASS_VI).map(([key, value]) => ({
                                    label: value,
                                    value: key,
                                }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Hệ số tiền</label>
                        <div className="mt-[4px]">
                            <Input
                                type="number"
                                className="w-full"
                                placeholder="Nhập thông tin"
                                onChange={(e) => {
                                    setForm({
                                        ...form,
                                        multiplier: +e.target.value,
                                    })
                                }}
                                value={form.multiplier}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Tổng số ghế</label>
                        <div className="mt-[4px]">
                            <Input
                                type="number"
                                className="w-full"
                                placeholder="Nhập thông tin"
                                onChange={(e) => {
                                    setForm({
                                        ...form,
                                        capacity: +e.target.value,
                                    })
                                }}
                                value={form.capacity}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Số ghế khả dụng</label>
                        <div className="mt-[4px]">
                            <Input
                                type="number"
                                className="w-full"
                                placeholder="Nhập thông tin"
                                onChange={(e) => {
                                    setForm({
                                        ...form,
                                        available_seats: +e.target.value,
                                    })
                                }}
                                value={form.available_seats}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Thức ăn</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full"
                                placeholder="Chọn trạng thái"
                                onChange={(val: string) => {
                                    setForm({
                                        ...form,
                                        has_meal: val as any,
                                    })
                                }}
                                value={form.has_meal.toString()}
                                options={Object.entries(HAS_MEAL_VI).map(([key, value]) => ({
                                    label: value,
                                    value: key,
                                }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Đồ uống miễn phí</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full"
                                placeholder="Chọn trạng thái"
                                onChange={(val: string) => {
                                    setForm({
                                        ...form,
                                        has_free_drink: val as any,
                                    })
                                }}
                                value={form.has_free_drink.toString()}
                                options={Object.entries(HAS_FREE_DRINK_VI).map(([key, value]) => ({
                                    label: value,
                                    value: key,
                                }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Phòng chờ</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full"
                                placeholder="Chọn trạng thái"
                                onChange={(val: string) => {
                                    setForm({
                                        ...form,
                                        has_lounge_access: val as any,
                                    })
                                }}
                                value={form.has_lounge_access.toString()}
                                options={Object.entries(HAS_LOUNGE_ACCESS_VI).map(([key, value]) => ({
                                    label: value,
                                    value: key,
                                }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Nguồn cắm điện</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full"
                                placeholder="Chọn trạng thái"
                                onChange={(val: string) => {
                                    setForm({
                                        ...form,
                                        has_power_outlet: val as any,
                                    })
                                }}
                                value={form.has_power_outlet.toString()}
                                options={Object.entries(HAS_POWER_OUTLET_VI).map(([key, value]) => ({
                                    label: value,
                                    value: key,
                                }))}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Ưu tiên</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full"
                                placeholder="Chọn trạng thái"
                                onChange={(val: string) => {
                                    setForm({
                                        ...form,
                                        has_priority_boarding: val as any,
                                    })
                                }}
                                value={form.has_priority_boarding.toString()}
                                options={Object.entries(HAS_PRIORITY_BOARDING_VI).map(([key, value]) => ({
                                    label: value,
                                    value: key,
                                }))}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalSeatClassPricingUpsert;

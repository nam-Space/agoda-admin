
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callUpdateFlightPromotion, callFetchFlight, callFetchAirline, callCreateFlightPromotion } from "@/config/api";
import { ConfigProvider, InputNumber, Modal, Select, Tag } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { getImage } from "@/utils/imageUrl";
import { IMeta } from "./FlightPromotionTable";
import dayjs from "dayjs";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

interface IProps {
    promotion?: any;
    isModalOpen: boolean;
    setIsModalOpen: any;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    handleGetFlightPromotion: any
    meta: IMeta
}

const ModalFlightPromotionUpsert = (props: IProps) => {
    const {
        promotion,
        isModalOpen,
        dataInit,
        setDataInit,
        setIsModalOpen,
        handleGetFlightPromotion,
        meta
    } = props;
    const user = useAppSelector(state => state.account.user)

    const [airlines, setAirlines] = useState<any>([])
    const [flights, setFlights] = useState<any>([])

    const [form, setForm] = useState({
        promotion: 0,
        airline_id: 0,
        airline: {},
        flight_id: 0,
        flight: {},
        discount_percent: 0,
        discount_amount: 0,
    });

    useEffect(() => {
        if (dataInit?.id, promotion?.id) {
            setForm({
                ...form,
                promotion: promotion.id,
                airline_id: dataInit?.flight?.airline?.id,
                airline: dataInit?.flight?.airline,
                flight_id: dataInit?.flight?.id,
                flight: dataInit?.flight,
                discount_percent: dataInit?.discount_percent,
                discount_amount: dataInit?.discount_amount,
            });
        }

    }, [dataInit, promotion]);

    const handleSubmit = async () => {
        if (dataInit?.id) {
            const res: any = await callUpdateFlightPromotion(dataInit.id, {
                promotion: form.promotion,
                flight: form.flight_id,
                discount_percent: form.discount_percent,
                discount_amount: form.discount_amount,
            });
            if (res.isSuccess) {
                toast.success("Sửa flight promotion thành công!", {
                    position: "bottom-right",
                });
            }
        } else {
            const res: any = await callCreateFlightPromotion({
                promotion: form.promotion,
                flight: form.flight_id,
                discount_percent: form.discount_percent,
                discount_amount: form.discount_amount,
            });
            if (res.isSuccess) {
                toast.success("Thêm mới flight promotion thành công!", {
                    position: "bottom-right",
                });
            }
        }

        handleReset()
        await handleGetFlightPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`);
    };

    const handleReset = () => {
        setIsModalOpen(false);
        setDataInit({});
        setForm({
            promotion: 0,
            airline_id: 0,
            airline: {},
            flight_id: 0,
            flight: {},
            discount_percent: 0,
            discount_amount: 0,
        })
    }

    const handleGetAirline = async (query: string) => {
        const res: any = await callFetchAirline(query);
        if (res.isSuccess) {
            setAirlines(res.data);
        }
    }

    const handleGetFlight = async (query: string) => {
        const res: any = await callFetchFlight(query);
        if (res.isSuccess) {
            setFlights(res.data);
        }
    }

    useEffect(() => {
        let bossQuery = ``
        if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            bossQuery += `&flight_operations_staff_id=${user.id}`
        }
        handleGetAirline(`current=1&pageSize=1000${bossQuery}`);
    }, []);

    useEffect(() => {
        if (form.airline_id) {
            handleGetFlight(`current=1&pageSize=1000&airline_id=${form.airline_id}`);
        }
    }, [form.airline_id]);

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={`${dataInit?.id ? "Sửa" : "Tạo mới"} flight promotion`}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    handleReset()
                }}
                width={900}
            >
                <div className="mt-[10px] grid grid-cols-2 gap-[20px]">
                    <div>
                        <label>Hãng hàng không</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full !h-[70px]"
                                placeholder="Chọn hãng hàng không"
                                onChange={(val, option: any) => setForm({
                                    ...form,
                                    airline_id: val,
                                    airline: option.data,
                                    flight_id: 0,
                                    flight: {}
                                })}
                                value={form.airline_id || null}
                                options={airlines.map((item: any) => {
                                    return {
                                        label: <div className="flex items-center gap-[10px]">
                                            <img
                                                src={getImage(item?.logo)}
                                                className="w-[70px] h-[50px] object-cover"
                                            />
                                            <div>
                                                <p className="leading-[20px]">{`${item.name}`}</p>
                                            </div>
                                        </div>,
                                        value: item.id as number,
                                        data: item
                                    }
                                })}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Chuyến bay</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full !h-[120px]"
                                placeholder="Chọn chuyến bay"
                                onChange={(val, option: any) => setForm({
                                    ...form,
                                    flight_id: val,
                                    flight: option.data
                                })}
                                value={form.flight_id || null}
                                options={flights.map((item: any) => {
                                    const recordLegSorted = [...item.legs].sort((a: any, b: any) =>
                                        new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime() // giảm dần
                                    );

                                    const firstLeg = recordLegSorted[0];
                                    const lastLeg = recordLegSorted[recordLegSorted.length - 1];

                                    return {
                                        label: <div className="p-[10px] rounded-[10px] cursor-pointer">
                                            <div>
                                                <div>
                                                    <Tag color="#87d068">Khứ hồi</Tag>
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
                                        </div>,
                                        value: item.id as number,
                                        data: item
                                    }
                                })}
                            />
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

export default ModalFlightPromotionUpsert;

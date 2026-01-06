/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callCreateFlightLeg, callFetchAirport, callUpdateFlightLeg } from "@/config/api";
import { ConfigProvider, DatePicker, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { nanoid } from 'nanoid';
import dayjs from "dayjs";
import { IMeta } from "./FlightLegTable";


const { RangePicker } = DatePicker;

interface IProps {
    flight?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    handleGetFlightLeg: any
    meta: IMeta
}

const ModalFlightLegUpsert = (props: IProps) => {
    const {
        flight,
        isModalOpen,
        dataInit,
        setDataInit,
        setIsModalOpen,
        handleGetFlightLeg,
        meta
    } = props;
    const [form, setForm] = useState({
        flight_code: "",
        departure_time: "",
        arrival_time: "",
        departure_airport_id: null,
        arrival_airport_id: null,
        departure_airport_name: "",
        arrival_airport_name: "",
    });
    const [airports, setAirports] = useState([]);

    useEffect(() => {
        if (dataInit?.id) {
            setForm({
                ...form,
                flight_code: dataInit.flight_code,
                departure_time: dataInit.departure_time,
                arrival_time: dataInit.arrival_time,
                departure_airport_id: dataInit.departure_airport?.id,
                arrival_airport_id: dataInit.arrival_airport?.id,
                departure_airport_name: dataInit.departure_airport?.name,
                arrival_airport_name: dataInit.arrival_airport?.name,
            });
        }

    }, [dataInit]);

    const handleSubmit = async () => {
        if (dataInit?.id) {
            const res: any = await callUpdateFlightLeg(dataInit.id, {
                flight_id: flight.id,
                flight_code: form.flight_code,
                departure_time: form.departure_time,
                arrival_time: form.arrival_time,
                departure_airport_id: form.departure_airport_id,
                arrival_airport_id: form.arrival_airport_id,
            });
            if (res.isSuccess) {
                toast.success("Sửa flight leg thành công!", {
                    position: "bottom-right",
                });
            }
        } else {
            const res: any = await callCreateFlightLeg({
                flight_id: flight.id,
                flight_code: nanoid(10),
                departure_time: form.departure_time,
                arrival_time: form.arrival_time,
                departure_airport_id: form.departure_airport_id,
                arrival_airport_id: form.arrival_airport_id,
            });
            if (res.isSuccess) {
                toast.success("Thêm mới flight leg thành công!", {
                    position: "bottom-right",
                });
            }
        }

        setIsModalOpen(false);
        setDataInit({});
        setForm({
            flight_code: "",
            departure_time: "",
            arrival_time: "",
            departure_airport_id: null,
            arrival_airport_id: null,
            departure_airport_name: "",
            arrival_airport_name: "",
        })
        await handleGetFlightLeg(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&flight_id=${flight.id}&sort=departure_time-desc`);
    };

    const handleGetAirport = async (query: string) => {
        const res: any = await callFetchAirport(query);
        if (res.isSuccess) {
            setAirports(res.data);
        }
    }


    useEffect(() => {
        handleGetAirport(`current=1&pageSize=1000`);
    }, []);

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={`${dataInit?.id ? "Sửa" : "Tạo mới"} flight leg`}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalOpen(false);
                    setDataInit({});
                }}
            >
                <div className="mt-[10px] grid grid-cols-2 gap-[20px]">
                    <div>
                        <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Địa điểm khởi hành</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full"
                                placeholder="Chọn sân bay"
                                onChange={(val, option: any) => setForm({
                                    ...form,
                                    departure_airport_id: val,
                                    departure_airport_name: option.label
                                })}
                                value={form.departure_airport_id}
                                options={airports.map((airport: any) => {
                                    return {
                                        value: airport.id,
                                        label: airport.name,
                                    }
                                })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Địa điểm hạ cánh</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full"
                                placeholder="Chọn sân bay"
                                onChange={(val, option: any) => {
                                    setForm({
                                        ...form,
                                        arrival_airport_id: val,
                                        arrival_airport_name: option.label,
                                    })
                                }}
                                value={form.arrival_airport_id}
                                options={airports.map((airport: any) => {
                                    return {
                                        value: airport.id,
                                        label: airport.name,
                                    }
                                })}
                            />
                        </div>
                    </div>
                    <div className="col-start-1 col-end-3">
                        <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Thời gian khởi hành → Thời gian hạ cánh</label>
                        <div className="mt-[4px]">
                            <ConfigProvider locale={vi_VN}>
                                <RangePicker
                                    showTime
                                    onChange={(dates: any, _dateStrings: [string, string]) => {
                                        if (!dates) {
                                            setForm({
                                                ...form,
                                                departure_time: "",
                                                arrival_time: "",
                                            });
                                            return;
                                        }
                                        setForm({
                                            ...form,
                                            departure_time: dates[0].format("YYYY-MM-DD HH:mm:ss"),
                                            arrival_time: dates[1].format("YYYY-MM-DD HH:mm:ss"),
                                        });
                                    }}
                                    value={form.departure_time && form.arrival_time
                                        ? [dayjs(form.departure_time), dayjs(form.arrival_time)]
                                        : null}
                                    className="w-full"
                                />
                            </ConfigProvider>
                        </div>
                    </div>

                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalFlightLegUpsert;

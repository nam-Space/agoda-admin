/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, DatePicker, Popconfirm, Select, Space, Table } from "antd";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { callFetchAirport } from "@/config/api";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { nanoid } from 'nanoid';

const { RangePicker } = DatePicker;

interface IProps {
    legsData?: any | null;
    setLegsData?: any | null;
}

const FlightLegTableCreate = (props: IProps) => {
    const { legsData: data, setLegsData: setData } = props;
    const containerRef = useRef<HTMLDivElement>(null);

    const [airports, setAirports] = useState([]);

    const [form, setForm] = useState({
        flight_code: "",
        action: 'ADD',
        departure_time: "",
        arrival_time: "",
        departure_airport_id: null,
        arrival_airport_id: null,
        departure_airport_name: "",
        arrival_airport_name: "",
    })

    const handleDeleteFlightLeg = async (record: any) => {
        setData((prev: any) => prev.filter((item: any) => item.flight_code !== record.flight_code));
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
            title: "Mã chuyến bay",
            dataIndex: 'flight_code',
        },
        {
            title: "Thời gian khởi hành",
            dataIndex: 'departure_time',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {dayjs(record.departure_time).format("YYYY-MM-DD HH:mm:ss")}
                    </div>
                )
            },
        },
        {
            title: "Thời gian hạ cánh",
            dataIndex: 'arrival_time',
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {dayjs(record.arrival_time).format("YYYY-MM-DD HH:mm:ss")}
                    </div>
                )
            },
        },
        {
            title: "Tổng thời gian",
            dataIndex: 'duration_minutes',
            render: (_text, record) => {
                const start = dayjs(record.departure_time);
                const end = dayjs(record.arrival_time);
                return (
                    <div className="flex items-center gap-[10px]">
                        {end.diff(start, "minute")} phút
                    </div>
                )
            },
        },
        {
            title: "Địa điểm khởi hành",
            dataIndex: 'departure_airport_name',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <div>
                            <p className="leading-[20px]">{`${record?.departure_airport_name}`}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Địa điểm hạ cánh",
            dataIndex: 'arrival_airport_name',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <div>
                            <p className="leading-[20px]">{`${record?.arrival_airport_name}`}</p>
                        </div>
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
                            });
                            containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                    />

                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa flight leg"}
                        description={"Bạn chắc chắn muốn xóa flight leg"}
                        onConfirm={() => handleDeleteFlightLeg(record)}
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

    const handleGetAirport = async (query: string) => {
        const res: any = await callFetchAirport(query);
        if (res.isSuccess) {
            setAirports(res.data);
        }
    }

    const handleSubmit = () => {
        if (!form.departure_airport_id || !form.arrival_airport_id) {
            toast.error("Vui lòng chọn đầy đủ sân bay", {
                position: "bottom-right",
            });
            return;
        }
        if (!form.departure_time || !form.arrival_time) {
            toast.error("Vui lòng chọn đầy đủ thời gian", {
                position: "bottom-right",
            });
            return;
        }
        if (form.action === "ADD") {
            setData((prev: any) => [{
                ...form,
                flight_code: nanoid(10)
            }, ...prev])
            toast.success("Thêm trạm dừng thành công", {
                position: "bottom-right",
            });
        }
        else {
            setData((prev: any) => prev.map((item: any) => {
                if (item.flight_code === form.flight_code) {
                    return form;
                }
                return item;
            }))
            toast.success("Sửa trạm dừng thành công", {
                position: "bottom-right",
            });
        }

        setForm({
            action: 'ADD',
            flight_code: "",
            departure_time: "",
            arrival_time: "",
            departure_airport_id: null,
            arrival_airport_id: null,
            departure_airport_name: "",
            arrival_airport_name: "",
        })
    }

    useEffect(() => {
        handleGetAirport(`current=1&pageSize=1000`);
    }, []);


    return (
        <div ref={containerRef} className="p-[20px] rounded-[10px] bg-gray-100">
            <div className="border-b-[1px] border-gray-300 pb-[20px]">
                <h2 className="text-[16px] font-semibold">Trạm dừng</h2>
                <div>
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
                        <div>
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
                    <div className="flex justify-end mt-[10px]">
                        <Button type="primary" style={{ backgroundColor: form.action === 'EDIT' ? '#6607f5' : '#068428' }} onClick={handleSubmit} icon={form.action === 'EDIT' ? <EditOutlined /> : <PlusOutlined />}>{form.action === 'EDIT' ? 'Sửa' : 'Thêm'} trạm dừng</Button>
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

export default FlightLegTableCreate
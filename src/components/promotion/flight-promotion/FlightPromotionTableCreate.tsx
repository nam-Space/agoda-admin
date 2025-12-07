/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, InputNumber, Popconfirm, Select, Space, Table, Tag } from "antd";
import { useEffect, useRef, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { nanoid } from 'nanoid';
import { callFetchAirline, callFetchFlight } from "@/config/api";
import { getImage } from "@/utils/imageUrl";
import dayjs from "dayjs";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalFlightDetail from "@/components/payment/flight/ModalFlightDetail";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";


interface IProps {
    flightData?: any | null;
    setFlightData?: any | null;
}

const FlightPromotionTableCreate = (props: IProps) => {
    const { flightData: data, setFlightData: setData } = props;
    const user = useAppSelector(state => state.account.user)
    const containerRef = useRef<HTMLDivElement>(null);
    const [airlines, setAirlines] = useState<any[]>([])
    const [flights, setFlights] = useState<any[]>([])
    const [selectedFlight, setSelectedFlight] = useState({})
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);

    const [form, setForm] = useState({
        id: "",
        action: 'ADD',
        airline_id: 0,
        airline: {},
        flight_id: 0,
        flight: {},
        discount_percent: 0,
        discount_amount: 0
    })

    const handleDeleteFlightPromotion = async (record: any) => {
        setData((prev: any) => prev.filter((item: any) => item.id !== record.id));
    }

    const columns: TableProps<any>['columns'] = [
        {
            title: "STT",
            dataIndex: 'stt',
            render: (text, record, index) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {data.length - index}
                    </div>
                )
            },
        },
        {
            title: "Hãng hàng không",
            dataIndex: 'airline',
            render: (text, record, index) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.airline?.logo)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.airline?.name}`}</p>
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Chuyến bay",
            dataIndex: 'flight',
            render: (text, record, index) => {
                if (!(record?.flight?.legs)) return <div></div>
                const recordLegSorted = [...record.flight.legs].sort((a: any, b: any) =>
                    new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime() // giảm dần
                );

                const firstLeg = recordLegSorted[0];
                const lastLeg = recordLegSorted[recordLegSorted.length - 1];

                return (
                    <div onClick={() => {
                        setSelectedFlight(record.flight)
                        setIsModalDetailOpen(true)
                    }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <div>
                            <div>
                                <Tag color="#2db7f5">1 chiều</Tag>
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
                        <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
                            <HiOutlineCursorClick />
                            <span>Click để xem chi tiết</span>
                        </div>
                    </div>
                )
            },
        },
        {
            title: "Phần trăm giảm giá",
            dataIndex: 'discount_percent',
            render: (text, record, index) => {
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
            render: (text, record, index) => {
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
            render: (text, record) => (
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
                        title={"Xác nhận xóa flight promotion"}
                        description={"Bạn chắc chắn muốn xóa flight promotion"}
                        onConfirm={() => handleDeleteFlightPromotion(record)}
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

    const handleSubmit = () => {
        if (!form.airline_id) {
            toast.error("Vui lòng chọn hãng hàng không", {
                position: "bottom-right",
            });
            return;
        }
        if (!form.flight_id) {
            toast.error("Vui lòng chọn chuyến bay", {
                position: "bottom-right",
            });
            return;
        }
        if (form.action === "ADD") {
            setData((prev: any) => [{
                ...form,
                id: nanoid(10)
            }, ...prev])
            toast.success("Thêm khuyễn mãi chuyến bay thành công", {
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
            toast.success("Sửa khuyễn mãi chuyến bay thành công", {
                position: "bottom-right",
            });
        }

        setForm({
            id: "",
            action: 'ADD',
            airline_id: 0,
            airline: {},
            flight_id: 0,
            flight: {},
            discount_percent: 0,
            discount_amount: 0
        })
    }


    return (
        <div ref={containerRef} className="p-[20px] rounded-[10px] bg-gray-100">
            <div className="border-b-[1px] border-gray-300 pb-[20px]">
                <h2 className="text-[16px] font-semibold">Chuyến bay</h2>
                <div>
                    <div className="mt-[10px] grid grid-cols-2 gap-[20px]">
                        <div>
                            <label>Hãng hàng không</label>
                            <div className="mt-[4px]">
                                <ConfigProvider locale={vi_VN}>
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
                                </ConfigProvider>
                            </div>
                        </div>
                        <div>
                            <label>Chuyến bay</label>
                            <div className="mt-[4px]">
                                <ConfigProvider locale={vi_VN}>
                                    <Select
                                        className="w-full !h-[120px]"
                                        placeholder="Chọn chuyến bay"
                                        onChange={(val, option: any) => {
                                            setForm({
                                                ...form,
                                                flight_id: val,
                                                flight: option.data
                                            })
                                        }}
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
                                                            <Tag color="#2db7f5">1 chiều</Tag>
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
                        <Button type="primary" style={{ backgroundColor: form.action === 'EDIT' ? '#6607f5' : '#068428' }} onClick={handleSubmit} icon={form.action === 'EDIT' ? <EditOutlined /> : <PlusOutlined />}>{form.action === 'EDIT' ? 'Sửa' : 'Thêm'} chuyến bay</Button>
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
            <ModalFlightDetail
                flight={selectedFlight}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    )
}

export default FlightPromotionTableCreate
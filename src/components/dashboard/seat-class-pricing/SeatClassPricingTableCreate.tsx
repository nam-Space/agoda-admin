/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Input, Popconfirm, Select, Space, Table } from "antd";
import { useRef, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { HAS_FREE_DRINK_VI, HAS_LOUNGE_ACCESS_VI, HAS_MEAL_VI, HAS_POWER_OUTLET_VI, HAS_PRIORITY_BOARDING_VI, SEAT_CLASS, SEAT_CLASS_VI } from "@/constants/airline";
import { nanoid } from 'nanoid';

interface IProps {
    seatClassesData?: any | null;
    setSeatClassesData?: any | null;
}

const SeatClassPricingTableCreate = (props: IProps) => {
    const { seatClassesData: data, setSeatClassesData: setData } = props;
    const containerRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState({
        id: "",
        action: 'ADD',
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

    const handleDeleteSeatClassPricing = async (record: any) => {
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
            title: "Loại ghế",
            dataIndex: 'seat_class',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {SEAT_CLASS_VI[record.seat_class]}
                    </div>
                )
            },
        },
        {
            title: "Hệ số giá",
            dataIndex: 'multiplier',
        },
        {
            title: "Tổng số ghế",
            dataIndex: 'capacity',
        },
        {
            title: "Số ghế khả dụng",
            dataIndex: 'available_seats',
            render: (_, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {record.available_seats}
                    </div>
                )
            },
        },
        {
            title: "Đồ ăn",
            dataIndex: 'has_meal',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {HAS_MEAL_VI[record.has_meal]}
                    </div>
                )
            },
        },
        {
            title: "Đồ uông miễn phí",
            dataIndex: 'has_free_drink',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {HAS_FREE_DRINK_VI[record.has_free_drink]}
                    </div>
                )
            },
        },
        {
            title: "Phòng chờ",
            dataIndex: 'has_lounge_access',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {HAS_LOUNGE_ACCESS_VI[record.has_lounge_access]}
                    </div>
                )
            },
        },
        {
            title: "Ổ cắm điện",
            dataIndex: 'has_power_outlet',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {HAS_POWER_OUTLET_VI[record.has_power_outlet]}
                    </div>
                )
            },
        },
        {
            title: "Ưu tiên lên máy bay",
            dataIndex: 'has_priority_boarding',
            render: (_text, record) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        {HAS_PRIORITY_BOARDING_VI[record.has_priority_boarding]}
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
                        title={"Xác nhận xóa seat class"}
                        description={"Bạn chắc chắn muốn xóa seat class"}
                        onConfirm={() => handleDeleteSeatClassPricing(record)}
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

    const handleSubmit = () => {
        if (!form.seat_class) {
            toast.error("Vui lòng chọn loại ghế", {
                position: "bottom-right",
            });
            return;
        }
        if (!form.multiplier) {
            toast.error("Vui lòng nhập hệ số", {
                position: "bottom-right",
            });
            return;
        }
        if (!form.capacity) {
            toast.error("Vui lòng nhập tổng số ghế", {
                position: "bottom-right",
            });
            return;
        }
        if (!form.available_seats) {
            toast.error("Vui lòng nhập số ghế khả dụng", {
                position: "bottom-right",
            });
            return;
        }
        if (form.action === "ADD") {
            setData((prev: any) => [{
                ...form,
                id: nanoid(10)
            }, ...prev])
            toast.success("Thêm hạng ghế thành công", {
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
            toast.success("Sửa hạng ghế thành công", {
                position: "bottom-right",
            });
        }

        setForm({
            id: "",
            action: 'ADD',
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
    }

    return (
        <div ref={containerRef} className="p-[20px] rounded-[10px] bg-gray-100">
            <div className="border-b-[1px] border-gray-300 pb-[20px]">
                <h2 className="text-[16px] font-semibold">Hạng ghế</h2>
                <div>
                    <div className="mt-[10px] grid grid-cols-2 gap-[20px]">
                        <div>
                            <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Loại ghế</label>
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
                            <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Hệ số tiền</label>
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
                            <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Tổng số ghế</label>
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
                            <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Số ghế khả dụng</label>
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
                            <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Thức ăn</label>
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
                            <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Đồ uống miễn phí</label>
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
                            <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Phòng chờ</label>
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
                            <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Nguồn cắm điện</label>
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
                            <label className="flex items-center gap-[6px]"><span className="text-red-500 text-[18px]">*</span>Ưu tiên</label>
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
                    <div className="flex justify-end mt-[10px]">
                        <Button type="primary" style={{ backgroundColor: form.action === 'EDIT' ? '#6607f5' : '#068428' }} onClick={handleSubmit} icon={form.action === 'EDIT' ? <EditOutlined /> : <PlusOutlined />}>{form.action === 'EDIT' ? 'Sửa' : 'Thêm'} hạng ghế</Button>
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

export default SeatClassPricingTableCreate
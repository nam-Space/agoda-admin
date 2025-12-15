/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, InputNumber, Popconfirm, Select, Space, Table } from "antd";
import { useEffect, useRef, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { nanoid } from 'nanoid';
import { callFetchCar } from "@/config/api";
import { getImage } from "@/utils/imageUrl";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";


interface IProps {
    carData?: any | null;
    setCarData?: any | null;
}

const CarPromotionTableCreate = (props: IProps) => {
    const { carData: data, setCarData: setData } = props;
    const user = useAppSelector(state => state.account.user)

    const containerRef = useRef<HTMLDivElement>(null);
    const [cars, setCars] = useState<any[]>([])

    const [form, setForm] = useState({
        id: "",
        action: 'ADD',
        car_id: 0,
        car_name: "",
        car_image: "",
        discount_percent: 0,
        discount_amount: 0
    })

    const handleDeleteCarPromotion = async (record: any) => {
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
            title: "Xe taxi",
            dataIndex: 'car',
            render: (_text, record, _index) => {
                return (
                    <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(record?.car_image)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.car_name}`}</p>
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
                            });
                            containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                    />

                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa room promotion"}
                        description={"Bạn chắc chắn muốn xóa room promotion"}
                        onConfirm={() => handleDeleteCarPromotion(record)}
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

    const handleGetCar = async (query: string) => {
        const res = await callFetchCar(query)
        if (res.data) {
            setCars(res.data)
        }
    }

    useEffect(() => {
        let bossQuery = ``
        if (user.role === ROLE.DRIVER) {
            bossQuery += `&user_id=${user.id}`
        }
        handleGetCar(`current=1&pageSize=1000${bossQuery}`)
    }, [])

    const handleSubmit = () => {
        if (!form.car_id) {
            toast.error("Vui lòng chọn xe taxi", {
                position: "bottom-right",
            });
            return;
        }
        if (form.action === "ADD") {
            setData((prev: any) => [{
                ...form,
                id: nanoid(10)
            }, ...prev])
            toast.success("Thêm khuyễn mãi taxi thành công", {
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
            toast.success("Sửa khuyễn mãi taxi thành công", {
                position: "bottom-right",
            });
        }

        setForm({
            id: "",
            action: 'ADD',
            car_id: 0,
            car_name: "",
            car_image: "",
            discount_percent: 0,
            discount_amount: 0
        })
    }


    return (
        <div ref={containerRef} className="p-[20px] rounded-[10px] bg-gray-100">
            <div className="border-b-[1px] border-gray-300 pb-[20px]">
                <h2 className="text-[16px] font-semibold">Xe taxi</h2>
                <div>
                    <div className="mt-[10px] grid grid-cols-2 gap-[20px]">
                        <div>
                            <label>Xe taxi</label>
                            <div className="mt-[4px]">
                                <ConfigProvider locale={vi_VN}>
                                    <Select
                                        style={{ width: '100%', height: 70 }}
                                        allowClear
                                        options={cars.map(item => {
                                            return {
                                                label: <div className="flex items-center gap-[10px]">
                                                    <img
                                                        src={getImage(item?.image)}
                                                        className="w-[70px] h-[50px] object-cover"
                                                    />
                                                    <div>
                                                        <p className="leading-[20px]">{`${item.name}`}</p>
                                                    </div>
                                                </div>,
                                                value: item.id,
                                                title: item.name,
                                                image: item?.image
                                            }
                                        })}
                                        onChange={(val, option: any) => {
                                            setForm({
                                                ...form,
                                                car_id: val,
                                                car_name: option.title,
                                                car_image: option.image,
                                            })
                                        }}
                                        value={form.car_id || null}
                                        placeholder="Chọn xe taxi"
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
                        <Button type="primary" style={{ backgroundColor: form.action === 'EDIT' ? '#6607f5' : '#068428' }} onClick={handleSubmit} icon={form.action === 'EDIT' ? <EditOutlined /> : <PlusOutlined />}>{form.action === 'EDIT' ? 'Sửa' : 'Thêm'} xe taxi</Button>
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

export default CarPromotionTableCreate
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Input, Popconfirm, Space, Table } from "antd";
import { useRef, useState } from "react";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { nanoid } from 'nanoid';


interface IProps {
    roomAmenitiesData?: any | null;
    setRoomAmenitiesData?: any | null;
}

const RoomAmenityTableCreate = (props: IProps) => {
    const { roomAmenitiesData: data, setRoomAmenitiesData: setData } = props;
    const containerRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState({
        id: "",
        action: 'ADD',
        name: "",
    })

    const handleDeleteRoomAmenity = async (record: any) => {
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
            title: "Tên tiện nghi",
            dataIndex: 'name',
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
                        title={"Xác nhận xóa room amenity"}
                        description={"Bạn chắc chắn muốn xóa room amenity"}
                        onConfirm={() => handleDeleteRoomAmenity(record)}
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
        if (!form.name) {
            toast.error("Vui lòng điền tên tiện nghi", {
                position: "bottom-right",
            });
            return;
        }
        if (form.action === "ADD") {
            setData((prev: any) => [{
                ...form,
                id: nanoid(10)
            }, ...prev])
            toast.success("Thêm tiện nghi thành công", {
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
            toast.success("Sửa tiện nghi thành công", {
                position: "bottom-right",
            });
        }

        setForm({
            id: "",
            action: 'ADD',
            name: "",
        })
    }


    return (
        <div ref={containerRef} className="p-[20px] rounded-[10px] bg-gray-100">
            <div className="border-b-[1px] border-gray-300 pb-[20px]">
                <h2 className="text-[16px] font-semibold">Tiện nghi</h2>
                <div>
                    <div className="mt-[10px] grid grid-cols-2 gap-[20px]">
                        <div>
                            <label>Tên tiện nghi</label>
                            <div className="mt-[4px]">
                                <Input
                                    className="w-full"
                                    placeholder="Nhập thông tin"
                                    onChange={e => setForm({
                                        ...form,
                                        name: e.target.value
                                    })}
                                    value={form.name}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end mt-[10px]">
                        <Button type="primary" style={{ backgroundColor: form.action === 'EDIT' ? '#6607f5' : '#068428' }} onClick={handleSubmit} icon={form.action === 'EDIT' ? <EditOutlined /> : <PlusOutlined />}>{form.action === 'EDIT' ? 'Sửa' : 'Thêm'} tiện nghi</Button>
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

export default RoomAmenityTableCreate
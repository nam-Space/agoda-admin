/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callCreateRoomAmenity, callUpdateRoomAmenity } from "@/config/api";
import { ConfigProvider, Input, Modal, } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { IMeta } from "./RoomAmenityTable";


interface IProps {
    room?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    handleGetRoomAmenity: any
    meta: IMeta
}

const ModalRoomAmenityUpsert = (props: IProps) => {
    const {
        room,
        isModalOpen,
        dataInit,
        setDataInit,
        setIsModalOpen,
        handleGetRoomAmenity,
        meta
    } = props;
    const [form, setForm] = useState({
        name: ""
    });

    useEffect(() => {
        if (dataInit?.id) {
            setForm({
                ...form,
                name: dataInit.name,
            });
        }

    }, [dataInit]);

    const handleSubmit = async () => {
        if (dataInit?.id) {
            const res: any = await callUpdateRoomAmenity(dataInit.id, {
                room: room.id,
                name: form.name,
            });
            if (res.isSuccess) {
                toast.success("Sửa room amenity thành công!", {
                    position: "bottom-right",
                });
            }
        } else {
            const res: any = await callCreateRoomAmenity({
                room: room.id,
                name: form.name,
            });
            if (res.isSuccess) {
                toast.success("Thêm mới room amenity thành công!", {
                    position: "bottom-right",
                });
            }
        }

        setIsModalOpen(false);
        setDataInit({});
        setForm({
            name: ""
        })
        await handleGetRoomAmenity(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&room_id=${room.id}&sort=created_at-desc`);
    };

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={`${dataInit?.id ? "Sửa" : "Tạo mới"} room amenity`}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalOpen(false);
                    setDataInit({});
                }}
            >
                <div className="mt-[10px] grid grid-cols-1 gap-[20px]">
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
            </Modal>
        </ConfigProvider>
    );
};

export default ModalRoomAmenityUpsert;

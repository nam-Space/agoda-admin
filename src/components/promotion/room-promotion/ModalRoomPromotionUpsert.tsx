
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callCreateRoomPromotion, callUpdateRoomPromotion, callFetchHotel, callFetchRoom } from "@/config/api";
import { ConfigProvider, InputNumber, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { IMeta } from "./RoomPromotionTable";
import { getImage } from "@/utils/imageUrl";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

interface IProps {
    promotion?: any;
    isModalOpen: boolean;
    setIsModalOpen: any;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    handleGetRoomPromotion: any
    meta: IMeta
}

const ModalRoomPromotionUpsert = (props: IProps) => {
    const {
        promotion,
        isModalOpen,
        dataInit,
        setDataInit,
        setIsModalOpen,
        handleGetRoomPromotion,
        meta
    } = props;

    const user = useAppSelector(state => state.account.user)

    const [hotels, setHotels] = useState<any>([])
    const [rooms, setRooms] = useState<any>([])

    const [form, setForm] = useState({
        promotion: 0,
        room_id: 0,
        room_type: "",
        room_image: "",
        hotel_id: 0,
        hotel_name: "",
        hotel_image: "",
        discount_percent: 0,
        discount_amount: 0,
    });



    useEffect(() => {
        if (dataInit?.id, promotion?.id) {
            setForm({
                ...form,
                promotion: promotion.id,
                room_id: dataInit?.room?.id,
                room_type: dataInit?.room?.room_type,
                room_image: dataInit?.room?.images?.[0]?.image,
                hotel_id: dataInit?.room?.hotel?.id,
                hotel_name: dataInit?.room?.hotel?.name,
                hotel_image: dataInit?.room?.hotel?.thumbnail,
                discount_percent: dataInit?.discount_percent,
                discount_amount: dataInit?.discount_amount,
            });
        }

    }, [dataInit, promotion]);

    const handleSubmit = async () => {
        if (dataInit?.id) {
            const res: any = await callUpdateRoomPromotion(dataInit.id, {
                promotion: form.promotion,
                room: form.room_id,
                discount_percent: form.discount_percent,
                discount_amount: form.discount_amount,
            });
            if (res.isSuccess) {
                toast.success("Sửa room promotion thành công!", {
                    position: "bottom-right",
                });
            }
        } else {
            const res: any = await callCreateRoomPromotion({
                promotion: form.promotion,
                room: form.room_id,
                discount_percent: form.discount_percent,
                discount_amount: form.discount_amount,
            });
            if (res.isSuccess) {
                toast.success("Thêm mới room promotion thành công!", {
                    position: "bottom-right",
                });
            }
        }

        handleReset()
        await handleGetRoomPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`);
    };

    const handleReset = () => {
        setIsModalOpen(false);
        setDataInit({});
        setForm({
            promotion: 0,
            room_id: 0,
            room_type: "",
            room_image: "",
            hotel_id: 0,
            hotel_name: "",
            hotel_image: "",
            discount_percent: 0,
            discount_amount: 0,
        })
    }

    const handleGetHotel = async (query: string) => {
        const res: any = await callFetchHotel(query);
        if (res.isSuccess) {
            setHotels(res.data);
        }
    }

    const handleGetRoom = async (query: string) => {
        const res: any = await callFetchRoom(query);
        if (res.isSuccess) {
            setRooms(res.data);
        }
    }

    useEffect(() => {
        let bossQuery = ``
        if (user.role === ROLE.OWNER) {
            bossQuery += `&ownerId=${user.id}`
        }
        handleGetHotel(`current=1&pageSize=1000${bossQuery}`);
    }, []);

    useEffect(() => {
        handleGetRoom(`current=1&pageSize=1000&hotel_id=${form.hotel_id}`)
    }, [form.hotel_id])

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={`${dataInit?.id ? "Sửa" : "Tạo mới"} room promotion`}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    handleReset()
                }}
                width={900}
            >
                <div className="mt-[10px] grid grid-cols-2 gap-[20px]">
                    <div>
                        <label>Khách sạn</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full !h-[70px]"
                                placeholder="Chọn khách sạn"
                                onChange={(val, option: any) => setForm({
                                    ...form,
                                    hotel_id: val,
                                    hotel_name: option.title,
                                    hotel_image: option.image,
                                    room_id: 0,
                                    room_type: "",
                                    room_image: ""
                                })}
                                value={form.hotel_id || null}
                                options={hotels.map((item: any) => {
                                    return {
                                        label: <div className="flex items-center gap-[10px]">
                                            <img
                                                src={getImage(item?.images?.[0]?.image)}
                                                className="w-[70px] h-[50px] object-cover"
                                            />
                                            <div>
                                                <p className="leading-[20px]">{`${item.name}`}</p>
                                            </div>
                                        </div>,
                                        value: item.id,
                                        title: item.name,
                                        image: item?.images?.[0]?.image
                                    }
                                })}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Phòng</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full !h-[70px]"
                                placeholder="Chọn phòng"
                                onChange={(val, option: any) => setForm({
                                    ...form,
                                    room_id: val,
                                    room_type: option.title,
                                    room_image: option.image
                                })}
                                value={form.room_id || null}
                                options={rooms.map((item: any) => {
                                    return {
                                        label: <div className="flex items-center gap-[10px]">
                                            <img
                                                src={getImage(item?.images?.[0]?.image)}
                                                className="w-[70px] h-[50px] object-cover"
                                            />
                                            <div>
                                                <p className="leading-[20px]">{`${item.room_type}`}</p>
                                            </div>
                                        </div>,
                                        value: item.id,
                                        title: item.room_type,
                                        image: item?.images?.[0]?.image
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

export default ModalRoomPromotionUpsert;

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Modal, Tag } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import RoomAmenityTable from "../room-amenity/RoomAmenityTable";
import { formatCurrency } from "@/utils/formatCurrency";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { getImage } from "@/utils/imageUrl";
import { HomeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { STAY_TYPE, STAY_TYPE_VI } from "@/constants/hotel";

interface IProps {
    room?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const ModalRoomDetail = (props: IProps) => {
    const { room, isModalOpen, setIsModalOpen } = props;
    const [isExpanded, setIsExpanded] = useState({
        description: false,
    });

    useEffect(() => {
        if (!isModalOpen) {
            setIsExpanded({
                description: false,
            })
        }
    }, [isModalOpen])

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={
                    <div className="flex items-center gap-3 py-[8px]">
                        <HomeOutlined className="text-blue-600 text-[22px]" />
                        <span className="text-[22px] font-bold">
                            Chi tiết phòng
                        </span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                width={1050}
                footer={
                    <div className="flex justify-end px-[4px]">
                        <Button size="large" onClick={() => setIsModalOpen(false)}>
                            Đóng
                        </Button>
                    </div>
                }
            >
                {/* --- PHẦN THÔNG TIN PHÒNG --- */}
                <div className="p-[10px]">
                    <h2 className="text-[20px] font-bold mb-[12px]">Thông tin phòng</h2>

                    <div className="flex gap-[28px]">

                        {/* --- ẢNH --- */}
                        {room?.images?.length > 0 && (
                            <div className="w-[340px] h-[240px] rounded-xl overflow-hidden shadow-md">
                                <Swiper
                                    slidesPerView={1}
                                    spaceBetween={12}
                                    navigation
                                    modules={[Navigation]}
                                    className="w-full h-full"
                                >
                                    {room.images.map((img: any, index: number) => (
                                        <SwiperSlide key={index}>
                                            <img
                                                src={`${import.meta.env.VITE_BE_URL}${img.image}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        )}

                        {/* --- THÔNG TIN CHI TIẾT --- */}
                        <div className="flex-1">
                            <div className="flex items-center gap-[10px]">
                                <p className="text-[20px] font-semibold">{room?.room_type}</p>
                                {room?.available ? (
                                    <Tag color="green" className="px-[10px] py-[3px] text-[13px]">
                                        Có sẵn
                                    </Tag>
                                ) : (
                                    <Tag color="red" className="px-[10px] py-[3px] text-[13px]">
                                        Hết chỗ
                                    </Tag>
                                )}
                            </div>

                            <div className="mt-[6px] text-[15px] leading-[22px]">
                                <p><strong>Loại chỗ ở:</strong> {STAY_TYPE_VI[room?.stay_type]}</p>
                                <p><strong>Số giường:</strong> {room?.beds}</p>
                                <p><strong>Diện tích:</strong> {room?.area_m2} m²</p>
                                {room?.stay_type === STAY_TYPE.OVERNIGHT ? <p>
                                    <strong>Giá mỗi đêm:</strong>{" "}
                                    <span className="text-blue-600 font-bold text-[18px]">
                                        {formatCurrency(room?.price_per_night)}đ
                                    </span>
                                </p> : <>
                                    <p>
                                        <strong>Giá trong ngày:</strong>{" "}
                                        <span className="text-blue-600 font-bold text-[18px]">
                                            {`${formatCurrency(room?.price_per_day)}`}đ
                                        </span>
                                    </p>
                                    <p><strong>Thời gian ở:</strong> {`${room?.dayuse_duration_hours}`} tiếng</p>
                                </>}

                                {room?.has_promotion && (
                                    <div className="mt-[6px]">
                                        <Tag color="#87d068" className="text-[13px] px-[10px] py-[4px]">
                                            Đang khuyến mãi
                                        </Tag>
                                    </div>
                                )}

                                <div className="mt-[10px] grid grid-cols-2 gap-y-[6px] text-[14px]">
                                    <p>- Tổng: {room?.total_rooms} phòng</p>
                                    <p>- Khả dụng: {room?.available_rooms} phòng</p>
                                    <p>- {room?.adults_capacity} người lớn</p>
                                    <p>- {room?.children_capacity} trẻ em</p>
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Mô tả:</strong></p>
                                    {room?.description && <div className="markdown-container" dangerouslySetInnerHTML={{
                                        __html: room.description.length > 150 ? (isExpanded.description
                                            ? room.description
                                            : `${room.description.substring(0, 150)}...`) : room.description
                                    }}></div>}
                                    {room?.description?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            description: !isExpanded.description
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.description ? "Ẩn" : "Xem tiếp"}
                                    </button>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- KHÁCH SẠN --- */}
                    <div className="mt-[30px] mb-[25px]">
                        <h2 className="text-[20px] font-bold mb-[12px]">Khách sạn</h2>
                        <div className="flex items-center gap-[15px]">
                            <img
                                src={getImage(room?.hotel?.thumbnail)}
                                className="w-[150px] h-[110px] object-cover rounded-[14px] shadow"
                            />
                            <div>
                                <p className="text-[18px] font-semibold">{room?.hotel?.name}</p>
                                <p className="text-[14px]"><strong>Địa chỉ:</strong> {room?.hotel?.location}</p>
                            </div>
                        </div>
                    </div>

                    <RoomAmenityTable room={room} />
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalRoomDetail;

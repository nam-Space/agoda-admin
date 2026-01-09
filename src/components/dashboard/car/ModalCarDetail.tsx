/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Modal } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaHotel } from "react-icons/fa";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import CarStatistic from "./CarStatistic";

interface IProps {
    car?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const ModalCarDetail = (props: IProps) => {
    const { car, isModalOpen, setIsModalOpen } = props;
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
                        <FaHotel className="text-[22px]" />
                        <span className="text-[22px] font-bold">
                            Chi tiết xe taxi
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
                {/* --- PHẦN THÔNG KHÁCH SẠN --- */}
                <div className="p-[10px]">
                    <h2 className="text-[20px] font-bold mb-[12px]">Thông tin khách sạn</h2>

                    <div className="flex gap-[28px]">
                        <div>
                            <img
                                src={`${import.meta.env.VITE_BE_URL}${car?.image}`}
                                className="w-[300px] object-cover"
                            />
                        </div>

                        {/* --- THÔNG TIN CHI TIẾT --- */}
                        <div className="flex-1 mb-[30px]">
                            <div className="flex items-center gap-[10px]">
                                <p className="text-[20px] font-semibold">{car?.name}</p>
                            </div>

                            <div className="mt-[6px] text-[15px] leading-[22px]">
                                <p><strong>Giá mỗi km:</strong> {formatCurrency(car?.price_per_km || 0)}đ</p>
                                <p><strong>Tốc độ trung bình:</strong> {car?.avg_speed} km/h</p>
                                <p><strong>Sức chứa tối đa:</strong> {car?.capacity} người</p>
                                <p><strong>Số hành lý tối đa:</strong> {car?.luggage}</p>
                                <p><strong>Số sao trung bình:</strong> {car?.avg_star}</p>
                                <div className="mt-[10px]">
                                    <p><strong>Mô tả:</strong></p>
                                    {car?.description && <div className="markdown-container" dangerouslySetInnerHTML={{
                                        __html: car.description.length > 150 ? (isExpanded.description
                                            ? car.description
                                            : `${car.description.substring(0, 150)}...`) : car.description
                                    }}></div>}

                                    {car?.description?.length > 150 && <button
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
                    <CarStatistic car={car} />
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalCarDetail;

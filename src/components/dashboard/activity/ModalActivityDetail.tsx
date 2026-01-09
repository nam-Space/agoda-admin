/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Modal } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { FaHotel } from "react-icons/fa";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/utils/formatCurrency";
import ActivityStatistic from "./ActivityStatistic";

interface IProps {
    activity?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const ModalActivityDetail = (props: IProps) => {
    const { activity, isModalOpen, setIsModalOpen } = props;
    const [isExpanded, setIsExpanded] = useState({
        short_description: false,
        more_information: false,
        cancellation_policy: false,
        departure_information: false,
    });

    useEffect(() => {
        if (!isModalOpen) {
            setIsExpanded({
                short_description: false,
                more_information: false,
                cancellation_policy: false,
                departure_information: false,
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
                            Chi tiết hoạt động
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
                    <h2 className="text-[20px] font-bold mb-[12px]">Thông tin hoạt động</h2>

                    <div className="flex gap-[28px]">

                        <div>
                            {activity?.images?.length > 0 && (
                                <div className="w-[340px] h-[240px] rounded-xl overflow-hidden shadow-md">
                                    <Swiper
                                        slidesPerView={1}
                                        spaceBetween={12}
                                        navigation
                                        modules={[Navigation]}
                                        className="w-full h-full"
                                    >
                                        {activity.images.map((img: any, index: number) => (
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
                        </div>

                        {/* --- THÔNG TIN CHI TIẾT --- */}
                        <div className="flex-1 mb-[30px]">
                            <div className="flex items-center gap-[10px]">
                                <p className="text-[20px] font-semibold">{activity?.name}</p>
                            </div>

                            <div className="mt-[6px] text-[15px] leading-[22px]">
                                <p><strong>Danh mục:</strong> {activity?.category}</p>
                                <p><strong>Giá trung bình:</strong> {formatCurrency(activity?.avg_price || 0)}đ</p>
                                <p><strong>Số sao trung bình:</strong> {(activity?.avg_star?.toFixed(0))}</p>
                                <p><strong>Thời gian chơi:</strong> {(activity?.total_time || 0)} giờ</p>
                                <div className="mt-[10px]">
                                    <p><strong>Mô tả ngắn:</strong></p>
                                    {activity?.short_description && <div className="markdown-container" dangerouslySetInnerHTML={{
                                        __html: activity.short_description.length > 150 ? (isExpanded.short_description
                                            ? activity.short_description
                                            : `${activity.short_description.substring(0, 150)}...`) : activity.short_description
                                    }}></div>}

                                    {activity?.short_description?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            short_description: !isExpanded.short_description
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.short_description ? "Ẩn" : "Xem tiếp"}
                                    </button>}

                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Thông tin thêm:</strong></p>
                                    {activity?.more_information && <div className="markdown-container" dangerouslySetInnerHTML={{
                                        __html: activity.more_information.length > 150 ? (isExpanded.more_information
                                            ? activity.more_information
                                            : `${activity.more_information.substring(0, 150)}...`) : activity.more_information
                                    }}></div>}

                                    {activity?.more_information?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            more_information: !isExpanded.more_information
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.more_information ? "Ẩn" : "Xem tiếp"}
                                    </button>}

                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Chính sách hủy:</strong></p>
                                    {activity?.cancellation_policy && <div className="markdown-container" dangerouslySetInnerHTML={{
                                        __html: activity.cancellation_policy.length > 150 ? (isExpanded.cancellation_policy
                                            ? activity.cancellation_policy
                                            : `${activity.cancellation_policy.substring(0, 150)}...`) : activity.cancellation_policy
                                    }}></div>}

                                    {activity?.cancellation_policy?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            cancellation_policy: !isExpanded.cancellation_policy
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.cancellation_policy ? "Ẩn" : "Xem tiếp"}
                                    </button>}

                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Thời gian và giờ khởi hành:</strong></p>
                                    {activity?.departure_information && <div className="markdown-container" dangerouslySetInnerHTML={{
                                        __html: activity.departure_information.length > 150 ? (isExpanded.departure_information
                                            ? activity.departure_information
                                            : `${activity.departure_information.substring(0, 150)}...`) : activity.departure_information
                                    }}></div>}

                                    {activity?.departure_information?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            departure_information: !isExpanded.departure_information
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.departure_information ? "Ẩn" : "Xem tiếp"}
                                    </button>}

                                </div>
                            </div>
                        </div>
                    </div>
                    <ActivityStatistic activity={activity} />
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalActivityDetail;

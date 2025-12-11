/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Modal } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import RoomTable from "../room/RoomTable";
import { FaHotel } from "react-icons/fa";

interface IProps {
    hotel?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const ModalHotelDetail = (props: IProps) => {
    const { hotel, isModalOpen, setIsModalOpen } = props;

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={
                    <div className="flex items-center gap-3 py-[8px]">
                        <FaHotel className="text-[22px]" />
                        <span className="text-[22px] font-bold">
                            Chi tiết khách sạn
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
                            {hotel?.images?.length > 0 && (
                                <div className="w-[340px] h-[240px] rounded-xl overflow-hidden shadow-md">
                                    <Swiper
                                        slidesPerView={1}
                                        spaceBetween={12}
                                        navigation
                                        modules={[Navigation]}
                                        className="w-full h-full"
                                    >
                                        {hotel.images.map((img: any, index: number) => (
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
                            <div className="mt-[30px]">
                                <iframe
                                    width="350"
                                    height="250"
                                    frameBorder="0"
                                    style={{ border: 0 }}
                                    className="w-full"
                                    src={`https://maps.google.com/maps?q=${hotel?.lat},${hotel?.lng}&hl=vi&z=18&output=embed`}
                                    allowFullScreen
                                    aria-hidden="false"
                                    tabIndex={0}
                                ></iframe>
                            </div>
                        </div>

                        {/* --- THÔNG TIN CHI TIẾT --- */}
                        <div className="flex-1 mb-[30px]">
                            <div className="flex items-center gap-[10px]">
                                <p className="text-[20px] font-semibold">{hotel?.name}</p>
                            </div>

                            <div className="mt-[6px] text-[15px] leading-[22px]">
                                <p><strong>Số sao trung bình:</strong> {hotel?.avg_star?.toFixed(1)}</p>
                                <p><strong>Địa điểm:</strong> {hotel?.location} m²</p>
                                <div className="mt-[10px]">
                                    <p><strong>Điểm nổi bật nhất:</strong></p>
                                    <div dangerouslySetInnerHTML={{ __html: hotel?.mostFeature || "" }}></div>
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Cơ sở vật chất:</strong></p>
                                    <div dangerouslySetInnerHTML={{ __html: hotel?.facilities || "" }}></div>
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Về chúng tôi:</strong></p>
                                    <div dangerouslySetInnerHTML={{ __html: hotel?.withUs || "" }}></div>
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Thông tin hữu ích:</strong></p>
                                    <div dangerouslySetInnerHTML={{ __html: hotel?.usefulInformation || "" }}></div>
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Mô tả:</strong></p>
                                    <div className="markdown-container" dangerouslySetInnerHTML={{ __html: hotel?.description || "" }}></div>
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Tiện nghi và cơ sở vật chất:</strong></p>
                                    <div dangerouslySetInnerHTML={{ __html: hotel?.amenitiesAndFacilities || "" }}></div>
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Vị trí:</strong></p>
                                    <div dangerouslySetInnerHTML={{ __html: hotel?.locationInfo || "" }}></div>
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Đi đâu gần đây:</strong></p>
                                    <div dangerouslySetInnerHTML={{ __html: hotel?.nearbyLocation || "" }}></div>
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Quy định của chỗ nghỉ:</strong></p>
                                    <div dangerouslySetInnerHTML={{ __html: hotel?.regulation || "" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <RoomTable hotel={hotel} />
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalHotelDetail;

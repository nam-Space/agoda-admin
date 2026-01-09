/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Modal } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import RoomTable from "../room/RoomTable";
import { FaHotel } from "react-icons/fa";
import { useEffect, useState } from "react";
import HotelStatistic from "./HotelStatistic";

interface IProps {
    hotel?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const ModalHotelDetail = (props: IProps) => {
    const { hotel, isModalOpen, setIsModalOpen } = props;
    const [isExpanded, setIsExpanded] = useState({
        mostFeature: false,
        facilities: false,
        withUs: false,
        usefulInformation: false,
        description: false,
        amenitiesAndFacilities: false,
        locationInfo: false,
        nearbyLocation: false,
        regulation: false
    });

    useEffect(() => {
        if (!isModalOpen) {
            setIsExpanded({
                mostFeature: false,
                facilities: false,
                withUs: false,
                usefulInformation: false,
                description: false,
                amenitiesAndFacilities: false,
                locationInfo: false,
                nearbyLocation: false,
                regulation: false
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
                                    {hotel?.mostFeature && <div dangerouslySetInnerHTML={{
                                        __html: hotel.mostFeature.length > 150 ? (isExpanded.mostFeature
                                            ? hotel.mostFeature
                                            : `${hotel.mostFeature.substring(0, 150)}...`) : hotel.mostFeature
                                    }}></div>}
                                    {hotel?.mostFeature?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            mostFeature: !isExpanded.mostFeature
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.mostFeature ? "Ẩn" : "Xem tiếp"}
                                    </button>}
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Cơ sở vật chất:</strong></p>
                                    {hotel?.facilities && <div dangerouslySetInnerHTML={{
                                        __html: hotel.facilities.length > 150 ? (isExpanded.facilities
                                            ? hotel.facilities
                                            : `${hotel.facilities.substring(0, 150)}...`) : hotel.facilities
                                    }}></div>}
                                    {hotel?.facilities?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            facilities: !isExpanded.facilities
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.facilities ? "Ẩn" : "Xem tiếp"}
                                    </button>}
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Về chúng tôi:</strong></p>
                                    {hotel?.withUs && <div dangerouslySetInnerHTML={{
                                        __html: hotel.withUs.length > 150 ? (isExpanded.withUs
                                            ? hotel.withUs
                                            : `${hotel.withUs.substring(0, 150)}...`) : hotel.withUs
                                    }}></div>}
                                    {hotel?.withUs?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            withUs: !isExpanded.withUs
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.withUs ? "Ẩn" : "Xem tiếp"}
                                    </button>}
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Thông tin hữu ích:</strong></p>
                                    {hotel?.usefulInformation && <div dangerouslySetInnerHTML={{
                                        __html: hotel.usefulInformation.length > 150 ? (isExpanded.usefulInformation
                                            ? hotel.usefulInformation
                                            : `${hotel.usefulInformation.substring(0, 150)}...`) : hotel.usefulInformation
                                    }}></div>}
                                    {hotel?.usefulInformation?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            usefulInformation: !isExpanded.usefulInformation
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.usefulInformation ? "Ẩn" : "Xem tiếp"}
                                    </button>}
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Mô tả:</strong></p>
                                    {hotel?.description && <div className="markdown-container" dangerouslySetInnerHTML={{
                                        __html: hotel.description.length > 150 ? (isExpanded.description
                                            ? hotel.description
                                            : `${hotel.description.substring(0, 150)}...`) : hotel.description
                                    }}></div>}

                                    {hotel?.description?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            description: !isExpanded.description
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.description ? "Ẩn" : "Xem tiếp"}
                                    </button>}

                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Tiện nghi và cơ sở vật chất:</strong></p>
                                    {hotel?.amenitiesAndFacilities && <div dangerouslySetInnerHTML={{
                                        __html: hotel.amenitiesAndFacilities.length > 150 ? (isExpanded.amenitiesAndFacilities
                                            ? hotel.amenitiesAndFacilities
                                            : `${hotel.amenitiesAndFacilities.substring(0, 150)}...`) : hotel.amenitiesAndFacilities
                                    }}></div>}
                                    {hotel?.amenitiesAndFacilities?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            amenitiesAndFacilities: !isExpanded.amenitiesAndFacilities
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.amenitiesAndFacilities ? "Ẩn" : "Xem tiếp"}
                                    </button>}
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Vị trí:</strong></p>
                                    {hotel?.locationInfo && <div dangerouslySetInnerHTML={{
                                        __html: hotel.locationInfo.length > 150 ? (isExpanded.locationInfo
                                            ? hotel.locationInfo
                                            : `${hotel.locationInfo.substring(0, 150)}...`) : hotel.locationInfo
                                    }}></div>}
                                    {hotel?.locationInfo?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            locationInfo: !isExpanded.locationInfo
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.locationInfo ? "Ẩn" : "Xem tiếp"}
                                    </button>}
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Đi đâu gần đây:</strong></p>
                                    {hotel?.nearbyLocation && <div dangerouslySetInnerHTML={{
                                        __html: hotel.nearbyLocation.length > 150 ? (isExpanded.nearbyLocation
                                            ? hotel.nearbyLocation
                                            : `${hotel.nearbyLocation.substring(0, 150)}...`) : hotel.nearbyLocation
                                    }}></div>}
                                    {hotel?.nearbyLocation?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            nearbyLocation: !isExpanded.nearbyLocation
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.nearbyLocation ? "Ẩn" : "Xem tiếp"}
                                    </button>}
                                </div>
                                <div className="mt-[10px]">
                                    <p><strong>Quy định của chỗ nghỉ:</strong></p>
                                    {hotel?.regulation && <div className="markdown-container" dangerouslySetInnerHTML={{
                                        __html: hotel.regulation.length > 150 ? (isExpanded.regulation
                                            ? hotel.regulation
                                            : `${hotel.regulation.substring(0, 150)}...`) : hotel.regulation
                                    }}></div>}
                                    {hotel?.regulation?.length > 150 && <button
                                        onClick={() => setIsExpanded({
                                            ...isExpanded,
                                            regulation: !isExpanded.regulation
                                        })}
                                        className="text-blue-600 hover:underline text-sm inline-block"
                                    >
                                        {isExpanded.regulation ? "Ẩn" : "Xem tiếp"}
                                    </button>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <HotelStatistic hotel={hotel} />
                    <RoomTable hotel={hotel} />
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalHotelDetail;

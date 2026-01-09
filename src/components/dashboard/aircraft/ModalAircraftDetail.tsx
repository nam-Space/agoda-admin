/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Modal, Tag } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import { FaHotel } from "react-icons/fa";
import AircraftStatistic from "./AircraftStatistic";

interface IProps {
    aircraft?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const ModalAircraftDetail = (props: IProps) => {
    const { aircraft, isModalOpen, setIsModalOpen } = props;

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={
                    <div className="flex items-center gap-3 py-[8px]">
                        <FaHotel className="text-[22px]" />
                        <span className="text-[22px] font-bold">
                            Chi tiết máy bay
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
                {/* --- PHẦN THÔNG MÁY AY --- */}
                <div className="p-[10px]">
                    <h2 className="text-[20px] font-bold mb-[12px]">Thông tin máy bay</h2>

                    <div className="flex gap-[28px]">
                        {/* --- THÔNG TIN CHI TIẾT --- */}
                        <div className="flex-1 mb-[30px]">
                            <div className="flex items-center gap-[10px]">
                                <p className="text-[20px] font-semibold">Máy bay: <span className="text-purple-500">{aircraft?.model}</span></p>
                                {aircraft?.is_active ? (
                                    <Tag color="green" className="px-[10px] py-[3px] text-[13px]">
                                        Đang hoạt động
                                    </Tag>
                                ) : (
                                    <Tag color="red" className="px-[10px] py-[3px] text-[13px]">
                                        Ngừng hoạt động
                                    </Tag>
                                )}
                            </div>

                            <div className="mt-[6px] text-[15px] leading-[22px]">
                                <p><strong>Số đăng ký:</strong> {aircraft?.registration_number}</p>
                                <p><strong>Tổng số ghế:</strong> {aircraft?.total_seats}</p>
                                <p><strong>Số ghế phổ thông:</strong> {aircraft?.economy_seats}</p>
                                <p><strong>Số ghế hạng thượng gia:</strong> {aircraft?.business_seats}</p>
                                <p><strong>Số ghế hạng nhất:</strong> {aircraft?.first_class_seats}</p>
                                <p><strong>Năm sản xuất:</strong> {aircraft?.manufacture_year}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <p className="text-[20px] font-semibold">Hãng hàng không</p>
                        <div className="flex items-center gap-[6px]">
                            <img
                                src={`${import.meta.env.VITE_BE_URL}${aircraft?.airline?.logo}`}
                                className="w-[60px] object-cover"
                            />
                            <p className="text-[20px] font-semibold">{aircraft?.airline?.name}</p>
                        </div>
                    </div>
                    <AircraftStatistic aircraft={aircraft} />
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalAircraftDetail;

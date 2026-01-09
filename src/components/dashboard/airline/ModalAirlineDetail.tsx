/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, ConfigProvider, Modal } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import { FaHotel } from "react-icons/fa";
import { useEffect, useState } from "react";
import AirlineStatistic from "./AirlineStatistic";

interface IProps {
    airline?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const ModalAirlineDetail = (props: IProps) => {
    const { airline, isModalOpen, setIsModalOpen } = props;
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
                            Chi tiết hãng hàng không
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
                {/* --- PHẦN THÔNG HÃNG HÀNG KHÔNG --- */}
                <div className="p-[10px]">
                    <h2 className="text-[20px] font-bold mb-[12px]">Thông tin hãng hàng không</h2>

                    <div className="flex gap-[28px]">

                        <div>
                            {airline?.logo && (
                                <div className="p-[10px] rounded-xl overflow-hidden shadow-md">
                                    <img
                                        src={`${import.meta.env.VITE_BE_URL}${airline.logo}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        {/* --- THÔNG TIN CHI TIẾT --- */}
                        <div className="flex-1 mb-[30px]">
                            <div className="flex items-center gap-[10px]">
                                <p className="text-[20px] font-semibold">{airline?.name}</p>
                            </div>

                            <div className="mt-[6px] text-[15px] leading-[22px]">
                                <p><strong>Mã hàng không:</strong> {airline?.code}</p>
                                <div className="mt-[10px]">
                                    <p><strong>Mô tả:</strong></p>
                                    {airline?.description && <div className="markdown-container" dangerouslySetInnerHTML={{
                                        __html: airline.description.length > 150 ? (isExpanded.description
                                            ? airline.description
                                            : `${airline.description.substring(0, 150)}...`) : airline.description
                                    }}></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <AirlineStatistic airline={airline} />
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalAirlineDetail;

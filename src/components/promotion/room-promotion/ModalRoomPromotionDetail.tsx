/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatCurrency } from "@/utils/formatCurrency";
import { getImage } from "@/utils/imageUrl";
import { Button, ConfigProvider, Modal, Tag } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import dayjs from "dayjs";
import RoomPromotionTable from "./RoomPromotionTable";

interface IProps {
    promotion?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const ModalRoomPromotionDetail = (props: IProps) => {
    const {
        promotion,
        isModalOpen,
        setIsModalOpen,
    } = props;

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={`Xem chi tiết giảm giá`}
                open={isModalOpen}
                onOk={() => setIsModalOpen(false)}
                onCancel={() => setIsModalOpen(false)}
                width={1000}
                footer={(_) => (
                    <>
                        <Button onClick={() => setIsModalOpen(false)}>Đóng</Button>
                    </>
                )}
            >
                <div className="mb-[30px]">
                    <h2 className="text-[20px] font-bold mb-[12px]">Thông tin giảm giá</h2>
                    <div className="flex gap-[28px]">
                        <img className="w-[340px] h-[240px] object-cover" src={getImage(promotion?.image)} />
                        <div className="flex-1">
                            <div className="flex gap-[16px]">
                                <p className="text-[20px] font-semibold">{promotion?.title}</p>
                                <div className="flex items-center">
                                    {promotion?.is_active ? (
                                        <Tag color="green" className="px-[10px] py-[3px] text-[13px]">
                                            Đang hoạt động
                                        </Tag>
                                    ) : (
                                        <Tag color="red" className="px-[10px] py-[3px] text-[13px]">
                                            Hết hạn
                                        </Tag>
                                    )}
                                </div>
                            </div>

                            <div className="mt-[6px] text-[15px] leading-[22px]">
                                <p>
                                    <strong>Giảm giá:</strong>{" "}
                                    <span className="text-pink-600 font-bold text-[18px]">
                                        {promotion?.discount_percent}%
                                    </span>
                                </p>
                                <p>
                                    <strong>Tiền giảm giá:</strong>{" "}
                                    <span className="text-blue-600 font-bold text-[18px]">
                                        {formatCurrency(promotion?.discount_amount)}đ
                                    </span>
                                </p>
                                <p>
                                    <strong>Thời gian bắt đầu:</strong>{" "}
                                    <span className="text-green-600 font-bold text-[16px]">
                                        {dayjs(promotion?.start_date).format("YYYY-MM-DD HH:mm:ss")}
                                    </span>
                                </p>
                                <p>
                                    <strong>Thời gian kết thúc:</strong>{" "}
                                    <span className="text-red-600 font-bold text-[16px]">
                                        {dayjs(promotion?.end_date).format("YYYY-MM-DD HH:mm:ss")}
                                    </span>
                                </p>
                                <div className="mt-[10px]">
                                    <p><strong>Mô tả:</strong></p>
                                    <div dangerouslySetInnerHTML={{ __html: promotion?.description || "" }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <RoomPromotionTable promotion={promotion} />
            </Modal>
        </ConfigProvider>
    );
};

export default ModalRoomPromotionDetail;

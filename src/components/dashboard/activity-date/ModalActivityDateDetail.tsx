/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { formatCurrency } from "@/utils/formatCurrency";
import { getImage } from "@/utils/imageUrl";
import { Button, ConfigProvider, Modal } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import dayjs from "dayjs";
import ActivityDateStatistic from "./ActivityDateStatistic";

interface IProps {
    activityDate?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const ModalActivityDateDetail = (props: IProps) => {
    const {
        activityDate,
        isModalOpen,
        setIsModalOpen,
    } = props;

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={`Xem chi tiết hoạt động`}
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
                    <h2 className="text-[20px] font-bold mb-[12px]">Thông tin hoạt động</h2>
                    <div className="flex gap-[28px]">
                        <img className="w-[340px] h-[240px] object-cover" src={getImage(activityDate?.activity_package?.activity?.thumbnail)} />
                        <div className="flex-1">
                            <div className="flex flex-col gap-[16px]">
                                <p className="text-[20px] font-semibold">{activityDate?.activity_package?.activity?.name}</p>
                                <p className="text-[20px]">Tên gói: <span className="text-green-600 font-semibold">{activityDate?.activity_package?.name}</span></p>
                            </div>

                            <div className="mt-[6px] text-[15px] leading-[22px]">
                                <p><strong>Danh mục:</strong> {activityDate?.activity_package?.activity?.category}</p>
                                <p><strong>Tổng số giờ chơi:</strong> {activityDate?.activity_package?.activity?.total_time} giờ</p>
                                <p>
                                    <strong>Giá người lớn:</strong>{" "}
                                    <span className="text-blue-600 font-bold text-[18px]">
                                        {formatCurrency(activityDate?.price_adult)}đ
                                    </span>
                                </p>
                                <p>
                                    <strong>Giá trẻ em:</strong>{" "}
                                    <span className="text-blue-600 font-bold text-[18px]">
                                        {formatCurrency(activityDate?.price_child)}đ
                                    </span>
                                </p>
                                <p>
                                    <strong>Ngày tổ chức:</strong>{" "}
                                    <span className="text-yellow-600 font-bold text-[16px]">
                                        {dayjs(activityDate?.date_launch).format("YYYY-MM-DD")}
                                    </span>
                                </p>
                                <p>
                                    <strong>Số lượng khách tối đa:</strong>{" "}
                                    <span className="text-pink-600 font-bold text-[18px]">{(activityDate?.max_participants)}</span>
                                </p>
                                <p>
                                    <strong>Số lượng khách khả dụng:</strong>{" "}
                                    <span className="text-green-600 font-bold text-[18px]">{(activityDate?.participants_available)}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <ActivityDateStatistic activityDate={activityDate} />
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalActivityDateDetail;

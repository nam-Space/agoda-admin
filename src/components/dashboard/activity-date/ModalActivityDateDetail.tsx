/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import TableCustomerBooking from "@/components/dashboard/flight/TableCustomerBooking";
import { SERVICE_TYPE } from "@/constants/booking";
import { formatCurrency } from "@/utils/formatCurrency";
import { getImage } from "@/utils/imageUrl";
import { Button, ConfigProvider, Modal } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import dayjs from "dayjs";

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

                                <div className="mt-[10px] grid grid-cols-2 gap-y-[6px] text-[14px]">
                                    {/* <p>- Ngày tổ chức: {dayjs(activityDate?.date_launch).format("YYYY-MM-DD")}</p> */}
                                    <p>- Tối đa {activityDate?.adult_quantity} người lớn</p>
                                    <p>- Tối đa {activityDate?.child_quantity} trẻ em</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <TableCustomerBooking serviceType={SERVICE_TYPE.ACTIVITY} activityDateId={activityDate?.id} />
            </Modal>
        </ConfigProvider>
    );
};

export default ModalActivityDateDetail;

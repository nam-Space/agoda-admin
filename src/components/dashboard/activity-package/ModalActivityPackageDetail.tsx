/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getImage } from "@/utils/imageUrl";
import { Button, ConfigProvider, Modal } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import ActivityPackageStatistic from "./ActivityPackageStatistic";

interface IProps {
    activityPackage?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const ModalActivityPackageDetail = (props: IProps) => {
    const {
        activityPackage,
        isModalOpen,
        setIsModalOpen,
    } = props;

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={`Xem chi tiết gói của hoạt động`}
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
                        <img className="w-[340px] h-[240px] object-cover" src={getImage(activityPackage?.activity?.images?.[0]?.image)} />
                        <div className="flex-1">
                            <div className="flex flex-col gap-[16px]">
                                <p className="text-[20px] font-semibold">{activityPackage?.activity?.name}</p>
                                <p className="text-[20px]">Tên gói: <span className="text-green-600 font-semibold">{activityPackage?.name}</span></p>
                            </div>
                        </div>
                    </div>
                    <ActivityPackageStatistic activityPackage={activityPackage} />
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalActivityPackageDetail;

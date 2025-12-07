
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callUpdateRoomPromotion, callFetchCar, callCreateCarPromotion } from "@/config/api";
import { ConfigProvider, InputNumber, Modal, Select } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import { getImage } from "@/utils/imageUrl";
import { IMeta } from "./CarPromotionTable";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

interface IProps {
    promotion?: any;
    isModalOpen: boolean;
    setIsModalOpen: any;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    handleGetCarPromotion: any
    meta: IMeta
}

const ModalCarPromotionUpsert = (props: IProps) => {
    const {
        promotion,
        isModalOpen,
        dataInit,
        setDataInit,
        setIsModalOpen,
        handleGetCarPromotion,
        meta
    } = props;

    const user = useAppSelector(state => state.account.user)

    const [cars, setCars] = useState<any>([])

    const [form, setForm] = useState({
        promotion: 0,
        car_id: 0,
        car_name: "",
        car_image: "",
        discount_percent: 0,
        discount_amount: 0,
    });

    useEffect(() => {
        if (dataInit?.id, promotion?.id) {
            setForm({
                ...form,
                promotion: promotion.id,
                car_id: dataInit?.car?.id,
                car_name: dataInit?.car?.room_type,
                car_image: dataInit?.car?.image,
                discount_percent: dataInit?.discount_percent,
                discount_amount: dataInit?.discount_amount,
            });
        }

    }, [dataInit, promotion]);

    const handleSubmit = async () => {
        if (dataInit?.id) {
            const res: any = await callUpdateRoomPromotion(dataInit.id, {
                promotion: form.promotion,
                car: form.car_id,
                discount_percent: form.discount_percent,
                discount_amount: form.discount_amount,
            });
            if (res.isSuccess) {
                toast.success("Sửa car promotion thành công!", {
                    position: "bottom-right",
                });
            }
        } else {
            const res: any = await callCreateCarPromotion({
                promotion: form.promotion,
                car: form.car_id,
                discount_percent: form.discount_percent,
                discount_amount: form.discount_amount,
            });
            if (res.isSuccess) {
                toast.success("Thêm mới car promotion thành công!", {
                    position: "bottom-right",
                });
            }
        }

        handleReset()
        await handleGetCarPromotion(`current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&promotion_id=${promotion.id}&sort=id-desc`);
    };

    const handleReset = () => {
        setIsModalOpen(false);
        setDataInit({});
        setForm({
            promotion: 0,
            car_id: 0,
            car_name: "",
            car_image: "",
            discount_percent: 0,
            discount_amount: 0,
        })
    }

    const handleGetCar = async (query: string) => {

        const res: any = await callFetchCar(query);
        if (res.isSuccess) {
            setCars(res.data);
        }
    }

    useEffect(() => {
        let bossQuery = ``
        if (user.role === ROLE.DRIVER) {
            bossQuery += `&user_id=${user.id}`
        }
        handleGetCar(`current=1&pageSize=1000${bossQuery}`);
    }, []);

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={`${dataInit?.id ? "Sửa" : "Tạo mới"} car promotion`}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    handleReset()
                }}
                width={900}
            >
                <div className="mt-[10px] grid grid-cols-2 gap-[20px]">
                    <div>
                        <label>Xe taxi</label>
                        <div className="mt-[4px]">
                            <Select
                                className="w-full !h-[70px]"
                                placeholder="Chọn xe taxi"
                                onChange={(val, option: any) => setForm({
                                    ...form,
                                    car_id: val,
                                    car_name: option.title,
                                    car_image: option.image
                                })}
                                value={form.car_id || null}
                                options={cars.map((item: any) => {
                                    return {
                                        label: <div className="flex items-center gap-[10px]">
                                            <img
                                                src={getImage(item?.image)}
                                                className="w-[70px] h-[50px] object-cover"
                                            />
                                            <div>
                                                <p className="leading-[20px]">{`${item.name}`}</p>
                                            </div>
                                        </div>,
                                        value: item.id,
                                        title: item.name,
                                        image: item?.image
                                    }
                                })}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Phần trăm giảm giá</label>
                        <div className="mt-[4px]">
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Nhập thông tin"
                                formatter={(value) => `${value}%`}
                                onChange={val => setForm({
                                    ...form,
                                    discount_percent: val as number
                                })}
                                value={form.discount_percent}
                            />
                        </div>
                    </div>
                    <div>
                        <label>Tiền giảm giá</label>
                        <div className="mt-[4px]">
                            <InputNumber
                                style={{ width: '100%' }}
                                placeholder="Nhập thông tin"
                                formatter={(value) => `${value}đ`}
                                onChange={val => setForm({
                                    ...form,
                                    discount_amount: val as number
                                })}
                                value={form.discount_amount}
                            />
                        </div>
                    </div>
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalCarPromotionUpsert;

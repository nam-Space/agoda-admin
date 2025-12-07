/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormDigit, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { callCreateAircraft, callFetchAirline, callUpdateAircraft } from "@/config/api";
import { toast } from "react-toastify";
import { getImage } from "@/utils/imageUrl";
import { IActivitySelect } from "../activity-package/ModalActivityPackage";
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import { AIRCRAFT_STATUS_VI } from "@/constants/airline";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalAircraft = (props: IProps) => {
    const user = useAppSelector(state => state.account.user)
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [airline, setAirline] = useState<IActivitySelect>({
        label: "",
        value: 0,
        key: 0,
    })

    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            if (dataInit?.airline?.id) {
                setAirline(
                    {
                        label: (<div className="flex items-center gap-[10px]">
                            <img
                                src={getImage(dataInit.airline?.logo)}
                                className="w-[70px] h-[50px] object-cover"
                            />
                            <div>
                                <p className="leading-[20px]">{`${dataInit.airline.name}`}</p>
                            </div>
                        </div>),
                        value: dataInit.airline.id,
                        key: dataInit.airline.id,
                    }
                )
            }
        }

        return () => form.resetFields()
    }, [dataInit]);

    async function fetchAirlineList(): Promise<IActivitySelect[]> {
        let query = ``
        if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            query += `&flight_operations_staff_id=${user.id}`
        }
        const res: any = await callFetchAirline(`current=1&pageSize=1000${query}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label: <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(item?.logo)}
                            className="w-[70px] h-[50px] object-cover"
                        />
                        <div>
                            <p className="leading-[20px]">{`${item.name}`}</p>
                        </div>
                    </div>,
                    value: item.id
                }
            })
            return temp;
        } else return [];
    }

    const submitData = async (valuesForm: any) => {
        const { model, registration_number, total_seats, economy_seats, business_seats, first_class_seats, is_active, manufacture_year } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                model,
                registration_number,
                total_seats,
                economy_seats,
                business_seats,
                first_class_seats,
                is_active,
                manufacture_year,
                airline_id: airline.value || null
            }

            const res: any = await callUpdateAircraft(dataInit.id, dataObj);
            if (res.isSuccess) {
                toast.success("Cập nhật aircraft thành công", {
                    position: "bottom-right",
                });
                handleReset();
                reloadTable();
            } else {
                toast.error("Có lỗi xảy ra", {
                    position: "bottom-right",
                });
            }
        } else {
            //create
            const dataObj = {
                model,
                registration_number,
                total_seats,
                economy_seats,
                business_seats,
                first_class_seats,
                is_active,
                manufacture_year,
                airline_id: airline.value || null
            }
            const res: any = await callCreateAircraft(dataObj);
            if (res.isSuccess) {
                toast.success("Thêm mới aircraft thành công", {
                    position: "bottom-right",
                });
                handleReset();
                reloadTable();
            } else {
                toast.error("Có lỗi xảy ra", {
                    position: "bottom-right",
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setAirline({
            label: "",
            value: 0,
            key: 0,
        })
        setOpenModal(false);
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật airline" : "Thêm mới airline"}</>}
                open={openModal}
                modalProps={{
                    onCancel: () => { handleReset() },
                    afterClose: () => handleReset(),
                    destroyOnClose: true,
                    width: isMobile ? "100%" : 900,
                    keyboard: false,
                    maskClosable: false,
                    okText: <>{dataInit?.id ? "Xác nhận" : "Thêm mới"}</>,
                    cancelText: "Hủy",
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitData}
                initialValues={dataInit?.id ? { ...dataInit, is_active: dataInit.is_active + "" } : {}}
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProForm.Item
                            name="airline"
                            label={"Hãng hàng không"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        >
                            <DebounceSelect
                                allowClear
                                defaultValue={airline}
                                value={airline}
                                placeholder={<span>Chọn hãng hàng không</span>}
                                fetchOptions={fetchAirlineList}
                                onChange={(newValue: any) => {
                                    setAirline({
                                        key: newValue?.key,
                                        label: newValue?.label,
                                        value: newValue?.value
                                    });
                                }}
                                className="w-full !h-[70px]"
                            />
                        </ProForm.Item>
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label={"Tên"}
                            name="model"
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormText
                            label={"Số đăng ký"}
                            name="registration_number"
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="total_seats"
                            label="Tổng số ghế"
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="economy_seats"
                            label="Số ghế hạng phổ thông"
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="business_seats"
                            label="Số ghế hạng thượng gia"
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="first_class_seats"
                            label="Số ghế hạng nhất"
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormSelect
                            name="is_active"
                            label={"Trạng thái"}
                            valueEnum={AIRCRAFT_STATUS_VI}
                            placeholder={"Chọn trạng thái"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="manufacture_year"
                            label="Năm sản xuất"
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                </Row>
            </ModalForm>
        </>
    )
}

export default ModalAircraft;

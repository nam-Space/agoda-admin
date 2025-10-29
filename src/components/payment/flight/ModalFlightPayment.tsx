/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProFormDigit, ProFormMoney, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect } from "react";
import { callCreatePayment, callUpdatePayment } from "@/config/api";
import { PAYMENT_METHOD_VI, PAYMENT_STATUS_VI } from "@/constants/payment";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalFlightPayment = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [form] = Form.useForm();

    useEffect(() => {
        return () => form.resetFields()
    }, [dataInit]);

    const submitData = async (valuesForm: any) => {
        const { amount, method, status } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                amount,
                method,
                status,
            }

            const res: any = await callUpdatePayment(dataInit.id, dataObj);
            if (res.isSuccess) {
                message.success("Cập nhật payment thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        } else {
            //create
            const dataObj = {
                amount,
                method,
                status,
            }
            const res: any = await callCreatePayment(dataObj);
            if (res.isSuccess) {
                message.success("Thêm mới payment thành công");
                handleReset();
                reloadTable();
            } else {
                notification.error({
                    message: 'Có lỗi xảy ra',
                    description: res.message
                });
            }
        }
    }

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setOpenModal(false);
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật payment" : "Thêm mới payment"}</>}
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
                    zIndex: 1
                }}
                scrollToFirstError={true}
                preserve={false}
                form={form}
                onFinish={submitData}
                initialValues={dataInit?.id ? { ...dataInit, booking_code: dataInit?.booking?.booking_code } : {}}
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label={"Mã code"}
                            name="booking_code"
                            disabled={true}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label={"Mã giao dịch"}
                            name="transaction_id"
                            disabled={true}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormMoney
                            name="amount"
                            label="Tổng tiền"
                            locale="vi-VN"
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect
                            name="method"
                            label={"Phương thức thanh toán"}
                            valueEnum={PAYMENT_METHOD_VI}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect
                            name="status"
                            label={"Trạng thái thanh toán"}
                            valueEnum={PAYMENT_STATUS_VI}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                </Row>
            </ModalForm>
        </>
    )
}

export default ModalFlightPayment;

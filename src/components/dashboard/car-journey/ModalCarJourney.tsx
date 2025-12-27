/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormDateTimePicker } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Row } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { callUpdateCarBooking } from "@/config/api";
import vi_VN from 'antd/locale/vi_VN';
import { toast } from "react-toastify";
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import { CAR_BOOKING_STATUS, CAR_BOOKING_STATUS_VI } from "@/constants/booking";
import dayjs from "dayjs";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface IStatusSelect {
    label?: any;
    value?: number | string;
    key?: number | string;
}

const ModalCarJourney = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [form] = Form.useForm();

    const [status, setStatus] = useState<IStatusSelect>({
        label: "",
        value: 0,
        key: 0,
    });

    useEffect(() => {
        if (dataInit?.id) {
            setStatus({
                label: CAR_BOOKING_STATUS_VI[dataInit?.booking?.car_detail?.[0]?.status],
                value: dataInit?.booking?.car_detail?.[0]?.status + "",
                key: dataInit?.booking?.car_detail?.[0]?.status + "",
            })
        }
        return () => form.resetFields()
    }, [dataInit]);

    const submitData = async (valuesForm: any) => {
        const { dropoff_datetime } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                status: status.value,
                dropoff_datetime
            }

            const res: any = await callUpdateCarBooking(dataInit?.booking?.car_detail?.[0]?.id, dataObj);
            if (res.isSuccess) {
                toast.success("Cập nhật trạng thái chuyến đi thành công", {
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
        setOpenModal(false);
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật trạng thái chuyến đi" : "Thêm mới trạng thái chuyến đi"}</>}
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
                initialValues={dataInit?.id ? {
                    ...dataInit?.booking?.car_detail?.[0],
                    status: dataInit?.booking?.car_detail?.[0]?.status + "",
                    dropoff_datetime: dataInit?.booking?.car_detail?.[0]?.dropoff_datetime ? dayjs(dataInit.booking.car_detail[0].dropoff_datetime) : null
                } : {}}
            >
                <Row gutter={16}>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProForm.Item
                            name="status"
                            label={"Trạng thái"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        >
                            <DebounceSelect
                                allowClear
                                defaultValue={status}
                                value={status}
                                placeholder={<span>Chọn trạng thái</span>}
                                fetchOptions={async () => {
                                    return await Object.entries(CAR_BOOKING_STATUS_VI).map(([val, key]) => {
                                        return {
                                            label: key,
                                            value: val
                                        }
                                    })
                                }}
                                onChange={(newValue: any) => {
                                    setStatus({
                                        key: newValue?.key,
                                        label: newValue?.label,
                                        value: newValue?.value
                                    });
                                }}
                                className="w-full"
                            />
                        </ProForm.Item>
                    </Col>
                    {status.value === (CAR_BOOKING_STATUS.ARRIVED as any).toString() && <Col lg={12} md={12} sm={24} xs={24}>
                        <ConfigProvider locale={vi_VN}>
                            <ProFormDateTimePicker
                                name="dropoff_datetime"
                                label="Thời gian"
                                placeholder="Chọn thời gian"
                                rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                            />
                        </ConfigProvider>
                    </Col>}

                </Row>
            </ModalForm>
        </>
    )
}

export default ModalCarJourney;

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useRef, useState } from "react";
import { callCreateActivityPackage, callFetchActivity, callUpdateActivityPackage } from "@/config/api";
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import { toast } from "react-toastify";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface IActivitySelect {
    label?: string;
    value?: number;
    key?: number;
}

const ModalActivityPackage = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [form] = Form.useForm();

    const [activity, setActivity] = useState<IActivitySelect>({
        label: "",
        value: 0,
        key: 0,
    });

    useEffect(() => {
        if (dataInit?.id) {
            if (dataInit?.activity?.id) {
                setActivity(
                    {
                        label: dataInit.activity.name,
                        value: dataInit.activity.id,
                        key: dataInit.activity.id,
                    }
                )
            }
        }

        return () => form.resetFields()
    }, [dataInit]);

    async function fetchActivityList(): Promise<IActivitySelect[]> {
        const res: any = await callFetchActivity(`current=1&pageSize=100`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label: item.name,
                    value: item.id
                }
            })
            return temp;
        } else return [];
    }

    const submitData = async (valuesForm: any) => {
        const { name } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                activity: activity.value,
                name,
            }

            const res: any = await callUpdateActivityPackage(dataInit.id, dataObj);
            if (res.isSuccess) {
                toast.success("Cập nhật activity package thành công", {
                    position: "bottom-right",
                });
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
                activity: activity.value,
                name,
            }
            const res: any = await callCreateActivityPackage(dataObj);
            if (res.isSuccess) {
                toast.success("Thêm mới activity package thành công", {
                    position: "bottom-right",
                });
                handleReset();
                reloadTable();
            } else {
                toast.error(res.message, {
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
                title={<>{dataInit?.id ? "Cập nhật activity package" : "Thêm mới activity package"}</>}
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
                initialValues={dataInit?.id ? dataInit : {}}
            >
                <Row gutter={16}>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
                            name="activity"
                            label={"Hoạt động"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={activity}
                                value={activity}
                                placeholder={<span>Chọn hoạt động</span>}
                                fetchOptions={fetchActivityList}
                                onChange={(newValue: any) => {
                                    setActivity({
                                        key: newValue?.key,
                                        label: newValue?.label,
                                        value: newValue?.value
                                    });
                                }}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>

                    </Col>
                    <Col lg={24} md={24} sm={24} xs={24}>
                        <ProFormText
                            label={"Tên hoạt động"}
                            name="name"
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

export default ModalActivityPackage;

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useRef, useState } from "react";
import { callCreateActivityPackage, callFetchActivity, callUpdateActivityPackage } from "@/config/api";
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import { toast } from "react-toastify";
import { getImage } from "@/utils/imageUrl";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface IActivitySelect {
    label?: any;
    value?: number;
    key?: number;
}

const ModalActivityPackage = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const user = useAppSelector(state => state.account.user)

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
                        // label: dataInit.activity.name,
                        label: (<div className="flex items-center gap-[10px]">
                            <img
                                src={getImage(dataInit.activity?.images?.[0]?.image)}
                                className="w-[70px] h-[50px] object-cover"
                            />
                            <div>
                                <p className="leading-[20px]">{`${dataInit.activity.name}`}</p>
                            </div>
                        </div>),
                        value: dataInit.activity.id,
                        key: dataInit.activity.id,
                    }
                )
            }
        }

        return () => form.resetFields()
    }, [dataInit]);

    async function fetchActivityList(): Promise<IActivitySelect[]> {
        let query = ``
        if (user.role === ROLE.EVENT_ORGANIZER) {
            query += `&event_organizer_id=${user.id}`
        }
        const res: any = await callFetchActivity(`current=1&pageSize=1000${query}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label: <div className="flex items-center gap-[10px]">
                        <img
                            src={getImage(item?.images?.[0]?.image)}
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
        setActivity({
            label: "",
            value: 0,
            key: 0,
        })
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
                    <Col lg={24} md={24} sm={24} xs={24}>
                        <ProForm.Item
                            name="activity"
                            label={"Hoạt động"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        >
                            <DebounceSelect
                                allowClear
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
                                className="w-full !h-[70px]"
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

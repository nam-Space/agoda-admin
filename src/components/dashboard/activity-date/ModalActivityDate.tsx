/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormDatePicker, ProFormDateRangePicker, ProFormDateTimeRangePicker, ProFormDigit, ProFormMoney, ProFormText } from "@ant-design/pro-components";
import { Col, ConfigProvider, DatePicker, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useRef, useState } from "react";
import { callCreateActivityPackage, callCreateBulkActivityDate, callFetchActivity, callFetchActivityPackage, callUpdateActivityDate, callUpdateActivityPackage } from "@/config/api";
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import { toast } from "react-toastify";
import vi_VN from 'antd/locale/vi_VN';
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { getDatesBetween } from "@/utils/getDatesBetween";
import { getImage } from "@/utils/imageUrl";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

dayjs.locale("vi");

const { RangePicker } = DatePicker;

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface IActivityPackageSelect {
    label?: any;
    value?: number;
    key?: number;
}

const ModalActivityDate = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const user = useAppSelector(state => state.account.user)

    const [form] = Form.useForm();

    const [activityPackage, setActivityPackage] = useState<IActivityPackageSelect>({
        label: "",
        value: 0,
        key: 0,
    });

    useEffect(() => {
        if (dataInit?.id) {
            if (dataInit?.activity_package?.id) {
                setActivityPackage(
                    {
                        label:
                            <div className="flex items-center gap-[10px]">
                                <img
                                    src={getImage(dataInit.activity_package?.activity?.thumbnail)}
                                    className="w-[70px] h-[50px] object-cover"
                                />
                                <div>
                                    <strong>{dataInit.activity_package?.name}</strong> ({dataInit.activity_package?.activity?.name})
                                </div>
                            </div>
                        ,
                        value: dataInit.activity_package.id,
                        key: dataInit.activity_package.id,
                    }
                )
            }
        }

        return () => form.resetFields()
    }, [dataInit]);

    async function fetchActivityPackageList(): Promise<IActivityPackageSelect[]> {
        let query = ``
        if (user.role === ROLE.EVENT_ORGANIZER) {
            query += `&event_organizer_id=${user.id}`
        }
        const res: any = await callFetchActivityPackage(`current=1&pageSize=1000${query}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label:
                        <div className="flex items-center gap-[10px]">
                            <img
                                src={getImage(item?.activity?.images?.[0]?.image)}
                                className="w-[70px] h-[50px] object-cover"
                            />
                            <div>
                                <strong>{item.name}</strong> ({item.activity?.name})
                            </div>
                        </div>
                    ,
                    value: item.id
                }
            })
            return temp;
        } else return [];
    }

    const submitData = async (valuesForm: any) => {
        const { price_adult, price_child, adult_quantity, child_quantity, dates, date_launch } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                activity_package: activityPackage.value,
                price_adult,
                price_child, adult_quantity, child_quantity,
                date_launch,
            }

            const res: any = await callUpdateActivityDate(dataInit.id, dataObj);
            if (res.isSuccess) {
                toast.success("Cập nhật activity date thành công", {
                    position: "bottom-right",
                });
                handleReset();
                reloadTable();
            } else {
                toast.error(res.message, {
                    position: "bottom-right",
                });
            }
        } else {
            //create
            const dataObj = {
                activity_package: activityPackage.value,
                price_adult,
                price_child, adult_quantity, child_quantity,
                dates: getDatesBetween(dates[0], dates[1]),
            }
            const res: any = await callCreateBulkActivityDate(dataObj);
            if (res.isSuccess) {
                toast.success("Thêm mới activity date thành công", {
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
        setActivityPackage({
            label: "",
            value: 0,
            key: 0,
        })
        setOpenModal(false);
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật activity date" : "Thêm mới activity date"}</>}
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
                initialValues={dataInit?.id ? dataInit : {}}
            >
                <Row gutter={16}>
                    <Col lg={24} md={24} sm={24} xs={24}>
                        <ProForm.Item
                            name="activity_package"
                            label={"Gói của hoạt động"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        >
                            <DebounceSelect
                                allowClear
                                defaultValue={activityPackage}
                                value={activityPackage}
                                placeholder={<span>Chọn gói của hoạt động</span>}
                                fetchOptions={fetchActivityPackageList}
                                onChange={(newValue: any) => {
                                    setActivityPackage({
                                        key: newValue?.key,
                                        label: newValue?.label,
                                        value: newValue?.value
                                    });
                                }}
                                className="w-full !h-[70px]"
                            />
                        </ProForm.Item>

                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormMoney
                            name="price_adult"
                            label="Giá người lớn"
                            placeholder={"Nhập thông tin"}
                            locale="vi-VN"
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormMoney
                            name="price_child"
                            label="Giá trẻ em"
                            placeholder={"Nhập thông tin"}
                            locale="vi-VN"
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="adult_quantity"
                            label="Số lượng người lớn"
                            placeholder={"Nhập thông tin"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="child_quantity"
                            label="Số lượng trẻ em"
                            placeholder={"Nhập thông tin"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        />
                    </Col>
                    {dataInit?.id ? (
                        <Col lg={12} md={12} sm={24} xs={24}>
                            <ConfigProvider locale={vi_VN}>
                                <ProFormDatePicker
                                    name="date_launch"
                                    label="Ngày tổ chức"
                                    placeholder="Ngày bắt đầu"
                                />
                            </ConfigProvider>
                        </Col>
                    ) : <Col lg={12} md={12} sm={24} xs={24}>
                        <ConfigProvider locale={vi_VN}>
                            <ProFormDateRangePicker
                                name="dates"
                                label="Danh sách ngày tổ chức"
                                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                            />
                        </ConfigProvider>
                    </Col>}

                </Row>
            </ModalForm>
        </>
    )
}

export default ModalActivityDate;

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormMoney, ProFormSelect } from "@ant-design/pro-components";
import { Col, Form, Row } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { callCreateFlight, callFetchAircraft, callFetchAirline, callUpdateFlight } from "@/config/api";
import { toast } from "react-toastify";
import { getImage } from "@/utils/imageUrl";
import { IActivitySelect } from "../activity-package/ModalActivityPackage";
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import { BAGGAGE_INCLUDED_VI } from "@/constants/airline";
import FlightLegTable from "../flight-leg/FlightLegTable";
import FlightLegTableCreate from "../flight-leg/FlightLegTableCreate";
import SeatClassPricingTableCreate from "../seat-class-pricing/SeatClassPricingTableCreate";
import SeatClassPricingTable from "../seat-class-pricing/SeatClassPricingTable";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalFlight = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const user = useAppSelector(state => state.account.user)

    const [airline, setAirline] = useState<IActivitySelect>({
        label: "",
        value: 0,
        key: 0,
    })

    const [aircraft, setAircraft] = useState<IActivitySelect>({
        label: "",
        value: 0,
        key: 0,
    })

    const [legsData, setLegsData] = useState<any>([]);
    const [seatClassesData, setSeatClassesData] = useState<any>([]);

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
                                <p className="leading-[20px]">{`${dataInit.airline?.name}`}</p>
                            </div>
                        </div>),
                        value: dataInit.airline.id,
                        key: dataInit.airline.id,
                    }
                )
            }

            if (dataInit?.aircraft?.id) {
                setAircraft(
                    {
                        label: (<div className="flex items-center gap-[10px]">
                            <div>
                                <p className="leading-[20px]">{`${dataInit.aircraft?.model}`}</p>
                            </div>
                        </div>),
                        value: dataInit.aircraft.id,
                        key: dataInit.aircraft.id,
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

    async function fetchAircraftList(): Promise<IActivitySelect[]> {
        let query = ``
        if (!airline?.value) return []
        query += `&airline_id=${airline.value}`
        query += `&is_active=${1}`
        const res: any = await callFetchAircraft(`current=1&pageSize=1000${query}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label: <div className="flex items-center gap-[10px]">
                        <div>
                            <p className="leading-[20px]">{`${item.model}`}</p>
                        </div>
                    </div>,
                    value: item.id
                }
            })
            return temp;
        } else return [];
    }

    const submitData = async (valuesForm: any) => {
        const { baggage_included, base_price } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                baggage_included,
                base_price,
                aircraft_id: aircraft?.value || null,
                airline_id: airline?.value || null,
            }

            const res: any = await callUpdateFlight(dataInit.id, dataObj);
            if (res.isSuccess) {
                toast.success("Cập nhật flight thành công", {
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
                baggage_included,
                base_price,
                aircraft_id: aircraft?.value || null,
                airline_id: airline?.value || null,
                legs_data: legsData,
                seat_classes_data: seatClassesData,
            }
            const res: any = await callCreateFlight(dataObj);
            if (res.isSuccess) {
                toast.success("Thêm mới flight thành công", {
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
        setLegsData([])
        setSeatClassesData([])
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật flight" : "Thêm mới flight"}</>}
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
                initialValues={dataInit?.id ? { ...dataInit, baggage_included: dataInit.baggage_included + "" } : {}}
            >
                <Row gutter={16}>
                    <Col lg={24} md={24} sm={24} xs={24}>
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
                                    setAircraft({
                                        key: 0,
                                        label: "",
                                        value: 0
                                    });
                                    form.resetFields(["aircraft"])
                                }}
                                className="w-full !h-[70px]"
                            />
                        </ProForm.Item>
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProForm.Item
                            name="aircraft"
                            label={"Máy bay"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        >
                            <DebounceSelect
                                allowClear
                                defaultValue={aircraft}
                                value={aircraft}
                                placeholder={<span>Chọn máy bay</span>}
                                fetchOptions={fetchAircraftList}
                                onChange={(newValue: any) => {
                                    setAircraft({
                                        key: newValue?.key,
                                        label: newValue?.label,
                                        value: newValue?.value
                                    });
                                }}
                            />
                        </ProForm.Item>
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormSelect
                            name="baggage_included"
                            label={"Bao gồm hành lý"}
                            valueEnum={BAGGAGE_INCLUDED_VI}
                            placeholder={"Chọn trạng thái"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormMoney
                            name="base_price"
                            label="Giá cơ sở"
                            placeholder={"Nhập thông tin"}
                            locale="vi-VN"
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        />
                    </Col>

                </Row>
                <div className="flex flex-col gap-[50px] mt-[30px]">
                    {dataInit?.id ? <FlightLegTable flight={dataInit} canCreate={true} canUpdate={true} canDelete={true} /> : <FlightLegTableCreate legsData={legsData} setLegsData={setLegsData} />}
                    {dataInit?.id ? <SeatClassPricingTable flight={dataInit} canCreate={true} canUpdate={true} canDelete={true} /> : <SeatClassPricingTableCreate seatClassesData={seatClassesData} setSeatClassesData={setSeatClassesData} />}
                </div>
            </ModalForm>
        </>
    )
}

export default ModalFlight;

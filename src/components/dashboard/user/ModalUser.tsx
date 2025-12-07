/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormDatePicker, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useState, useEffect } from "react";
import { callCreateUser, callFetchAirline, callFetchHotel, callFetchUser, callRefreshToken, callUpdateUser, callUploadSingleImage } from "@/config/api";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';
import dayjs from "dayjs";
import { getImage, getUserAvatar } from "@/utils/imageUrl";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAccount } from "@/redux/slice/accountSlide";
import Cookies from "js-cookie";
import { ROLE, ROLE_VI, STATUS_USER_VI } from "@/constants/role";
import { GENDER_VI } from "@/constants/gender";
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import { toast } from "react-toastify";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface IUserAvatar {
    name: string;
    uid: string;
}

export interface IRoleSelect {
    label?: any;
    value?: string;
    key?: string;
}

export interface IManagerSelect {
    label?: any;
    value?: number;
    key?: number;
}

const ModalUser = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const user = useAppSelector((state: any) => state.account.user)

    const [role, setRole] = useState<IRoleSelect>({
        label: ROLE_VI.admin,
        value: ROLE.ADMIN,
        key: ROLE.ADMIN,
    });

    const [manager, setManager] = useState<IManagerSelect>({
        label: "",
        value: 0,
        key: 0,
    });

    const [hotel, setHotel] = useState<IManagerSelect>({
        label: "",
        value: 0,
        key: 0,
    });

    const [flightOperationManager, setFlightOperationManager] = useState<IManagerSelect>({
        label: "",
        value: 0,
        key: 0,
    });

    const [airline, setAirline] = useState<IManagerSelect>({
        label: "",
        value: 0,
        key: 0,
    });

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataAvatar, setDataAvatar] = useState<IUserAvatar[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const dispatch = useAppDispatch()
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            if (dataInit?.avatar) {
                setDataAvatar([
                    {
                        uid: uuidv4(),
                        name: `${import.meta.env.VITE_BE_URL}${dataInit.avatar}`
                    }
                ])
            }

            if (dataInit?.role) {
                setRole(
                    {
                        label: ROLE_VI[dataInit.role as keyof typeof ROLE_VI],
                        value: dataInit.role,
                        key: dataInit.role,
                    }
                )
            }

            if (dataInit?.manager?.id) {
                setManager(
                    {
                        label: (<div className="flex items-center gap-[10px]">
                            <img
                                src={getUserAvatar(dataInit.manager.avatar)}
                                className="w-[40px] h-[40px] object-cover rounded-[50%]"
                            />
                            <div>
                                <p className="leading-[20px]">{`${dataInit.manager.first_name} ${dataInit.manager.last_name}`}</p>
                                <p className="leading-[20px] text-[#929292]">{`@${dataInit.manager.username}`}</p>
                            </div>
                        </div>),
                        value: dataInit.manager.id,
                        key: dataInit.manager.id,
                    }
                )
            }

            if (dataInit?.hotel?.id) {
                setHotel(
                    {
                        label: (<div className="flex items-center gap-[10px]">
                            <img
                                src={getImage(dataInit.hotel?.images?.[0]?.image)}
                                className="w-[70px] h-[50px] object-cover"
                            />
                            <div>
                                <p className="leading-[20px]">{`${dataInit.hotel.name}`}</p>
                            </div>
                        </div>),
                        value: dataInit.hotel.id,
                        key: dataInit.hotel.id,
                    }
                )
            }
            if (dataInit?.flight_operation_manager?.id) {
                setFlightOperationManager(
                    {
                        label: (<div className="flex items-center gap-[10px]">
                            <img
                                src={getUserAvatar(dataInit.flight_operation_manager.avatar)}
                                className="w-[40px] h-[40px] object-cover rounded-[50%]"
                            />
                            <div>
                                <p className="leading-[20px]">{`${dataInit.flight_operation_manager.first_name} ${dataInit.flight_operation_manager.last_name}`}</p>
                                <p className="leading-[20px] text-[#929292]">{`@${dataInit.flight_operation_manager.username}`}</p>
                            </div>
                        </div>),
                        value: dataInit.flight_operation_manager.id,
                        key: dataInit.flight_operation_manager.id,
                    }
                )
            }

            if (dataInit?.airline?.id) {
                setAirline(
                    {
                        label: (<div className="flex items-center gap-[10px]">
                            <img
                                src={getImage(dataInit?.airline?.logo)}
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

    const submitUser = async (valuesForm: any) => {
        const { username, first_name, last_name, email, phone_number, password, gender, birthday, is_active } = valuesForm;

        if (dataInit?.id) {
            //update
            const userObj = {
                username: dataInit.username,
                email,
                first_name,
                last_name,
                birthday,
                phone_number,
                gender,
                avatar: (dataAvatar[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
                role: role.value,
                manager: manager.value || null,
                is_active,
                hotel: hotel.value || null,
                flight_operation_manager: flightOperationManager.value || null,
                airline: airline.value || null
            }

            if (role.value !== ROLE.HOTEL_STAFF) {
                userObj.manager = null
                userObj.hotel = null
            }

            if (role.value !== ROLE.AIRLINE_TICKETING_STAFF) {
                userObj.flight_operation_manager = null
                userObj.airline = null
            }

            const res: any = await callUpdateUser(dataInit.id, userObj);
            if (res.isSuccess) {
                if (user.id === dataInit.id) {
                    const refresh_token_agoda = Cookies.get(
                        "refresh_token_agoda_admin"
                    );
                    const resTmp = await callRefreshToken({
                        refresh: refresh_token_agoda,
                    });
                    if (resTmp.data) {
                        localStorage.setItem('access_token_agoda_admin', resTmp.data.access);
                        dispatch(fetchAccount())
                    }
                }
                toast.success("Cập nhật user thành công", {
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
            const userObj = {
                username,
                email,
                password,
                first_name,
                last_name,
                birthday,
                phone_number,
                gender,
                avatar: (dataAvatar[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
                role: role.value,
                manager: manager.value || null,
                is_active,
                hotel: hotel.value || null,
                flight_operation_manager: flightOperationManager.value || null,
                airline: airline.value || null
            }

            if (role.value !== ROLE.HOTEL_STAFF) {
                userObj.manager = null
                userObj.hotel = null
            }

            if (role.value !== ROLE.AIRLINE_TICKETING_STAFF) {
                userObj.flight_operation_manager = null
                userObj.airline = null
            }

            const res: any = await callCreateUser(userObj);
            if (res.isSuccess) {
                toast.success("Thêm mới user thành công", {
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

    async function fetchManagerList(): Promise<IManagerSelect[]> {
        const res: any = await callFetchUser(`current=1&pageSize=1000&role=${ROLE.OWNER}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label: <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(item.avatar)}
                            className="w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]">{`${item.first_name} ${item.last_name}`}</p>
                            <p className="leading-[20px] text-[#929292]">{`@${item.username}`}</p>
                        </div>
                    </div>,
                    value: item.id
                }
            })
            return temp;
        } else return [];
    }

    async function fetchHotelList(): Promise<IManagerSelect[]> {
        let query = ``
        if (manager.value) {
            query += `&ownerId=${manager.value}`
        }
        else return [];
        const res: any = await callFetchHotel(`current=1&pageSize=1000${query}`);
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

    async function fetchFlightOperationManagerList(): Promise<IManagerSelect[]> {
        const res: any = await callFetchUser(`current=1&pageSize=1000&role=${ROLE.FLIGHT_OPERATION_STAFF}`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label: <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(item.avatar)}
                            className="w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]">{`${item.first_name} ${item.last_name}`}</p>
                            <p className="leading-[20px] text-[#929292]">{`@${item.username}`}</p>
                        </div>
                    </div>,
                    value: item.id
                }
            })
            return temp;
        } else return [];
    }

    async function fetchAirlineList(): Promise<IManagerSelect[]> {
        let query = ``
        if (flightOperationManager.value) {
            query += `&flight_operations_staff_id=${flightOperationManager.value}`
        }
        else return [];
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

    const handleReset = async () => {
        form.resetFields();
        setDataInit(null);
        setDataAvatar([])
        setOpenModal(false);
        setRole({
            label: ROLE_VI.admin,
            value: ROLE.ADMIN,
            key: ROLE.ADMIN,
        }
        )
        setManager({
            label: "",
            value: 0,
            key: 0,
        })
        setHotel({
            label: "",
            value: 0,
            key: 0,
        })
        setFlightOperationManager({
            label: "",
            value: 0,
            key: 0,
        })
        setAirline({
            label: "",
            value: 0,
            key: 0,
        })
    }

    const handleRemoveFile = (file: any) => {
        setDataAvatar([])
    }

    const handlePreview = async (file: any) => {
        if (!file.originFileObj) {
            setPreviewImage(file.url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
            return;
        }
        getBase64(file.originFileObj, (url: string) => {
            setPreviewImage(url);
            setPreviewOpen(true);
            setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        });
    };

    const getBase64 = (img: any, callback: any) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (file: any) => {
        return true;
    };

    const handleChange = (info: any) => {
        if (info.file.status === 'uploading') {
            setLoadingUpload(true);
        }
        if (info.file.status === 'done') {
            setLoadingUpload(false);
        }
        if (info.file.status === 'error') {
            setLoadingUpload(false);
            toast.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.", {
                position: "bottom-right",
            });
        }
    };

    const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
        const res: any = await callUploadSingleImage({ file, type: 'user' });
        if (res?.isSuccess) {
            setDataAvatar([{
                name: `${import.meta.env.VITE_BE_URL}${res.data.image_url}`,
                uid: uuidv4()
            }])
            if (onSuccess) onSuccess('ok')
        } else {
            if (onError) {
                setDataAvatar([])
                const error = new Error(res.message);
                onError({ event: error });
            }
        }
    };

    return (
        <ModalForm
            title={<>{dataInit?.id ? "Cập nhật người dùng" : "Thêm mới người dùng"}</>}
            open={openModal}
            modalProps={{
                onCancel: () => { handleReset() },
                afterClose: () => handleReset(),
                destroyOnClose: true,
                width: isMobile ? "100%" : 900,
                keyboard: false,
                maskClosable: false,
                okText: <>{dataInit?.id ? "Xác nhận" : "Thêm mới"}</>,
                cancelText: "Hủy"
            }}
            scrollToFirstError={true}
            preserve={false}
            form={form}
            onFinish={submitUser}
            initialValues={dataInit?.id ? { ...dataInit, is_active: dataInit.is_active + "" } : {}}
        >
            <Row gutter={16}>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormText
                        label={"Tên đăng nhập"}
                        name="username"
                        rules={[{ required: dataInit?.id ? false : true, message: "Trường này là bắt buộc" }]}
                        disabled={dataInit?.id ? true : false}
                        placeholder={"Nhập thông tin"}
                    />
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormText
                        label={"Email"}
                        name="email"
                        rules={[
                            { required: true, message: "Trường này là bắt buộc" },
                        ]}
                        placeholder={"Nhập thông tin"}
                    />
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormText.Password
                        disabled={dataInit?.id ? true : false}
                        label={"Mật khẩu"}
                        name="password"
                        rules={[{ required: dataInit?.id ? false : true, message: "Trường này là bắt buộc" }]}
                        placeholder={"Nhập thông tin"}
                    />
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={"Avatar"}
                        name="avatar"
                    >
                        <ConfigProvider locale={enUS}>
                            <Upload
                                name="avatar"
                                listType="picture-card"
                                className="avatar-uploader"
                                maxCount={1}
                                multiple={false}
                                customRequest={handleUploadFileLogo}
                                beforeUpload={beforeUpload}
                                onChange={handleChange}
                                onRemove={(file) => handleRemoveFile(file)}
                                onPreview={handlePreview}
                                defaultFileList={
                                    dataInit?.id && dataInit.avatar ?
                                        [
                                            {
                                                uid: uuidv4(),
                                                name: dataInit?.avatar ?? "",
                                                status: 'done',
                                                url: getUserAvatar(dataInit.avatar),
                                            }
                                        ] : []
                                }

                            >
                                <div>
                                    {loadingUpload ? <LoadingOutlined /> : <PlusOutlined />}
                                    <div style={{ marginTop: 8 }}>
                                        Tải ảnh lên
                                    </div>
                                </div>
                            </Upload>
                        </ConfigProvider>
                    </Form.Item>
                </Col>
                <Col lg={6} md={6} sm={24} xs={24}>
                    <ConfigProvider locale={enUS}>
                        <ProFormDatePicker
                            label={"Ngày sinh"}
                            name="birthday"
                            normalize={(value: any) => value && dayjs(value, 'YYYY-MM-DD')}
                            fieldProps={{
                                format: 'YYYY-MM-DD',
                            }}
                            width={'lg'}
                            placeholder={"Chọn ngày sinh"}
                        />
                    </ConfigProvider>
                </Col>
                <Col lg={6} md={6} sm={24} xs={24}>
                    <ProFormText
                        label={"Tên"}
                        name="first_name"
                        rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        placeholder={"Nhập thông tin"}
                    />
                </Col>
                <Col lg={6} md={6} sm={24} xs={24}>
                    <ProFormText
                        label={"Họ"}
                        name="last_name"
                        rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        placeholder={"Nhập thông tin"}
                    />
                </Col>
                <Col lg={6} md={6} sm={24} xs={24}>
                    <ProFormText
                        label={"SĐT"}
                        name="phone_number"
                        placeholder={"Nhập thông tin"}
                    />
                </Col>
                <Col lg={6} md={6} sm={24} xs={24}>
                    <ProFormSelect
                        name="gender"
                        label={"Giới tính"}
                        valueEnum={GENDER_VI}
                        placeholder={"Chọn giới tính"}
                        rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                    />
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProForm.Item
                        name="role"
                        label={"Vai trò"}
                        rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                    >
                        <DebounceSelect
                            allowClear
                            showSearch
                            defaultValue={role}
                            value={role}
                            placeholder={<span>Chọn vai trò</span>}
                            fetchOptions={async () => {
                                return await Object.entries(ROLE_VI).map(([val, key]) => {
                                    return {
                                        label: key,
                                        value: val
                                    }
                                })
                            }}
                            onChange={(newValue: any) => {
                                setRole({
                                    key: newValue?.key,
                                    label: newValue?.label,
                                    value: newValue?.value
                                });
                            }}
                            className="w-full"
                        />
                    </ProForm.Item>
                </Col>
                {role.value === ROLE.HOTEL_STAFF && (
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProForm.Item
                            name="manager"
                            label={"Người quản lý khách sạn"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        >
                            <DebounceSelect
                                allowClear
                                defaultValue={manager}
                                value={manager}
                                placeholder={<span>Chọn người quản lý</span>}
                                fetchOptions={fetchManagerList}
                                onChange={(newValue: any) => {
                                    setManager({
                                        key: newValue?.key,
                                        label: newValue?.label,
                                        value: newValue?.value
                                    });
                                    setHotel({
                                        label: "",
                                        value: 0,
                                        key: 0,
                                    })
                                    form.resetFields(["hotel"]);
                                }}
                                className="w-full !h-[60px]"
                            />
                        </ProForm.Item>
                    </Col>

                )}
                {role.value === ROLE.AIRLINE_TICKETING_STAFF && (
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProForm.Item
                            name="flight_operation_manager"
                            label={"Người quản lý hãng hàng không"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        >
                            <DebounceSelect
                                allowClear
                                defaultValue={flightOperationManager}
                                value={flightOperationManager}
                                placeholder={<span>Chọn người quản lý hãng hàng không</span>}
                                fetchOptions={fetchFlightOperationManagerList}
                                onChange={(newValue: any) => {
                                    setFlightOperationManager({
                                        key: newValue?.key,
                                        label: newValue?.label,
                                        value: newValue?.value
                                    });
                                }}
                                className="w-full !h-[60px]"
                            />
                        </ProForm.Item>
                    </Col>

                )}

                {!!manager.value && (
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProForm.Item
                            name="hotel"
                            label={"Khách sạn"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        >
                            <DebounceSelect
                                allowClear
                                defaultValue={hotel}
                                value={hotel}
                                placeholder={<span>Chọn khách sạn</span>}
                                fetchOptions={fetchHotelList}
                                onChange={(newValue: any) => {
                                    setHotel({
                                        key: newValue?.key,
                                        label: newValue?.label,
                                        value: newValue?.value
                                    });
                                }}
                                className="w-full !h-[70px]"
                            />
                        </ProForm.Item>
                    </Col>
                )}

                {!!flightOperationManager.value && (
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
                )}

                <Col lg={6} md={6} sm={24} xs={24}>
                    <ProFormSelect
                        name="is_active"
                        label={"Trạng thái"}
                        valueEnum={STATUS_USER_VI}
                        placeholder={"Chọn trạng thái"}
                        rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                    />
                </Col>
            </Row>
            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
                style={{ zIndex: 50 }}
            >
                <img alt="userImg" style={{ width: '100%', objectFit: 'cover' }} width={500} height={500} src={previewImage} />
            </Modal>
        </ModalForm>
    )
}

export default ModalUser;

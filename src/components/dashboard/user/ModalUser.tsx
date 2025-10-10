/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProFormDatePicker, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useState, useEffect } from "react";
import { callCreateUser, callRefreshToken, callUpdateUser, callUploadSingleImage } from "@/config/api";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';
import dayjs from "dayjs";
import { getUserAvatar } from "@/utils/imageUrl";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchAccount } from "@/redux/slice/accountSlide";
import Cookies from "js-cookie";

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

const ModalUser = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const user = useAppSelector((state: any) => state.account.user)

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
        }
        return () => form.resetFields()
    }, [dataInit]);

    const submitUser = async (valuesForm: any) => {
        const { username, first_name, last_name, email, phone_number, password, gender, birthday, role } = valuesForm;

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
                role
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
                message.success("Cập nhật user thành công");
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
                role
            }
            const res: any = await callCreateUser(userObj);
            if (res.isSuccess) {
                message.success("Thêm mới user thành công");
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
        setDataAvatar([])
        setOpenModal(false);
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
            message.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.")
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
        <>
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
                initialValues={dataInit?.id ? dataInit : {}}
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
                            valueEnum={{
                                male: "Nam",
                                female: "Nữ",
                                other: "Khác",
                            }}
                            placeholder={"Chọn giới tính"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormSelect
                            name="role"
                            label={"Vai trò"}
                            valueEnum={{
                                admin: "Quản trị viên",
                                staff: "Nhân viên",
                                driver: "Tài xế",
                                customer: "Khách hàng",
                                owner: "Chủ khách sạn",
                            }}
                            placeholder={"Chọn vai trò"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        />

                    </Col>
                </Row>
            </ModalForm>
            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
                style={{ zIndex: 50 }}
            >
                <img alt="userImg" style={{ width: '100%', objectFit: 'cover' }} width={500} height={500} src={previewImage} />
            </Modal>
        </>
    )
}

export default ModalUser;

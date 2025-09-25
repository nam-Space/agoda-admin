/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormDigit, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { callCreateCar, callFetchUser, callUpdateCar, callUploadSingleImage } from "@/config/api";
import { useAppDispatch } from "@/redux/hooks";
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { DebounceSelect } from "@/components/antd/DebounceSelect";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface ICarImage {
    name: string;
    uid: string;
}

export interface IUserSelect {
    label?: string;
    value?: number;
    key?: number;
}

const ModalCar = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataImage, setDataImage] = useState<ICarImage[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [form] = Form.useForm();

    const [user, setUser] = useState<IUserSelect>({
        label: "",
        value: 0,
        key: 0,
    });

    useEffect(() => {
        if (dataInit?.id) {
            if (dataInit?.image) {
                setDataImage([
                    {
                        uid: uuidv4(),
                        name: `${import.meta.env.VITE_BE_URL}${dataInit.image}`
                    }
                ])
            }

            if (dataInit?.user?.id) {
                setUser(
                    {
                        label: `${dataInit.user.first_name} ${dataInit.user.last_name}`,
                        value: dataInit.user.id,
                        key: dataInit.user.id,
                    }
                )
            }
        }

        return () => form.resetFields()
    }, [dataInit]);

    async function fetchUserList(): Promise<IUserSelect[]> {
        const res: any = await callFetchUser(`current=1&pageSize=100&role=driver`);
        if (res?.isSuccess) {
            const list = res.data;
            const temp = list.map((item: any) => {
                return {
                    label: `${item.first_name} ${item.last_name}`,
                    value: item.id
                }
            })
            return temp;
        } else return [];
    }

    const submitData = async (valuesForm: any) => {
        const {
            name,
            description,
            capacity,
            luggage,
            point,
            avg_star,
            price_per_km,
            avg_speed
        } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                user: user.value,
                name,
                description,
                capacity,
                luggage,
                point,
                avg_star,
                price_per_km,
                avg_speed,
                image: (dataImage[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
            }

            const res: any = await callUpdateCar(dataInit.id, dataObj);
            if (res.isSuccess) {
                message.success("Cập nhật car thành công");
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
                user: user.value,
                name,
                description,
                capacity,
                luggage,
                point,
                avg_star,
                price_per_km,
                avg_speed,
                image: (dataImage[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
            }
            const res: any = await callCreateCar(dataObj);
            if (res.isSuccess) {
                message.success("Thêm mới car thành công");
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
        setDataImage([])
        setOpenModal(false);
    }

    const handleRemoveFile = (file: any) => {
        setDataImage([])
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
        const res: any = await callUploadSingleImage({ file, type: 'car' });
        if (res?.isSuccess) {
            setDataImage([{
                name: `${import.meta.env.VITE_BE_URL}${res.data.image_url}`,
                uid: uuidv4()
            }])
            if (onSuccess) onSuccess('ok')
        } else {
            if (onError) {
                setDataImage([])
                const error = new Error(res.message);
                onError({ event: error });
            }
        }
    };

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật car" : "Thêm mới car"}</>}
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
                            name="user"
                            label={"Tài xế"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={user}
                                value={user}
                                placeholder={<span>Chọn tài xế</span>}
                                fetchOptions={fetchUserList}
                                onChange={(newValue: any) => {
                                    setUser({
                                        key: newValue?.key,
                                        label: newValue?.label,
                                        value: newValue?.value
                                    });
                                }}
                                style={{ width: '100%' }}
                            />
                        </ProForm.Item>

                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label={"Tên xe"}
                            name="name"
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormTextArea
                            label={"Mô tả"}
                            name="description"
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <Form.Item
                            labelCol={{ span: 24 }}
                            label={"Image"}
                            name="image"
                        >
                            <ConfigProvider locale={enUS}>
                                <Upload
                                    name="image"
                                    listType="picture-card"
                                    className="image-uploader"
                                    maxCount={1}
                                    multiple={false}
                                    customRequest={handleUploadFileLogo}
                                    beforeUpload={beforeUpload}
                                    onChange={handleChange}
                                    onRemove={(file) => handleRemoveFile(file)}
                                    onPreview={handlePreview}
                                    defaultFileList={
                                        dataInit?.id && dataInit.image ?
                                            [
                                                {
                                                    uid: uuidv4(),
                                                    name: dataInit?.image ?? "",
                                                    status: 'done',
                                                    url: `${import.meta.env.VITE_BE_URL}${dataInit.image}`,
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
                        <ProFormDigit
                            name="capacity"
                            label="Sức chứa (người)"
                            placeholder={"Nhập thông tin"}
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="luggage"
                            label="Số hành lý tối đa"
                            placeholder={"Nhập thông tin"}
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="price_per_km"
                            label="Giá mỗi km"
                            placeholder={"Nhập thông tin"}
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="avg_speed"
                            label="Tốc độ trung bình (km/h)"
                            placeholder={"Nhập thông tin"}
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="point"
                            label="Điểm"
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="avg_star"
                            label="Số sao trung bình"
                            placeholder={"Nhập thông tin"}
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
                <img alt="img" style={{ width: '100%', objectFit: 'cover' }} width={500} height={500} src={previewImage} />
            </Modal>
        </>
    )
}

export default ModalCar;

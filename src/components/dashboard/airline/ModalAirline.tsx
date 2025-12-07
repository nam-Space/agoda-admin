/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormText } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { callCreateAirline, callFetchUser, callUpdateAirline, callUploadSingleImage } from "@/config/api";
import { BlockTypeSelect, BoldItalicUnderlineToggles, CodeToggle, CreateLink, diffSourcePlugin, DiffSourceToggleWrapper, frontmatterPlugin, headingsPlugin, imagePlugin, InsertFrontmatter, InsertImage, InsertTable, InsertThematicBreak, linkDialogPlugin, linkPlugin, listsPlugin, ListsToggle, markdownShortcutPlugin, MDXEditor, quotePlugin, tablePlugin, thematicBreakPlugin, toolbarPlugin, UndoRedo } from '@mdxeditor/editor';
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { marked } from 'marked';
import TurndownService from 'turndown';
import enUS from 'antd/lib/locale/en_US';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "react-toastify";
import { ICitySelect } from "../hotel/ModalHotel";
import { ROLE } from "@/constants/role";
import { useAppSelector } from "@/redux/hooks";
import { getUserAvatar } from "@/utils/imageUrl";
import { DebounceSelect } from "@/components/antd/DebounceSelect";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface ICityImage {
    name: string;
    uid: string;
}

const ModalAirline = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const user = useAppSelector(state => state.account.user)
    const [description, setDescription] = useState("");

    const [flightOperationsStaff, setFlightOperationsStaff] = useState<ICitySelect>({
        label: "",
        value: 0,
        key: 0,
    });

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataImage, setDataImage] = useState<ICityImage[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            if (dataInit?.logo) {
                setDataImage([
                    {
                        uid: uuidv4(),
                        name: `${import.meta.env.VITE_BE_URL}${dataInit.logo}`
                    }
                ])
            }

            setDescription(dataInit.description)
        }

        return () => form.resetFields()
    }, [dataInit]);

    async function fetchFlightOperationsStaffList(): Promise<ICitySelect[]> {
        let query = ``
        if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
            query += `&username=${user.username}`
        }

        const res: any = await callFetchUser(`current=1&pageSize=1000&role=${ROLE.FLIGHT_OPERATION_STAFF}${query}`);
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

    const submitData = async (valuesForm: any) => {
        const { name, code } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                name,
                description,
                code,
                logo: (dataImage[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
                flight_operations_staff: flightOperationsStaff.value || null
            }

            const res: any = await callUpdateAirline(dataInit.id, dataObj);
            if (res.isSuccess) {
                toast.success("Cập nhật airline thành công", {
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
                name,
                description,
                code,
                logo: (dataImage[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
                flight_operations_staff: flightOperationsStaff.value || null
            }
            const res: any = await callCreateAirline(dataObj);
            if (res.isSuccess) {
                toast.success("Thêm mới airline thành công", {
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
        setDescription("")
        setDataImage([])
        setFlightOperationsStaff({
            label: "",
            value: 0,
            key: 0,
        })
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
            toast.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.", {
                position: "bottom-right",
            });
        }
    };

    const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
        const res: any = await callUploadSingleImage({ file, type: 'airline_logo' });
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

    const convertHtmlToMarkdown = (htmlContent: string) => {
        const turndownService = new TurndownService();
        const markdown = turndownService.turndown(htmlContent);
        return markdown
    }

    const handleChangeMarkdown = (valMarkDown: string) => {
        const valHtml = marked(valMarkDown)
        setDescription(valHtml as string)
    }

    return (
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
            initialValues={dataInit?.id ? dataInit : {}}
        >
            <Row gutter={16}>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProForm.Item
                        name="flightOperationsStaff"
                        label={"Nhân viên vận hành chuyến bay"}
                        rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                    >
                        <DebounceSelect
                            allowClear
                            defaultValue={flightOperationsStaff}
                            value={flightOperationsStaff}
                            placeholder={<span>Chọn nhân viên vận hành chuyến bay</span>}
                            fetchOptions={fetchFlightOperationsStaffList}
                            onChange={(newValue: any) => {
                                setFlightOperationsStaff({
                                    key: newValue?.key,
                                    label: newValue?.label,
                                    value: newValue?.value
                                });
                            }}
                            className="w-full !h-[60px]"
                        />
                    </ProForm.Item>
                </Col>
                <Col lg={24} md={24} sm={24} xs={24}>
                    <ProFormText
                        label={"Tên"}
                        name="name"
                        rules={[
                            { required: true, message: "Trường này là bắt buộc" },
                        ]}
                        placeholder={"Nhập thông tin"}
                    />
                </Col>
                <Col lg={24} md={24} sm={24} xs={24}>
                    <ProFormText
                        label={"Mã hàng không"}
                        name="code"
                        rules={[
                            { required: true, message: "Trường này là bắt buộc" },
                        ]}
                        placeholder={"Nhập thông tin"}
                    />
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={"Ảnh cẩm nang"}
                        name="logo"
                    >
                        <ConfigProvider locale={enUS}>
                            <Upload
                                name="logo"
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
                                    dataInit?.id && dataInit.logo ?
                                        [
                                            {
                                                uid: uuidv4(),
                                                name: dataInit?.logo ?? "",
                                                status: 'done',
                                                url: `${import.meta.env.VITE_BE_URL}${dataInit.logo}`,
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
                <Col lg={24} md={24} sm={24} xs={24}>
                    <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Mô tả</label>
                    <MDXEditor
                        markdown={convertHtmlToMarkdown(description)}
                        className="min-h-[500px] bg-[#fcfcfc]"
                        // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                        contentEditableClassName="prose"
                        onChange={handleChangeMarkdown}
                        plugins={[
                            headingsPlugin(),
                            diffSourcePlugin({
                                diffMarkdown: 'An older version',
                                viewMode: 'rich-text'
                            }),
                            linkPlugin(),
                            linkDialogPlugin(),
                            frontmatterPlugin(),
                            imagePlugin(),
                            tablePlugin(),
                            thematicBreakPlugin(),
                            listsPlugin(),
                            quotePlugin(),
                            markdownShortcutPlugin(),
                            toolbarPlugin({
                                toolbarClassName: 'markdown-editor',
                                toolbarContents: () => (
                                    <>
                                        <BlockTypeSelect />
                                        <BoldItalicUnderlineToggles />
                                        <CodeToggle />
                                        <CreateLink />
                                        <InsertFrontmatter />
                                        <InsertImage />
                                        <InsertTable />
                                        <InsertThematicBreak />
                                        <ListsToggle />
                                        <DiffSourceToggleWrapper>
                                            <UndoRedo />
                                        </DiffSourceToggleWrapper>
                                    </>
                                )
                            })]}
                    />
                </Col>
            </Row>
            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewOpen(false)}
            >
                <img alt="img" style={{ width: '100%', objectFit: 'cover' }} width={500} height={500} src={previewImage} />
            </Modal>
        </ModalForm>
    )
}

export default ModalAirline;

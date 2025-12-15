/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormText } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { callCreateCity, callFetchCountry, callUpdateCity, callUploadSingleImage } from "@/config/api";
import { BlockTypeSelect, BoldItalicUnderlineToggles, CodeToggle, CreateLink, diffSourcePlugin, DiffSourceToggleWrapper, frontmatterPlugin, headingsPlugin, imagePlugin, InsertFrontmatter, InsertImage, InsertTable, InsertThematicBreak, linkDialogPlugin, linkPlugin, listsPlugin, ListsToggle, markdownShortcutPlugin, MDXEditor, quotePlugin, tablePlugin, thematicBreakPlugin, toolbarPlugin, UndoRedo } from '@mdxeditor/editor';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { v4 as uuidv4 } from 'uuid';
import enUS from 'antd/lib/locale/en_US';
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import { toast } from "react-toastify";

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

export interface ICountrySelect {
    label?: string;
    value?: number;
    key?: number;
}

const ModalCity = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [description, setDescription] = useState("");

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataImage, setDataImage] = useState<ICityImage[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const [loadingUploadHandbook, setLoadingUploadHandbook] = useState<boolean>(false);
    const [dataImageHandbook, setDataImageHandbook] = useState<ICityImage[]>([]);
    const [previewOpenHandbook, setPreviewOpenHandbook] = useState(false);
    const [previewImageHandbook, setPreviewImageHandbook] = useState('');
    const [previewTitleHandbook, setPreviewTitleHandbook] = useState('');

    const [form] = Form.useForm();

    const [country, setCountry] = useState<ICountrySelect>({
        label: "",
        value: 0,
        key: 0,
    });

    useEffect(() => {
        if (dataInit?.id) {
            setDescription(dataInit.description)
            if (dataInit?.image) {
                setDataImage([
                    {
                        uid: uuidv4(),
                        name: `${import.meta.env.VITE_BE_URL}${dataInit.image}`
                    }
                ])
            }

            if (dataInit?.image_handbook) {
                setDataImageHandbook([
                    {
                        uid: uuidv4(),
                        name: `${import.meta.env.VITE_BE_URL}${dataInit.image_handbook}`
                    }
                ])
            }

            if (dataInit?.country?.id) {
                setCountry(
                    {
                        label: dataInit.country.name,
                        value: dataInit.country.id,
                        key: dataInit.country.id,
                    }
                )
            }
        }

        return () => form.resetFields()
    }, [dataInit]);

    async function fetchCountryList(): Promise<ICountrySelect[]> {
        const res: any = await callFetchCountry(`current=1&pageSize=100`);
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
                country: country.value,
                name,
                description,
                image: (dataImage[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
                image_handbook: (dataImageHandbook[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
            }

            const res: any = await callUpdateCity(dataInit.id, dataObj);
            if (res.isSuccess) {
                toast.success("Cập nhật city thành công", {
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
                country: country.value,
                name,
                description,
                image: (dataImage[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
                image_handbook: (dataImageHandbook[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
            }
            const res: any = await callCreateCity(dataObj);
            if (res.isSuccess) {
                toast.success("Thêm mới city thành công", {
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
        setDataImage([])
        setDataImageHandbook([])
        setDescription("")
        setOpenModal(false);
    }

    const handleRemoveFile = (_file: any) => {
        setDataImage([])
    }

    const handleRemoveFileHandbook = (_file: any) => {
        setDataImageHandbook([])
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

    const handlePreviewHandbook = async (file: any) => {
        if (!file.originFileObj) {
            setPreviewImageHandbook(file.url);
            setPreviewOpenHandbook(true);
            setPreviewTitleHandbook(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
            return;
        }
        getBase64(file.originFileObj, (url: string) => {
            setPreviewImageHandbook(url);
            setPreviewOpenHandbook(true);
            setPreviewTitleHandbook(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
        });
    };

    const getBase64 = (img: any, callback: any) => {
        const reader = new FileReader();
        reader.addEventListener('load', () => callback(reader.result));
        reader.readAsDataURL(img);
    };

    const beforeUpload = (_file: any) => {
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

    const handleChangeHandbook = (info: any) => {
        if (info.file.status === 'uploading') {
            setLoadingUploadHandbook(true);
        }
        if (info.file.status === 'done') {
            setLoadingUploadHandbook(false);
        }
        if (info.file.status === 'error') {
            setLoadingUploadHandbook(false);
            toast.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.", {
                position: "bottom-right",
            });
        }
    };

    const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
        const res: any = await callUploadSingleImage({ file, type: 'city' });
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

    const handleUploadFileLogoHandbook = async ({ file, onSuccess, onError }: any) => {
        const res: any = await callUploadSingleImage({ file, type: 'city_handbook' });
        if (res?.isSuccess) {
            setDataImageHandbook([{
                name: `${import.meta.env.VITE_BE_URL}${res.data.image_url}`,
                uid: uuidv4()
            }])
            if (onSuccess) onSuccess('ok')
        } else {
            if (onError) {
                setDataImageHandbook([])
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
            title={<>{dataInit?.id ? "Cập nhật city" : "Thêm mới city"}</>}
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
                <Col lg={6} md={6} sm={24} xs={24}>
                    <ProForm.Item
                        name="country"
                        label={"Quốc gia"}
                        rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                    >
                        <DebounceSelect
                            allowClear
                            showSearch
                            defaultValue={country}
                            value={country}
                            placeholder={<span>Chọn Quốc gia</span>}
                            fetchOptions={fetchCountryList}
                            onChange={(newValue: any) => {
                                setCountry({
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
                        label={"Tên thành phố"}
                        name="name"
                        rules={[
                            { required: true, message: "Trường này là bắt buộc" },
                        ]}
                        placeholder={"Nhập thông tin"}
                    />
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={"Ảnh"}
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
                <Col lg={12} md={12} sm={24} xs={24}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={"Ảnh cẩm nang"}
                        name="image_handbook"
                    >
                        <ConfigProvider locale={enUS}>
                            <Upload
                                name="image_handbook"
                                listType="picture-card"
                                className="image_handbook-uploader"
                                maxCount={1}
                                multiple={false}
                                customRequest={handleUploadFileLogoHandbook}
                                beforeUpload={beforeUpload}
                                onChange={handleChangeHandbook}
                                onRemove={(file) => handleRemoveFileHandbook(file)}
                                onPreview={handlePreviewHandbook}
                                defaultFileList={
                                    dataInit?.id && dataInit.image_handbook ?
                                        [
                                            {
                                                uid: uuidv4(),
                                                name: dataInit?.image_handbook ?? "",
                                                status: 'done',
                                                url: `${import.meta.env.VITE_BE_URL}${dataInit.image_handbook}`,
                                            }
                                        ] : []
                                }

                            >
                                <div>
                                    {loadingUploadHandbook ? <LoadingOutlined /> : <PlusOutlined />}
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
            <Modal
                open={previewOpenHandbook}
                title={previewTitleHandbook}
                footer={null}
                onCancel={() => setPreviewOpenHandbook(false)}
            >
                <img alt="img" style={{ width: '100%', objectFit: 'cover' }} width={500} height={500} src={previewImageHandbook} />
            </Modal>
        </ModalForm>
    )
}

export default ModalCity;

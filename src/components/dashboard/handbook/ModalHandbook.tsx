/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { callCreateHandbook, callFetchCity, callUpdateHandbook, callUploadSingleImage } from "@/config/api";
import { BlockTypeSelect, BoldItalicUnderlineToggles, CodeToggle, CreateLink, diffSourcePlugin, DiffSourceToggleWrapper, frontmatterPlugin, headingsPlugin, imagePlugin, InsertFrontmatter, InsertImage, InsertTable, InsertThematicBreak, linkDialogPlugin, linkPlugin, listsPlugin, ListsToggle, markdownShortcutPlugin, MDXEditor, quotePlugin, tablePlugin, thematicBreakPlugin, toolbarPlugin, UndoRedo } from '@mdxeditor/editor';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { toast } from "react-toastify";
import enUS from 'antd/lib/locale/en_US';
import { v4 as uuidv4 } from 'uuid';
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import { CATEGORY_HANDBOOK_VI } from "@/constants/handbook";
import { useAppSelector } from "@/redux/hooks";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

interface IHotelImage {
    name: string;
    uid: string;
}

export interface ICitySelect {
    label?: any;
    value?: number;
    key?: number;
}

const ModalHandbook = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const user = useAppSelector(state => state.account.user)

    const [formMarkdown, setFormMarkdown] = useState({
        description: '',
        short_description: '',
    })

    const [city, setCity] = useState<ICitySelect>({
        label: "",
        value: 0,
        key: 0,
    });

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataImage, setDataImage] = useState<IHotelImage[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');


    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            setFormMarkdown({
                ...formMarkdown,
                description: dataInit.description || "",
                short_description: dataInit.short_description || "",
            })

            if (dataInit?.image) {
                setDataImage([
                    {
                        uid: uuidv4(),
                        name: `${import.meta.env.VITE_BE_URL}${dataInit.image}`
                    }
                ])
            }

            if (dataInit?.city?.id) {
                setCity(
                    {
                        label: dataInit.city.name,
                        value: dataInit.city.id,
                        key: dataInit.city.id,
                    }
                )
            }

        }

        return () => form.resetFields()
    }, [dataInit]);

    async function fetchCityList(): Promise<ICitySelect[]> {
        const res: any = await callFetchCity(`current=1&pageSize=100`);
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
        const { title, category } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                city: city.value,
                title,
                category,
                ...formMarkdown,
                image: (dataImage[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
                author: user?.id || null,
            }
            const res: any = await callUpdateHandbook(dataInit.id, dataObj);
            if (res.isSuccess) {
                toast.success("Cập nhật handbook thành công", {
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
                city: city.value,
                title,
                category,
                ...formMarkdown,
                image: (dataImage[0]?.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""),
                author: user?.id || null,
            }
            const res: any = await callCreateHandbook(dataObj);
            if (res.isSuccess) {
                toast.success("Thêm mới handbook thành công", {
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
        setDataImage([])
        setCity({
            label: "",
            value: 0,
            key: 0,
        })
        setFormMarkdown({
            description: '',
            short_description: '',
        })
        setOpenModal(false);
    }

    const handleRemoveFile = (_file: any) => {
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

    const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
        const res: any = await callUploadSingleImage({ file, type: 'handbook' });
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

    const handleChangeMarkdown = (type: string, valMarkDown: string) => {
        const valHtml = marked(valMarkDown)
        setFormMarkdown({
            ...formMarkdown,
            [type]: valHtml
        })
    }

    return (
        <ModalForm
            title={<>{dataInit?.id ? "Cập nhật handbook" : "Thêm mới handbook"}</>}
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
                        name="city"
                        label={"Thành phố"}
                        rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                    >
                        <DebounceSelect
                            allowClear
                            showSearch
                            defaultValue={city}
                            value={city}
                            placeholder={<span>Chọn thành phố</span>}
                            fetchOptions={fetchCityList}
                            onChange={(newValue: any) => {
                                setCity({
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
                        label={"Tiêu đề"}
                        name="title"
                        rules={[
                            { required: true, message: "Trường này là bắt buộc" },
                        ]}
                        placeholder={"Nhập thông tin"}
                    />
                </Col>
                <Col lg={12} md={12} sm={24} xs={24}>
                    <ProFormSelect
                        name="category"
                        label={"Danh mục"}
                        valueEnum={CATEGORY_HANDBOOK_VI}
                        placeholder={"Chọn danh mục"}
                        rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                    />
                </Col>
                <Col lg={24} md={24} sm={24} xs={24}>
                    <Form.Item
                        labelCol={{ span: 24 }}
                        label={"Ảnh cẩm nang"}
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
                <Col lg={24} md={24} sm={24} xs={24}>
                    <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Mô tả ngắn</label>
                    <MDXEditor
                        markdown={convertHtmlToMarkdown(formMarkdown.short_description)}
                        className="min-h-[500px] bg-[#fcfcfc]"
                        // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                        contentEditableClassName="prose"
                        onChange={(val) => handleChangeMarkdown('short_description', val)}
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
                <Col lg={24} md={24} sm={24} xs={24}>
                    <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Mô tả</label>
                    <MDXEditor
                        markdown={convertHtmlToMarkdown(formMarkdown.description)}
                        className="min-h-[500px] bg-[#fcfcfc]"
                        // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                        contentEditableClassName="prose"
                        onChange={(val) => handleChangeMarkdown('description', val)}
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

export default ModalHandbook;

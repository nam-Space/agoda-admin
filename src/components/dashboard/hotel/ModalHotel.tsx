/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormDigit, ProFormText } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useRef, useState } from "react";
import { callCreateCountry, callCreateHotel, callFetchCity, callFetchUser, callUpdateCountry, callUpdateHotel, callUploadSingleImage } from "@/config/api";
import { AdmonitionDirectiveDescriptor, BlockTypeSelect, BoldItalicUnderlineToggles, ChangeAdmonitionType, ChangeCodeMirrorLanguage, CodeToggle, CreateLink, diffSourcePlugin, DiffSourceToggleWrapper, directivesPlugin, frontmatterPlugin, headingsPlugin, imagePlugin, InsertAdmonition, InsertCodeBlock, InsertFrontmatter, InsertImage, InsertSandpack, InsertTable, InsertThematicBreak, linkDialogPlugin, linkPlugin, listsPlugin, ListsToggle, markdownShortcutPlugin, MDXEditor, MDXEditorMethods, quotePlugin, sandpackPlugin, tablePlugin, thematicBreakPlugin, toolbarPlugin, UndoRedo } from '@mdxeditor/editor';
import { useAppDispatch } from "@/redux/hooks";
import { marked } from 'marked';
import TurndownService from 'turndown';
import { toast } from "react-toastify";
import enUS from 'antd/lib/locale/en_US';
import { v4 as uuidv4 } from 'uuid';
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import { ROLE } from "@/constants/role";
import { getUserAvatar } from "@/utils/imageUrl";

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

const ModalHotel = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [formMarkdown, setFormMarkdown] = useState({
        mostFeature: '',
        facilities: '',
        withUs: '',
        usefulInformation: '',
        description: '',
        amenitiesAndFacilities: '',
        locationInfo: '',
        nearbyLocation: '',
        regulation: ''
    })

    const [city, setCity] = useState<ICitySelect>({
        label: "",
        value: 0,
        key: 0,
    });

    const [owner, setOwner] = useState<ICitySelect>({
        label: "",
        value: 0,
        key: 0,
    });

    const [loadingUpload, setLoadingUpload] = useState<boolean>(false);
    const [dataImages, setDataImages] = useState<IHotelImage[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');


    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            setFormMarkdown({
                ...formMarkdown,
                mostFeature: dataInit.mostFeature || "",
                facilities: dataInit.facilities || "",
                withUs: dataInit.withUs || "",
                usefulInformation: dataInit.usefulInformation || "",
                description: dataInit.description || "",
                amenitiesAndFacilities: dataInit.amenitiesAndFacilities || "",
                locationInfo: dataInit.locationInfo || "",
                nearbyLocation: dataInit.nearbyLocation || "",
                regulation: dataInit.regulation || ""
            })

            if (dataInit?.images?.length > 0) {
                setDataImages(dataInit.images.map((image: any) => {
                    return {
                        uid: uuidv4(),
                        name: `${import.meta.env.VITE_BE_URL}${image.image}`,
                    }
                }))
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
            else {
                setCity({
                    label: "",
                    value: 0,
                    key: 0,
                })
            }

            if (dataInit?.owner?.id) {
                setOwner(
                    {
                        label: (<div className="flex items-center gap-[10px]">
                            <img
                                src={getUserAvatar(dataInit.owner.avatar)}
                                className="w-[40px] h-[40px] object-cover rounded-[50%]"
                            />
                            <div>
                                <p className="leading-[20px]">{`${dataInit.owner.first_name} ${dataInit.owner.last_name}`}</p>
                                <p className="leading-[20px] text-[#929292]">{`@${dataInit.owner.username}`}</p>
                            </div>
                        </div>),
                        value: dataInit.owner.id,
                        key: dataInit.owner.id,
                    }
                )
            }
            else {
                setOwner({
                    label: "",
                    value: 0,
                    key: 0,
                })
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

    async function fetchOwnerList(): Promise<ICitySelect[]> {
        const res: any = await callFetchUser(`current=1&pageSize=1000&role=owner`);
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
        const { name, lat, lng, point, avg_star, location } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                city: city.value,
                owner: owner.value,
                name,
                lat,
                lng,
                point,
                avg_star,
                location,
                ...formMarkdown,
                images: dataImages.map(image => (image.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""))
            }
            const res: any = await callUpdateHotel(dataInit.id, dataObj);
            if (res.isSuccess) {
                toast.success("Cập nhật hotel thành công", {
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
                owner: owner.value,
                name,
                lat,
                lng,
                point,
                avg_star,
                location,
                ...formMarkdown,
                images: dataImages.map(image => (image.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""))
            }
            const res: any = await callCreateHotel(dataObj);
            if (res.isSuccess) {
                toast.success("Thêm mới hotel thành công", {
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
        setDataImages([])
        setFormMarkdown({
            mostFeature: '',
            facilities: '',
            withUs: '',
            usefulInformation: '',
            description: '',
            amenitiesAndFacilities: '',
            locationInfo: '',
            nearbyLocation: '',
            regulation: ''
        })
        setOpenModal(false);
    }

    const handleRemoveFile = (file: any) => {
        const newDataImages = [...dataImages].filter(image => image.name !== file.url);
        setDataImages(newDataImages)
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
        const res: any = await callUploadSingleImage({ file, type: 'hotel' });
        if (res?.isSuccess) {
            setTimeout(() => {
                setDataImages([...dataImages,
                {
                    uid: uuidv4(),
                    name: `${import.meta.env.VITE_BE_URL}${res.data.image_url}`,
                }])
                if (onSuccess) onSuccess('ok')
            }, 300)

        } else {
            if (onError) {
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
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật hotel" : "Thêm mới hotel"}</>}
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
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProForm.Item
                            name="owner"
                            label={"Chủ khách sạn"}
                        >
                            <DebounceSelect
                                allowClear
                                showSearch
                                defaultValue={owner}
                                value={owner}
                                placeholder={<span>Chọn chủ khách sạn</span>}
                                fetchOptions={fetchOwnerList}
                                onChange={(newValue: any) => {
                                    setOwner({
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
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="lat"
                            label="Vĩ độ (lat)"
                            placeholder={"Nhập thông tin"}
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="lng"
                            label="Kinh độ (lng)"
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
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label={"Địa điểm"}
                            name="location"
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={24} md={24} sm={24} xs={24}>
                        <Form.Item
                            labelCol={{ span: 24 }}
                            label={"Ảnh khách sạn"}
                            name="images"
                        >
                            <ConfigProvider locale={enUS}>
                                <Upload
                                    name="images"
                                    listType="picture-card"
                                    className="images-uploader"
                                    // multiple={true}
                                    customRequest={handleUploadFileLogo}
                                    beforeUpload={beforeUpload}
                                    onChange={handleChange}
                                    onRemove={(file) => handleRemoveFile(file)}
                                    onPreview={handlePreview}
                                    defaultFileList={
                                        (dataInit?.id && dataInit?.images?.length > 0) ?
                                            dataInit.images.map((image: any) => {
                                                return {
                                                    uid: uuidv4(),
                                                    name: `${image.image}`,
                                                    url: `${import.meta.env.VITE_BE_URL}${image.image}`,
                                                    status: 'done'
                                                }
                                            }) : []
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
                        <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Điểm nổi bật nhất</label>
                        <MDXEditor
                            markdown={convertHtmlToMarkdown(formMarkdown.mostFeature)}
                            className="min-h-[500px] bg-[#fcfcfc]"
                            // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                            contentEditableClassName="prose"
                            onChange={(val) => handleChangeMarkdown('mostFeature', val)}
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
                        <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Cơ sở vật chất</label>
                        <MDXEditor
                            markdown={convertHtmlToMarkdown(formMarkdown.facilities)}
                            className="min-h-[500px] bg-[#fcfcfc]"
                            // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                            contentEditableClassName="prose"
                            onChange={(val) => handleChangeMarkdown('facilities', val)}
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
                        <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Về chúng tôi</label>
                        <MDXEditor
                            markdown={convertHtmlToMarkdown(formMarkdown.withUs)}
                            className="min-h-[500px] bg-[#fcfcfc]"
                            // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                            contentEditableClassName="prose"
                            onChange={(val) => handleChangeMarkdown('withUs', val)}
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
                        <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Thông tin hữu ích</label>
                        <MDXEditor
                            markdown={convertHtmlToMarkdown(formMarkdown.usefulInformation)}
                            className="min-h-[500px] bg-[#fcfcfc]"
                            // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                            contentEditableClassName="prose"
                            onChange={(val) => handleChangeMarkdown('usefulInformation', val)}
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
                    <Col lg={24} md={24} sm={24} xs={24}>
                        <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Tiện nghi và cơ sở vật chất</label>
                        <MDXEditor
                            markdown={convertHtmlToMarkdown(formMarkdown.amenitiesAndFacilities)}
                            className="min-h-[500px] bg-[#fcfcfc]"
                            // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                            contentEditableClassName="prose"
                            onChange={(val) => handleChangeMarkdown('amenitiesAndFacilities', val)}
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
                        <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Vị trí</label>
                        <MDXEditor
                            markdown={convertHtmlToMarkdown(formMarkdown.locationInfo)}
                            className="min-h-[500px] bg-[#fcfcfc]"
                            // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                            contentEditableClassName="prose"
                            onChange={(val) => handleChangeMarkdown('locationInfo', val)}
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
                        <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Đi đâu gần đây</label>
                        <MDXEditor
                            markdown={convertHtmlToMarkdown(formMarkdown.nearbyLocation)}
                            className="min-h-[500px] bg-[#fcfcfc]"
                            // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                            contentEditableClassName="prose"
                            onChange={(val) => handleChangeMarkdown('nearbyLocation', val)}
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
                        <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Quy định của chỗ nghỉ</label>
                        <MDXEditor
                            markdown={convertHtmlToMarkdown(formMarkdown.regulation)}
                            className="min-h-[500px] bg-[#fcfcfc]"
                            // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                            contentEditableClassName="prose"
                            onChange={(val) => handleChangeMarkdown('regulation', val)}
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

export default ModalHotel;

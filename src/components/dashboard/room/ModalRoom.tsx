/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormDateRangePicker, ProFormDigit, ProFormMoney, ProFormSelect, ProFormText } from "@ant-design/pro-components";
import { Col, ConfigProvider, Form, Modal, Row, Upload, } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { callCreateRoom, callFetchHotel, callUpdateRoom, callUploadSingleImage } from "@/config/api";
import { BlockTypeSelect, BoldItalicUnderlineToggles, CodeToggle, CreateLink, diffSourcePlugin, DiffSourceToggleWrapper, frontmatterPlugin, headingsPlugin, imagePlugin, InsertFrontmatter, InsertImage, InsertTable, InsertThematicBreak, linkDialogPlugin, linkPlugin, listsPlugin, ListsToggle, markdownShortcutPlugin, MDXEditor, quotePlugin, tablePlugin, thematicBreakPlugin, toolbarPlugin, UndoRedo } from '@mdxeditor/editor';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { toast } from "react-toastify";
import enUS from 'antd/lib/locale/en_US';
import { v4 as uuidv4 } from 'uuid';
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import vi_VN from 'antd/locale/vi_VN';
import { AVAILABLE_ROOM_VI } from "@/constants/hotel";
import { getImage } from "@/utils/imageUrl";
import RoomAmenityTable from "../room-amenity/RoomAmenityTable";
import RoomAmenityTableCreate from "../room-amenity/RoomAmenityTableCreate";

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

export interface IHotelSelect {
    label?: any;
    value?: number;
    key?: number;
}

const ModalRoom = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;

    const [formMarkdown, setFormMarkdown] = useState({
        description: ''
    })

    const [hotel, setHotel] = useState<IHotelSelect>({
        label: "",
        value: 0,
        key: 0,
    });

    const [roomAmenitiesData, setRoomAmenitiesData] = useState([])

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
                description: dataInit.description || ""
            })

            if (dataInit?.images?.length > 0) {
                setDataImages(dataInit.images.map((image: any) => {
                    return {
                        uid: uuidv4(),
                        name: `${import.meta.env.VITE_BE_URL}${image.image}`,
                    }
                }))
            }

            if (dataInit?.hotel?.id) {
                setHotel(
                    {
                        label: <div className="flex items-center gap-[10px]">
                            <img
                                src={getImage(dataInit.hotel?.thumbnail)}
                                className="w-[70px] h-[50px] object-cover"
                            />
                            <div>
                                <p className="leading-[20px]">{`${dataInit.hotel.name}`}</p>
                            </div>
                        </div>,
                        value: dataInit.hotel.id,
                        key: dataInit.hotel.id,
                    }
                )
            }
        }

        return () => form.resetFields()
    }, [dataInit]);

    async function fetchHotelList(): Promise<IHotelSelect[]> {
        const res: any = await callFetchHotel(`current=1&pageSize=1000`);
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
        const { room_type, price_per_night, adults_capacity, children_capacity, total_rooms, available_rooms, dates, beds, area_m2, available } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                hotel: hotel.value,
                room_type,
                price_per_night,
                adults_capacity,
                children_capacity,
                total_rooms,
                available_rooms,
                start_date: dates[0],
                end_date: dates[1],
                beds,
                area_m2,
                available,
                ...formMarkdown,
                images: dataImages.map(image => (image.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, ""))
            }
            const res: any = await callUpdateRoom(dataInit.id, dataObj);
            if (res.isSuccess) {
                toast.success("Cập nhật room thành công", {
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
                hotel: hotel.value,
                room_type,
                price_per_night,
                adults_capacity,
                children_capacity,
                total_rooms,
                available_rooms,
                start_date: dates[0],
                end_date: dates[1],
                beds,
                area_m2,
                available,
                ...formMarkdown,
                images: dataImages.map(image => (image.name as any)?.replaceAll(`${import.meta.env.VITE_BE_URL}`, "")),
                amenities_data: roomAmenitiesData.map((amenity: any) => {
                    return {
                        name: amenity.name
                    }
                })
            }
            const res: any = await callCreateRoom(dataObj);
            if (res.isSuccess) {
                toast.success("Thêm mới room thành công", {
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
            description: ''
        })
        setHotel({
            label: "",
            value: 0,
            key: 0,
        })
        setRoomAmenitiesData([])
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
            toast.error(info?.file?.error?.event?.message ?? "Đã có lỗi xảy ra khi upload file.", {
                position: "bottom-right",
            });
        }
    };

    const handleUploadFileLogo = async ({ file, onSuccess, onError }: any) => {
        const res: any = await callUploadSingleImage({ file, type: 'room' });
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
                title={<>{dataInit?.id ? "Cập nhật room" : "Thêm mới room"}</>}
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
                initialValues={dataInit?.id ? {
                    ...dataInit,
                    available: dataInit.available + "",
                    dates: [dataInit.start_date, dataInit.end_date]
                } : {}}
            >
                <Row gutter={16}>
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
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ProFormText
                            label={"Loại phòng"}
                            name="room_type"
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                            placeholder={"Nhập thông tin"}
                        />
                    </Col>
                    <Col lg={24} md={24} sm={24} xs={24}>
                        <Form.Item
                            labelCol={{ span: 24 }}
                            label={"Ảnh phòng"}
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
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormMoney
                            name="price_per_night"
                            label="Giá mỗi đêm"
                            placeholder={"Nhập thông tin"}
                            locale="vi-VN"
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="adults_capacity"
                            label="Số lượng người lớn tối đa"
                            placeholder={"Nhập thông tin"}
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="children_capacity"
                            label="Số lượng trẻ em tối đa"
                            placeholder={"Nhập thông tin"}
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="total_rooms"
                            label="Tổng số phòng"
                            placeholder={"Nhập thông tin"}
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="available_rooms"
                            label="Tổng số phòng khả dụng"
                            placeholder={"Nhập thông tin"}
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="beds"
                            label="Số giường ngủ"
                            placeholder={"Nhập thông tin"}
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormDigit
                            name="area_m2"
                            label="Diện tích (m²)"
                            placeholder={"Nhập thông tin"}
                            rules={[
                                { required: true, message: "Trường này là bắt buộc" },
                            ]}
                        />
                    </Col>
                    <Col lg={6} md={6} sm={24} xs={24}>
                        <ProFormSelect
                            name="available"
                            label={"Có sẵn"}
                            valueEnum={AVAILABLE_ROOM_VI}
                            placeholder={"Chọn trạng thái"}
                            rules={[{ required: true, message: "Trường này là bắt buộc" }]}
                        />
                    </Col>
                    <Col lg={12} md={12} sm={24} xs={24}>
                        <ConfigProvider locale={vi_VN}>
                            <ProFormDateRangePicker
                                name="dates"
                                label="Thời gian khả dụng"
                                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                                className="w-full"
                            />
                        </ConfigProvider>
                    </Col>
                    {dataInit?.id ? <Col lg={24} md={24} sm={24} xs={24}>
                        <RoomAmenityTable
                            room={dataInit}
                            canCreate={true}
                            canUpdate={true}
                            canDelete={true}
                        />
                    </Col> : <Col lg={24} md={24} sm={24} xs={24}>
                        <RoomAmenityTableCreate
                            roomAmenitiesData={roomAmenitiesData}
                            setRoomAmenitiesData={setRoomAmenitiesData}
                        />
                    </Col>}
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
        </>
    )
}

export default ModalRoom;

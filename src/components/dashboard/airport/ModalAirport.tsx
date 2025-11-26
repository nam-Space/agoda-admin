/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProForm, ProFormDigit, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { callCreateAirport, callFetchCity, callUpdateAirport } from "@/config/api";
import { BlockTypeSelect, BoldItalicUnderlineToggles, CodeToggle, CreateLink, diffSourcePlugin, DiffSourceToggleWrapper, directivesPlugin, frontmatterPlugin, headingsPlugin, imagePlugin, InsertFrontmatter, InsertImage, InsertTable, InsertThematicBreak, linkDialogPlugin, linkPlugin, listsPlugin, ListsToggle, markdownShortcutPlugin, MDXEditor, quotePlugin, tablePlugin, thematicBreakPlugin, toolbarPlugin, UndoRedo } from '@mdxeditor/editor';
import { useAppDispatch } from "@/redux/hooks";
import { marked } from 'marked';
import TurndownService from 'turndown';
import { DebounceSelect } from "@/components/antd/DebounceSelect";
import { toast } from "react-toastify";

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

export interface ICitySelect {
    label?: any;
    value?: number;
    key?: number;
}

const ModalAirport = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [description, setDescription] = useState("");

    const [city, setCity] = useState<ICitySelect>({
        label: "",
        value: 0,
        key: 0,
    });

    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            setDescription(dataInit.description)

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
        const { name, location, lat, lng } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                city: city.value,
                name,
                location,
                description,
                lat,
                lng
            }

            const res: any = await callUpdateAirport(dataInit.id, dataObj);
            if (res.isSuccess) {
                toast.success("Cập nhật airport thành công", {
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
                city: city.value,
                name,
                location,
                description,
                lat,
                lng
            }
            const res: any = await callCreateAirport(dataObj);
            if (res.isSuccess) {
                toast.success("Thêm mới airport thành công", {
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
        setCity({
            label: "",
            value: 0,
            key: 0,
        })
        setDescription("")
        setOpenModal(false);
    }

    const convertHtmlToMarkdown = (htmlContent: string) => {
        const turndownService = new TurndownService();
        const markdown = turndownService.turndown(htmlContent);
        return markdown
    }

    const handleChange = (valMarkDown: string) => {
        const valHtml = marked(valMarkDown)
        setDescription(valHtml as string)
    }

    return (
        <>
            <ModalForm
                title={<>{dataInit?.id ? "Cập nhật airport" : "Thêm mới airport"}</>}
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
                            label={"Địa điểm"}
                            name="location"
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
                    <Col lg={24} md={24} sm={24} xs={24}>
                        <label className="flex items-center gap-[4px]"><span className="text-red-500 text-[20px]">*</span>Mô tả</label>
                        <MDXEditor
                            markdown={convertHtmlToMarkdown(description)}
                            className="min-h-[500px] bg-[#fcfcfc]"
                            // bắt buộc phải có contentEditableClassName="prose" nếu không TailwindCSS sẽ ghi đè
                            contentEditableClassName="prose"
                            onChange={handleChange}
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
        </>
    )
}

export default ModalAirport;

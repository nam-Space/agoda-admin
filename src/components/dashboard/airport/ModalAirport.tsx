/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModalForm, ProFormDigit, ProFormText } from "@ant-design/pro-components";
import { Col, Form, Row, message, notification } from "antd";
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from "react";
import { callCreateAirport, callUpdateAirport } from "@/config/api";
import { BlockTypeSelect, BoldItalicUnderlineToggles, CodeToggle, CreateLink, diffSourcePlugin, DiffSourceToggleWrapper, directivesPlugin, frontmatterPlugin, headingsPlugin, imagePlugin, InsertFrontmatter, InsertImage, InsertTable, InsertThematicBreak, linkDialogPlugin, linkPlugin, listsPlugin, ListsToggle, markdownShortcutPlugin, MDXEditor, quotePlugin, tablePlugin, thematicBreakPlugin, toolbarPlugin, UndoRedo } from '@mdxeditor/editor';
import { useAppDispatch } from "@/redux/hooks";
import { marked } from 'marked';
import TurndownService from 'turndown';

interface IProps {
    openModal: boolean;
    setOpenModal: (v: boolean) => void;
    dataInit?: any | null;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}

const ModalAirport = (props: IProps) => {
    const { openModal, setOpenModal, reloadTable, dataInit, setDataInit } = props;
    const [description, setDescription] = useState("");

    const dispatch = useAppDispatch()
    const [form] = Form.useForm();

    useEffect(() => {
        if (dataInit?.id) {
            setDescription(dataInit.description)
        }

        return () => form.resetFields()
    }, [dataInit]);

    const submitData = async (valuesForm: any) => {
        const { name, location, lat, lng } = valuesForm;

        if (dataInit?.id) {
            //update
            const dataObj = {
                name,
                location,
                description,
                lat,
                lng
            }

            const res: any = await callUpdateAirport(dataInit.id, dataObj);
            if (res.isSuccess) {
                message.success("Cập nhật airport thành công");
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
                name,
                location,
                description,
                lat,
                lng
            }
            const res: any = await callCreateAirport(dataObj);
            if (res.isSuccess) {
                message.success("Thêm mới airport thành công");
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

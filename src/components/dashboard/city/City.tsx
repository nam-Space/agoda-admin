/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Popconfirm, Select, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteCity, callFetchCountry } from "../../../config/api";
import DataTable from "../../antd/Table";
import ModalCity from "./ModalCity";
import { fetchCity } from "@/redux/slice/citySlide";
import { getImage } from "@/utils/imageUrl";
import { toast } from "react-toastify";
import _ from "lodash";
export default function City() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.city.isFetching);
    const meta = useAppSelector(state => state.city.meta);
    const cities = useAppSelector(state => state.city.data);
    const [countries, setCountries] = useState([])
    const dispatch = useAppDispatch();

    const handleDeleteCity = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteCity(id);
            if (res?.isSuccess) {
                toast.success("Xóa city thành công", {
                    position: "bottom-right",
                });
                reloadTable();
            } else {
                toast.error("Có lỗi xảy ra", {
                    position: "bottom-right",
                });
            }
        }
    }

    const handleGetCountry = async (query: string) => {
        const res: any = await callFetchCountry(query)
        if (res.isSuccess) {
            setCountries(res.data)
        }
    }

    useEffect(() => {
        handleGetCountry(`current=1&pageSize=1000`)
    }, [])

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<any>[] = [
        {
            title: "ID",
            dataIndex: 'id',
            hideInSearch: true,
            sorter: true
        },
        {
            title: "Tên quốc gia",
            dataIndex: 'country',
            render: (_text, record, _index, _action) => {
                return (
                    <div>{record?.country?.name}</div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Quốc gia"
                            allowClear
                            value={value.country_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, country_id: val }
                                ])
                            }
                            options={countries.map((item: any) => ({
                                label: item.name,
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8 }}
                        />


                        <Space>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => confirm()}
                            >
                                Tìm
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    clearFilters?.();
                                    confirm();
                                }}
                            >
                                Reset
                            </Button>
                        </Space>
                    </div>
                );
            },
            onFilter: () => true, // bắt buộc để Antd không filter local
            hideInSearch: true
        },
        {
            title: "Tên thành phố",
            dataIndex: 'name',
            sorter: true,

        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div className="line-clamp-6 max-w-[350px]">{record.description}</div>
                )
            },
            width: 350
        },
        {
            title: "Ảnh",
            dataIndex: 'image',
            render: (_text, record, _index, _action) => {
                return (
                    <img src={`${getImage(record.image)}`} />
                )
            },
            hideInSearch: true,
            width: 150
        },
        {
            title: "Ảnh cẩm nang",
            dataIndex: 'image_handbook',
            render: (_text, record, _index, _action) => {
                return (
                    <img src={`${getImage(record.image_handbook)}`} />
                )
            },
            hideInSearch: true,
            width: 150
        },
        {
            title: "Ngày tạo",
            dataIndex: 'created_at',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <>{dayjs(record.created_at).format('DD-MM-YYYY HH:mm:ss')}</>
                )
            },
            hideInSearch: true,
        },
        {

            title: "Hành động",
            hideInSearch: true,
            width: 50,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setOpenModal(true);
                            setDataInit(entity);
                        }}
                    />

                    <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa city"}
                        description={"Bạn chắc chắn muốn xóa city"}
                        onConfirm={() => handleDeleteCity(entity.id)}
                        okText={"Xác nhận"}
                        cancelText={"Hủy"}
                    >
                        <span style={{ cursor: "pointer", margin: "0 10px" }}>
                            <DeleteOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#ff4d4f',
                                }}
                            />
                        </span>
                    </Popconfirm>
                </Space>
            ),

        },
    ];

    const buildQuery = (params: any, _sort: any, _filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`

        if (_filter?.country?.[0]?.country_id) {
            temp += `&country_id=${_filter?.country?.[0]?.country_id}`
        }

        if (clone.name) {
            temp += `&name=${clone.name}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }

        // sort
        if (_.isEmpty(_sort)) {
            temp += `&sort=id-desc`
        }
        else {
            Object.entries(_sort).map(([key, val]) => {
                temp += `&sort=${key}-${val === "ascend" ? "asc" : "desc"}`
            })
        }

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách city"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={cities}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchCity({ query }))
                }}
                scroll={{ x: true }}
                pagination={
                    {
                        current: meta.currentPage,
                        pageSize: meta.itemsPerPage,
                        showSizeChanger: true,
                        total: meta.totalItems,
                        showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} bản ghi</div>) }
                    }
                }
                rowSelection={false}
                toolBarRender={(_action, _rows): any => {
                    return (
                        <Button
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={() => setOpenModal(true)}
                        >
                            <span>
                                Thêm mới
                            </span>
                        </Button>
                    );
                }}
            />
            <ModalCity
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}

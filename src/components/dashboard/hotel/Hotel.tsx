/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Input, Popconfirm, Select, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteHotel, callFetchCity, callFetchUser } from "../../../config/api";
import DataTable from "../../antd/Table";
import { fetchHotel } from "@/redux/slice/hotelSlide";
import ModalHotel from "./ModalHotel";
import { getUserAvatar } from "@/utils/imageUrl";
import { ROLE } from "@/constants/role";
import { toast } from "react-toastify";
import { HiOutlineCursorClick } from "react-icons/hi";
import ModalHotelDetail from "./ModalHotelDetail";
import _ from "lodash";
import { formatCurrency } from "@/utils/formatCurrency";
export default function Hotel() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.hotel.isFetching);
    const meta = useAppSelector(state => state.hotel.meta);
    const hotels = useAppSelector(state => state.hotel.data);
    const dispatch = useAppDispatch();

    const [cities, setCities] = useState([])
    const [users, setUsers] = useState([])

    const handleDeleteHotel = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteHotel(id);
            if (res?.isSuccess) {
                toast.success("Xóa hotel thành công", {
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

    const handleGetCity = async (query: string) => {
        const res: any = await callFetchCity(query)
        if (res.isSuccess) {
            setCities(res.data)
        }
    }

    const handleGetUser = async (query: string) => {
        const res: any = await callFetchUser(query)
        if (res.isSuccess) {
            setUsers(res.data)
        }
    }

    useEffect(() => {
        handleGetCity(`current=1&pageSize=1000`)
        handleGetUser(`current=1&pageSize=1000&role=${ROLE.OWNER}`)
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
            title: "Thành phố",
            dataIndex: 'city',
            render: (_text, record, _index, _action) => {
                return (
                    <div>{record?.city?.name}</div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Thành phố"
                            allowClear
                            value={value.city_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, city_id: val }
                                ])
                            }
                            options={cities.map((item: any) => ({
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
            title: "Khách sạn",
            dataIndex: 'name',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div onClick={() => {
                        setDataInit(record)
                        setIsModalDetailOpen(true)
                    }} className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
                        <img src={`${import.meta.env.VITE_BE_URL}${record?.images?.[0]?.image}`} />
                        <p className="mt-[6px] font-semibold text-[16px]">{record?.name}</p>
                        <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
                            <HiOutlineCursorClick />
                            <span>Click để xem chi tiết</span>
                        </div>
                    </div>
                )
            },
        },
        {
            title: 'Chủ khách sạn',
            dataIndex: 'owner',
            render: (_text, record, _index, _action) => {
                return (
                    record?.owner ? <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(record?.owner?.avatar)}
                            className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.owner?.first_name} ${record?.owner?.last_name}`}</p>
                            <p className="leading-[20px] text-[#929292]">{`@${record?.owner?.username}`}</p>
                        </div>
                    </div> : <div></div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Chủ khách sạn"
                            allowClear
                            value={value.owner_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, owner_id: val }
                                ])
                            }
                            options={users.map((item: any) => ({
                                label: <div className="flex items-center gap-[10px]">
                                    <img
                                        src={getUserAvatar(item?.avatar)}
                                        className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                    />
                                    <div>
                                        <p className="leading-[20px]">{`${item?.first_name} ${item?.last_name}`}</p>
                                        <p className="leading-[20px] text-[#929292]">{`@${item?.username}`}</p>
                                    </div>
                                </div>,
                                value: item.id,
                            }))}
                            style={{ width: "100%", marginBottom: 8, height: 60 }}
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
            title: 'Địa chỉ',
            dataIndex: 'location',
            render: (_text, record, _index, _action) => {
                const mapUrl = `https://maps.google.com/maps?q=${record.lat},${record.lng}&hl=vi&z=18&output=embed`;

                return (
                    <div>
                        <iframe
                            width="250"
                            height="200"
                            frameBorder="0"
                            style={{ border: 0 }}
                            src={mapUrl}
                            allowFullScreen
                            aria-hidden="false"
                            tabIndex={0}
                        ></iframe>
                        <div>{record?.location}</div>
                    </div>
                )
            },
            sorter: true,
        },
        {
            title: 'Giá trị',
            dataIndex: 'avg',
            render: (_text, record, _index, _action) => {
                return (
                    <div >
                        <p>- Giá trung bình: {formatCurrency(+record.min_price)}đ</p>
                        <p>- Sao trung bình: {record.avg_star}</p>
                    </div>
                )
            },
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Input
                            placeholder="Giá từ"
                            type="number"
                            value={value.min_avg_price}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_avg_price: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Giá đến"
                            type="number"
                            value={value.max_avg_price}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_avg_price: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />
                        <Input
                            placeholder="Số sao từ"
                            type="number"
                            value={value.min_avg_star}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, min_avg_star: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
                        />

                        <Input
                            placeholder="Số sao đến"
                            type="number"
                            value={value.max_avg_star}
                            onChange={(e) =>
                                setSelectedKeys([
                                    { ...value, max_avg_star: e.target.value }
                                ])
                            }
                            onPressEnter={confirm as any}
                            style={{ marginBottom: 8 }}
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
            hideInSearch: true,
            width: 200
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
            width: 100
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
                        title={"Xác nhận xóa khách sạn"}
                        description={"Bạn chắc chắn muốn xóa khách sạn"}
                        onConfirm={() => handleDeleteHotel(entity.id)}
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

        if (_filter?.city?.[0]?.city_id) {
            temp += `&cityId=${_filter?.city?.[0]?.city_id}`
        }
        if (_filter?.owner?.[0]?.owner_id) {
            temp += `&ownerId=${_filter?.owner?.[0]?.owner_id}`
        }
        if (_filter?.avg?.[0]?.min_avg_price) {
            temp += `&min_avg_price=${_filter?.avg?.[0]?.min_avg_price}`
        }
        if (_filter?.avg?.[0]?.max_avg_price) {
            temp += `&max_avg_price=${_filter?.avg?.[0]?.max_avg_price}`
        }
        if (_filter?.avg?.[0]?.min_avg_star) {
            temp += `&min_avg_star=${_filter?.avg?.[0]?.min_avg_star}`
        }
        if (_filter?.avg?.[0]?.max_avg_star) {
            temp += `&max_avg_star=${_filter?.avg?.[0]?.max_avg_star}`
        }

        if (clone.name) {
            temp += `&name=${clone.name}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }
        if (clone.location) {
            temp += `&location=${clone.location}`
        }
        if (user.role === ROLE.OWNER) {
            temp += `&ownerId=${user.id}`
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
                headerTitle={"Danh sách hotel"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={hotels}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchHotel({ query }))
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
            <ModalHotel
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
            <ModalHotelDetail
                hotel={dataInit}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    );
}

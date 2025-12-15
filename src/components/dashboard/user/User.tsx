/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Avatar, Button, Popconfirm, Space } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteUser } from "../../../config/api";
import DataTable from "../../antd/Table";
import { fetchUser } from "../../../redux/slice/userSlide";
import { getUserAvatar } from "@/utils/imageUrl";
import ModalUser from "./ModalUser";
import { ROLE_UI, ROLE_VI, STATUS_USER_VI } from "@/constants/role";
import { GENDER_VI } from "@/constants/gender";
import { toast } from "react-toastify";

export default function User() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.user.isFetching);
    const meta = useAppSelector(state => state.user.meta);
    const users = useAppSelector(state => state.user.data);
    const dispatch = useAppDispatch();

    const handleDeleteUser = async (id: number | undefined) => {
        if (id) {
            const res: any = await callDeleteUser(id);
            if (res?.isSuccess) {
                toast.success("Xóa User thành công", {
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

    const reloadTable = () => {
        tableRef?.current?.reload();
    }

    const columns: ProColumns<any>[] = [
        {
            title: "ID",
            dataIndex: 'id',
            hideInSearch: true,
        },
        {
            title: "Tên đăng nhập",
            dataIndex: 'username',
            hideInSearch: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Avatar src={getUserAvatar(record.avatar)} />
                            <p>{record.username}</p>
                        </div>
                        {record.email && <div>- Email: {record.email}</div>}
                        {record.gender && <div>- Giới tính: {(GENDER_VI as any)[record.gender]}</div>}
                        {record.phone_number && <div>- SĐT: {record.phone_number}</div>}
                        {record.birthday && <div>- Ngày sinh: {dayjs(record.birthday).format("YYYY-MM-DD")}</div>}

                    </div>
                )
            },
        },

        {
            title: "Tên",
            dataIndex: 'first_name',
            render: (_text, record, _index, _action) => {
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <p>{record.first_name}</p>
                    </div>
                )
            },
            sorter: true,
        },
        {
            title: "Họ",
            dataIndex: 'last_name',
            render: (_text, record, _index, _action) => {
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <p>{record.last_name}</p>
                    </div>
                )
            },
            sorter: true,
        },

        {
            title: "Vai trò",
            dataIndex: 'role',
            render: (_text, record, _index, _action) => {
                const roleInfo = (ROLE_UI as any)[record.role];
                const Icon = roleInfo?.icon || UserOutlined;

                return (
                    <div className="flex flex-col gap-3 p-2">

                        {/* Badge Vai trò */}
                        <div
                            className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full text-white font-medium text-sm shadow-sm ${roleInfo?.color}`}
                        >
                            <Icon />
                            <span>{(ROLE_VI as any)[record.role]}</span>
                        </div>

                        {/* Manager info card */}
                        {record?.manager && (
                            <div className="
                        flex gap-3 items-center p-3 rounded-2xl border 
                        shadow-sm bg-white hover:shadow-md 
                        transition-all duration-200
                    ">
                                <img
                                    src={getUserAvatar(record.manager.avatar)}
                                    className="w-[45px] h-[45px] rounded-full object-cover
                            hover:scale-105 transition-transform duration-200"
                                />
                                <div className="leading-tight">
                                    <p className="font-semibold text-[14px]">
                                        {record.manager.first_name} {record.manager.last_name}
                                    </p>
                                    <p className="text-gray-500 text-[13px]">@{record.manager.username}</p>
                                    <p className="text-[12px] text-gray-400">Người quản lý trực tiếp</p>
                                </div>
                            </div>
                        )}
                        {record?.flight_operation_manager && (
                            <div className="
                        flex gap-3 items-center p-3 rounded-2xl border 
                        shadow-sm bg-white hover:shadow-md 
                        transition-all duration-200
                    ">
                                <img
                                    src={getUserAvatar(record.flight_operation_manager.avatar)}
                                    className="w-[45px] h-[45px] rounded-full object-cover
                            hover:scale-105 transition-transform duration-200"
                                />
                                <div className="leading-tight">
                                    <p className="font-semibold text-[14px]">
                                        {record.flight_operation_manager.first_name} {record.flight_operation_manager.last_name}
                                    </p>
                                    <p className="text-gray-500 text-[13px]">@{record.flight_operation_manager.username}</p>
                                    <p className="text-[12px] text-gray-400">Người quản lý trực tiếp</p>
                                </div>
                            </div>
                        )}
                    </div>
                );
            },
            sorter: true,
        },
        // {
        //     title: "Người quản lý",
        //     dataIndex: 'manager',
        //     render: (text, record, index, action) => {
        //         return (
        //             record?.manager ? <div className="flex items-center gap-[10px]">
        //                 <img
        //                     src={getUserAvatar(record?.manager?.avatar)}
        //                     className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
        //                 />
        //                 <div>
        //                     <p className="leading-[20px]">{`${record?.manager?.first_name} ${record?.manager?.last_name}`}</p>
        //                     <p className="leading-[20px] text-[#929292]">{`@${record?.manager?.username}`}</p>
        //                 </div>
        //             </div> : <div></div>
        //         )
        //     },
        //     sorter: true,
        // },
        {
            title: "Trạng thái",
            dataIndex: 'is_active',
            render: (_text, record, _index, _action) => {
                return (
                    <>{STATUS_USER_VI[record.is_active]}</>
                )
            },
            sorter: true,
        },
        {
            title: "Ngày tạo",
            dataIndex: 'date_joined',
            sorter: true,
            render: (_text, record, _index, _action) => {
                return (
                    <>{dayjs(record.date_joined).format('DD-MM-YYYY HH:mm:ss')}</>
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
                        title={"Xác nhận vô hiệu hóa người dùng"}
                        description={"Bạn chắc chắn muốn vô hiệu hóa người dùng"}
                        onConfirm={() => handleDeleteUser(entity.id)}
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
        if (clone.first_name) {
            temp += `&first_name=${clone.first_name}`
        }
        if (clone.last_name) {
            temp += `&last_name=${clone.last_name}`
        }
        if (clone.email) {
            temp += `&email=${clone.email}`
        }
        if (clone.gender) {
            temp += `&gender=${clone.gender}`
        }
        if (clone.phone_number) {
            temp += `&phone_number=${clone.phone_number}`
        }
        if (clone.role) {
            temp += `&role=${clone.role}`
        }
        temp += `&sort=id-desc`
        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách user"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={users}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchUser({ query }))
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
            <ModalUser
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}

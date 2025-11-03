/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ROLE } from '@/constants/role';
import { useAppSelector } from '@/redux/hooks';
import { getUserAvatar } from '@/utils/imageUrl';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import React, { useRef, useState } from 'react'
import DataTable from '../antd/Table';
import { callFetchCar, callFetchHotel } from '@/config/api';
import { formatCurrency } from '@/utils/formatCurrency';

const TableCarRecommended = () => {
    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const [cars, setCars] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [meta, setMeta] = useState({
        "totalItems": 0,
        "currentPage": 1,
        "itemsPerPage": 5,
        "totalPages": 1
    })

    const columns: ProColumns<any>[] = [
        {
            title: "ID",
            dataIndex: 'id',
            hideInSearch: true,
        },
        {
            title: "Tên xe",
            dataIndex: 'name',
            sorter: true,

        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div className="line-clamp-6">{record.description}</div>
                )
            },
            width: 200
        },
        {
            title: "Ảnh",
            dataIndex: 'image',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <img src={`${import.meta.env.VITE_BE_URL}${record.image}`} />
                )
            },
            hideInSearch: true,
            width: 150
        },

        {
            title: "Tài xế",
            dataIndex: 'user',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    record?.user ?
                        <div className="flex items-center gap-[10px]">
                            <img
                                src={getUserAvatar(record?.user?.avatar)}
                                className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                            />
                            <div>
                                <p className="leading-[20px]">{`${record?.user?.first_name} ${record?.user?.last_name}`}</p>
                                <p className="leading-[20px] text-[#929292]">{`@${record?.user?.username}`}</p>
                            </div>
                        </div> : <div></div>
                )
            },
            hideInSearch: true,
            width: 150
        },
        {
            title: 'Giá mỗi km',
            dataIndex: 'price_per_km',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <p>{formatCurrency(record.price_per_km)}đ</p>
                    </div>
                )
            },
        },
        {
            title: 'Tốc độ trung bình',
            dataIndex: 'avg_speed',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <p>{record.avg_speed} km/h</p>
                    </div>
                )
            },
        },
    ];

    const buildQuery = (params: any, sort: any, filter: any) => {
        let temp = ""

        const clone = { ...params, currentPage: params.current, limit: params.pageSize };
        delete clone.current
        delete clone.pageSize

        temp += `current=${clone.currentPage}`
        temp += `&pageSize=${clone.limit}`
        if (clone.name) {
            temp += `&name=${clone.name}`
        }
        if (clone.description) {
            temp += `&description=${clone.description}`
        }
        if (user.role === ROLE.DRIVER) {
            temp += `&user_id=${user.id}`
        }

        temp += `&recommended=true`

        return temp;
    }

    const handleGetCars = async (query: string) => {
        setIsLoading(true)
        const res: any = await callFetchCar(query)
        setIsLoading(false)
        if (res.isSuccess) {
            setCars(res.data)
            setMeta(res.meta)
        }
    }

    return (
        <div className='mt-3 border border-gray-200 dark:border-gray-800'>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách xe taxi phổ biến"}
                rowKey="id"
                loading={isLoading}
                columns={columns}
                dataSource={cars}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    handleGetCars(query)
                }}
                search={false}
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
            />
        </div>
    )
}

export default TableCarRecommended
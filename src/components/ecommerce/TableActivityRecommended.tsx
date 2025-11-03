/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ROLE } from '@/constants/role';
import { useAppSelector } from '@/redux/hooks';
import { getUserAvatar } from '@/utils/imageUrl';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import React, { useRef, useState } from 'react'
import DataTable from '../antd/Table';
import { callFetchActivity, callFetchHotel } from '@/config/api';
import { CATEGORY_ACTIVITY } from '@/constants/activity';
import { formatCurrency } from '@/utils/formatCurrency';

const TableActivityRecommended = () => {
    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const [activities, setActivities] = useState([])
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
            title: 'Người tổ chức sự kiện',
            dataIndex: 'event_organizer',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    record?.event_organizer ? <div className="flex items-center gap-[10px]">
                        <img
                            src={getUserAvatar(record?.event_organizer?.avatar)}
                            className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                        />
                        <div>
                            <p className="leading-[20px]">{`${record?.event_organizer?.first_name} ${record?.event_organizer?.last_name}`}</p>
                            <p className="leading-[20px] text-[#929292]">{`@${record?.event_organizer?.username}`}</p>
                        </div>
                    </div> : <div></div>
                )
            },
        },
        {
            title: "Thành phố",
            dataIndex: 'city',
            sorter: true,
            hideInSearch: true,
            render: (text, record, index, action) => {
                return (
                    <div>{record?.city?.name}</div>
                )
            },
        },
        {
            title: "Ảnh",
            dataIndex: 'image',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <img src={`${import.meta.env.VITE_BE_URL}${record?.images?.[0]?.image}`} />
                )
            },
            hideInSearch: true,
            width: 150
        },
        {
            title: "Tên hoạt động",
            dataIndex: 'name',
            sorter: true,
            width: 200
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            render: (text, record, index, action) => {
                return (
                    <span>{(CATEGORY_ACTIVITY as any)[record.category]}</span>
                )
            },
            sorter: true,
        },
        {
            title: 'Giá trung bình',
            dataIndex: 'avg_price',
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <div>{formatCurrency(record?.avg_price)}đ</div>
                )
            },
        },
        {
            title: 'Sao trung bình',
            dataIndex: 'avg_star',
            sorter: true,
        },
        {
            title: 'Tổng số giờ chơi',
            dataIndex: 'total_time',
            sorter: true,
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
        if (user.role === ROLE.EVENT_ORGANIZER) {
            temp += `&event_organizer_id=${user.id}`
        }

        temp += `&recommended=true`

        return temp;
    }

    const handleGetActivities = async (query: string) => {
        setIsLoading(true)
        const res: any = await callFetchActivity(query)
        setIsLoading(false)
        if (res.isSuccess) {
            setActivities(res.data)
            setMeta(res.meta)
        }
    }

    return (
        <div className='mt-3 border border-gray-200 dark:border-gray-800'>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách hoạt động phổ biến"}
                rowKey="id"
                loading={isLoading}
                columns={columns}
                dataSource={activities}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    handleGetActivities(query)
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

export default TableActivityRecommended
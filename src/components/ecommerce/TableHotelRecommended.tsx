/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ROLE } from '@/constants/role';
import { useAppSelector } from '@/redux/hooks';
import { getUserAvatar } from '@/utils/imageUrl';
import { ActionType, ProColumns } from '@ant-design/pro-components';
import { useRef, useState } from 'react'
import DataTable from '../antd/Table';
import { callFetchHotel } from '@/config/api';
import { HiOutlineCursorClick } from 'react-icons/hi';
import ModalHotelDetail from '../dashboard/hotel/ModalHotelDetail';

const TableHotelRecommended = () => {
    const user = useAppSelector(state => state.account.user)
    const [dataInit, setDataInit] = useState(null);
    const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);

    const tableRef = useRef<ActionType>(null);

    const [hotels, setHotels] = useState([])
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
            title: "Thành phố",
            dataIndex: 'city',
            sorter: true,
            hideInSearch: true,
            render: (_text, record, _index, _action) => {
                return (
                    <div>{record?.city?.name}</div>
                )
            },
        },
        // {
        //     title: "Ảnh",
        //     dataIndex: 'image',
        //     sorter: true,
        //     render: (text, record, index, action) => {
        //         return (
        //             <img src={`${import.meta.env.VITE_BE_URL}${record?.images?.[0]?.image}`} />
        //         )
        //     },
        //     hideInSearch: true,
        //     width: 150
        // },
        {
            title: "Khách sạn",
            dataIndex: 'hotel',
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
            width: 250
        },
        {
            title: 'Chủ khách sạn',
            dataIndex: 'owner',
            sorter: true,
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
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'location',
            sorter: true,
            width: 150
        },
        {
            title: 'Vị trí',
            dataIndex: 'google-map',
            sorter: true,
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
                    </div>
                )
            },
        },
        {
            title: 'Sao trung bình',
            dataIndex: 'avg_star',
            sorter: true,
        },
    ];

    const buildQuery = (params: any, _sort: any, _filter: any) => {
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
        if (user.role === ROLE.OWNER) {
            temp += `&ownerId=${user.id}`
        }
        else if (user.role === ROLE.HOTEL_STAFF) {
            temp += `&ownerId=${user.manager?.id}`
        }

        temp += `&recommended=true`

        return temp;
    }

    const handleGetHotels = async (query: string) => {
        setIsLoading(true)
        const res: any = await callFetchHotel(query)
        setIsLoading(false)
        if (res.isSuccess) {
            setHotels(res.data)
            setMeta(res.meta)
        }
    }

    return (
        <div className='mt-3 border border-gray-200 dark:border-gray-800'>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách khách sạn phổ biến"}
                rowKey="id"
                loading={isLoading}
                columns={columns}
                dataSource={hotels}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    handleGetHotels(query)
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
            <ModalHotelDetail
                hotel={dataInit}
                isModalOpen={isModalDetailOpen}
                setIsModalOpen={setIsModalDetailOpen}
            />
        </div>
    )
}

export default TableHotelRecommended
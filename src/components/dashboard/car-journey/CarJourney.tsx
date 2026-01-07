/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { Space, Steps } from "antd";
import { EditOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import DataTable from "../../antd/Table";
import { fetchPayment } from "@/redux/slice/paymentSlide";
import { SERVICE_TYPE } from "@/constants/booking";
import { getUserAvatar } from "@/utils/imageUrl";
import { haversine } from "@/utils/googleMap";
import { ROLE } from "@/constants/role";
import { Icon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import markerImg from "/images/google-map/marker.webp";
import ModalCarJourney from "./ModalCarJourney";
import dayjs from "dayjs";
import { PAYMENT_STATUS } from "@/constants/payment";

export default function CarJourney() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.payment.isFetching);
    const meta = useAppSelector(state => state.payment.meta);
    const payments = useAppSelector(state => state.payment.data);
    const dispatch = useAppDispatch();

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
            title: "Vị trí",
            dataIndex: 'method',
            sorter: true,
            render: (_text, record, _index, _action) => {
                const car_booking = record?.booking?.car_detail?.[0]

                const lat1 = car_booking?.lat1 || 0
                const lng1 = car_booking?.lng1 || 0
                const lat2 = car_booking?.lat2 || 0
                const lng2 = car_booking?.lng2 || 0

                const distance = haversine(
                    lat1 || 0,
                    lng1 || 0,
                    lat2 || 0,
                    lng2 || 0
                )

                let zoomLevel;
                if (distance < 100) {
                    zoomLevel = 10; // Gần nhau
                } else if (distance < 500) {
                    zoomLevel = 8; // Khoảng cách vừa
                } else if (distance < 1500) {
                    zoomLevel = 5; // Xa nhau, zoom thấp
                } else {
                    zoomLevel = 3; // Cách xa nhau nhiều, zoom thấp
                }

                const center = [(lat1 + lat2) / 2, (lng1 + lng2) / 2];


                return (
                    <div>
                        <div className="flex flex-col gap-4">
                            <div>
                                <p>- Tài xế:</p>
                                {car_booking?.driver ?
                                    <div className="flex items-center gap-[10px]">
                                        <img
                                            src={getUserAvatar(car_booking?.driver?.avatar)}
                                            className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                        />
                                        <div>
                                            <p className="leading-[20px]">{`${car_booking?.driver?.first_name} ${car_booking?.driver?.last_name}`}</p>
                                            <p className="leading-[20px] text-[#929292]">{`@${car_booking?.driver?.username}`}</p>
                                        </div>
                                    </div> : <div></div>}
                            </div>
                            <div>
                                <p>- Xe taxi:</p>
                                <div className="flex items-center">
                                    <img
                                        src={`${import.meta.env.VITE_BE_URL}${car_booking?.car?.image}`}
                                        alt={
                                            car_booking?.car
                                                ?.name
                                        }
                                        width={60}
                                        height={40}
                                        className="object-contain"
                                    />
                                    <div>
                                        <div className="font-medium text-sm">
                                            {
                                                car_booking?.car
                                                    ?.name
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {car_booking && <div className="space-y-3 mt-[10px]">
                            <MapContainer
                                center={center as any}
                                zoom={zoomLevel}
                                className="w-full h-[250px]"
                                scrollWheelZoom={true}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />

                                <MarkerClusterGroup chunkedLoading>
                                    <Marker
                                        position={[lat1, lng1]}
                                        icon={
                                            new Icon({
                                                iconUrl: markerImg,
                                                iconSize: [38, 38],
                                            })
                                        }
                                        title={car_booking?.pickup_location}
                                    >
                                        <Popup>
                                            {car_booking?.pickup_location}
                                        </Popup>
                                    </Marker>
                                    <Marker
                                        position={[lat2, lng2]}
                                        icon={
                                            new Icon({
                                                iconUrl: markerImg,
                                                iconSize: [38, 38],
                                            })
                                        }
                                        title={car_booking?.dropoff_location}
                                    >
                                        <Popup>
                                            {car_booking?.dropoff_location}
                                        </Popup>
                                    </Marker>
                                </MarkerClusterGroup>
                            </MapContainer>
                        </div>}
                    </div>
                )
            },
            width: 300
        },
        {
            title: "Hành trình",
            dataIndex: 'journey',
            sorter: true,
            render: (_text, record, _index, _action) => {
                const car_booking = record?.booking?.car_detail?.[0]

                return (
                    <div>
                        {car_booking && <div className="space-y-3">
                            <Steps
                                progressDot
                                current={car_booking.status}
                                items={[
                                    {
                                        title: 'Bắt đầu',
                                    },
                                    {
                                        title: 'Đã đón khách',
                                        description: <div> {
                                            record?.booking?.user?.id ? <div className="flex items-center gap-[10px] ml-[20px] mt-[4px]">
                                                <img
                                                    src={getUserAvatar(record?.booking?.user?.avatar)}
                                                    className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                                />
                                                <div>
                                                    <p className="leading-[20px]">{`${record?.booking?.user?.first_name} ${record?.booking?.user?.last_name}`}</p>
                                                    <p className="leading-[20px] text-[#929292]">{`@${record?.booking?.user?.username}`}</p>
                                                </div>
                                            </div> : <div className="flex items-center gap-[10px]">
                                                <img
                                                    src={getUserAvatar(record.booking.guest_info.avatar)}
                                                    className="w-[40px] min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                                />
                                                <div>
                                                    <p className="leading-[20px]"><span className="font-bold">Khách ngoài:</span> {record.booking.guest_info.full_name}</p>
                                                    <p className="leading-[20px] text-[#929292]">{record.booking.guest_info.email}</p>
                                                </div>
                                            </div>
                                        }
                                            <div className="mt-[6px]">Tại: <strong>{car_booking?.pickup_location}</strong></div>
                                            <div className="mt-[6px]">Ngày: <strong>{dayjs(car_booking?.pickup_datetime).format("YYYY-MM-DD")}</strong></div>
                                            <div className="mt-[6px]">Lúc: <strong>{dayjs(car_booking?.pickup_datetime).format("HH:mm:ss")}</strong></div>
                                        </div>
                                    },
                                    {
                                        title: 'Đang di chuyển',
                                    },
                                    {
                                        title: 'Đã đến nơi',
                                        description: <div>
                                            <div className="mt-[6px]">Tại: <strong>{car_booking?.dropoff_location}</strong></div>
                                            {car_booking?.dropoff_datetime && <>
                                                <div className="mt-[6px]">Ngày: <strong>{dayjs(car_booking.dropoff_datetime).format("YYYY-MM-DD")}</strong></div>
                                                <div className="mt-[6px]">Lúc: <strong>{dayjs(car_booking.dropoff_datetime).format("HH:mm:ss")}</strong></div>
                                            </>}

                                        </div>,
                                    },
                                ]}
                            />
                        </div>}
                    </div>
                )
            },
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
        temp += `&booking__service_type=${SERVICE_TYPE.CAR}`
        if (clone.transaction_id) {
            temp += `&transaction_id=${clone.transaction_id}`
        }

        if (user.role === ROLE.DRIVER) {
            temp += `&driver_id=${user.id}`
        }

        temp += `&status=${PAYMENT_STATUS.SUCCESS}`

        return temp;
    }

    return (
        <div>
            <DataTable
                actionRef={tableRef}
                headerTitle={"Danh sách hành trình"}
                rowKey="id"
                loading={isFetching}
                columns={columns}
                dataSource={payments}
                request={async (params, sort, filter): Promise<any> => {
                    const query = buildQuery(params, sort, filter);
                    dispatch(fetchPayment({ query }))
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
            />
            <ModalCarJourney
                openModal={openModal}
                setOpenModal={setOpenModal}
                reloadTable={reloadTable}
                dataInit={dataInit}
                setDataInit={setDataInit}
            />
        </div>
    );
}

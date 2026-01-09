/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Select, Space, Steps } from "antd";
import { EditOutlined } from '@ant-design/icons';
import { ActionType, ProColumns } from "@ant-design/pro-components";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import DataTable from "../../antd/Table";
import { fetchPayment } from "@/redux/slice/paymentSlide";
import { CAR_BOOKING_STATUS_VI, SERVICE_TYPE } from "@/constants/booking";
import { getImage, getUserAvatar } from "@/utils/imageUrl";
import { haversine } from "@/utils/googleMap";
import { ROLE } from "@/constants/role";
import { Icon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import markerImg from "/images/google-map/marker.webp";
import ModalCarJourney from "./ModalCarJourney";
import dayjs from "dayjs";
import { PAYMENT_STATUS } from "@/constants/payment";
import { callFetchCar, callFetchUser } from "@/config/api";
import _ from "lodash";

export default function CarJourney() {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [dataInit, setDataInit] = useState(null);

    const user = useAppSelector(state => state.account.user)

    const tableRef = useRef<ActionType>(null);

    const isFetching = useAppSelector(state => state.payment.isFetching);
    const meta = useAppSelector(state => state.payment.meta);
    const payments = useAppSelector(state => state.payment.data);
    const dispatch = useAppDispatch();

    const [drivers, setDrivers] = useState([])
    const [customer, setCustomer] = useState([])
    const [cars, setCars] = useState([])

    const handleGetUser = async (query: string, type: string) => {
        const res: any = await callFetchUser(query)
        if (res.isSuccess) {
            if (type === ROLE.DRIVER) {
                setDrivers(res.data)
            }
            else if (type === ROLE.CUSTOMER) {
                setCustomer(res.data)
            }
        }
    }

    const handleGetCar = async (query: string) => {
        const res: any = await callFetchCar(query)
        if (res.isSuccess) {
            setCars(res.data)
        }
    }

    useEffect(() => {
        if (user.role === ROLE.ADMIN) {
            handleGetUser(`current=1&pageSize=1000&role=${ROLE.DRIVER}`, ROLE.DRIVER)
            handleGetCar(`current=1&pageSize=1000`)
        }
        else if (user.role === ROLE.DRIVER) {
            handleGetCar(`current=1&pageSize=1000&user_id=${user.id}`)
        }
        handleGetUser(`current=1&pageSize=1000&role=${ROLE.CUSTOMER}`, ROLE.CUSTOMER)
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
            title: "Vị trí",
            dataIndex: 'driver_location',
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
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        {user.role === ROLE.ADMIN && <Select
                            placeholder="Tài xế"
                            allowClear
                            value={value.driver_id}
                            onChange={async (val: any) => {
                                setSelectedKeys([
                                    { ...value, driver_id: val }
                                ])
                                if (val) {
                                    await handleGetCar(`current=1&pageSize=1000&user_id=${val}`)
                                }
                                else {
                                    await handleGetCar(`current=1&pageSize=1000`)
                                }
                            }}
                            options={drivers.map((item: any) => ({
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
                        />}


                        <Select
                            placeholder="Xe taxi"
                            allowClear
                            value={value.car_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, car_id: val }
                                ])
                            }
                            options={cars.map((item: any) => ({
                                label: <div className="flex items-center gap-[10px]">
                                    <img
                                        src={getImage(item?.image)}
                                        className="min-w-[40px] max-w-[40px] h-[40px] object-cover rounded-[50%]"
                                    />
                                    <div>
                                        <p className="leading-[20px] font-semibold">{`${item?.name}`}</p>
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
            hideInSearch: true,
            width: 300
        },
        {
            title: "Hành trình",
            dataIndex: 'journey',
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
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {

                const value: any = selectedKeys[0] || {};

                return (
                    <div style={{ padding: 12, width: 280 }}>
                        <Select
                            placeholder="Khách hàng"
                            allowClear
                            value={value.booking__user_id}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, booking__user_id: val }
                                ])
                            }
                            options={customer.map((item: any) => ({
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

                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            value={value.car_booking_status}
                            onChange={(val: any) =>
                                setSelectedKeys([
                                    { ...value, car_booking_status: val }
                                ])
                            }
                            options={Object.entries(CAR_BOOKING_STATUS_VI).map(([key, val]) => {
                                return {
                                    label: val,
                                    value: key
                                }
                            })}
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

        if (_filter?.driver_location?.[0]?.driver_id) {
            temp += `&driver_id=${_filter?.driver_location?.[0]?.driver_id}`
        }
        if (_filter?.driver_location?.[0]?.car_id) {
            temp += `&car_id=${_filter?.driver_location?.[0]?.car_id}`
        }

        if (_filter?.journey?.[0]?.booking__user_id) {
            temp += `&booking__user_id=${_filter?.journey?.[0]?.booking__user_id}`
        }
        if (_filter?.journey?.[0]?.car_booking_status) {
            temp += `&car_booking_status=${_filter?.journey?.[0]?.car_booking_status}`
        }

        if (user.role === ROLE.DRIVER) {
            temp += `&driver_id=${user.id}`
        }

        temp += `&status=${PAYMENT_STATUS.SUCCESS}`

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

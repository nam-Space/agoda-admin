/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { callFetchActivity, callFetchAirline, callFetchCar, callFetchFlight, callFetchHotel, callFetchPaymentOverview, callFetchRoomAdmin, callFetchUser } from "@/config/api";
import { SERVICE_TYPE, SERVICE_TYPE_VI } from "@/constants/booking";
import { useAppSelector } from "@/redux/hooks";
import { ROLE } from "@/constants/role";
import { getImage, getUserAvatar } from "@/utils/imageUrl";
import { DebounceSelect } from "../antd/DebounceSelect";
import { Star } from "lucide-react";
import ChartTab from "../common/ChartTab";
import EcommerceMetrics from "./EcommerceMetrics";
import { TIME_STATISTIC } from "@/constants/time";
import dayjs from "dayjs";
export interface ICitySelect {
	label?: any;
	value?: number;
	key?: number;
}

export default function MonthlySalesChart({ serviceType }: any) {
	const user = useAppSelector(state => state.account.user)

	const [statistic, setStatistic] = useState({
		"labels": [],
		"revenues": [],
		"total": 0,
		"total_revenue": 0,
		"revenue_growth": 0,
		"customers": [],
		"customer_growth": 0,
		"orders": [],
		"order_growth": 0,
		"statistic_by": TIME_STATISTIC.DAY
	})

	const [selectedTime, setSelectedTime] = useState(TIME_STATISTIC.DAY);

	const [owner, setOwner] = useState<ICitySelect>({
		label: user.role === ROLE.OWNER ? <div className="flex items-center gap-[10px]">
			<img
				src={getUserAvatar(user.avatar)}
				className="w-[40px] h-[40px] object-cover rounded-[50%]"
			/>
			<div>
				<p className="leading-[20px]">{`${user.first_name} ${user.last_name}`}</p>
				<p className="leading-[20px] text-[#929292]">{`@${user.username}`}</p>
			</div>
		</div> : user.role === ROLE.HOTEL_STAFF ? <div className="flex items-center gap-[10px]">
			<img
				src={getUserAvatar(user.manager?.avatar)}
				className="w-[40px] h-[40px] object-cover rounded-[50%]"
			/>
			<div>
				<p className="leading-[20px]">{`${user.manager?.first_name} ${user.manager?.last_name}`}</p>
				<p className="leading-[20px] text-[#929292]">{`@${user.manager?.username}`}</p>
			</div>
		</div> : "",
		value: user.role === ROLE.OWNER ? user.id : (user.role === ROLE.HOTEL_STAFF ? user.manager?.id : 0),
		key: user.role === ROLE.OWNER ? user.id : (user.role === ROLE.HOTEL_STAFF ? user.manager?.id : 0),
	});

	const [hotel, setHotel] = useState<ICitySelect>({
		label: "",
		value: 0,
		key: 0,
	});

	const [room, setRoom] = useState<ICitySelect>({
		label: "",
		value: 0,
		key: 0,
	});

	const [eventOrganizer, setEventOrganizer] = useState<ICitySelect>({
		label: user.role === ROLE.EVENT_ORGANIZER ? <div className="flex items-center gap-[10px]">
			<img
				src={getUserAvatar(user.avatar)}
				className="w-[40px] h-[40px] object-cover rounded-[50%]"
			/>
			<div>
				<p className="leading-[20px]">{`${user.first_name} ${user.last_name}`}</p>
				<p className="leading-[20px] text-[#929292]">{`@${user.username}`}</p>
			</div>
		</div> : "",
		value: user.role === ROLE.EVENT_ORGANIZER ? user.id : 0,
		key: user.role === ROLE.EVENT_ORGANIZER ? user.id : 0,
	});

	const [activity, setActivity] = useState<ICitySelect>({
		label: "",
		value: 0,
		key: 0,
	});

	const [driver, setDriver] = useState<ICitySelect>({
		label: user.role === ROLE.DRIVER ? <div className="flex items-center gap-[10px]">
			<img
				src={getUserAvatar(user.avatar)}
				className="w-[40px] h-[40px] object-cover rounded-[50%]"
			/>
			<div>
				<p className="leading-[20px]">{`${user.first_name} ${user.last_name}`}</p>
				<p className="leading-[20px] text-[#929292]">{`@${user.username}`}</p>
			</div>
		</div> : "",
		value: user.role === ROLE.DRIVER ? user.id : 0,
		key: user.role === ROLE.DRIVER ? user.id : 0,
	});

	const [car, setCar] = useState<ICitySelect>({
		label: "",
		value: 0,
		key: 0,
	});

	const [flightOperationManager, setFlightOperationManager] = useState<ICitySelect>({
		label: user.role === ROLE.FLIGHT_OPERATION_STAFF ? <div className="flex items-center gap-[10px]">
			<img
				src={getUserAvatar(user.avatar)}
				className="w-[40px] h-[40px] object-cover rounded-[50%]"
			/>
			<div>
				<p className="leading-[20px]">{`${user.first_name} ${user.last_name}`}</p>
				<p className="leading-[20px] text-[#929292]">{`@${user.username}`}</p>
			</div>
		</div> : user.role === ROLE.AIRLINE_TICKETING_STAFF ? <div className="flex items-center gap-[10px]">
			<img
				src={getUserAvatar(user.flight_operation_manager?.avatar)}
				className="w-[40px] h-[40px] object-cover rounded-[50%]"
			/>
			<div>
				<p className="leading-[20px]">{`${user.flight_operation_manager?.first_name} ${user.flight_operation_manager?.last_name}`}</p>
				<p className="leading-[20px] text-[#929292]">{`@${user.flight_operation_manager?.username}`}</p>
			</div>
		</div> : "",
		value: user.role === ROLE.FLIGHT_OPERATION_STAFF ? user.id : (user.role === ROLE.AIRLINE_TICKETING_STAFF ? user.flight_operation_manager?.id : 0),
		key: user.role === ROLE.FLIGHT_OPERATION_STAFF ? user.id : (user.role === ROLE.AIRLINE_TICKETING_STAFF ? user.flight_operation_manager?.id : 0),
	});

	const [airline, setAirline] = useState<ICitySelect>({
		label: "",
		value: 0,
		key: 0,
	});

	const [flight, setFlight] = useState<ICitySelect>({
		label: "",
		value: 0,
		key: 0,
	});

	const options: ApexOptions = {
		colors: ["#465fff"],
		chart: {
			fontFamily: "Outfit, sans-serif",
			type: "bar",
			height: 180,
			toolbar: {
				show: false,
			},
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: "39%",
				borderRadius: 5,
				borderRadiusApplication: "end",
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			show: true,
			width: 4,
			colors: ["transparent"],
		},
		xaxis: {
			categories: [
				...statistic.labels
			],
			axisBorder: {
				show: false,
			},
			axisTicks: {
				show: false,
			},
		},
		legend: {
			show: true,
			position: "top",
			horizontalAlign: "left",
			fontFamily: "Outfit",
		},
		yaxis: {
			title: {
				text: undefined,
			},
		},
		grid: {
			yaxis: {
				lines: {
					show: true,
				},
			},
		},
		fill: {
			opacity: 1,
		},

		tooltip: {
			x: {
				show: false,
			},
			y: {
				formatter: (val: number) => `${val}`,
			},
		},
	};
	const series = [
		{
			name: "Doanh thu",
			data: [...statistic.revenues],
		},
	];
	const handleGetPaymentOverview = async (query: string) => {
		const res: any = await callFetchPaymentOverview(query)
		if (res.isSuccess) {
			setStatistic({
				...res.data
			})
		}
	}

	async function fetchOwnerList(): Promise<ICitySelect[]> {
		let query = `&role=${ROLE.OWNER}`
		if (user.role === ROLE.OWNER) {
			query = `&username=${user.username}`
		}
		const res: any = await callFetchUser(`current=1&pageSize=1000${query}`);
		if (res?.isSuccess) {
			const list = res.data;
			const temp = list.map((item: any) => {
				return {
					label: <div className="flex items-center gap-[10px]">
						<img
							src={getUserAvatar(item.avatar)}
							className="w-[40px] h-[40px] object-cover rounded-[50%]"
						/>
						<div>
							<p className="leading-[20px]">{`${item.first_name} ${item.last_name}`}</p>
							<p className="leading-[20px] text-[#929292]">{`@${item.username}`}</p>
						</div>
					</div>,
					value: item.id
				}
			})
			return temp;
		} else return [];
	}

	async function fetchEventOrganizerList(): Promise<ICitySelect[]> {
		let query = `&role=${ROLE.EVENT_ORGANIZER}`
		if (user.role === ROLE.EVENT_ORGANIZER) {
			query += `&username=${user.username}`
		}

		const res: any = await callFetchUser(`current=1&pageSize=1000${query}`);
		if (res?.isSuccess) {
			const list = res.data;
			const temp = list.map((item: any) => {
				return {
					label: <div className="flex items-center gap-[10px]">
						<img
							src={getUserAvatar(item.avatar)}
							className="w-[40px] h-[40px] object-cover rounded-[50%]"
						/>
						<div>
							<p className="leading-[20px]">{`${item.first_name} ${item.last_name}`}</p>
							<p className="leading-[20px] text-[#929292]">{`@${item.username}`}</p>
						</div>
					</div>,
					value: item.id
				}
			})
			return temp;
		} else return [];
	}

	async function fetchDriverList(): Promise<ICitySelect[]> {
		let query = `&role=${ROLE.DRIVER}`
		if (user.role === ROLE.DRIVER) {
			query = `&username=${user.username}`
		}

		const res: any = await callFetchUser(`current=1&pageSize=1000${query}`);
		if (res?.isSuccess) {
			const list = res.data;
			const temp = list.map((item: any) => {
				return {
					label: <div className="flex items-center gap-[10px]">
						<img
							src={getUserAvatar(item.avatar)}
							className="w-[40px] h-[40px] object-cover rounded-[50%]"
						/>
						<div>
							<p className="leading-[20px]">{`${item.first_name} ${item.last_name}`}</p>
							<p className="leading-[20px] text-[#929292]">{`@${item.username}`}</p>
						</div>
					</div>,
					value: item.id
				}
			})
			return temp;
		} else return [];
	}
	async function fetchFlightOperationManagerList(): Promise<ICitySelect[]> {
		let query = `&role=${ROLE.FLIGHT_OPERATION_STAFF}`
		if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
			query = `&username=${user.username}`
		}

		const res: any = await callFetchUser(`current=1&pageSize=1000${query}`);
		if (res?.isSuccess) {
			const list = res.data;
			const temp = list.map((item: any) => {
				return {
					label: <div className="flex items-center gap-[10px]">
						<img
							src={getUserAvatar(item.avatar)}
							className="w-[40px] h-[40px] object-cover rounded-[50%]"
						/>
						<div>
							<p className="leading-[20px]">{`${item.first_name} ${item.last_name}`}</p>
							<p className="leading-[20px] text-[#929292]">{`@${item.username}`}</p>
						</div>
					</div>,
					value: item.id
				}
			})
			return temp;
		} else return [];
	}

	async function fetchHotelList(): Promise<ICitySelect[]> {
		let query = ``
		if (owner.value) {
			query = `&ownerId=${owner.value}`
		}
		else if (user.role === ROLE.OWNER) {
			query = `&ownerId=${user.id}`
		}
		else if (user.role === ROLE.HOTEL_STAFF) {
			if (user.manager?.id) {
				query = `&ownerId=${user.manager.id}`
			}
		}
		const res: any = await callFetchHotel(`current=1&pageSize=1000${query}`);
		if (res?.isSuccess) {
			const list = res.data;
			const temp = list.map((item: any) => {
				return {
					label: <div className="flex gap-3">
						<div className="relative w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
							<img
								src={`${import.meta.env.VITE_BE_URL}${item?.images?.[0]?.image}`}
								className="w-full h-full object-cover"
								alt={item?.name}
							/>
						</div>
						<div className="flex-1 min-w-0">
							<h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
								{item?.name}
							</h4>
							<div className="flex items-center gap-1 text-xs">
								<Star className="w-3 h-3 fill-orange-500 text-orange-500" />
								<span className="font-semibold">
									{item?.avg_star?.toFixed(1)}
								</span>
								<span className="text-gray-500">
									{item?.review_count || 0} lượt đánh giá
								</span>
							</div>
						</div>
					</div>,
					value: item.id
				}
			})
			return temp;
		} else return [];
	}

	async function fetchRoomList(): Promise<ICitySelect[]> {
		let query = ``
		if (owner.value) {
			query = `&owner_id=${owner.value}`
		}
		else if (user.role === ROLE.OWNER) {
			query = `&owner_id=${user.id}`
		}
		else if (user.role === ROLE.HOTEL_STAFF) {
			if (user.manager?.id) {
				query = `&owner_id=${user.manager.id}`
			}
		}
		if (hotel.value) {
			query += `&hotel_id=${hotel.value}`
		}
		const res: any = await callFetchRoomAdmin(`current=1&pageSize=1000${query}`);
		if (res?.isSuccess) {
			const list = res.data;
			const temp = list.map((item: any) => {
				return {
					label: <div className="flex gap-3">
						<div className="relative w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
							<img
								src={`${import.meta.env.VITE_BE_URL}${item?.images?.[0]?.image}`}
								className="w-full h-full object-cover"
								alt={item?.room_type}
							/>
						</div>
						<div className="flex-1 min-w-0">
							<h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
								{item?.room_type}
							</h4>
						</div>
					</div>,
					value: item.id
				}
			})
			return temp;
		} else return [];
	}


	async function fetchActivityList(): Promise<ICitySelect[]> {
		let query = ``
		if (eventOrganizer.value) {
			query = `&event_organizer_id=${eventOrganizer.value}`
		}
		else if (user.role === ROLE.EVENT_ORGANIZER) {
			query = `&event_organizer_id=${user.id}`
		}
		const res: any = await callFetchActivity(`current=1&pageSize=1000${query}`);
		if (res?.isSuccess) {
			const list = res.data;
			const temp = list.map((item: any) => {
				return {
					label:
						<div className="flex gap-3">
							<div className="relative w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
								<img
									src={`${import.meta.env.VITE_BE_URL}${item?.images?.[0]?.image}`}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
									{
										item?.name
									}
								</h4>
								<div className="flex items-center gap-1 text-xs">
									<Star className="w-3 h-3 fill-orange-500 text-orange-500" />

									<span className="font-semibold">
										{
											item?.avg_star?.toFixed(1)
										}
									</span>
									<span className="text-gray-500">
										{
											item?.review_count || 0
										} lượt đánh giá
									</span>
								</div>
							</div>
						</div>,
					value: item.id
				}
			})
			return temp;
		} else return [];
	}

	async function fetchCarList(): Promise<ICitySelect[]> {
		let query = ``
		if (driver.value) {
			query = `&user_id=${driver.value}`
		}
		else if (user.role === ROLE.DRIVER) {
			query = `&user_id=${user.id}`
		}
		const res: any = await callFetchCar(`current=1&pageSize=1000${query}`);
		if (res?.isSuccess) {
			const list = res.data;
			const temp = list.map((item: any) => {
				return {
					label:
						<div className="flex gap-3">
							<img
								src={`${import.meta.env.VITE_BE_URL}${item?.image}`}
								alt={item.name}
								width={60}
								height={40}
								className="object-contain"
							/>
							<div>
								<div className="font-medium text-sm">
									{
										item
											?.name
									}
								</div>
								<div className="text-xs text-gray-500">
									{
										item
											?.description
									}
								</div>
							</div>
						</div>,
					value: item.id
				}
			})
			return temp;
		} else return [];
	}

	async function fetchAirlineList(): Promise<ICitySelect[]> {
		let query = ``
		if (flightOperationManager.value) {
			query = `&flight_operations_staff_id=${flightOperationManager.value}`
		}
		else if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
			query = `&flight_operations_staff_id=${user.id}`
		}
		else if (user.role === ROLE.AIRLINE_TICKETING_STAFF) {
			query = `&flight_operations_staff_id=${user.flight_operation_manager?.id}`
		}
		const res: any = await callFetchAirline(`current=1&pageSize=1000${query}`);
		if (res?.isSuccess) {
			const list = res.data;
			const temp = list.map((item: any) => {
				return {
					label:
						<div className="flex items-center gap-3">
							<div className="relative w-[40px] h-[40px] flex-shrink-0 rounded-lg overflow-hidden">
								<img
									src={`${import.meta.env.VITE_BE_URL}${item?.logo}`}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="flex-1 min-w-0">
								<h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-1">
									{
										item?.name
									}
								</h4>
							</div>
						</div>,
					value: item.id
				}
			})
			return temp;
		} else return [];
	}

	async function fetchFlightList(): Promise<ICitySelect[]> {
		let query = ``
		if (flightOperationManager.value) {
			query = `&flight_operations_staff_id=${flightOperationManager.value}`
		}
		else if (user.role === ROLE.FLIGHT_OPERATION_STAFF) {
			query = `&flight_operations_staff_id=${user.id}`
		}
		else if (user.role === ROLE.AIRLINE_TICKETING_STAFF) {
			query = `&flight_operations_staff_id=${user.flight_operation_manager?.id}`
		}
		if (airline.value) {
			query = `&airline_id=${airline.value}`
		}
		const res: any = await callFetchFlight(`current=1&pageSize=1000${query}`);
		if (res?.isSuccess) {
			const list = res.data;
			const temp = list.map((item: any) => {
				const recordLegSorted = [...item.legs].sort((a: any, b: any) =>
					new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime() // giảm dần
				);
				const firstLeg = recordLegSorted[0];
				const lastLeg = recordLegSorted[recordLegSorted.length - 1];

				return {
					label:
						<div className="flex flex-col gap-[10px]">
							<div className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150">
								<div>
									<div className="flex items-center gap-[6px]">
										<img src={getImage(item?.airline?.logo)} alt={item?.airline?.name} className="w-[24px]" />
										<p className="text-[12px] text-gray-500">{item?.airline?.name} <span className="text-blue-500 font-bold">(Id: {item?.id})</span></p>
									</div>
									<div>
										<p className="font-semibold text-base">{dayjs(firstLeg?.departure_time).format("HH:ss")} → {dayjs(lastLeg?.arrival_time).format("HH:ss")}</p>
									</div>
									<div>
										<p className="text-xs text-gray-500">{dayjs(firstLeg?.departure_time).format("DD/MM/YYYY")} - {dayjs(lastLeg?.arrival_time).format("DD/MM/YYYY")}</p>
									</div>
									<div className="flex items-center gap-[10px]">
										<p className="font-semibold leading-[20px]">{`${firstLeg?.departure_airport?.name}`}</p>
										→
										<p className="font-semibold leading-[20px]">{`${lastLeg?.arrival_airport?.name}`}</p>
									</div>
								</div>
							</div>
						</div>,
					value: item.id
				}
			})
			return temp;
		} else return [];
	}

	useEffect(() => {
		let bossQuery = ``
		let serviceQuery = ``
		if (owner.value) {
			bossQuery = `&owner_hotel_id=${owner.value}`
		}
		else if (eventOrganizer.value) {
			bossQuery = `&event_organizer_activity_id=${eventOrganizer.value}`
		}
		else if (driver.value) {
			bossQuery = `&driver_id=${driver.value}`
		}
		else if (flightOperationManager.value) {
			bossQuery = `&flight_operations_staff_id=${flightOperationManager.value}`
		}

		if (serviceType === SERVICE_TYPE.HOTEL) {
			if (hotel.value) {
				serviceQuery = `&hotel_id=${hotel.value}`
			}
			if (room.value) {
				serviceQuery = `&room_id=${room.value}`
			}
		}
		else if (serviceType === SERVICE_TYPE.ACTIVITY) {
			if (activity.value) {
				serviceQuery = `&activity_id=${activity.value}`
			}
		}
		else if (serviceType === SERVICE_TYPE.CAR) {
			if (car.value) {
				serviceQuery = `&car_id=${car.value}`
			}
		}
		else if (serviceType === SERVICE_TYPE.FLIGHT) {
			if (airline.value) {
				serviceQuery = `&airline_id=${airline.value}`
			}
			if (flight.value) {
				serviceQuery = `&flight_id=${flight.value}`
			}
		}


		handleGetPaymentOverview(`booking__service_type=${serviceType}${bossQuery}${serviceQuery}&statistic_by=${selectedTime}`)

	}, [owner, eventOrganizer, driver, flightOperationManager, serviceType, hotel, room, activity, car, airline, flight, selectedTime])
	return (
		<div>
			<EcommerceMetrics statistic={statistic} serviceType={serviceType} />
			<div className="grid grid-cols-9 gap-6 mt-3">
				<div className="col-start-1 col-end-10 overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 py-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
							Doanh thu {SERVICE_TYPE_VI[serviceType]?.toLowerCase()}
						</h3>
						<ChartTab selectedTime={selectedTime} setSelectedTime={setSelectedTime} />
					</div>
					<div className="mt-3 grid grid-cols-3 gap-4">
						{serviceType === SERVICE_TYPE.HOTEL &&
							<>
								<div>
									<label>Chủ khách sạn</label>
									<div className="mt-2">
										<DebounceSelect
											allowClear
											defaultValue={owner}
											value={owner}
											placeholder={<span>Chọn chủ khách sạn</span>}
											fetchOptions={fetchOwnerList}
											onChange={(newValue: any) => {
												setOwner({
													key: newValue?.key,
													label: newValue?.label,
													value: newValue?.value
												});
											}}
											disabled={user.role === ROLE.OWNER}
											className="w-full !h-[60px]"
										/>
									</div>
								</div>
								<div>
									<label>Khách sạn</label>
									<div className="mt-2">
										<DebounceSelect
											allowClear
											defaultValue={hotel}
											value={hotel}
											placeholder={<span>Chọn khách sạn</span>}
											fetchOptions={fetchHotelList}
											onChange={(newValue: any) => {
												setHotel({
													key: newValue?.key,
													label: newValue?.label,
													value: newValue?.value
												});
											}}
											className="w-full !h-[60px]"
										/>
									</div>
								</div>
								<div>
									<label>Phòng</label>
									<div className="mt-2">
										<DebounceSelect
											allowClear
											defaultValue={room}
											value={room}
											placeholder={<span>Chọn phòng</span>}
											fetchOptions={fetchRoomList}
											onChange={(newValue: any) => {
												setRoom({
													key: newValue?.key,
													label: newValue?.label,
													value: newValue?.value
												});
											}}
											className="w-full !h-[60px]"
										/>
									</div>
								</div>
							</>
						}

						{serviceType === SERVICE_TYPE.ACTIVITY &&
							<>
								<div>
									<label>Người tổ chức sự kiện</label>
									<div className="mt-2">
										<DebounceSelect
											allowClear
											defaultValue={eventOrganizer}
											value={eventOrganizer}
											placeholder={<span>Chọn người tổ chức sự kiện</span>}
											fetchOptions={fetchEventOrganizerList}
											onChange={(newValue: any) => {
												setEventOrganizer({
													key: newValue?.key,
													label: newValue?.label,
													value: newValue?.value
												});
											}}
											disabled={user.role === ROLE.EVENT_ORGANIZER}
											className="w-full !h-[60px]"
										/>
									</div>
								</div>
								<div>
									<label>Hoạt động</label>
									<div className="mt-2">
										<DebounceSelect
											allowClear
											defaultValue={activity}
											value={activity}
											placeholder={<span>Chọn hoạt động</span>}
											fetchOptions={fetchActivityList}
											onChange={(newValue: any) => {
												setActivity({
													key: newValue?.key,
													label: newValue?.label,
													value: newValue?.value
												});
											}}
											className="w-full !h-[60px]"
										/>
									</div>
								</div>
							</>
						}

						{serviceType === SERVICE_TYPE.CAR &&
							<>
								<div>
									<label>Tài xế</label>
									<div className="mt-2">
										<DebounceSelect
											allowClear
											defaultValue={driver}
											value={driver}
											placeholder={<span>Chọn tài xế</span>}
											fetchOptions={fetchDriverList}
											onChange={(newValue: any) => {
												setDriver({
													key: newValue?.key,
													label: newValue?.label,
													value: newValue?.value
												});
											}}
											disabled={user.role === ROLE.DRIVER}
											className="w-full !h-[60px]"
										/>
									</div>
								</div>
								<div>
									<label>Xe taxi</label>
									<div className="mt-2">
										<DebounceSelect
											allowClear
											defaultValue={car}
											value={car}
											placeholder={<span>Chọn xe taxi</span>}
											fetchOptions={fetchCarList}
											onChange={(newValue: any) => {
												setCar({
													key: newValue?.key,
													label: newValue?.label,
													value: newValue?.value
												});
											}}
											className="w-full !h-[60px]"
										/>
									</div>
								</div>
							</>}

						{serviceType === SERVICE_TYPE.FLIGHT &&
							<>
								<div>
									<label>Người vận hành chuyến bay</label>
									<div className="mt-2">
										<DebounceSelect
											allowClear
											defaultValue={flightOperationManager}
											value={flightOperationManager}
											placeholder={<span>Chọn người vận hành chuyến bay</span>}
											fetchOptions={fetchFlightOperationManagerList}
											onChange={(newValue: any) => {
												setFlightOperationManager({
													key: newValue?.key,
													label: newValue?.label,
													value: newValue?.value
												});
											}}
											disabled={user.role === ROLE.FLIGHT_OPERATION_STAFF}
											className="w-full !h-[60px]"
										/>
									</div>
								</div>
								<div>
									<label>Hãng hàng không</label>
									<div className="mt-2">
										<DebounceSelect
											allowClear
											defaultValue={airline}
											value={airline}
											placeholder={<span>Chọn hãng hàng không</span>}
											fetchOptions={fetchAirlineList}
											onChange={(newValue: any) => {
												setAirline({
													key: newValue?.key,
													label: newValue?.label,
													value: newValue?.value
												});
											}}
											className="w-full !h-[60px]"
										/>
									</div>
								</div>
								<div>
									<label>Chuyến bay</label>
									<div className="mt-2">
										<DebounceSelect
											allowClear
											defaultValue={flight}
											value={flight}
											placeholder={<span>Chọn chuyến bay</span>}
											fetchOptions={fetchFlightList}
											onChange={(newValue: any) => {
												setFlight({
													key: newValue?.key,
													label: newValue?.label,
													value: newValue?.value
												});
											}}
											className="w-full !h-[140px]"
										/>
									</div>
								</div>
							</>
						}

					</div>

					<div className="mt-4 max-w-full overflow-x-auto custom-scrollbar">
						<Chart options={options} series={series} type="bar" height={180} />
					</div>
				</div>
			</div>
		</div>
	);
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import FlightLegTable from "@/components/dashboard/flight-leg/FlightLegTable";
import SeatClassPricingTable from "@/components/dashboard/seat-class-pricing/SeatClassPricingTable";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDuration } from "@/utils/getDatesBetween";
import { getImage } from "@/utils/imageUrl";
import { Button, ConfigProvider, Modal } from "antd";
import vi_VN from 'antd/locale/vi_VN';
import dayjs from "dayjs";
import FlightStatistic from "./FlightStatistic";

interface IProps {
    flight?: any | null;
    isModalOpen: boolean;
    setIsModalOpen: any;
}

const ModalFlightDetail = (props: IProps) => {
    const {
        flight,
        isModalOpen,
        setIsModalOpen,
    } = props;

    const flightLegsSorted = flight?.legs?.length ? [...flight.legs].sort((a: any, b: any) =>
        new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime() // giảm dần
    ) : [];

    const firstLeg = flightLegsSorted[0];
    const lastLeg = flightLegsSorted[flightLegsSorted.length - 1];

    return (
        <ConfigProvider locale={vi_VN}>
            <Modal
                title={`Xem chi tiết chuyến bay`}
                open={isModalOpen}
                onOk={() => setIsModalOpen(false)}
                onCancel={() => setIsModalOpen(false)}
                width={1000}
                footer={(_) => (
                    <>
                        <Button onClick={() => setIsModalOpen(false)}>Đóng</Button>
                    </>
                )}
            >
                <div className="mt-[30px] mb-[20px] border rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="grid grid-cols-12 gap-4 items-center p-4 cursor-pointer">
                        <div className="col-span-3 flex items-center space-x-3">
                            <img src={getImage(flight?.airline?.logo)} alt={flight?.airline?.name} className="w-12 h-12 object-contain" />
                            <div>
                                <p className="font-semibold text-base">{flight?.airline?.name}</p>
                                {flight?.departure_airport && flight?.arrival_airport && (<p className="text-sm text-gray-500">{flight?.departure_airport?.code} - {flight?.arrival_airport?.code}</p>)}
                            </div>
                        </div>
                        <div className="col-span-5 text-center">
                            {firstLeg && lastLeg && <>
                                <p className="text-xl font-bold">{dayjs(firstLeg?.departure_time).format("HH:mm")} - {dayjs(lastLeg?.arrival_time).format("HH:mm")}</p>
                                <p className="text-xs text-gray-500">{dayjs(firstLeg?.departure_time).format("DD/MM/YYYY")} - {dayjs(lastLeg?.arrival_time).format("DD/MM/YYYY")}</p>
                            </>}

                            <p className="text-sm text-gray-600">{flight?.stops} điểm dừng • {formatDuration(flight?.total_duration)}</p>
                        </div>
                        <div className="col-span-3 text-right">
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(flight?.base_price)}&nbsp;₫</p>
                        </div>
                    </div>
                </div>
                <FlightLegTable flight={flight} />
                <SeatClassPricingTable flight={flight} />
                <div className="mt-[20px]">
                    <FlightStatistic flight={flight} />
                </div>
            </Modal>
        </ConfigProvider>
    );
};

export default ModalFlightDetail;

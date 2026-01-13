/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callCreateFlightSeat, callUpdateFlightSeat } from "@/config/api";
import { ConfigProvider, Input, Modal, Select, Switch } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import vi_VN from "antd/locale/vi_VN";
import { IMeta } from "./FlightSeatTable";

interface IProps {
  flight?: any | null;
  isModalOpen: boolean;
  setIsModalOpen: any;
  dataInit?: any | null;
  setDataInit: (v: any) => void;
  handleGetFlightSeat: any;
  meta: IMeta;
}

const ModalFlightSeatUpsert = (props: IProps) => {
  const {
    flight,
    isModalOpen,
    dataInit,
    setDataInit,
    setIsModalOpen,
    handleGetFlightSeat,
    meta,
  } = props;
  const [form, setForm] = useState({
    seat_number: "",
    seat_class: "",
    is_available: true,
  });

  useEffect(() => {
    if (dataInit?.id) {
      setForm({
        seat_number: dataInit.seat_number,
        seat_class: dataInit.seat_class,
        is_available: dataInit.is_available,
      });
    } else {
      setForm({
        seat_number: "",
        seat_class: "",
        is_available: true,
      });
    }
  }, [dataInit]);

  const handleSubmit = async () => {
    if (dataInit?.id) {
      const res: any = await callUpdateFlightSeat(dataInit.id, {
        flight: flight.id,
        seat_number: form.seat_number,
        seat_class: form.seat_class,
        is_available: form.is_available,
      });
      if (res?.isSuccess) {
        toast.success("Cập nhật flight seat thành công", {
          position: "bottom-right",
        });
        handleGetFlightSeat(
          `current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&flight_id=${flight.id}&sort=created_at-desc`
        );
        setIsModalOpen(false);
        setDataInit({});
      } else {
        toast.error(res.message, {
          position: "bottom-right",
        });
      }
    } else {
      const res: any = await callCreateFlightSeat({
        flight: flight.id,
        seat_number: form.seat_number,
        seat_class: form.seat_class,
        is_available: form.is_available,
      });
      if (res?.isSuccess) {
        toast.success("Thêm flight seat thành công", {
          position: "bottom-right",
        });
        handleGetFlightSeat(
          `current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&flight_id=${flight.id}&sort=created_at-desc`
        );
        setIsModalOpen(false);
        setDataInit({});
      } else {
        toast.error(res.message, {
          position: "bottom-right",
        });
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setDataInit({});
  };

  return (
    <Modal
      title={dataInit?.id ? "Cập nhật ghế cụ thể" : "Thêm mới ghế cụ thể"}
      open={isModalOpen}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={dataInit?.id ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
    >
      <ConfigProvider locale={vi_VN}>
        <div className="space-y-4">
          <div>
            <label>Số ghế</label>
            <Input
              value={form.seat_number}
              onChange={(e) =>
                setForm({ ...form, seat_number: e.target.value })
              }
              placeholder="Nhập số ghế (vd: 12A)"
            />
          </div>
          <div>
            <label>Hạng ghế</label>
            <Select
              value={form.seat_class}
              onChange={(value) => setForm({ ...form, seat_class: value })}
              placeholder="Chọn hạng ghế"
              className="w-full"
            >
              {flight?.seat_classes?.map((sc: any) => (
                <Select.Option key={sc.seat_class} value={sc.seat_class}>
                  {sc.seat_class}
                </Select.Option>
              ))}
            </Select>
          </div>
          <div>
            <label>Có sẵn</label>
            <Switch
              checked={form.is_available}
              onChange={(checked) =>
                setForm({ ...form, is_available: checked })
              }
            />
          </div>
        </div>
      </ConfigProvider>
    </Modal>
  );
};

export default ModalFlightSeatUpsert;

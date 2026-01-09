/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { callCreatePhysicalRoom, callUpdatePhysicalRoom } from "@/config/api";
import { ConfigProvider, Input, Modal, Select, InputNumber } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import vi_VN from "antd/locale/vi_VN";
import { IMeta } from "../../../../../../tài liệu/PhysicalRoomTable";

interface IProps {
  room?: any | null;
  isModalOpen: boolean;
  setIsModalOpen: any;
  dataInit?: any | null;
  setDataInit: (v: any) => void;
  handleGetPhysicalRoom: any;
  meta: IMeta;
}

const ModalPhysicalRoomUpsert = (props: IProps) => {
  const {
    room,
    isModalOpen,
    dataInit,
    setDataInit,
    setIsModalOpen,
    handleGetPhysicalRoom,
    meta,
  } = props;
  const [form, setForm] = useState({
    code: "",
    floor: 1,
    is_available: true,
  });

  useEffect(() => {
    if (dataInit?.id) {
      setForm({
        code: dataInit.code,
        floor: dataInit.floor,
        is_available: dataInit.is_available,
      });
    } else {
      setForm({
        code: "",
        floor: 1,
        is_available: true,
      });
    }
  }, [dataInit]);

  const handleSubmit = async () => {
    if (dataInit?.id) {
      const res: any = await callUpdatePhysicalRoom(dataInit.id, {
        room: room.id,
        code: form.code,
        floor: form.floor,
        is_available: form.is_available,
      });
      if (res?.isSuccess) {
        toast.success("Cập nhật physical room thành công", {
          position: "bottom-right",
        });
        handleGetPhysicalRoom(
          `current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&room_id=${room.id}&sort=created_at-desc`
        );
        setIsModalOpen(false);
        setDataInit({});
      } else {
        toast.error(res.message, {
          position: "bottom-right",
        });
      }
    } else {
      const res: any = await callCreatePhysicalRoom({
        room: room.id,
        code: form.code,
        floor: form.floor,
        is_available: form.is_available,
      });
      if (res?.isSuccess) {
        toast.success("Thêm physical room thành công", {
          position: "bottom-right",
        });
        handleGetPhysicalRoom(
          `current=${meta.currentPage}&pageSize=${meta.itemsPerPage}&room_id=${room.id}&sort=created_at-desc`
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
      title={dataInit?.id ? "Cập nhật phòng vật lý" : "Thêm mới phòng vật lý"}
      open={isModalOpen}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={dataInit?.id ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
    >
      <ConfigProvider locale={vi_VN}>
        <div className="space-y-4">
          <div>
            <label>Mã phòng</label>
            <Input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Nhập mã phòng"
            />
          </div>
          <div>
            <label>Tầng</label>
            <InputNumber
              min={1}
              value={form.floor}
              onChange={(value) => setForm({ ...form, floor: value || 1 })}
              placeholder="Nhập tầng"
              className="w-full"
            />
          </div>
          <div>
            <label>Có sẵn</label>
            <Select
              value={form.is_available}
              onChange={(value) => setForm({ ...form, is_available: value })}
              className="w-full"
            >
              <Select.Option value={true}>Có</Select.Option>
              <Select.Option value={false}>Không</Select.Option>
            </Select>
          </div>
        </div>
      </ConfigProvider>
    </Modal>
  );
};

export default ModalPhysicalRoomUpsert;

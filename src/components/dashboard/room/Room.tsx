/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
import { Button, Input, Popconfirm, Select, Space, Tag } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns } from "@ant-design/pro-components";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { callDeleteRoom, callFetchHotel } from "../../../config/api";
import DataTable from "../../antd/Table";
import { getImage } from "@/utils/imageUrl";
import { ROLE } from "@/constants/role";
import { toast } from "react-toastify";
import { formatCurrency } from "@/utils/formatCurrency";
import { fetchRoom } from "@/redux/slice/roomSlide";
import ModalRoom from "./ModalRoom";
import ModalRoomDetail from "./ModalRoomDetail";
import { HiOutlineCursorClick } from "react-icons/hi";
import { AVAILABLE_ROOM_VI, STAY_TYPE, STAY_TYPE_VI } from "@/constants/hotel";
import { Star } from "lucide-react";
import _ from "lodash";

export default function Room() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [dataInit, setDataInit] = useState(null);
  const [isModalDetailOpen, setIsModalDetailOpen] = useState(false);
  const user = useAppSelector((state) => state.account.user);

  const tableRef = useRef<ActionType>(null);

  const isFetching = useAppSelector((state) => state.room.isFetching);
  const meta = useAppSelector((state) => state.room.meta);
  const rooms = useAppSelector((state) => state.room.data);
  const dispatch = useAppDispatch();

  const [hotelState, setHotelState] = useState<{
    data: any[];
    page: number;
    hasMore: boolean;
    loading: boolean;
    search: string;
  }>({
    data: [],
    page: 1,
    hasMore: true,
    loading: false,
    search: "",
  });

  const handleDeleteRoom = async (id: number | undefined) => {
    if (id) {
      const res: any = await callDeleteRoom(id);
      if (res?.isSuccess) {
        toast.success("Xóa room thành công", {
          position: "bottom-right",
        });
        reloadTable();
      } else {
        toast.error("Có lỗi xảy ra", {
          position: "bottom-right",
        });
      }
    }
  };

  const PAGE_SIZE = 10;

  const fetchHotels = async ({
    page = 1,
    search = "",
    append = false,
  }: {
    page?: number;
    search?: string;
    append?: boolean;
  }) => {
    if (hotelState.loading) return;

    setHotelState((prev) => ({ ...prev, loading: true }));

    const query = `current=${page}&pageSize=${PAGE_SIZE}${
      search ? `&name=${search}` : ""
    }`;
    const res: any = await callFetchHotel(query);

    if (res?.isSuccess) {
      setHotelState((prev) => ({
        ...prev,
        data: append ? [...prev.data, ...res.data] : res.data,
        page,
        hasMore: res.data.length === PAGE_SIZE,
        loading: false,
      }));
    } else {
      setHotelState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleHotelSearch = (value: string) => {
    setHotelState((prev) => ({
      ...prev,
      search: value,
      page: 1,
      hasMore: true,
    }));

    fetchHotels({
      page: 1,
      search: value,
      append: false,
    });
  };

  useEffect(() => {
    fetchHotels({ page: 1 });
  }, []);

  const reloadTable = () => {
    tableRef?.current?.reload();
  };

  const columns: ProColumns<any>[] = [
    {
      title: "ID",
      dataIndex: "id",
      hideInSearch: true,
      sorter: true,
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      render: (_text, record, _index, _action) => {
        return (
          <img
            src={`${import.meta.env.VITE_BE_URL}${record?.images?.[0]?.image}`}
          />
        );
      },
      hideInSearch: true,
      width: 120,
    },
    {
      title: "Loại phòng",
      dataIndex: "room",
      render: (_text, record, _index, _action) => {
        return (
          <div
            onClick={() => {
              setDataInit(record);
              setIsModalDetailOpen(true);
            }}
            className="bg-gray-200 p-[10px] rounded-[10px] cursor-pointer hover:bg-gray-300 transition-all duration-150"
          >
            <div>
              <p className="text-[18px] font-semibold">{`${record?.room_type}`}</p>
              <p className="">
                Loại chỗ ở: {`${STAY_TYPE_VI[record?.stay_type]}`}
              </p>
              <p className="">Số giường: {`${record?.beds}`}</p>
              <p className="">Diện tích: {`${record?.area_m2}`} m²</p>
              {record?.stay_type === STAY_TYPE.OVERNIGHT ? (
                <p className="">
                  Giá mỗi đêm: {`${formatCurrency(record?.price_per_night)}`}đ
                </p>
              ) : (
                <>
                  <p className="">
                    Giá trong ngày: {`${formatCurrency(record?.price_per_day)}`}
                    đ
                  </p>
                  <p className="">
                    Thời gian ở: {`${record?.dayuse_duration_hours}`} tiếng
                  </p>
                </>
              )}

              {record.available ? (
                <div>
                  <Tag color="green">Có sẵn</Tag>
                </div>
              ) : (
                <div>
                  <Tag color="red">Hết chỗ</Tag>
                </div>
              )}
              {record?.has_promotion && (
                <div className="mt-[4px]">
                  <Tag color="#87d068">Đang khuyến mãi</Tag>
                </div>
              )}
            </div>
            <div className="mt-[10px] flex items-center justify-center gap-[5px] text-[12px] italic">
              <HiOutlineCursorClick />
              <span>Click để xem chi tiết</span>
            </div>
          </div>
        );
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => {
        const value: any = selectedKeys[0] || {};

        return (
          <div style={{ padding: 12, width: 280 }}>
            <Input
              placeholder="Tên loại phòng"
              value={value.room_type}
              onChange={(e) =>
                setSelectedKeys([{ ...value, room_type: e.target.value }])
              }
              onPressEnter={confirm as any}
              style={{ marginBottom: 8 }}
            />
            <Select
              placeholder="Loại chỗ ở"
              allowClear
              value={value.stay_type}
              onChange={(val: any) =>
                setSelectedKeys([{ ...value, stay_type: val }])
              }
              options={Object.entries(STAY_TYPE_VI).map(([k, v]) => ({
                label: v,
                value: k,
              }))}
              style={{ width: "100%", marginBottom: 8 }}
            />
            {value.stay_type === STAY_TYPE.OVERNIGHT && (
              <>
                <Input
                  placeholder="Giá mỗi đêm từ"
                  type="number"
                  value={value.min_price_per_night}
                  onChange={(e) =>
                    setSelectedKeys([
                      { ...value, min_price_per_night: e.target.value },
                    ])
                  }
                  onPressEnter={confirm as any}
                  style={{ marginBottom: 8 }}
                />

                <Input
                  placeholder="Giá mỗi đêm đến"
                  type="number"
                  value={value.max_price_per_night}
                  onChange={(e) =>
                    setSelectedKeys([
                      { ...value, max_price_per_night: e.target.value },
                    ])
                  }
                  onPressEnter={confirm as any}
                  style={{ marginBottom: 8 }}
                />
              </>
            )}
            {value.stay_type === STAY_TYPE.DAY_USE && (
              <>
                <Input
                  placeholder="Giá trong ngày từ"
                  type="number"
                  value={value.min_price_per_day}
                  onChange={(e) =>
                    setSelectedKeys([
                      { ...value, min_price_per_day: e.target.value },
                    ])
                  }
                  onPressEnter={confirm as any}
                  style={{ marginBottom: 8 }}
                />

                <Input
                  placeholder="Giá trong ngày đến"
                  type="number"
                  value={value.max_price_per_day}
                  onChange={(e) =>
                    setSelectedKeys([
                      { ...value, max_price_per_day: e.target.value },
                    ])
                  }
                  onPressEnter={confirm as any}
                  style={{ marginBottom: 8 }}
                />
              </>
            )}

            <Select
              placeholder="Có sẵn"
              allowClear
              value={value.available}
              onChange={(val: any) =>
                setSelectedKeys([{ ...value, available: val }])
              }
              options={Object.entries(AVAILABLE_ROOM_VI).map(([k, v]) => ({
                label: v,
                value: k,
              }))}
              style={{ width: "100%", marginBottom: 8 }}
            />

            <Space>
              <Button type="primary" size="small" onClick={() => confirm()}>
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
      title: "Khách sạn",
      dataIndex: "hotel",
      render: (_text, record, _index, _action) => {
        return (
          <div className="flex items-center gap-[10px]">
            <img
              src={getImage(record?.hotel?.thumbnail)}
              className="w-[70px] h-[50px] object-cover"
            />
            <div>
              <p className="leading-[20px]">{`${record?.hotel?.name}`}</p>
            </div>
          </div>
        );
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => {
        const value: any = selectedKeys[0] || {};

        const handleHotelScroll = (e: React.UIEvent<HTMLDivElement>) => {
          const target = e.target as HTMLDivElement;

          if (
            target.scrollTop + target.offsetHeight >=
              target.scrollHeight - 20 &&
            hotelState.hasMore &&
            !hotelState.loading
          ) {
            fetchHotels({
              page: hotelState.page + 1,
              search: hotelState.search,
              append: true,
            });
          }
        };

        return (
          <div style={{ padding: 12, width: 280 }}>
            <Select
              placeholder="Khách sạn"
              allowClear
              showSearch
              filterOption={false}
              loading={hotelState.loading}
              onSearch={handleHotelSearch}
              onPopupScroll={handleHotelScroll}
              value={value.hotel_id}
              onChange={(val: any) =>
                setSelectedKeys([{ ...value, hotel_id: val }])
              }
              options={hotelState.data.map((item: any) => ({
                label: (
                  <div className="flex gap-3">
                    <div className="w-[40px] h-[40px] rounded-lg overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_BE_URL}${
                          item?.images?.[0]?.image
                        }`}
                        className="w-full h-full object-cover"
                        alt={item?.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm line-clamp-2">
                        {item?.name}
                      </h4>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="w-3 h-3 fill-orange-500 text-orange-500" />
                        <span className="font-semibold">
                          {item?.avg_star?.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                          {item?.review_count || 0} đánh giá
                        </span>
                      </div>
                    </div>
                  </div>
                ),
                value: item.id,
              }))}
              notFoundContent={
                hotelState.loading ? "Đang tải..." : "Không có dữ liệu"
              }
              style={{ width: "100%", marginBottom: 8, height: 60 }}
            />

            <Space>
              <Button type="primary" size="small" onClick={() => confirm()}>
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
      width: 200,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      sorter: true,
      render: (_text, record, _index, _action) => {
        return (
          <div className="line-clamp-6 w-[200px]">{record.description}</div>
        );
      },
      width: 200,
    },
    {
      title: "Không gian",
      dataIndex: "space",
      render: (_text, record, _index, _action) => {
        return (
          <div className="flex items-center gap-[10px]">
            <ul>
              <li>- Tổng: {record?.total_rooms} phòng</li>
              <li>- Khả dụng: {record?.available_rooms} phòng</li>
              <li>- {record?.adults_capacity} người lớn</li>
              <li>- {record?.children_capacity} trẻ em</li>
            </ul>
          </div>
        );
      },
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => {
        const value: any = selectedKeys[0] || {};

        return (
          <div style={{ padding: 12, width: 280 }}>
            <Input
              placeholder="Số lượng người lớn từ"
              type="number"
              value={value.min_adults_capacity}
              onChange={(e) =>
                setSelectedKeys([
                  { ...value, min_adults_capacity: e.target.value },
                ])
              }
              onPressEnter={confirm as any}
              style={{ marginBottom: 8 }}
            />

            <Input
              placeholder="Số lượng người lớn đến"
              type="number"
              value={value.max_adults_capacity}
              onChange={(e) =>
                setSelectedKeys([
                  { ...value, max_adults_capacity: e.target.value },
                ])
              }
              onPressEnter={confirm as any}
              style={{ marginBottom: 8 }}
            />

            <Input
              placeholder="Số lượng trẻ em từ"
              type="number"
              value={value.min_children_capacity}
              onChange={(e) =>
                setSelectedKeys([
                  { ...value, min_children_capacity: e.target.value },
                ])
              }
              onPressEnter={confirm as any}
              style={{ marginBottom: 8 }}
            />

            <Input
              placeholder="Số lượng trẻ em đến"
              type="number"
              value={value.max_children_capacity}
              onChange={(e) =>
                setSelectedKeys([
                  { ...value, max_children_capacity: e.target.value },
                ])
              }
              onPressEnter={confirm as any}
              style={{ marginBottom: 8 }}
            />

            <Space>
              <Button type="primary" size="small" onClick={() => confirm()}>
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
      title: "Thời gian",
      dataIndex: "created_at",
      sorter: true,
      render: (_text, record, _index, _action) => {
        return (
          <div className="flex items-center gap-[10px]">
            <ul>
              <li>
                - Ngày tạo:{" "}
                {dayjs(record.created_at).format("DD-MM-YYYY HH:mm:ss")}
              </li>
              <li>
                - Ngày bắt đầu:{" "}
                {dayjs(record.start_date).format("DD-MM-YYYY HH:mm:ss")}
              </li>
              <li>
                - Ngày kết thúc:{" "}
                {dayjs(record.end_date).format("DD-MM-YYYY HH:mm:ss")}
              </li>
            </ul>
          </div>
        );
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
              color: "#ffa500",
            }}
            type=""
            onClick={() => {
              setOpenModal(true);
              setDataInit(entity);
            }}
          />

          <Popconfirm
            placement="leftTop"
            title={"Xác nhận xóa phòng"}
            description={"Bạn chắc chắn muốn xóa phòng"}
            onConfirm={() => handleDeleteRoom(entity.id)}
            okText={"Xác nhận"}
            cancelText={"Hủy"}
          >
            <span style={{ cursor: "pointer", margin: "0 10px" }}>
              <DeleteOutlined
                style={{
                  fontSize: 20,
                  color: "#ff4d4f",
                }}
              />
            </span>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const buildQuery = (params: any, _sort: any, _filter: any) => {
    let temp = "";

    const clone = {
      ...params,
      currentPage: params.current,
      limit: params.pageSize,
    };
    delete clone.current;
    delete clone.pageSize;

    temp += `current=${clone.currentPage}`;
    temp += `&pageSize=${clone.limit}`;

    if (_filter?.room?.[0]?.room_type) {
      temp += `&room_type=${_filter?.room?.[0]?.room_type}`;
    }
    if (_filter?.room?.[0]?.stay_type) {
      temp += `&stay_type=${_filter?.room?.[0]?.stay_type}`;
    }
    if (_filter?.room?.[0]?.min_price_per_night) {
      temp += `&min_price_per_night=${_filter?.room?.[0]?.min_price_per_night}`;
    }
    if (_filter?.room?.[0]?.max_price_per_night) {
      temp += `&max_price_per_night=${_filter?.room?.[0]?.max_price_per_night}`;
    }
    if (_filter?.room?.[0]?.min_price_per_day) {
      temp += `&min_price_per_day=${_filter?.room?.[0]?.min_price_per_day}`;
    }
    if (_filter?.room?.[0]?.max_price_per_day) {
      temp += `&max_price_per_day=${_filter?.room?.[0]?.max_price_per_day}`;
    }
    if (_filter?.room?.[0]?.available) {
      temp += `&available=${_filter?.room?.[0]?.available === "true" ? 1 : 0}`;
    }

    if (_filter?.hotel?.[0]?.hotel_id) {
      temp += `&hotel_id=${_filter?.hotel?.[0]?.hotel_id}`;
    }

    if (clone.name) {
      temp += `&name=${clone.name} `;
    }
    if (clone.description) {
      temp += `&description=${clone.description} `;
    }
    if (user.role === ROLE.OWNER) {
      temp += `&owner_id=${user.id} `;
    }

    // sort
    if (_.isEmpty(_sort)) {
      temp += `&sort=id-desc`;
    } else {
      Object.entries(_sort).map(([key, val]) => {
        temp += `&sort=${key}-${val === "ascend" ? "asc" : "desc"} `;
      });
    }

    return temp;
  };

  return (
    <div>
      <DataTable
        actionRef={tableRef}
        headerTitle={"Danh sách room"}
        rowKey="id"
        loading={isFetching}
        columns={columns}
        dataSource={rooms}
        request={async (params, sort, filter): Promise<any> => {
          const query = buildQuery(params, sort, filter);
          dispatch(fetchRoom({ query }));
        }}
        scroll={{ x: true }}
        pagination={{
          current: meta.currentPage,
          pageSize: meta.itemsPerPage,
          showSizeChanger: true,
          total: meta.totalItems,
          showTotal: (total, range) => {
            return (
              <div>
                {" "}
                {range[0]}-{range[1]} trên {total} bản ghi
              </div>
            );
          },
        }}
        rowSelection={false}
        toolBarRender={(_action, _rows): any => {
          return (
            <Button
              icon={<PlusOutlined />}
              type="primary"
              onClick={() => setOpenModal(true)}
            >
              <span>Thêm mới</span>
            </Button>
          );
        }}
      />
      <ModalRoom
        openModal={openModal}
        setOpenModal={setOpenModal}
        reloadTable={reloadTable}
        dataInit={dataInit}
        setDataInit={setDataInit}
      />
      <ModalRoomDetail
        room={dataInit}
        isModalOpen={isModalDetailOpen}
        setIsModalOpen={setIsModalDetailOpen}
      />
    </div>
  );
}

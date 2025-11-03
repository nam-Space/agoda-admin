/* eslint-disable @typescript-eslint/no-explicit-any */

import { TIME_STATISTIC, TIME_STATISTIC_VI } from "@/constants/time";

const ChartTab = ({ selectedTime, setSelectedTime }: any) => {


  const getButtonClass = (option: string) =>
    selectedTime === option
      ? "shadow-theme-xs text-gray-900 dark:text-white bg-white dark:bg-gray-800"
      : "text-gray-500 dark:text-gray-400";

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-gray-100 p-0.5 dark:bg-gray-900">
      <button
        onClick={() => setSelectedTime(TIME_STATISTIC.DAY)}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass(
          TIME_STATISTIC.DAY
        )}`}
      >
        {TIME_STATISTIC_VI[TIME_STATISTIC.DAY]}
      </button>

      <button
        onClick={() => setSelectedTime(TIME_STATISTIC.MONTH)}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass(
          TIME_STATISTIC.MONTH
        )}`}
      >
        {TIME_STATISTIC_VI[TIME_STATISTIC.MONTH]}
      </button>

      <button
        onClick={() => setSelectedTime(TIME_STATISTIC.QUARTER)}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass(
          TIME_STATISTIC.QUARTER
        )}`}
      >
        {TIME_STATISTIC_VI[TIME_STATISTIC.QUARTER]}
      </button>

      <button
        onClick={() => setSelectedTime(TIME_STATISTIC.YEAR)}
        className={`px-3 py-2 font-medium w-full rounded-md text-theme-sm hover:text-gray-900   dark:hover:text-white ${getButtonClass(
          TIME_STATISTIC.YEAR
        )}`}
      >
        {TIME_STATISTIC_VI[TIME_STATISTIC.YEAR]}
      </button>
    </div>
  );
};

export default ChartTab;

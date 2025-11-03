/* eslint-disable @typescript-eslint/no-explicit-any */
import MonthlyTarget from "./MonthlyTarget";
import CustomerTarget from "./CustomerTarget";
import OrderTarget from "./OrderTarget";

export default function EcommerceMetrics({ statistic, serviceType }: any) {

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <CustomerTarget statistic={statistic} serviceType={serviceType} />
        <OrderTarget statistic={statistic} serviceType={serviceType} />
        <MonthlyTarget statistic={statistic} serviceType={serviceType} />
      </div>

    </div>
  );
}

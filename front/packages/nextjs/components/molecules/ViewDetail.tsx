import React from "react";
import { cn } from "../../utils/cn";

const ViewDetail: React.FC = () => {
  return (
    <div
      className={cn(
        "w-2/3 py-10 mx-auto px-48 flex flex-row gap-14 border-t border-b bg-slate-50",
        "note:px-10 note:w-3/4",
        "tablet:px-10 tablet:w-full",
        "mobile:w-full mobile:flex mobile:flex-col mobile:gap-4",
      )}
    >
      <div className=" mobile:font-bold">Instructions</div>
      <ul className=" flex flex-col gap-1 list-disc mobile:gap-3 mobile:text-sm">
        <li>Please enter the recipient's address accurately before proceeding with the payment.</li>
        <li>Depending on the network environment, payment processing may take some time.</li>
        <li>The gifts you send can be confirmed in the gift box.</li>
        <li>This product may differ from the actual product as it is an example image.</li>
        <li>For shipped products, extension of validity period and refunds are not applicable.</li>
        <li>
          As we are not a telecommunications intermediary, we do not take responsibility for the product information and
          transactions provided by the seller.
        </li>
      </ul>
    </div>
  );
};

export default ViewDetail;

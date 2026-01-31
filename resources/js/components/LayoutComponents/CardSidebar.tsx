import React, { useState } from "react";

import {
  ChevronDown,
  ChevronUp,
  Heart,
  Rotate3D,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { Drawer } from "../CustomComponents/Drawer/Drawer";
interface CardSidebarProps {
  open: boolean;
  handleCloseModal: () => void;
}

const CardSidebar: React.FC<CardSidebarProps> = ({
  open,
  handleCloseModal,
}) => {
  const [count1, setCount1] = useState<number>(1);
  const [count2, setCount2] = useState<number>(2);
  const [count3, setCount3] = useState<number>(1);
  return (
    <>
      <Drawer
        isOpen={open}
        onClose={() => handleCloseModal()}
        position="right"
        size="large"
        customContentClass="none"
        content={
          <>
            <div id="basicEnd" drawer-end className="drawer show drawer-lg">
              <div className="drawer-header">
                <h6>My Cart (3)</h6>
                <button data-drawer-close="basicEnd">
                  <X className="link link-red" onClick={handleCloseModal}></X>
                </button>
              </div>
              <div className="drawer-content">
                <div className="py-3 border-b border-gray-200 dark:border-dark-800 last:border-none first:pt-0">
                  <div className="flex gap-3 item-center">
                   
                    <div className="grow">
                      <h6 className="mb-2 text-14">
                        <a href="#!">Crop top Sweater Clothing</a>
                      </h6>
                      <p>
                        <span className="badge badge-green ltr:mr-2 rtl:ml-2">
                          In Stock
                        </span>{" "}
                        -{" "}
                        <span className="inline-block bg-pink-500 ltr:ml-2 rtl:mr-2 size-3"></span>{" "}
                        <span className="align-baseline">Pink</span>
                      </p>
                      <div className="flex gap-3 *:flex *:items-center items-center mt-5">
                        <a href="#!" className="shrink-0 link link-red text-14">
                          <Trash2 className="size-4 ltr:mr-1 rtl:ml-1" /> Remove
                        </a>
                        <a
                          href="#!"
                          className="shrink-0 link link-primary text-14"
                        >
                          <Trash2 className="size-4 ltr:mr-1 rtl:ml-1" />{" "}
                          Wishlist
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-col shrink-0">
                      <h6>$22.12</h6>
                      <div className="mt-auto">
                        <div className="flex items-center w-16 p-1 text-center border border-gray-200 rounded-md dark:border-dark-800">
                          <div className="flex flex-col">
                            <button
                              onClick={() => setCount1(count1 + 1)}
                              className="flex items-center justify-center text-gray-500 transition duration-200 ease-linear dark:text-dark-500 plus hover:text-primary-500 dark:hover:text-primary-500"
                            >
                              <ChevronUp className="size-3" />
                            </button>
                            <button
                              onClick={() => setCount1(count1 - 1)}
                              className="flex items-center justify-center text-gray-500 transition duration-200 ease-linear dark:text-dark-500 minus hover:text-primary-500 dark:hover:text-primary-500"
                            >
                              <ChevronDown className="size-3" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={count1}
                            className="h-5 p-0 text-center border-0 rounded-none form-input"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-3 border-b border-gray-200 dark:border-dark-800 last:border-none first:pt-0">
                  <div className="flex gap-3 item-center">
                   
                    <div className="grow">
                      <h6 className="mb-2 text-14">
                        <a href="#!">Spar Men Black Running Shoes</a>
                      </h6>
                      <p>
                        <span className="badge badge-green ltr:mr-2 rtl:ml-2">
                          In Stock
                        </span>{" "}
                        -{" "}
                        <span className="inline-block bg-gray-800 dark:bg-dark-700 ltr:ml-2 rtl:mr-2 size-3"></span>{" "}
                        <span className="align-baseline">Black</span>
                      </p>
                      <div className="flex gap-3 *:flex *:items-center items-center mt-5">
                        <a href="#!" className="shrink-0 link link-red text-14">
                          <Trash2 className="size-4 ltr:mr-1 rtl:ml-1" /> Remove
                        </a>
                        <a
                          href="#!"
                          className="shrink-0 link link-primary text-14"
                        >
                          <Heart className="size-4 ltr:mr-1 rtl:ml-1" />{" "}
                          Wishlist
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-col shrink-0">
                      <h6>$71.56</h6>
                      <div className="mt-auto">
                        <div className="flex items-center w-16 p-1 text-center border border-gray-200 rounded-md dark:border-dark-800">
                          <div className="flex flex-col">
                            <button
                              onClick={() => setCount2(count2 + 1)}
                              className="flex items-center justify-center text-gray-500 transition duration-200 ease-linear dark:text-dark-500 plus hover:text-primary-500 dark:hover:text-primary-500"
                            >
                              <ChevronUp className="size-3" />
                            </button>
                            <button
                              onClick={() => setCount2(count2 - 1)}
                              className="flex items-center justify-center text-gray-500 transition duration-200 ease-linear dark:text-dark-500 minus hover:text-primary-500 dark:hover:text-primary-500"
                            >
                              <ChevronDown className="size-3" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={count2}
                            className="h-5 p-0 text-center border-0 rounded-none form-input"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-3 border-b border-gray-200 dark:border-dark-800 last:border-none first:pt-0">
                  <div className="flex gap-3 item-center">
                    
                    <div className="grow">
                      <h6 className="mb-2 text-14">
                        <a href="#!">Spar Men Black Running Shoes</a>
                      </h6>
                      <p>
                        <span className="badge badge-red ltr:mr-2 rtl:ml-2">
                          Out of Stock
                        </span>{" "}
                        -{" "}
                        <span className="inline-block bg-blue-500 ltr:ml-2 rtl:mr-2 size-3"></span>{" "}
                        <span className="align-baseline">Blue</span>
                      </p>
                      <div className="flex gap-3 *:flex *:items-center items-center mt-5">
                        <a href="#!" className="shrink-0 link link-red text-14">
                          <Trash2 className="size-4 ltr:mr-1 rtl:ml-1" /> Remove
                        </a>
                        <a
                          href="#!"
                          className="shrink-0 link link-primary text-14"
                        >
                          <Heart className="size-4 ltr:mr-1 rtl:ml-1" />{" "}
                          Wishlist
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-col shrink-0">
                      <h6>$44.49</h6>
                      <div className="mt-auto">
                        <div className="flex items-center w-16 p-1 text-center border border-gray-200 rounded-md dark:border-dark-800">
                          <div className="flex flex-col">
                            <button
                              onClick={() => setCount3(count3 + 1)}
                              className="flex items-center justify-center text-gray-500 transition duration-200 ease-linear dark:text-dark-500 plus hover:text-primary-500 dark:hover:text-primary-500"
                            >
                              <ChevronUp className="size-3" />
                            </button>
                            <button
                              onClick={() => setCount3(count3 - 1)}
                              className="flex items-center justify-center text-gray-500 transition duration-200 ease-linear dark:text-dark-500 minus hover:text-primary-500 dark:hover:text-primary-500"
                            >
                              <ChevronDown className="size-3" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={count3}
                            className="h-5 p-0 text-center border-0 rounded-none form-input"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-col p-0 border-none drawer-footer">
                <div className="w-full p-5 pb-3 border-t border-gray-200 dark:border-dark-800">
                  <div className="-mx-5">
                    <table className="w-full flush text-start">
                      <tbody>
                        <tr className="*:py-2 *:px-5">
                          <td>Sub Amount</td>
                          <td>
                            $<span>138.17</span>
                          </td>
                        </tr>
                        <tr className="*:py-2 *:px-5">
                          <td>Vat Amount (6%)</td>
                          <td>
                            $<span>8.29</span>
                          </td>
                        </tr>
                        <tr className="*:py-2 *:px-5">
                          <td>Discount (10%)</td>
                          <td>
                            -$<span>0.00</span>
                          </td>
                        </tr>
                        <tr className="*:py-2 *:px-5">
                          <td>Shipping Charge</td>
                          <td>
                            $<span>35.00</span>
                          </td>
                        </tr>
                        <tr className="border-t border-gray-200 dark:border-dark-800 *:pt-3 *:px-5">
                          <th className="text-start">Total Amount</th>
                          <td>
                            $<span>181.46</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-200 dark:border-dark-800">
                  <a
                    href="apps-ecommerce-products-list.html"
                    className="btn btn-sub-indigo btn-icon-text"
                  >
                    <ShoppingBag className="size-4"></ShoppingBag> Continue
                    Shopping
                  </a>
                  <a
                    href="apps-ecommerce-checkout.html"
                    className="btn btn-primary btn-icon-text"
                  >
                    <Rotate3D className="size-4" /> Checkout
                  </a>
                </div>
              </div>
            </div>
          </>
        }
      />
    </>
  );
};

export default CardSidebar;

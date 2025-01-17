import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import Modal from "@/components/UI/Modal";
import { api } from "@/utils/api";
import AutocompleteAsset from "../UI/AutocompleteAsset";

const FormSchema = z.object({
  assetType: z.enum(["STOCK", "CRYPTO"], {
    invalid_type_error: "Asset type is required.",
  }),
  assetId: z.object(
    {
      symbol: z
        .string({ invalid_type_error: "Asset is required." })
        .min(1, `Asset is required.`),
      name: z
        .string({ invalid_type_error: "Asset is required." })
        .min(1, `Asset is required.`),
    },
    { required_error: "Asset is required." }
  ),
  amount: z
    .number({
      invalid_type_error: "Amount is required.",
    })
    .gt(0, { message: "Must be greater than 0." }),
});

export type SearchAssetType = {
  symbol: string;
  name: string;
};

export type FormSchemaType = {
  assetType: "STOCK" | "CRYPTO" | "";
  assetId: SearchAssetType;
  amount: number | undefined;
};

type AddAssetModalProps = {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetchAssets: () => void;
  assetList: string[] | undefined;
};

const AddAssetModal = ({
  setOpen,
  refetchAssets,
  assetList,
}: AddAssetModalProps) => {
  const { data: sessionData } = useSession();

  const createAssetMutation = api.portfolioAsset.createAsset.useMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      assetType: "",
      assetId: { symbol: "", name: "" },
      amount: undefined,
    },
  });

  // const [formData, setFormData] = useState<FormSchemaType>({
  //   assetType: "",
  //   assetId: { symbol: "", name: "" },
  //   amount: undefined,
  // });

  const onSubmit = (data: FormSchemaType) => {
    // setFormData(data);
    createAssetMutation.mutate(
      {
        userId: sessionData?.user?.id as string,
        assetSymbol: data.assetId.symbol,
        assetName: data.assetId.name,
        amount: data.amount as number,
        type: data.assetType as "STOCK" | "CRYPTO",
      },
      {
        onSuccess: () => {
          refetchAssets();
          setOpen(false);
        },
      }
    );
  };

  return (
    <Modal setOpen={setOpen}>
      <form
        //eslint-disable-next-line
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6"
        action="#"
        method="POST"
      >
        <div className="bg-white">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Add Asset
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add a new asset to your portfolio.
              </p>
            </div>
            <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
              <fieldset>
                <legend className="contents text-base font-medium text-gray-900">
                  Asset type
                </legend>
                <p className="text-sm text-gray-500">
                  The type of the asset you want to add.
                </p>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center">
                    <input
                      id="asset-type"
                      type="radio"
                      value="STOCK"
                      className="disabled: h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
                      disabled
                      {...register("assetType", { required: true })}
                    />
                    <label
                      htmlFor="asset-type"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      Stock
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="asset-type"
                      type="radio"
                      value="CRYPTO"
                      className="h-4 w-4 border-gray-300 text-teal-600 focus:ring-teal-500"
                      {...register("assetType", { required: true })}
                    />
                    <label
                      htmlFor="asset-type"
                      className="ml-3 block text-sm font-medium text-gray-700"
                    >
                      Crypto
                    </label>
                  </div>
                </div>
                <AnimatePresence>
                  {errors.assetType && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                        transition: { duration: 0.1 },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: { duration: 0.1 },
                      }}
                      className="mt-[2px] text-xs text-red-600"
                    >
                      {errors.assetType.message}
                    </motion.div>
                  )}
                </AnimatePresence>
              </fieldset>

              <div className="mt-5 md:col-span-2 md:mt-0">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="first-name"
                      className="block text-base font-medium text-gray-700"
                    >
                      Name
                      <p className=" text-sm font-normal text-gray-500">
                        The symbol/ticker of the asset.
                      </p>
                    </label>
                    <Controller
                      control={control}
                      name="assetId"
                      render={({ field: { onChange, value } }) => (
                        <AutocompleteAsset
                          onChange={onChange}
                          value={value}
                          assetList={assetList}
                        />
                      )}
                    />
                    <AnimatePresence>
                      {errors.assetId && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                            transition: { duration: 0.1 },
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            transition: { duration: 0.1 },
                          }}
                          className="mt-[2px] text-xs text-red-600"
                        >
                          Asset is required.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="last-name"
                      className="block text-base font-medium text-gray-700"
                    >
                      Amount
                      <p className=" text-sm font-normal text-gray-500">
                        Asset quantity.
                      </p>
                    </label>
                    <input
                      type="text"
                      id="amount"
                      // defaultValue={formData.amount}
                      {...register("amount", {
                        required: true,
                        valueAsNumber: true,
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    />
                    <AnimatePresence>
                      {errors.amount && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{
                            opacity: 1,
                            height: "auto",
                            transition: { duration: 0.1 },
                          }}
                          exit={{
                            height: 0,
                            opacity: 0,
                            transition: { duration: 0.1 },
                          }}
                          className="mt-[2px] text-xs text-red-600"
                        >
                          {errors.amount.message}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            type="button"
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            onClick={() => setOpen(false)}
            whileTap={{
              scale: 0.95,
              borderRadius: "8px",
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 8,
              mass: 0.5,
            }}
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-teal-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            whileTap={{
              scale: 0.95,
              borderRadius: "8px",
            }}
            transition={{
              type: "spring",
              stiffness: 150,
              damping: 8,
              mass: 0.5,
            }}
          >
            Add
          </motion.button>
        </div>
      </form>
    </Modal>
  );
};

export default AddAssetModal;

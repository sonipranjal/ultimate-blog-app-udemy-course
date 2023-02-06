import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { trpc } from "../../utils/trpc";
import Modal from "../Modal";

export const tagCreateSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
});

type TagFormProps = {
  isOpen: boolean;
  onClose: () => void;
};

const TagForm = ({ isOpen, onClose }: TagFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{
    name: string;
    description: string;
  }>({
    resolver: zodResolver(tagCreateSchema),
  });

  const tagRouter = trpc.useContext().tag;

  const createTag = trpc.tag.createTag.useMutation({
    onSuccess: () => {
      toast.success("tag successfully created 🥳");
      reset();
      onClose();
      tagRouter.getTags.invalidate();
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a tag">
      <form
        onSubmit={handleSubmit((data) => createTag.mutate(data))}
        className="relative flex flex-col items-center justify-center space-y-4"
      >
        <input
          type="text"
          id="name"
          className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
          placeholder="name of the tag"
          {...register("name")}
        />
        <p className="w-full pb-2 text-left text-sm text-red-500">
          {errors.name?.message}
        </p>
        <input
          type="text"
          id="description"
          className="h-full w-full rounded-xl border border-gray-300 p-4 outline-none focus:border-gray-600"
          placeholder="description"
          {...register("description")}
        />
        <p className="w-full pb-2 text-left text-sm text-red-500">
          {errors.description?.message}
        </p>
        <div className="flex w-full justify-end">
          <button
            className="w-fit space-x-3 whitespace-nowrap rounded border border-gray-200 px-4 py-2 text-right text-sm transition hover:border-gray-900 hover:text-gray-900"
            type="submit"
          >
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TagForm;

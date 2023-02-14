import dayjs from "dayjs";
import Link from "next/link";
import React from "react";
import { toast } from "react-hot-toast";
import { trpc } from "../../utils/trpc";

const SideSection = () => {
  const readingList = trpc.post.getReadingList.useQuery();
  const suggestions = trpc.user.getSuggestions.useQuery();

  const followUser = trpc.user.followUser.useMutation({
    onSuccess: () => {
      // we have to update out UI
      toast.success("user followed");
    },
  });

  return (
    <aside className="col-span-4 flex flex-col space-y-4 p-6">
      <div>
        <h3 className="my-6 text-lg font-semibold">
          People you might be interested
        </h3>
        {/* suggestions */}
        <div className="flex flex-col space-y-4">
          {suggestions.isSuccess &&
            suggestions.data.map((user) => (
              <div
                key={user.id}
                className="flex flex-row items-center space-x-5"
              >
                <div className="h-10 w-10 flex-none rounded-full bg-gray-300"></div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {user.name}
                  </div>
                  <div className="text-xs">{user.username}</div>
                </div>
                <div>
                  <button
                    onClick={() =>
                      followUser.mutate({
                        followingUserId: user.id,
                      })
                    }
                    className="flex items-center space-x-3 rounded border border-gray-400/50 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900"
                  >
                    Follow
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* bookmarks */}
      <div>
        <h3 className="my-6 text-lg font-semibold">Your reading list</h3>
        <div className="flex flex-col space-y-8">
          {readingList.data &&
            readingList.data.map((bookmark) => (
              <Link
                href={`/${bookmark.post.slug}`}
                key={bookmark.id}
                className="group flex items-center space-x-6"
              >
                <div className="aspect-square h-full w-2/5 rounded-xl bg-gray-300"></div>
                <div className="flex w-3/5 flex-col space-y-2">
                  <div className="text-lg font-semibold decoration-indigo-600 group-hover:underline">
                    {bookmark.post.title}
                  </div>
                  <div className="truncate">{bookmark.post.description}</div>
                  <div className="flex w-full items-center space-x-4">
                    <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                    <div>{bookmark.post.author.name} &#x2022;</div>
                    <div>
                      {dayjs(bookmark.post.createdAt).format("DD/MM/YYYY")}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </aside>
  );
};

export default SideSection;

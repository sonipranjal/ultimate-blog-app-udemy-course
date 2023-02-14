import React from "react";
import { CiSearch } from "react-icons/ci";
import { HiChevronDown } from "react-icons/hi";
import InfiniteScroll from "react-infinite-scroll-component";
import { trpc } from "../../utils/trpc";

import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Post from "../Post";
import { BiLoaderCircle } from "react-icons/bi";

const MainSection = () => {
  const getPosts = trpc.post.getPosts.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  console.log(getPosts.data?.pages.flatMap((page) => page.posts));

  return (
    <main className="col-span-8 border-r border-gray-300 px-24">
      <div className="flex w-full flex-col space-y-4 py-10">
        <div className="flex w-full items-center space-x-4">
          <label
            htmlFor="search"
            className="relative w-full rounded-3xl border border-gray-800"
          >
            <div className="absolute left-2 flex h-full items-center ">
              <CiSearch />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="w-full rounded-3xl py-1 px-4 pl-7 text-sm outline-none placeholder:text-xs placeholder:text-gray-300"
              placeholder="Search..."
            />
          </label>
          <div className="flex w-full items-center justify-end space-x-4">
            <div>My topics:</div>
            <div className="flex items-center space-x-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-3xl bg-gray-200/50 px-4 py-3">
                  tag {i}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between border-b border-gray-300 pb-8">
          <div>Articles</div>
          <div>
            <button className="flex items-center space-x-2 rounded-3xl border border-gray-800 px-4 py-1.5 font-semibold">
              <div>Following</div>
              <div>
                <HiChevronDown className="text-xl " />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center space-y-8">
        {getPosts.isLoading && (
          <div className="flex h-full w-full items-center justify-center space-x-4">
            <div>
              <AiOutlineLoading3Quarters className="animate-spin" />
            </div>
            <div>Loading...</div>
          </div>
        )}

        <InfiniteScroll
          dataLength={
            getPosts.data?.pages.flatMap((page) => page.posts).length ?? 0
          } //This is important field to render the next data
          next={getPosts.fetchNextPage}
          hasMore={Boolean(getPosts.hasNextPage)}
          loader={
            <div className="flex h-full w-full items-center justify-center">
              <BiLoaderCircle className="animate-spin" />
            </div>
          }
          endMessage={
            <p className="text-center">
              <b>Yay! You have seen it all</b>
            </p>
          }
        >
          {getPosts.isSuccess &&
            getPosts.data?.pages
              .flatMap((page) => page.posts)
              .map((post) => <Post {...post} key={post.id} />)}
        </InfiniteScroll>
      </div>
    </main>
  );
};

export default MainSection;

import { router, protectedProcedure } from "../trpc";

import { createApi } from "unsplash-js";
import { env } from "../../../env/server.mjs";
import { TRPCError } from "@trpc/server";
import { unsplashSearchRouteSchema } from "../../../components/UnsplashGallary";

const unsplash = createApi({
  accessKey: env.UNSPLASH_API_ACCESS_KEY,
});

export const unsplashRouter = router({
  getImages: protectedProcedure
    .input(unsplashSearchRouteSchema)
    .query(async ({ input: { searchQuery } }) => {
      try {
        const imagesData = await unsplash.search.getPhotos({
          query: searchQuery,
          orientation: "landscape",
        });
        return imagesData.response;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "unsplash not working",
        });
      }
    }),
});

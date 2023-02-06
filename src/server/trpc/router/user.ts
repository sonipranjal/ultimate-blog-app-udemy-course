import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import isDataURI from "validator/lib/isDataURI";
import { decode } from "base64-arraybuffer";
import { createClient } from "@supabase/supabase-js";
import { env } from "../../../env/server.mjs";
import { TRPCError } from "@trpc/server";

const supabase = createClient(env.SUPABASE_PUBLIC_URL, env.SUPABASE_SECRET_KEY);

export const userRouter = router({
  getUserProfile: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ ctx: { prisma }, input: { username } }) => {
      return await prisma.user.findUnique({
        where: {
          username: username,
        },
        select: {
          name: true,
          image: true,
          id: true,
          username: true,
          _count: {
            select: {
              posts: true,
            },
          },
        },
      });
    }),

  getUserPosts: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ ctx: { prisma, session }, input: { username } }) => {
      return await prisma.user.findUnique({
        where: {
          username,
        },
        select: {
          posts: {
            select: {
              id: true,
              slug: true,
              title: true,
              description: true,
              createdAt: true,
              author: {
                select: {
                  name: true,
                  image: true,
                  username: true,
                },
              },
              bookmarks: session?.user?.id
                ? {
                    where: {
                      userId: session?.user?.id,
                    },
                  }
                : false,
            },
          },
        },
      });
    }),

  uploadAvatar: protectedProcedure
    .input(
      z.object({
        imageAsDataUrl: z.string().refine((val) => isDataURI(val)),
        username: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      // make a function which which grab the user from db using the username and check if it's id is equal to the session user id

      // `image` here is a base64 encoded data URI, it is NOT a base64 string, so we need to extract
      // the real base64 string from it.
      // Check the syntax here: https://en.wikipedia.org/wiki/Data_URI_scheme#Syntax
      // remove the "data:image/jpeg;base64,"
      const imageBase64Str = input.imageAsDataUrl.replace(/^.+,/, "");

      const { data, error } = await supabase.storage
        .from("public")
        .upload(`avatars/${input.username}.png`, decode(imageBase64Str), {
          contentType: "image/png",
          upsert: true,
        });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "upload failed to supabase",
        });
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("public").getPublicUrl(data?.path);

      await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: {
          image: publicUrl,
        },
      });
    }),
});

import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";
import { writeFormSchema } from "../../../components/WriteFormModal";
import { router, protectedProcedure, publicProcedure } from "../trpc";

const LIMIT = 10;

export const postRouter = router({
  createPost: protectedProcedure
    .input(
      writeFormSchema.and(
        z.object({
          tagsIds: z
            .array(
              z.object({
                id: z.string(),
              })
            )
            .optional(),
        })
      )
    )
    .mutation(
      async ({
        ctx: { prisma, session },
        input: { title, description, text, tagsIds, html },
      }) => {
        // create a function that checks whether the post with this title exists

        await prisma.post.create({
          data: {
            title,
            description,
            text,
            html,
            slug: slugify(title),
            author: {
              connect: {
                id: session.user.id,
              },
            },
            tags: {
              connect: tagsIds,
            },
          },
        });
      }
    ),

  updatePostFeaturedImage: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
        postId: z.string(),
      })
    )
    .mutation(
      async ({ ctx: { prisma, session }, input: { imageUrl, postId } }) => {
        // we have to check if the user is owner of the given post

        const postData = await prisma.post.findUnique({
          where: {
            id: postId,
          },
        });

        if (postData?.authorId !== session.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "you are not owner of this post",
          });
        }

        await prisma.post.update({
          where: {
            id: postId,
          },
          data: {
            featuredImage: imageUrl,
          },
        });
      }
    ),

  getPosts: publicProcedure
    .input(
      z.object({
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx: { prisma, session }, input: { cursor } }) => {
      const posts = await prisma.post.findMany({
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          slug: true,
          title: true,
          description: true,
          createdAt: true,
          featuredImage: true,
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
          tags: {
            select: {
              name: true,
              id: true,
              slug: true,
            },
          },
        },
        cursor: cursor ? { id: cursor } : undefined,
        take: LIMIT + 1,
      });

      let nextCursor: typeof cursor | undefined = undefined;

      if (posts.length > LIMIT) {
        const nextItem = posts.pop();
        if (nextItem) nextCursor = nextItem.id;
      }

      return { posts, nextCursor };
    }),

  getPost: publicProcedure
    .input(
      z.object({
        slug: z.string(),
      })
    )
    .query(async ({ ctx: { prisma, session }, input: { slug } }) => {
      const post = await prisma.post.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
          description: true,
          title: true,
          text: true,
          html: true,
          likes: session?.user?.id
            ? {
                where: {
                  userId: session?.user?.id,
                },
              }
            : false,
          authorId: true,
          slug: true,
          featuredImage: true,
        },
      });

      return post;
    }),

  likePost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { postId } }) => {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });
    }),

  disLikePost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { postId } }) => {
      await prisma.like.delete({
        where: {
          userId_postId: {
            postId: postId,
            userId: session.user.id,
          },
        },
      });
    }),

  bookmarkPost: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { postId } }) => {
      await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          postId,
        },
      });
    }),

  removeBookmark: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { postId } }) => {
      await prisma.bookmark.delete({
        where: {
          userId_postId: {
            postId: postId,
            userId: session.user.id,
          },
        },
      });
    }),

  submitComment: protectedProcedure
    .input(
      z.object({
        text: z.string().min(3),
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx: { prisma, session }, input: { text, postId } }) => {
      await prisma.comment.create({
        data: {
          text,
          user: {
            connect: {
              id: session.user.id,
            },
          },
          post: {
            connect: {
              id: postId,
            },
          },
        },
      });
    }),

  getComments: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(async ({ ctx: { prisma }, input: { postId } }) => {
      const comments = await prisma.comment.findMany({
        where: {
          postId,
        },
        select: {
          id: true,
          text: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return comments;
    }),

  getReadingList: protectedProcedure.query(
    async ({ ctx: { prisma, session } }) => {
      const allBookmarks = await prisma.bookmark.findMany({
        where: {
          userId: session.user.id,
        },
        take: 4,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          post: {
            select: {
              title: true,
              description: true,
              author: {
                select: {
                  name: true,
                  image: true,
                },
              },
              createdAt: true,
              slug: true,
            },
          },
        },
      });

      return allBookmarks;
    }
  ),
});

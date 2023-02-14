import { router } from "../trpc";
import { authRouter } from "./auth";
import { postRouter } from "./post";
import { tagRouter } from "./tag";
import { unsplashRouter } from "./unsplash";
import { userRouter } from "./user";

export const appRouter = router({
  auth: authRouter,
  post: postRouter,
  user: userRouter,
  tag: tagRouter,
  unsplash: unsplashRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

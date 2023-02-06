import { randomUUID } from "crypto";
import slugify from "slugify";

export const generateUsername = (name: string) => {
  return slugify(name) + randomUUID();
};

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as characters_actions from "../characters/actions.js";
import type * as characters_mutations from "../characters/mutations.js";
import type * as characters_queries from "../characters/queries.js";
import type * as http from "../http.js";
import type * as image_generations_actions from "../image_generations/actions.js";
import type * as image_generations_mutations from "../image_generations/mutations.js";
import type * as image_generations_queries from "../image_generations/queries.js";
import type * as lib_imagekit from "../lib/imagekit.js";
import type * as lib_kie from "../lib/kie.js";
import type * as lib_openai from "../lib/openai.js";
import type * as script from "../script.js";
import type * as users from "../users.js";
import type * as video_generations_actions from "../video_generations/actions.js";
import type * as video_generations_mutations from "../video_generations/mutations.js";
import type * as video_generations_queries from "../video_generations/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "characters/actions": typeof characters_actions;
  "characters/mutations": typeof characters_mutations;
  "characters/queries": typeof characters_queries;
  http: typeof http;
  "image_generations/actions": typeof image_generations_actions;
  "image_generations/mutations": typeof image_generations_mutations;
  "image_generations/queries": typeof image_generations_queries;
  "lib/imagekit": typeof lib_imagekit;
  "lib/kie": typeof lib_kie;
  "lib/openai": typeof lib_openai;
  script: typeof script;
  users: typeof users;
  "video_generations/actions": typeof video_generations_actions;
  "video_generations/mutations": typeof video_generations_mutations;
  "video_generations/queries": typeof video_generations_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

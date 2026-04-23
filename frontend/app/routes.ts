import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("books/:asin", "routes/book-detail.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
] satisfies RouteConfig;

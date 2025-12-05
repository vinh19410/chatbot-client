import "vue-router";
declare module "vue-router" {
  interface RouteMeta {
    action?: string;
    subject?: string;
    layoutWrapperClasses?: string;
    navActiveLink?: RouteLocationRaw;
    layout?: "blank" | "default";
    unauthenticatedOnly?: boolean;
    public?: boolean;
    google: typeof google;
    hideNav?: boolean;
  }

  const google: typeof import("google-one-tap");
}

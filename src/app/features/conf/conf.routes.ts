import { Routes } from "@angular/router";

export const CONF_ROUTES: Routes = [
  {
    path: "parametrization",
    loadChildren: () =>
      import("./pages/parametrization/parametrization.routes").then(
        (m) => m.PARAMETRIZATION_ROUTES,
      ),
  },
];

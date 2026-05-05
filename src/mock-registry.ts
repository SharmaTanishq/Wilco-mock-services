export type MockRoute = {
  method: string;
  path: string;
  description: string;
};

const routes: MockRoute[] = [];

export function registerRoute(route: MockRoute) {
  routes.push(route);
}

export function getRegisteredRoutes() {
  return [...routes].sort((a, b) =>
    `${a.path}:${a.method}`.localeCompare(`${b.path}:${b.method}`),
  );
}

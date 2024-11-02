interface Service {
    id: string;
    name: string;
    host: string;
    port: number;
    meta?: {
        routes?: Record<string, { requiresAuth: boolean; methods?: Record<string, boolean> }>;
    };
}


export const servicesConfig: Service[] = [
  {
      id: "discovery-service",
      name: "discovery",
      host: "localhost",
      port: 3000,
      meta: {
          routes: {
              "some/public/route": { requiresAuth: false, methods: { GET: false } },
              "some/protected/route": { requiresAuth: true, methods: { GET: true, POST: true } }
          }
      }
  },
  {
      id: "user-service",
      name: "user",
      host: "localhost",
      port: 4000,
      meta: {
          routes: {
              "auth/logout": { requiresAuth: true, methods: { POST: true } },
              "auth/login": { requiresAuth: false, methods: { POST: false } },
              // Add a wildcard entry for all POST methods
              // "auth/*": { requiresAuth: true, methods: { POST: true } }
          }
      }
  },
  {
      id: "post-service",
      name: "post",
      host: "localhost",
      port: 5000,
  
  },
  {
      id: "api-gateway",
      name: "gateway",
      host: "localhost",
      port: 8080,
    
  }
];

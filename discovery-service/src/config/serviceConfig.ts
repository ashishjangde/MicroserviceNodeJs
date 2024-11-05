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
     
  },
  {
      id: "user-service",
      name: "user",
      host: "localhost",
      port: 4000,
      meta: {
          routes: {
              "/auth/logout": { requiresAuth: true, methods: { POST: true } },
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
      meta: {
          routes: {
              "/": { requiresAuth: true, methods: { POST: true , GET: true} },
              "/:postId": { requiresAuth: true, methods: { DELETE: true } },
            
          }
      }
  
  },
  {
      id: "api-gateway",
      name: "gateway",
      host: "localhost",
      port: 8080,
    
  }
];

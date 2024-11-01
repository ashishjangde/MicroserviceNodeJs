interface Service {
  id: string;
  name: string;
  host: string;
  port: number;
}


export const servicesConfig: Service[] = [
  {
      id: "discovery-service",
      name: "discovery",
      host: "localhost",
      port: 3000
  },
  {
      id: "user-service",
      name: "user",
      host: "localhost",
      port: 4000
  },
  {
      id: "post-service",
      name: "post",
      host: "localhost",
      port: 5000
  }
] 
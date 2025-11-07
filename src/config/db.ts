export const dbConfig = {
  host: process.env.DB_HOST || "49.235.130.75",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "123456",
  password: process.env.DB_PASSWORD || "123456",
  database: process.env.DB_NAME || "classroom",
}


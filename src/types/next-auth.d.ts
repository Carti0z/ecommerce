import { DefaultSession } from "next-auth"
import { RoleName } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      roles: Array<{
        name: RoleName
        permissions: string[]
      }>
    } & DefaultSession["user"]
  }

  interface User {
    roles: Array<{
      name: RoleName
      permissions: string[]
    }>
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    roles: Array<{
      name: RoleName
      permissions: string[]
    }>
  }
}

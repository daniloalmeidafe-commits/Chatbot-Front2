export type RoleName = 'ADMIN' | 'USER'

export type AuthRole = {
    id?: string
    name: RoleName
}

export type AuthUser = {
    id: string
    name: string
    email: string
    role?: AuthRole | null
}

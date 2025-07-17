export const API_ROUTES = {
  LOGIN: '/api/users/login',
  SIGNUP: '/api/users/signup',
  LOGOUT: '/api/users/logout',
  GET_ALL_USERS: '/api/users/all',
  GET_ADMINS: '/api/users/admins',
}

export type ApiRoutes = (typeof API_ROUTES)[keyof typeof API_ROUTES];
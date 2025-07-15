import http from './http';

export const createUser = async (user: { uid: string; email: string }) => 
  await http.post('/users', user);
import http from "./http";

export const createUser = async (user: {
  uid: string;
  email: string;
  photoURL: string | null;
  username: string | null;
}) => await http.post("/users", user);

export const getUserById = async (uid: string) =>
  await http.get(`/users/${uid}`);

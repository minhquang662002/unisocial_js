export interface ResResult {
  [key: string]: any;
  message?: string;
}

export interface User {
  _id: string;
  avatar: string;
  background: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthday: string;
  address?: string;
  gender: string;
  friends: User[] | [];
}

export interface Post {
  _id: string;
  owner: User;
  text: string;
  images: string[] | [];
  videos: string[] | [];
  likes: string[];
  comments: number;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: User;
  receiver: string[];
  url: string;
  text: string;
  readBy: string[];
}

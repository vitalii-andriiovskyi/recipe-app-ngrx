export interface AuthUserVW {
  username:string;
  password: string;
}


export interface User {
  _id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  address?: Address;
  phone?: string;
  token?: string;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}

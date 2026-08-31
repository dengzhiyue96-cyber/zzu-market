export interface JWTUser {
  id: number;
  username: string;
  role: string;
}

export interface ApiResponse<T = any> {
  code: 0 | 1;
  msg: string;
  data?: T;
}

export const CAMPUS_LIST = ['主校区', '南校区', '北校区', '东校区'] as const;
export const CONDITION_LIST = ['全新', '99新', '95新', '9成新', '8成新', '有瑕疵'] as const;

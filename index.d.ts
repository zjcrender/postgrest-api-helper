// Type definitions for PGHelper 2.0.0
// Project: PGHelper
// Definitions by: render https://render.ink

import {AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError} from 'axios'
import {apiInstance, requestMethod} from "./index";

export as namespace PGHelper;

export = PGHelper;

declare class PGHelper {
  constructor(axiosInstance: AxiosInstance);

  request(config: AxiosRequestConfig): apiInstance;

  get: requestMethod;
  delete: requestMethod;
  head: requestMethod;
  options: requestMethod;
  post: requestMethod;
  put: requestMethod;
  patch: requestMethod;

}

declare namespace PGHelper {
  export interface requestMethod {
    (endpoint: string): apiInstance
  }


  interface queries {
    [props: string]: any
  }

  interface operatorMethod {
    (...rules: Array<string>): apiInstance
  }

  export interface apiInstance {
    setQueries(queries: queries): apiInstance;

    setBody(data: any): apiInstance;

    addHeader(key: string, value: string): apiInstance;

    removeHeader(key: string): apiInstance;

    order(key: string, ascending: boolean, nullsfirst: boolean): apiInstance;

    order(...args: Array<string>): apiInstance;

    select(...args: Array<string>): apiInstance;

    pagination(pageIndex: number, pageSize: number, fetchCount: boolean): apiInstance;

    end(): Promise<[AxiosError, null] | [null, AxiosResponse]>;

    not: apiInstance;

    eq: operatorMethod;
    neq: operatorMethod;
    gt: operatorMethod;
    gte: operatorMethod;
    lt: operatorMethod;
    lte: operatorMethod;
    like: operatorMethod;
    ilike: operatorMethod;
    in: operatorMethod;
    is: operatorMethod;
    cs: operatorMethod;
    cd: operatorMethod;
    and: operatorMethod;
    or: operatorMethod;

  }
}

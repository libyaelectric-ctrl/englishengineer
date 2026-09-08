import type { RequestHandler } from 'express';

export interface RouteRegistrar {
  get(path: string, ...handlers: RequestHandler[]): RouteRegistrar;
  post(path: string, ...handlers: RequestHandler[]): RouteRegistrar;
  put(path: string, ...handlers: RequestHandler[]): RouteRegistrar;
  delete(path: string, ...handlers: RequestHandler[]): RouteRegistrar;
  use(...args: [path: string, ...handlers: RequestHandler[]] | RequestHandler[]): RouteRegistrar;
}

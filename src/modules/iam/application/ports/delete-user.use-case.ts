export interface DeleteUserUseCasePort {
  execute(id: string): Promise<void>;
}

export const DELETE_USER_USE_CASE = Symbol('DELETE_USER_USE_CASE');

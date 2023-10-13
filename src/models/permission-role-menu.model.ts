import {Model, model, property} from '@loopback/repository';

@model()
export class PermissionRoleMenu extends Model {
  @property({
    type: 'string',
    required: true,
  })
  token: string;

  @property({
    type: 'string',
    required: true,
  })
  idMenu: string;

  @property({
    type: 'string',
    required: true,
  })
  action : string;


  constructor(data?: Partial<PermissionRoleMenu>) {
    super(data);
  }
}

export interface PermissionRoleMenuRelations {
  // describe navigational properties here
}

export type PermissionRoleMenuWithRelations = PermissionRoleMenu & PermissionRoleMenuRelations;

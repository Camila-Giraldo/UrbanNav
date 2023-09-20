import {Entity, model, property, hasMany} from '@loopback/repository';
import {User} from './user.model';
import {Menu} from './menu.model';
import {RoleMenu} from './role-menu.model';

@model()
export class Role extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  _id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @hasMany(() => User)
  users: User[];

  @hasMany(() => Menu, {through: {model: () => RoleMenu}})
  menus: Menu[];

  constructor(data?: Partial<Role>) {
    super(data);
  }
}

export interface RoleRelations {
  // describe navigational properties here
}

export type RoleWithRelations = Role & RoleRelations;

import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, HasManyThroughRepositoryFactory} from '@loopback/repository';
import {MongodbDataSource} from '../datasources';
import {Role, RoleRelations, User, Menu, RoleMenu} from '../models';
import {UserRepository} from './user.repository';
import {RoleMenuRepository} from './role-menu.repository';
import {MenuRepository} from './menu.repository';

export class RoleRepository extends DefaultCrudRepository<
  Role,
  typeof Role.prototype._id,
  RoleRelations
> {

  public readonly users: HasManyRepositoryFactory<User, typeof Role.prototype._id>;

  public readonly menus: HasManyThroughRepositoryFactory<Menu, typeof Menu.prototype._id,
          RoleMenu,
          typeof Role.prototype._id
        >;

  constructor(
    @inject('datasources.mongodb') dataSource: MongodbDataSource, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>, @repository.getter('RoleMenuRepository') protected roleMenuRepositoryGetter: Getter<RoleMenuRepository>, @repository.getter('MenuRepository') protected menuRepositoryGetter: Getter<MenuRepository>,
  ) {
    super(Role, dataSource);
    this.menus = this.createHasManyThroughRepositoryFactoryFor('menus', menuRepositoryGetter, roleMenuRepositoryGetter,);
    this.registerInclusionResolver('menus', this.menus.inclusionResolver);
    this.users = this.createHasManyRepositoryFactoryFor('users', userRepositoryGetter,);
    this.registerInclusionResolver('users', this.users.inclusionResolver);
  }
}

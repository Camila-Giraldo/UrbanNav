import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {RoleMenuRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    @repository(RoleMenuRepository)
    private repositoryRoleMenu: RoleMenuRepository,
  ) {}

  async VerifyPermissionOfUserByRole(
    idRole: string,
    idMenu: string,
    action: string,
  ): Promise<UserProfile | undefined> {
    let permission = await this.repositoryRoleMenu.findOne({
      where: {
        roleId: idRole,
        menuId: idMenu,
      },
    });

    let next: boolean = false;
    if (permission) {
      switch (action) {
        case 'save':
          next = permission.save;
          break;
        case 'edit':
          next = permission.edit;
          break;
        case 'list':
          next = permission.list;
          break;
        case 'delete':
          next = permission.delete;
          break;
        case 'download':
          next = permission.download;
          break;
        default:
          throw new HttpErrors[401](
            'it is not possible to execute the action because it does not exist',
          );
      }

      if (next) {
        let profile: UserProfile = Object.assign({
          permitted: 'OK',
        });
        return profile;
      } else {
        return undefined;
      }
    } else {
      throw new HttpErrors[401](
        'it is not possible to execute the action due to lack of permissions',
      );
    }
  }
}

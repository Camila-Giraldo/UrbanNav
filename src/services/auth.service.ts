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
    let continuar: boolean = false;
    if (permission) {
      switch (action) {
        case 'save':
          continuar = permission.save;
          break;
        case 'edit':
          continuar = permission.edit;
          break;
        case 'list':
          continuar = permission.list;
          break;
        case 'delete':
          continuar = permission.delete;
          break;
        case 'download':
          continuar = permission.download;
          break;
        default:
          throw new HttpErrors[401](
            'it is not possible to execute the action because it does not exist',
          );
      }

      if (continuar) {
        let profile: UserProfile = Object.assign({
          permitido: 'OK',
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

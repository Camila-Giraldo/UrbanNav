import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {RoleMenuRepository} from '../repositories';
import {UserProfile} from '@loopback/security';

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    @repository(RoleMenuRepository)
    private repositoryRoleMenu: RoleMenuRepository,
  ) {}

  async VerificarPermisoDeUsuarioPorRol(idRol:string, idMenu: string, action: string): Promise<UserProfile | undefined>{
    let permission = await this.repositoryRoleMenu.findOne({
      where: {
        roleId: idRol,
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
          allowed: 'Ok',
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

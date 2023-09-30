/* eslint-disable @typescript-eslint/no-unused-vars */
import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {SecurityUserService} from '../services';
import {repository} from '@loopback/repository';
import {RoleMenu} from '../models';
import {RoleMenuRepository} from '../repositories';

export class AuthStrategy implements AuthenticationStrategy {
  name: string = 'auth';

  constructor(
    @service(SecurityUserService)
    private serviceSecurity: SecurityUserService,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
    @repository(RoleMenuRepository)
    private repositoryRoleMenu: RoleMenuRepository


  ) {}

    /**
   * Autenticación de un usuario frente a una acción en la base de datos
   * @param request la solicitud con el token
   * @returns el perfil de usuario, undefined cuando no tiene permiso o un httpError
   */

  async authenticate(request: Request): Promise<UserProfile | undefined> {

   let token=parseBearerToken(request);
   if(token){
    let idRol=this.serviceSecurity.getRolFromToken(token);
    let idMenu:string =this.metadata.options![0];
    let action:string =this.metadata.options![1];

    let permission= await this.repositoryRoleMenu.findOne({
      where:{
        roleId:idRol,
        menuId:idMenu,
      }


    });
   let continuar: boolean =false;
    if(permission){

      switch(action){
        case "save":
          continuar = permission.save;
          break;
          case "edit":
            continuar = permission.edit;
            break;
            case "list":
              continuar = permission.list;
              break;
              case "delete":
                continuar = permission.delete;
                break;
                case "download":
                continuar = permission.download;
                break;
      default :
      throw new HttpErrors[401]("it is not possible to execute the action because it does not exist");



      }
      if (continuar){
        let profile: UserProfile=Object.assign({

          allowed:"Ok"
        });
        return profile;
      }else{

        return undefined;
      }

    }else{
     throw new HttpErrors[401]("it is not possible to execute the action due to lack of permissions");

    }


   }
   throw new HttpErrors[401]("it is not possible to execute the action due to lack of a token");


  }
}

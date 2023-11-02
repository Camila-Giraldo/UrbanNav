/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  AuthenticationBindings,
  AuthenticationMetadata,
  AuthenticationStrategy,
} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {AuthService, SecurityUserService} from '../services';

export class AuthStrategy implements AuthenticationStrategy {
  name: string = 'auth';

  constructor(
    @service(SecurityUserService)
    private serviceSecurity: SecurityUserService,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata[],
    @service(AuthService)
    private serviceAuth: AuthService,
  ) {}

  /**
   * Autenticación de un usuario frente a una acción en la base de datos
   * @param request la solicitud con el token
   * @returns el perfil de usuario, undefined cuando no tiene permiso o un httpError
   */

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    let token = parseBearerToken(request);
    if (token) {
      let idRol = this.serviceSecurity.getRolFromToken(token);
      let idMenu: string = this.metadata[0].options![0];
      let action: string = this.metadata[0].options![1];

      try {
        let res = await this.serviceAuth.VerifyPermissionOfUserByRole(
          idRol,
          idMenu,
          action,
        );
        return res;
      } catch (e) {
        throw e;
      }
    }
    throw new HttpErrors[401](
      'it is not possible to execute the action due to lack of a token',
    );
  }
}

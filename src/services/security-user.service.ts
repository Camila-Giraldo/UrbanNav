import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {SecuritySpecs} from '../config/security.config';
import {AuthenticationFactor, Credentials, DataPqrs, User} from '../models';
import {LoginRepository, UserRepository} from '../repositories';
const generator = require('generate-password');
const MD5 = require('crypto-js/md5');
const jwt = require('jsonwebtoken');

@injectable({scope: BindingScope.TRANSIENT})
export class SecurityUserService {
  constructor(
    @repository(UserRepository)
    public repositoryUser: UserRepository,
    @repository(LoginRepository)
    public repositoryLogin: LoginRepository,
  ) {}

  /**
   * Crear una clave aleatoria
   * @returns text aleatoria de n caracteres
   */
  createRandomText(n: number): string {
    let clave = generator.generate({
      length: n,
      numbers: true,
    });
    return clave;
  }

  /**
   *  cifrar una cadena con el algoritmo MD5
   * @param text texto a cifrar
   * @returns Cadena cifrada con MD5
   */

  encryptText(text: string): string {
    let encryptedText = MD5(text).toString();
    return encryptedText;
  }

  /**
   * Se busca un usuario con las credenciales dadas
   * @param credentials credenciales de usuario
   * @returns usuario si las credenciales son correctas, null de lo contrario
   */
  async identifyUser(credentials: Credentials): Promise<User | null> {
    let user = await this.repositoryUser.findOne({
      where: {
        email: credentials.email,
        password: credentials.password,
      },
    });
    return user;
  }

  /**
   * valida un codigo 2fa para un usuario
   * @param credential2fa credenciales de usuario con el codigo 2fa
   * @returns el registro de login si el codigo 2fa es correcto, null de lo contrario
   */
  async verifyCode2fa(
    credential2fa: AuthenticationFactor,
  ): Promise<User | null> {
    let login = await this.repositoryLogin.findOne({
      where: {
        userId: credential2fa.userId,
        code2Fa: credential2fa.code2Fa,
        codeStatus: false,
      },
    });
    if (login) {
      let user = await this.repositoryUser.findById(login.userId);
      return user;
    }
    return null;
  }

  /**
   * generacion de jwt
   * @param user información del usuario
   * @returns token
   */
  createToken(user: User): string {
    let data = {
      name: `${user.name} ${user.lastname}`,
      role: user.roleId,
      email: user.email,
    };
    let token = jwt.sign(data, SecuritySpecs.keyJWT);
    return token;
  }
  /**
   * Valida y obtiene el rol de un token
   * @param tk el token
   * @returns el _id del rol
   */
  getRolFromToken(tk: string): string {
    let obj = jwt.verify(tk, SecuritySpecs.keyJWT);
    return obj.role;
  }

  /**
   * Valida que el usuario exista para el envío de pqrs
   */
  async validateUser(data: DataPqrs): Promise <User | null>{
    let user = await this.repositoryUser.findOne({
      where: {
        email: data.email
      }
    });
    return user;
  }
}

import {/* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Credentials, User} from '../models';
import {UserRepository} from '../repositories';
const generator = require('generate-password');
const MD5 = require('crypto-js/md5');

@injectable({scope: BindingScope.TRANSIENT})
export class SegurityUserService {
  constructor(
    @repository(UserRepository)
    public repositoryUser: UserRepository,
  ) {}

  /**
   * Crear una clave aleatoria
   * @returns cadena aleatoria de n caracteres
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
   * @param cadena texto a cifrar
   * @returns cadena cifrada con MD5
   */

  cifrarTexto(cadena: string): string {
    let cadenaCifrada = MD5(cadena).toString();
    return cadenaCifrada;
  }

  /**
   * Se busca un usuario con las credenciales dadas
   * @param credentials credenciales de usuario
   * @returns usuario si las credenciales son correctas, null de lo contrario
   */
  async identificarUsuario(credentials: Credentials): Promise<User | null> {
    let user = await this.repositoryUser.findOne({
      where: {
        email: credentials.email,
        password: credentials.password,
      },
    });
    return user as User;
  }
}

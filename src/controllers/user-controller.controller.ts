import {authenticate} from '@loopback/authentication';
import {service} from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {AuthenticationFactor, Credentials, Login, User} from '../models';
import {LoginRepository, UserRepository} from '../repositories';
import {SecurityUserService} from '../services';

export class UserControllerController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @service(SecurityUserService)
    public servicioSeguridad: SecurityUserService,
    @repository(LoginRepository)
    public repositoryLogin: LoginRepository,
  ) {}

  @post('/user')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['_id'],
          }),
        },
      },
    })
    user: Omit<User, '_id'>,
  ): Promise<User> {
    let clave = this.servicioSeguridad.createRandomText(10);
    let claveCifrada = this.servicioSeguridad.cifrarTexto(clave);
    user.password = claveCifrada;
    //Send Email
    return this.userRepository.create(user);
  }

  @get('/user/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @authenticate('auth')
  @get('/user')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @patch('/user')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @get('/user/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  @patch('/user/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @put('/user/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  @del('/user/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  /**
   * Métodos personalizados para la Api
   */

  @post('/identificar-user')
  @response(200, {
    description: 'Identificar un user por correo y clave',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async identifyuser(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Credentials),
        },
      },
    })
    credentials: Credentials,
  ): Promise<object> {
    let user = await this.servicioSeguridad.identifyUser(credentials);
    if (user) {
      let code2fa = this.servicioSeguridad.createRandomText(5);
      let login: Login = new Login();
      login.userId = user._id!;
      login.code2Fa = code2fa;
      login.codeStatus = false;
      login.token = '';
      login.tokenStatus = false;
      this.repositoryLogin.create(login);
      user.password = '';
      //notificar por correo o sms
      return user;
    }
    return new HttpErrors[401]('Las credentials no son correctas');
  }

  @post('/verificar-2Fa')
  @response(200, {
    description: 'Validar un código de 2Fa',
  })
  async validarCodigo2Fa(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthenticationFactor),
        },
      },
    })
    credentials: AuthenticationFactor,
  ): Promise<object> {
    const user = await this.servicioSeguridad.verifyCode2fa(credentials);
    if (user) {
      const token = this.servicioSeguridad.createToken(user);
      if (user) {
        user.password = '';
        try {
          await this.userRepository.logins(user._id).patch(
            {
              codeStatus: true,
              token: token,
            },
            {
              codeStatus: false,
            },
          );
        } catch {
          console.log(
            'No se ha almacenado el cambio del estado de token en la base de datos',
          );
        }
        return {
          user: user,
          token: token,
        };
      }
    }
    return new HttpErrors[401]('Código de 2FA inválido para el user');
  }
}

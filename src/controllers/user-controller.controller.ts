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
import {SegurityUserService} from '../services';

export class UserControllerController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @service(SegurityUserService)
    public servicioSeguridad: SegurityUserService,
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

  @post('/identificar-usuario')
  @response(200, {
    description: 'Identificar un usuario por correo y clave',
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
      //notificar por correo o sms
      return user;
    }
    return new HttpErrors[401]('Las credenciales no son correctas');
  }

  @post('/verificar-2fa')
  @response(200, {
    description: 'Validar un código de 2FA',
  })
  async verifyCode2fa(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthenticationFactor),
        },
      },
    })
    credentials: AuthenticationFactor,
  ): Promise<object> {
    let user = await this.servicioSeguridad.verifyCode2fa(credentials);
    if (user) {
      let token = this.servicioSeguridad.createToken(user);
      if (user) {
        user.password = '';
        return {
          user: user,
          token: token,
        };
      }
    }
    return new HttpErrors[401]('Código 2FA no válido');
  }
}

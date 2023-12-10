/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prefer-const */
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
import {UserProfile} from '@loopback/security';
import {ConfigNotifications} from '../config/notifications.config';
import {SecuritySpecs} from '../config/security.config';
import {
  AuthenticationFactor,
  Credentials,
  CredentialsChangePassword,
  CredentialsGetPassword,
  Login,
  PermissionRoleMenu,
  User,
  ValidationHashUser,
} from '../models';
import {LoginRepository, UserRepository} from '../repositories';
import {
  AuthService,
  NotificationsService,
  SecurityUserService,
} from '../services';

export class UserController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @service(SecurityUserService)
    public securityService: SecurityUserService,
    @repository(LoginRepository)
    public repositoryLogin: LoginRepository,
    @service(AuthService)
    private serviceAuth: AuthService,
    @service(NotificationsService)
    public serviceNotifications: NotificationsService,
  ) {}

  /*@authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuAdminId, SecuritySpecs.saveAction],
  })*/
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
    let password = user.password;
    let encryptedPassword = this.securityService.encryptText(password);
    user.password = encryptedPassword;
    user.validationStatus = true;
    //Send Email
    let data = {
      destinationEmail: user.email,
      destinationName: `${user.name} ${user.lastname}`,
      emailSubject: ConfigNotifications.subjectPost,
      emailContent: `Welcome ${user.name}, you are now part of the UrbanNav family, CONGRATULATIONS!!!`,
    };
    let url = ConfigNotifications.urlEmail;
    this.serviceNotifications.SendNotification(data, url);
    return this.userRepository.create(user);
  }

  @post('/public-user')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async createPublicUser(
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
    let dataUser: any = {};
    let role: string = 'Passenger';
    let password = user.password;
    let encryptedPassword = this.securityService.encryptText(password);
    user.password = encryptedPassword;

    if (role === 'passenger') {
      role = 'passenger';
      user.roleId = SecuritySpecs.rolePassengerId!;
    } else {
      role = 'driver';
      user.roleId = SecuritySpecs.roleDriverId!;
    }

    // //role validation
    // let role = user.roleId;
    // if (role === 'driver') {
    //   user.roleId = SecuritySpecs.roleDriverId!;
    // } else {
    //   user.roleId = SecuritySpecs.rolePassengerId!;
    // }

    //hash validation
    let hash = this.securityService.createRandomText(100);
    user.validationHash = hash;
    user.validationStatus = false;
    user.accepted = false;

    //Send Email hash validation
    let link = `<a href="${ConfigNotifications.emailValidation}/${hash}" target='_blank'>Validate</a>`;
    let data = {
      destinationEmail: user.email,
      destinationName: `${user.name} ${user.lastname}`,
      emailSubject: ConfigNotifications.subjectValidation,
      emailContent: `Hello ${user.name}, please visit this link for validate your account: ${link}`,
    };
    let url = ConfigNotifications.urlEmail;
    this.serviceNotifications.SendNotification(data, url);

    const newUser = await this.userRepository.create(user);

    const urlPost = SecuritySpecs.urlPost;

    if (user.roleId === SecuritySpecs.roleDriverId) {
      urlPost.concat('driver');
      dataUser = {
        idDriver: `${newUser._id}`,
        name: user.name,
        lastName: user.lastname,
        phoneNumber: user.phoneNumber,
        email: user.email,
        password: user.password,
        photo: user.photo,
        gender: user.gender,
        drivingLicense: user.drivingLicense,
        status: user.status,
        carId: user.carId,
      };
    } else if (user.roleId === SecuritySpecs.rolePassengerId) {
      urlPost.concat('passenger');
      dataUser = {
        idPassenger: `${newUser._id}`,
        name: user.name,
        lastName: user.lastname,
        phoneNumber: user.phoneNumber,
        email: user.email,
        password: user.password,
        photo: user.photo,
        gender: user.gender,
        emergencyContact: user.emergencyContact,
      };
    }

    //Send to business microservice
    await this.securityService.dataUser(dataUser, urlPost);

    return newUser;
  }

  @post('/validate-hash-user')
  @response(200, {
    description: 'Validate hash user',
  })
  async validateHashUser(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ValidationHashUser, {}),
        },
      },
    })
    hash: ValidationHashUser,
  ): Promise<boolean> {
    let user = await this.userRepository.findOne({
      where: {
        validationHash: hash.hashCode,
        validationStatus: false,
      },
    });
    if (user) {
      user.validationStatus = true;
      this.userRepository.updateById(user._id, user);
      return true;
    }
    return false;
  }

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuAdminId, SecuritySpecs.listAction],
  })
  @get('/user/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuAdminId, SecuritySpecs.listAction],
  })
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

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuAdminId, SecuritySpecs.editAction],
  })
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

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuAdminId, SecuritySpecs.listAction],
  })
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

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuAdminId, SecuritySpecs.editAction],
  })
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

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuAdminId, SecuritySpecs.editAction],
  })
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

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuAdminId, SecuritySpecs.deleteAction],
  })
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

  @post('/identify-user')
  @response(200, {
    description: 'Identify an user with his credentials',
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
    let user = await this.securityService.identifyUser(credentials);
    if (user) {
      let code2fa = this.securityService.createRandomText(5);
      let login: Login = new Login();
      login.userId = user._id!;
      login.code2Fa = code2fa;
      login.codeStatus = false;
      login.token = '';
      login.tokenStatus = false;
      this.repositoryLogin.create(login);
      user.password = '';
      //Send notification using email or sms
      let data = {
        destinationEmail: user.email,
        destinationName: `${user.name} ${user.lastname}`,
        emailSubject: ConfigNotifications.subject2fa,
        emailContent: `Your second factor authentication code is: ${code2fa} please don't share this code with anyone.`,
      };
      let url = ConfigNotifications.urlEmail;
      this.serviceNotifications.SendNotification(data, url);
      return user;
    }
    return new HttpErrors[401]('Las credentials no son correctas');
  }

  @post('/get-new-password')
  @response(200, {
    description: 'Identificar un user por correo y password',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async getUserPassword(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CredentialsGetPassword),
        },
      },
    })
    credentials: CredentialsGetPassword,
  ): Promise<object> {
    let user = await this.userRepository.findOne({
      where: {
        email: credentials.email,
      },
    });
    if (user) {
      let newPassword = this.securityService.createRandomText(10);
      console.log(newPassword);
      let hiddenPassword = this.securityService.encryptText(newPassword);
      user.password = hiddenPassword;
      this.userRepository.updateById(user._id, user);
      //Send notification using email or sms
      let data = {
        destinationNumber: user.phoneNumber,
        messageContent: `Hello ${user.name} ${user.lastname}, your new password is: ${newPassword} please don't share with anyone. When start session please change your password.`,
      };
      let url = ConfigNotifications.urlSMS;
      this.serviceNotifications.SendNotification(data, url);
      return user;
    }
    return new HttpErrors[401]('It was not posible to find the user');
  }

  @post('/validate-permission')
  @response(200, {
    description: 'Validación de permisos de un user para lógica de negocio',
    content: {
      'application/json': {schema: getModelSchemaRef(PermissionRoleMenu)},
    },
  })
  async ValidatePermissionOfUser(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(PermissionRoleMenu),
        },
      },
    })
    data: PermissionRoleMenu,
  ): Promise<UserProfile | undefined> {
    let idRole = this.securityService.getRolFromToken(data.token);
    console.log(idRole);
    console.log(data);

    return await this.serviceAuth.VerifyPermissionOfUserByRole(
      idRole,
      data.idMenu,
      data.action,
    );
  }

  @post('/verify-2Fa')
  @response(200, {
    description: 'Validar un código de 2Fa',
  })
  async verify2FaCode(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthenticationFactor),
        },
      },
    })
    credentials: AuthenticationFactor,
  ): Promise<object> {
    const user = await this.securityService.verifyCode2fa(credentials);
    if (user) {
      let token = this.securityService.createToken(user);
      let menu = [];
      if (user) {
        user.password = '';
        try {
          await this.userRepository.logins(user._id).patch(
            {
              codeStatus: true,
              token: token,
              tokenStatus: true,
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

        menu = await this.securityService.getPermissionsFromMenuByUser(
          user.roleId!,
        );

        // Send sms with started session
        let data = {
          destinationNumber: user.phoneNumber,
          messageContent: `Hello ${user.name} ${user.lastname}, you have started a session in UrbanNav.`,
        };
        let url = ConfigNotifications.urlSMS;
        this.serviceNotifications.SendNotification(data, url);

        return {
          user: user,
          token: token,
          menu: menu,
        };
      }
    }
    return new HttpErrors[401]('Código de 2FA inválido para el user');
  }

  //change password
  @post('/change-password')
  @response(200, {
    description: 'Change the user password',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async changePassword(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(CredentialsChangePassword),
        },
      },
    })
    credentials: CredentialsChangePassword,
  ): Promise<object> {
    let user = await this.userRepository.findOne({
      where: {
        password: credentials.currentPassword,
      },
    });
    if (user) {
      let newPassword = credentials.newPassword;
      let repeatNewPassword = credentials.repeatNewPassword;
      if (newPassword === repeatNewPassword) {
        let hiddenPassword = this.securityService.encryptText(newPassword);
        user.password = hiddenPassword;
        this.userRepository.updateById(user._id, user);
        user.password = '';
        //Send notification using email or sms
        let data = {
          destinationEmail: user.email,
          destinationName: `${user.name} ${user.lastname}`,
          emailSubject: ConfigNotifications.subjectPost,
          emailContent: `Hello ${user.name} ${user.lastname}, your password has been changed successfully.`,
        };
        let url = ConfigNotifications.urlEmail;
        this.serviceNotifications.SendNotification(data, url);
        return user;
      } else {
        return new HttpErrors[401]('The passwords do not match');
      }
    }
    return new HttpErrors[401]('It was not posible to change the password');
  }
}

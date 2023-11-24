import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import {DataPqrs, Pqrs} from '../models';
import {PqrsRepository, UserRepository} from '../repositories';
import {service} from '@loopback/core';
import {NotificationsService, SecurityUserService} from '../services';
import {SecuritySpecs} from '../config/security.config';
import {ConfigNotifications} from '../config/notifications.config';

export class PqrsController {
  constructor(
    @repository(PqrsRepository)
    public pqrsRepository : PqrsRepository,
    @repository(UserRepository)
    public userRepository : UserRepository,
    @service(NotificationsService)
    public serviceNotifications : NotificationsService,
    @service(SecurityUserService)
    public securityService: SecurityUserService,
  ) {}

  @post('/pqrs')
  @response(200, {
    description: 'Pqrs model instance',
    content: {'application/json': {schema: getModelSchemaRef(Pqrs)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pqrs, {
            title: 'NewPqrs',
            exclude: ['_id'],
          }),
        },
      },
    })
    pqrs: Omit<Pqrs, '_id'>,
  ): Promise<Pqrs> {
    return this.pqrsRepository.create(pqrs);
  }

  @get('/pqrs/count')
  @response(200, {
    description: 'Pqrs model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Pqrs) where?: Where<Pqrs>,
  ): Promise<Count> {
    return this.pqrsRepository.count(where);
  }

  @get('/pqrs')
  @response(200, {
    description: 'Array of Pqrs model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Pqrs, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Pqrs) filter?: Filter<Pqrs>,
  ): Promise<Pqrs[]> {
    return this.pqrsRepository.find(filter);
  }

  @patch('/pqrs')
  @response(200, {
    description: 'Pqrs PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pqrs, {partial: true}),
        },
      },
    })
    pqrs: Pqrs,
    @param.where(Pqrs) where?: Where<Pqrs>,
  ): Promise<Count> {
    return this.pqrsRepository.updateAll(pqrs, where);
  }

  @get('/pqrs/{id}')
  @response(200, {
    description: 'Pqrs model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Pqrs, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Pqrs, {exclude: 'where'}) filter?: FilterExcludingWhere<Pqrs>
  ): Promise<Pqrs> {
    return this.pqrsRepository.findById(id, filter);
  }

  @patch('/pqrs/{id}')
  @response(204, {
    description: 'Pqrs PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Pqrs, {partial: true}),
        },
      },
    })
    pqrs: Pqrs,
  ): Promise<void> {
    await this.pqrsRepository.updateById(id, pqrs);
  }

  @put('/pqrs/{id}')
  @response(204, {
    description: 'Pqrs PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() pqrs: Pqrs,
  ): Promise<void> {
    await this.pqrsRepository.replaceById(id, pqrs);
  }

  @del('/pqrs/{id}')
  @response(204, {
    description: 'Pqrs DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.pqrsRepository.deleteById(id);
  }


  /***Personalizated methods from api */

  @post('/new-pqrs')
  @response(200, {
    description: 'Save and notify new pqrs',
    content: {'application/json': {schema: getModelSchemaRef(Pqrs)}},
  })
  async newPqrs(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(DataPqrs),
        },
      },
    })
    data: DataPqrs,
  ): Promise<object> {
    let user = await this.securityService.validateUser(data);
    if(user){
      //Send notifications to admins and user
      let admins = await this.userRepository.find({
        where: {roleId: SecuritySpecs.roleAdminId}
      });
      if(admins){
        admins.forEach(admin => {
          let dataAdmin = {
            destinationEmail: admin.email,
            destinationName: `${admin.name} ${admin.lastname}`,
            emailSubject: ConfigNotifications.subjectPqrs,
            emailContent: `The user ${user?.name} ${user?.lastname} has created a new PQRS: "${data.message}", please solve it as soon as possible`,
          }
          let url = ConfigNotifications.urlEmail;
          this.serviceNotifications.SendNotification(dataAdmin, url);
        });
      }
      let dataUser = {
        destinationEmail: user.email,
        destinationName: `${user.name} ${user.lastname}`,
        emailSubject: ConfigNotifications.subjectPqrsUser,
        emailContent: `Your PQRS has been created, please wait for the response`,
      }
      let url = ConfigNotifications.urlEmail;
      this.serviceNotifications.SendNotification(dataUser, url);
      return this.pqrsRepository.create(data);
    }
    return new HttpErrors[401]('You are not a part of UrbanNav system');
  }
}

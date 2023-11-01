import {authenticate} from '@loopback/authentication';
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
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {SecuritySpecs} from '../config/security.config';
import {RoleMenu} from '../models';
import {RoleMenuRepository} from '../repositories';

export class RoleMenuControllerController {
  constructor(
    @repository(RoleMenuRepository)
    public roleMenuRepository: RoleMenuRepository,
  ) {}

  @post('/role-menu')
  @response(200, {
    description: 'RoleMenu model instance',
    content: {'application/json': {schema: getModelSchemaRef(RoleMenu)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RoleMenu, {
            title: 'NewRoleMenu',
            exclude: ['_id'],
          }),
        },
      },
    })
    roleMenu: Omit<RoleMenu, '_id'>,
  ): Promise<RoleMenu> {
    return this.roleMenuRepository.create(roleMenu);
  }

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuMenuRoleId, SecuritySpecs.listAction],
  })
  @get('/role-menu/count')
  @response(200, {
    description: 'RoleMenu model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(RoleMenu) where?: Where<RoleMenu>): Promise<Count> {
    return this.roleMenuRepository.count(where);
  }

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuMenuRoleId, SecuritySpecs.listAction],
  })
  @get('/role-menu')
  @response(200, {
    description: 'Array of RoleMenu model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(RoleMenu, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(RoleMenu) filter?: Filter<RoleMenu>,
  ): Promise<RoleMenu[]> {
    return this.roleMenuRepository.find(filter);
  }

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuMenuRoleId, SecuritySpecs.editAction],
  })
  @patch('/role-menu')
  @response(200, {
    description: 'RoleMenu PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RoleMenu, {partial: true}),
        },
      },
    })
    roleMenu: RoleMenu,
    @param.where(RoleMenu) where?: Where<RoleMenu>,
  ): Promise<Count> {
    return this.roleMenuRepository.updateAll(roleMenu, where);
  }

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuMenuRoleId, SecuritySpecs.listAction],
  })
  @get('/role-menu/{id}')
  @response(200, {
    description: 'RoleMenu model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(RoleMenu, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(RoleMenu, {exclude: 'where'})
    filter?: FilterExcludingWhere<RoleMenu>,
  ): Promise<RoleMenu> {
    return this.roleMenuRepository.findById(id, filter);
  }

  @patch('/role-menu/{id}')
  @response(204, {
    description: 'RoleMenu PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(RoleMenu, {partial: true}),
        },
      },
    })
    roleMenu: RoleMenu,
  ): Promise<void> {
    await this.roleMenuRepository.updateById(id, roleMenu);
  }

  @put('/role-menu/{id}')
  @response(204, {
    description: 'RoleMenu PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() roleMenu: RoleMenu,
  ): Promise<void> {
    await this.roleMenuRepository.replaceById(id, roleMenu);
  }

  @authenticate({
    strategy: 'auth',
    options: [SecuritySpecs.menuMenuRoleId, SecuritySpecs.deleteAction],
  })
  @del('/role-menu/{id}')
  @response(204, {
    description: 'RoleMenu DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.roleMenuRepository.deleteById(id);
  }
}

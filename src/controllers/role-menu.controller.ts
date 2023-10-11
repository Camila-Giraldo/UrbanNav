import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
  import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
Role,
Menu,
} from '../models';
import {RoleRepository} from '../repositories';
import {SecuritySpecs} from '../config/security.config';
import {authenticate} from '@loopback/authentication';

export class RoleMenuController {
  constructor(
    @repository(RoleRepository) protected roleRepository: RoleRepository,
  ) { }



  @authenticate({strategy:'auth',
  options:[SecuritySpecs.menuMenuRoleId,SecuritySpecs.listAction]
}
)

  @get('/roles/{id}/menus', {
    responses: {
      '200': {
        description: 'Array of Role has many Menu through RoleMenu',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Menu)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<Menu>,
  ): Promise<Menu[]> {
    return this.roleRepository.menus(id).find(filter);
  }

  @post('/roles/{id}/menus', {
    responses: {
      '200': {
        description: 'create a Menu model instance',
        content: {'application/json': {schema: getModelSchemaRef(Menu)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof Role.prototype._id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Menu, {
            title: 'NewMenuInRole',
            exclude: ['_id'],
          }),
        },
      },
    }) menu: Omit<Menu, '_id'>,
  ): Promise<Menu> {
    return this.roleRepository.menus(id).create(menu);
  }

  @authenticate({strategy:'auth',
  options:[SecuritySpecs.menuMenuRoleId,SecuritySpecs.editAction]
}
)


  @patch('/roles/{id}/menus', {
    responses: {
      '200': {
        description: 'Role.Menu PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Menu, {partial: true}),
        },
      },
    })
    menu: Partial<Menu>,
    @param.query.object('where', getWhereSchemaFor(Menu)) where?: Where<Menu>,
  ): Promise<Count> {
    return this.roleRepository.menus(id).patch(menu, where);
  }

  @authenticate({strategy:'auth',
  options:[SecuritySpecs.menuMenuRoleId,SecuritySpecs.eliminateAction]
}
)


  @del('/roles/{id}/menus', {
    responses: {
      '200': {
        description: 'Role.Menu DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(Menu)) where?: Where<Menu>,
  ): Promise<Count> {
    return this.roleRepository.menus(id).delete(where);
  }
}

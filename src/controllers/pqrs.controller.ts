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
} from '@loopback/rest';
import {Pqrs} from '../models';
import {PqrsRepository} from '../repositories';

export class PqrsController {
  constructor(
    @repository(PqrsRepository)
    public pqrsRepository : PqrsRepository,
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
}

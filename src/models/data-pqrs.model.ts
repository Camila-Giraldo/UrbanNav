import {Model, model, property} from '@loopback/repository';

@model()
export class DataPqrs extends Model {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  type: string;

  @property({
    type: 'string',
    required: true,
  })
  message: string;


  constructor(data?: Partial<DataPqrs>) {
    super(data);
  }
}

export interface DataPqrsRelations {
  // describe navigational properties here
}

export type DataPqrsWithRelations = DataPqrs & DataPqrsRelations;

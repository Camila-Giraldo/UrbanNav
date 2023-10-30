import {Model, model, property} from '@loopback/repository';

@model()
export class Pqrs extends Model {
  
  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: true,
  })
  fullName: string;

  @property({
    type: 'string',
    required: true,
  })
  lastName: string;

  @property({
    type: 'date',
    required: true,
  })
  date: string;

  @property({
    type: 'string',
    required: true,
  })
  reason: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;


  constructor(data?: Partial<Pqrs>) {
    super(data);
  }
}

export interface PqrsRelations {
  // describe navigational properties here
}

export type PqrsWithRelations = Pqrs & PqrsRelations;

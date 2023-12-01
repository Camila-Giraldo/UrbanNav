import {Model, model, property} from '@loopback/repository';

@model()
export class ValidationHashUser extends Model {
  @property({
    type: 'string',
    required: true,
  })
  hashCode: string;


  constructor(data?: Partial<ValidationHashUser>) {
    super(data);
  }
}

export interface ValidationHashUserRelations {
  // describe navigational properties here
}

export type ValidationHashUserWithRelations = ValidationHashUser & ValidationHashUserRelations;

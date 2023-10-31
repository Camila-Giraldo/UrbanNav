import {Model, model, property} from '@loopback/repository';

@model()
export class CredentialsGetPassword extends Model {
  @property({
    type: 'string',
    required: true,
  })
  email: string;


  constructor(data?: Partial<CredentialsGetPassword>) {
    super(data);
  }
}

export interface CredentialsGetPasswordRelations {
  // describe navigational properties here
}

export type CredentialsGetPasswordWithRelations = CredentialsGetPassword & CredentialsGetPasswordRelations;

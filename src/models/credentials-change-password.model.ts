import {Model, model, property} from '@loopback/repository';

@model()
export class CredentialsChangePassword extends Model {
  @property({
    type: 'string',
    required: true,
  })
  currentPassword: string;

  @property({
    type: 'string',
    required: true,
  })
  newPassword: string;

  @property({
    type: 'string',
    required: true,
  })
  repeatNewPassword: string;


  constructor(data?: Partial<CredentialsChangePassword>) {
    super(data);
  }
}

export interface CredentialsChangePasswordRelations {
  // describe navigational properties here
}

export type CredentialsChangePasswordWithRelations = CredentialsChangePassword & CredentialsChangePasswordRelations;

export namespace SecuritySpecs {
  export const keyJWT = process.env.SECRET_PASSWORD_JWT;
  export const menuRolId = '65256c9d9d738d049ca64a37';
  export const menuLoginId = '6526ae8903fd5690809a65a3';
  export const menuMenuId = '6527f1d34f4c5935200c598d';
  export const menuMenuRoleId = '652717551ccf0f31603c63a6';

  export const listAction = 'list';
  export const saveAction = 'save';
  export const editAction = 'edit';
  export const deleteAction = 'delete';
  export const downloadAction = 'download';
  export const mongodbConnectionString = process.env.CONNECTION_STRING_MONGODB;
}

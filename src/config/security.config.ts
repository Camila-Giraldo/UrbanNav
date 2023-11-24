export namespace SecuritySpecs {
  export const keyJWT = process.env.SECRET_PASSWORD_JWT;
  export const mongodbConnectionString = process.env.CONNECTION_STRING_MONGODB;

  export const menuAdminId = process.env.MENU_ADMIN_ID;
  export const menuRolId = process.env.MENU_ROL_ID;
  export const menuLoginId = process.env.MENU_LOGIN_ID;
  export const menuMenuId = process.env.MENU_MENU_ID;
  export const menuMenuRoleId = process.env.MENU_MENU_ROLE_ID;

  export const roleAdminId = process.env.ROLE_ADMIN_ID;

  export const listAction = 'list';
  export const saveAction = 'save';
  export const editAction = 'edit';
  export const deleteAction = 'delete';
  export const downloadAction = 'download';
}

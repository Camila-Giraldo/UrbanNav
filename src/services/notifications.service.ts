import {injectable, /* inject, */ BindingScope} from '@loopback/core';
const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class NotificationsService {
  constructor(/* Add @inject to inject parameters */) {}

  EnviarNotificacion(data: any, url: string){
    fetch(url,{
      method: 'post',
      body: JSON.stringify(data),
      headers: {'Content-Type':'application/json'}
    })
  }
}

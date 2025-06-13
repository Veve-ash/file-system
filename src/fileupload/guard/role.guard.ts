import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { FileuploadService } from "../fileupload.service";
import { ForbiddenRoleException } from "../exception/fileupload.exception";


@Injectable()
export class RolesGuard implements CanActivate{
constructor (private reflector:Reflector,private fileuploadService:FileuploadService){}

 async canActivate(context: ExecutionContext):Promise<boolean> {
  const roles=this.reflector.get<string[]>('roles',context.getHandler());
  console.log('roles',roles)
  const request = context.switchToHttp().getRequest();
  if(request?.user){
   const headers:Headers=request.headers;
  let user = this.fileuploadService.user(headers);
  console.log('user',user)
  
   if (!roles.includes((await user).role)) {
   throw new ForbiddenRoleException(roles.join(' or '));
  }
  return true;
  }
  return false; 
}}
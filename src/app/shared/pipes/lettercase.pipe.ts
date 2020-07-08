import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'lettercase'
})
export class LettercasePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(!value){
      return null;
    }

    if (args == 'ucfirst-nod') {
      let name = value.charAt(0).toUpperCase() + value.slice(1);
      return name;
    }

    if (args == 'utf8') {
      return decodeURIComponent(escape(value));
    }


    if(args == 'ucfirst'){
      let name = value.charAt(0).toUpperCase() + value.slice(1);
      if(name){
        return decodeURIComponent(escape(name));
      }
      return name;
    }
  }

}

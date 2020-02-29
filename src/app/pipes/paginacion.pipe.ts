import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginacion'
})
export class PaginacionPipe implements PipeTransform {

  transform(array: any[], page_size: number, page_number: number): any[] {
    if(!array.length) return []
    if(page_size == 0){
      return array
    }

    page_size = page_size || 10
    page_number = page_number || 1

    return array.slice((page_number - 1) * page_size, (page_number) * page_size)

  }

}

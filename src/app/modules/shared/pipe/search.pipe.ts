import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(inputList: any[], searchText: string): any {

    if (!searchText)
      return inputList;

    return inputList.filter(x => (JSON.stringify(x)).toLowerCase().includes(searchText.toLowerCase()));

  }

}

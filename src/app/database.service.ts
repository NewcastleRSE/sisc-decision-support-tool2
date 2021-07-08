import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private http: HttpClient) { }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  // get full data about an output area and/or lsoa
  async getData(query) {
    return await this.http.get(environment.serverless_function_url + '&' + query, { responseType: 'text',
      observe: 'response'})
      .toPromise()
      .then((response) => {
        const fullResponse = JSON.parse(response.body);
        return fullResponse;
      })
      .catch(this.handleError);
  }
}

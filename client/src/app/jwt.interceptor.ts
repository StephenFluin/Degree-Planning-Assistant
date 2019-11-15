import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConnectionService } from './connection.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private connectionService: ConnectionService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const currentUser = this.connectionService.currentUserValue;
        if (currentUser && currentUser['token']) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentUser['token']}`
                }
            });
        }

        return next.handle(request);
    }
}
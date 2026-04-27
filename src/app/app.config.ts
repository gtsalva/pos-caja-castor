import { ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NZ_I18N, es_ES } from 'ng-zorro-antd/i18n';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

import {
  BarChartOutline,
  CheckCircleOutline,
  CheckCircleFill,
  CloseOutline,
  CloseCircleOutline,
  CloseCircleFill,
  CreditCardOutline,
  DeleteOutline,
  DollarOutline,
  DownOutline,
  ExclamationCircleFill,
  InfoCircleFill,
  LoadingOutline,
  LockOutline,
  LogoutOutline,
  MailOutline,
  PlusCircleOutline,
  PlusOutline,
  SearchOutline,
  ShoppingCartOutline,
  SwapOutline,
  UnorderedListOutline,
  UpOutline,
  UserOutline,
} from '@ant-design/icons-angular/icons';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(NzMessageModule),
    provideNzIcons([
      // Outline
      BarChartOutline,
      CheckCircleOutline,
      CloseOutline,
      CloseCircleOutline,
      CreditCardOutline,
      DeleteOutline,
      DollarOutline,
      DownOutline,
      LoadingOutline,
      LockOutline,
      LogoutOutline,
      MailOutline,
      PlusCircleOutline,
      PlusOutline,
      SearchOutline,
      ShoppingCartOutline,
      SwapOutline,
      UnorderedListOutline,
      UpOutline,
      UserOutline,
      // Fill (nz-alert types + nz-form-control states)
      CheckCircleFill,
      CloseCircleFill,
      ExclamationCircleFill,
      InfoCircleFill,
    ]),
    { provide: NZ_I18N, useValue: es_ES },
    { provide: LOCALE_ID, useValue: 'en-US' },
  ],
};

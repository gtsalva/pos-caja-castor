import { ApplicationConfig, LOCALE_ID, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NZ_I18N, es_ES } from 'ng-zorro-antd/i18n';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { registerLocaleData, DATE_PIPE_DEFAULT_TIMEZONE } from '@angular/common';
import es from '@angular/common/locales/es';
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
  FilePdfOutline,
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
  FileImageOutline,
  WarningFill,
  PercentageOutline,
  MinusOutline,
  StopOutline,
  StopFill,
  FileTextOutline,
  ArrowLeftOutline,
  PhoneOutline,
  ShopOutline,
  ToolOutline,
} from '@ant-design/icons-angular/icons';

registerLocaleData(es);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(NzMessageModule, NzModalModule),
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
      FilePdfOutline,
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
      FileImageOutline,
      WarningFill,
      PercentageOutline,
      MinusOutline,
      StopOutline,
      StopFill,
      FileTextOutline,
      ArrowLeftOutline,
      PhoneOutline,
      ShopOutline,
      ToolOutline
    ]),
    { provide: NZ_I18N, useValue: es_ES },
    { provide: LOCALE_ID, useValue: 'es-GT' },
    { provide: DATE_PIPE_DEFAULT_TIMEZONE, useValue: 'America/Guatemala' },
  ],
};

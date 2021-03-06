import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/exceptions/base.exception.filter';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';
import { generateDocument } from './doc';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  // 接口版本化管理
  app.enableVersioning({
    defaultVersion: [VERSION_NEUTRAL, '1'],
    type: VersioningType.URI,
  });
  // 异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  // 统一响应体格式
  app.useGlobalInterceptors(new TransformInterceptor());
  generateDocument(app);

  await app.listen(3000);
}
bootstrap();

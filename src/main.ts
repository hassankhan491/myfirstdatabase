import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Enable CORS so your future frontend can talk to this backend
  app.enableCors();

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('E-Commerce Management Dashboard API')
    .setDescription('API for managing Amazon & Walmart multi-client e-commerce operations')
    .setVersion('1.0')
    .addBearerAuth() // Adds the "Authorize" button for JWT tokens
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger UI is available at: http://localhost:3000/api`);
}
bootstrap();
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport, } from '@nestjs/microservices';
@Module({
  imports: [
    ConfigModule,
      ClientsModule.registerAsync([
        {
          imports: [ConfigModule],
          name: 'USERS_SERVICE',
          useFactory: async (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.get<string>('TCP_USERSSERVICE_HOST'),
              port: Number(configService.get('TCP_USERSSERVICE_PORT')),
            },
          }),
          inject: [ConfigService],
        },
      {
        imports: [ConfigModule],
        name: 'CONTENTS_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('TCP_CONTENTSSERVICE_HOST'),
            port: Number(configService.get('TCP_CONTENTSSERVICE_PORT')),
          },
        }),
        inject: [ConfigService],
      },
      {
        imports: [ConfigModule],
        name: 'QUERIES_SERVICE',
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get<string>('TCP_QUERIESSERVICE_HOST'),
            port: Number(configService.get('TCP_QUERIESSERVICE_PORT')),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

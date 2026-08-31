import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport, } from '@nestjs/microservices';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ClientsModule.registerAsync([
        {
          imports: [ConfigModule],
          name: 'USERS_SERVICE',
          useFactory: async (configService: ConfigService) => ({
            transport: Transport.TCP,
            options: {
              host: configService.get<string>('TCP_HOST') || 'localhost',
              port: Number(configService.get('TCP_USERSSERVICE_PORT') || 3004),
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
            host: configService.get<string>('TCP_HOST') || 'localhost',
            port: Number(configService.get('TCP_CONTENTSSERVICE_PORT') || 3005),
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
            host: configService.get<string>('TCP_HOST') || 'localhost',
            port: Number(configService.get('TCP_QUERIESSERVICE_PORT') || 3007),
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

import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from "drizzle-orm/mysql2";
import mysql from 'mysql2/promise';
export const DRIZZLE = Symbol('DRIZZLE_CONNECTION');

@Global()
@Module({
    imports: [ConfigModule],
    providers: [{
        provide: DRIZZLE,
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => {
            const poolConnection = mysql.createPool({
                host: configService.get<string>('DATABASE_HOST'),
                port: configService.get<number>('DATABASE_PORT'),
                user: configService.get<string>('DATABASE_USER'),
                password: configService.get<string>('DATABASE_PASSWORD'),
                database: configService.get<string>('DATABASE_NAME'),
            });
            return drizzle({client: poolConnection});
        },
    },
    ],
    exports: [DRIZZLE],
})
export class DbModule { }

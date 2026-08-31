import { Module,Global } from '@nestjs/common';
import { ConfigModule, ConfigService} from '@nestjs/config';
import { DrizzleDB } from "./drizzle";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { relations } from "./relations";    
export const DRIZZLE = Symbol('DRIZZLE_CONNECTION');

@Global()
@Module({imports: [ConfigModule],
    providers: [{
        provide: DRIZZLE,
        inject: [ConfigService],
        useFactory: async (configService: ConfigService): Promise<DrizzleDB> => {
            const pool = new Pool({
                connectionString: configService.get<string>('DATABASE_URL'),
            });
            return drizzle({ client: pool, relations });
        },
    },
    ],
    exports: [DRIZZLE],})
export class DbModule {}

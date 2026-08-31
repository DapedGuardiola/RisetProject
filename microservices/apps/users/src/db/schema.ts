import { timeStamp } from "console";
import { mysqlTable, int, varchar, date, datetime } from "drizzle-orm/mysql-core";
export const users = mysqlTable('users', {
    user_id: int().primaryKey().autoincrement(),
    username: varchar({ length: 255 }).unique(),
    password: varchar({ length: 255 }).notNull(),
    nickname: varchar({ length: 255 }),
    followers_count: int(),
    trust_score: int(),
    create_time: datetime({mode:'date'}),
})
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import {relations} from "./relations";
export type DrizzleDB = NodePgDatabase<typeof relations>;
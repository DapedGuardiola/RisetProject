import { Injectable,Inject } from '@nestjs/common';
import {DRIZZLE} from '../db/db.module';
import type {DrizzleDB} from '../db/drizzle';
import { videos } from 'src/db/schema';
import { createVideoDTO } from './video.dto';
@Injectable()
export class VideoService {
    constructor(
            @Inject(DRIZZLE)
            private db:DrizzleDB
        ){}
        async findAll(offset: number = 0) {
                try {
                    return await this.db.transaction(async (tx) => {
                        return tx.query.videos.findMany({
                            limit : 2,
                            offset : offset,
                        });
                    });
                } catch (e) {
                    console.error(e);
                }
            }
            
            async findById(id:number) {
                try {
                    return await this.db.transaction(async (tx) => {
                        return tx.query.videos.findFirst({
                            where: {
                                video_id: id
                            }
                        });
                    });
                } catch (e) {
                    console.error(e);
                }
            }
        
            async create(dto:createVideoDTO){
                try {
                    const inserted = await this.db.transaction(async (tx) => {
                        return tx.insert(videos).values(dto);
                    });
                    console.log(inserted);
                } catch (e) {
                    console.error(e);
                }
            }
}

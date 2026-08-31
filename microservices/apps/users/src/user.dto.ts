export type createUserDTO = {
    username: string,
    nickname: string,
    followers_count?: number,
    trust_score: number,
    create_time: Date,
}
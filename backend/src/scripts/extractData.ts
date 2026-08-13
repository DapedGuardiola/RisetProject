import * as fs from 'fs';
import * as path from 'path';

// Input file path (place your source JSON here)

const inputFilePath = path.join(__dirname, 'rawdata/mbgtiktokcomment.json');

// Output file paths
const outputVideoIdsPath = path.join(__dirname, './rawdata/newvideo_id.json');
const outputCommentsPath = path.join(__dirname, './rawdata/newcomments.json');
const outputUsersPath = path.join(__dirname, './rawdata/newusers.json');

interface CommentData {
    video_id?: number;
    comment_id?: number;
    parent_comment_id: number;
    username?: string;
    nickname?: string;
    avatar?: string;
    user_id?: number;
    [key: string]: unknown;
}

interface UserData {
    user_id: number;
    username: string;
    nickname?: string;
}

function main(): void {
    console.log(`Attempting to read data from: ${inputFilePath}`);

    let rawData: string;
    try {
        rawData = fs.readFileSync(inputFilePath, 'utf-8');
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error(
                `Error: The file '${inputFilePath}' was not found. Please ensure it exists at the specified path.`
            );
            return;
        }
        console.error(`An unexpected error occurred while reading the file: ${err}`);
        return;
    }

    let allCommentsData: CommentData[];
    try {
        const parsed = JSON.parse(rawData);
        if (!Array.isArray(parsed)) {
            console.warn('Warning: The loaded JSON is not a list. Assuming it\'s a single object and wrapping it.');
            allCommentsData = [parsed as CommentData];
        } else {
            allCommentsData = parsed as CommentData[];
        }
    } catch (err) {
        console.error(`Error decoding JSON from '${inputFilePath}': ${err}`);
        console.error('Please ensure the file contains valid JSON data (e.g., a JSON array of objects or a single JSON object).');
        return;
    }

    // Data structures
    const uniqueVideoIds = new Set<number>();
    const uniqueNumberVideoId = new Set<number>();
    const getVideoNumberId = new Map<number, number>();
    const processedCommentKeys = new Set<string>(); // "video_id::comment_id"
    const uniqueUsersData = new Map<number, UserData>();
    const usernameToGeneratedIdMap = new Map<string, number>();
    const uniqueCommentId = new Set<number>();
    const getNewCommentId = new Map<number, number>();
    let commentIdIncrement = 0;
    let userIdCounter = 0;
    let videoIdIncrement = 0;
    const commentsToWrite: CommentData[] = [];

    for (const commentData of allCommentsData) {
        // Extract video_id for unique video IDs
        const videoId = commentData.video_id;
        if (videoId && !uniqueVideoIds.has(videoId)) {
            uniqueVideoIds.add(videoId);
            videoIdIncrement += 1;
            uniqueNumberVideoId.add(videoIdIncrement);
            getVideoNumberId.set(videoId, videoIdIncrement);
        }

        // Process comments to remove duplicates based on video_id and comment_id
        const commentId = commentData.comment_id;
        if (videoId && commentId) {
            const commentKey = `${videoId}::${commentId}`;
            if (!processedCommentKeys.has(commentKey)) {
                processedCommentKeys.add(commentKey);
                commentIdIncrement += 1;
                uniqueCommentId.add(commentIdIncrement);
                getNewCommentId.set(commentId, commentIdIncrement);
                // Extract user information and generate user_id
                const username = commentData.username;
                const nickname = commentData.nickname;

                let currentCommentUserId: number | undefined;
                let currentCommentVideoId: number | undefined;
                let parentCommentId: number | undefined;
                if (username) {
                    if (!usernameToGeneratedIdMap.has(username)) {
                        // Generate a new unique user_id for this user
                        userIdCounter += 1;
                        const generatedUserId = userIdCounter;
                        usernameToGeneratedIdMap.set(username, generatedUserId);

                        uniqueUsersData.set(generatedUserId, {
                            user_id: generatedUserId,
                            username,
                            nickname,
                        });
                    }
                    currentCommentVideoId = getVideoNumberId.get(videoId);
                    currentCommentUserId = usernameToGeneratedIdMap.get(username);
                    const currentParentCommentId = commentData.parent_comment_id;
                    if (currentParentCommentId) {
                        parentCommentId = getNewCommentId.get(currentParentCommentId);
                    } else {
                        parentCommentId = undefined;
                    }

                }

                // Create a cleaned comment object for comments.json
                const cleanComment: CommentData = { ...commentData };
                // Add the generated user_id to the comment
                if (parentCommentId) {
                    cleanComment.parent_comment_id = parentCommentId;
                }
                cleanComment.comment_id = getNewCommentId.get(commentId);

                if (currentCommentUserId !== undefined) {
                    cleanComment.user_id = currentCommentUserId;
                }
                if (currentCommentVideoId !== undefined) {
                    cleanComment.video_id = currentCommentVideoId;
                }
                // Remove 'username', 'nickname', and 'avatar'
                delete cleanComment.username;
                delete cleanComment.nickname;
                delete cleanComment.avatar;

                commentsToWrite.push(cleanComment);
            }
        }
    }

    // Prepare data for writing to output files
    const videoIdsList = Array.from(uniqueNumberVideoId);
    const usersList = Array.from(uniqueUsersData.values());

    // Ensure output directory exists
    const outputDir = path.dirname(outputVideoIdsPath);
    fs.mkdirSync(outputDir, { recursive: true });

    try {
        fs.writeFileSync(outputVideoIdsPath, JSON.stringify(videoIdsList, null, 2), 'utf-8');
        console.log(`Unique video IDs written to ${outputVideoIdsPath}`);

        fs.writeFileSync(outputCommentsPath, JSON.stringify(commentsToWrite, null, 2), 'utf-8');
        console.log(`Processed comments written to ${outputCommentsPath}`);

        fs.writeFileSync(outputUsersPath, JSON.stringify(usersList, null, 2), 'utf-8');
        console.log(`Unique users written to ${outputUsersPath}`);
    } catch (err) {
        console.error(`An unexpected error occurred while writing output files: ${err}`);
    }
}

main();
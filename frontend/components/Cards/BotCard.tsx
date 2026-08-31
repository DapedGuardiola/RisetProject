import { useAnalytics } from "../Clients/AnalyticClient"

export default function BotCard() {
    const { botComment, durations } = useAnalytics();
    return (
        <div className=" w-50 border border-white h-20 rounded rounded-2xl">
            <div className="flex flex-col">
                <div>
                    {new Date(Date.now()).toLocaleString()}
                </div>
                <div>
                    {botComment?.[0] && (
                        <h2 className="font-bold text-xl">{botComment[0].bot_comments_count} Bot Comment</h2>
                    )}
                </div>
            </div>
        </div>
    )
}
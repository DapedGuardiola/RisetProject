import { useAnalytics } from "../Clients/AnalyticClient"

export default function UserSignedUp() {
    const { userSignUp, durations } = useAnalytics();
    return (
        <div className="w-50 border border-white h-20 rounded rounded-2xl">
            <div className="flex flex-col">
                <div>
                    {new Date(Date.now()).toLocaleString()}
                </div>
                <div>
                    {userSignUp?.map((item, index) => (
                        <h2 className="font-bold text-xl" key={index}>{item.user_count} Users signed up</h2>
                    ))}
                </div>

            </div>
        </div>
    )
}
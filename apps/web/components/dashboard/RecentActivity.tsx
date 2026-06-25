import React from 'react'
import { ActivityItem } from '@/actions/activity'
import { Sparkles } from 'lucide-react'

const RecentActivity = ({ activity }: { activity: ActivityItem[] }) => {
  return (
                    <div>
                    <h2 className="text-lg font-semibold text-zinc-100 mb-4">
                        Recent Activity
                    </h2>
                    {(activity?.length ?? 0) === 0 ? (
                        <div className="glass-card rounded-xl p-8 text-center">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                                <Sparkles className="w-4 h-4 text-zinc-600" />
                            </div>
                            <p className="text-sm text-zinc-500">No recent activity</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activity?.slice(0, 8).map((activity, i) => (
                                <div
                                    key={activity.id}
                                    className="glass-card rounded-xl px-4 py-3 flex items-center gap-3"
                                >
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-zinc-300 truncate">
                                            {activity.description}
                                        </p>
                                        <p className="text-[10px] text-zinc-600 mt-0.5">
                                            {new Date(activity.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
  )
}

export default RecentActivity
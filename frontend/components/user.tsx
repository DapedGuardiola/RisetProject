"use client";

import { useEffect, useState } from "react";

type paramType = { 
  width   : string,
  sessionUser: number,
  setSessionUser : (id: number) => void,
}

type usersType = {
  user_id: number;
  username: string;
  nickname: string;
  followers_count: number;
};

export default function UserGrid({width, sessionUser, setSessionUser}:paramType) {
  const [users, setUsers] = useState<usersType[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
      const data: usersType[] = await res.json();
      console.log(data)
      setUsers(data);

      if (data.length > 0) {
        setSessionUser((data[0].user_id));
      }
    };  
    void loadUsers();
  }, []);

  if (users.length === 0) {
    return (
      <aside className={width}>
        <div className="rounded-3xl border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
            Selected session user
          </p>
          <p className="mt-2 text-lg font-semibold text-white">
            Loading users...
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className={width}>
      <div className="rounded-3xl border border-zinc-200 bg-zinc-950 p-5 text-white shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">
          Selected session user
        </p>
        <p className="mt-2 text-lg font-semibold text-white">{sessionUser}</p>
      </div>

      <div className="mt-5 space-y-4">
        {users.map((user) => {
          const active = sessionUser === (user.user_id);

          return (
            <button
              key={user.user_id}
              type="button"
              onClick={() => setSessionUser((user.user_id))}
              className={`flex w-full items-center gap-4 rounded-3xl border p-4 text-left cursor-pointer transition hover:-translate-y-0.5 ${
                active
                  ? "border-zinc-950 bg-zinc-100"
                  : "border-zinc-200 bg-white hover:border-zinc-400"
              }`}
            >
              <img
                src="https://picsum.photos/600/600"
                alt={user.username}
                className="h-16 w-16 rounded-full object-cover"
              />
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-zinc-900">
                  {user.username}
                </h2>
                <span className="text-sm text-zinc-500">@{user.nickname}</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

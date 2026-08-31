"use client";

import { useState, useEffect, useRef } from "react";
import { useContentContext } from "../Clients/ContentClients";
import { UserType } from "../Types/UserType";
import TrustScoreDonut from "./TrustScoreDonut";

const PAGE_SIZE = 10;

export default function UserSelector() {
  const { currentUser, setCurrentUser } = useContentContext();
  const [isOpen, setIsOpen] = useState(false);
  const [usersList, setUsersList] = useState<UserType[]>([]);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Fetch users when offset changes or dropdown opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `http://localhost:3006/api/users?limit=${PAGE_SIZE}&offset=${offset}`
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch users: ${res.statusText}`);
        }
        const data: UserType[] = await res.json();
        if (isMounted) {
          setUsersList(data || []);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching users:", err);
          setError(err.message || "Failed to load users");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [isOpen, offset]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectUser = (user: UserType) => {
    setCurrentUser(user);
    setIsOpen(false);
  };

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(0, prev - PAGE_SIZE));
  };

  const handleNextPage = () => {
    setOffset((prev) => prev + PAGE_SIZE);
  };

  return (
    <div ref={dropdownRef} className="absolute top-4 right-4 z-50">
      {/* Profile Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative flex items-center gap-2.5 p-1.5 pr-3.5 bg-white/90 hover:bg-white backdrop-blur-md border border-gray-200/90 shadow-md hover:shadow-lg rounded-full transition-all duration-200 cursor-pointer active:scale-95"
        title={currentUser ? `Active: ${currentUser.nickname || currentUser.username} (Trust Score: ${currentUser.trust_score ?? 0}/10)` : "Select User"}
      >
        {/* Placeholder profile avatar icon */}
        <div className="relative w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-inner overflow-hidden font-bold text-sm uppercase">
          {currentUser?.nickname ? (
            currentUser.nickname.trim().charAt(0).toUpperCase()
          ) : (
            <svg
              className="w-5 h-5 text-white/90"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
          {/* Active indicator dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-800 max-w-[90px] truncate leading-tight">
              {currentUser?.nickname || currentUser?.username || "Select User"}
            </span>
            {/* Trust Score Donut Bar */}
            {currentUser?.trust_score !== undefined && (
              <TrustScoreDonut score={currentUser.trust_score} size={22} strokeWidth={2.5} />
            )}
          </div>
          <span className="text-[10px] text-gray-500 max-w-[110px] truncate leading-tight">
            @{currentUser?.username || "guest"}
          </span>
        </div>

        {/* Dropdown Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-indigo-600" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-84 bg-white/95 backdrop-blur-xl border border-gray-200/90 shadow-2xl rounded-2xl p-3 z-50 transition-all duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-gray-100 px-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Pilih User Aktif
              </span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Page {Math.floor(offset / PAGE_SIZE) + 1}
            </span>
          </div>

          {/* User List */}
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5 scrollbar-thin scrollbar-thumb-gray-200">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2 rounded-xl animate-pulse bg-gray-50/80"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
                  <div className="flex-1 space-y-1.5">
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    <div className="w-16 h-2 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="p-3 text-center text-xs text-red-500 bg-red-50 rounded-xl">
                {error}
              </div>
            ) : usersList.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">
                Tidak ada user lagi.
              </div>
            ) : (
              usersList.map((user) => {
                const isSelected = currentUser?.user_id === user.user_id;
                return (
                  <button
                    key={user.user_id}
                    type="button"
                    onClick={() => handleSelectUser(user)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-indigo-50/90 border border-indigo-200"
                        : "hover:bg-gray-100/80 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Avatar Placeholder */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm ${
                          isSelected
                            ? "bg-indigo-600 ring-2 ring-indigo-400"
                            : "bg-gradient-to-tr from-gray-400 to-gray-600 group-hover:from-indigo-500 group-hover:to-purple-600 transition-colors"
                        }`}
                      >
                        {user.nickname
                          ? user.nickname.trim().charAt(0).toUpperCase()
                          : "U"}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p
                            className={`text-xs font-semibold truncate leading-tight ${
                              isSelected ? "text-indigo-950" : "text-gray-800"
                            }`}
                          >
                            {user.nickname || user.username}
                          </p>
                          {/* Trust Score Donut Bar right beside username */}
                          {user.trust_score !== undefined && (
                            <TrustScoreDonut score={user.trust_score} size={24} strokeWidth={3} />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 truncate leading-tight">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    {/* Right side follower count / checkmark */}
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      {user.followers_count !== undefined && (
                        <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded-md">
                          {user.followers_count} flw
                        </span>
                      )}
                      {isSelected && (
                        <svg
                          className="w-4 h-4 text-indigo-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Pagination Controls */}
          <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2 px-1">
            <button
              type="button"
              disabled={offset === 0 || isLoading}
              onClick={handlePrevPage}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer"
            >
              Prev
            </button>

            <span className="text-[11px] text-gray-400 font-mono">
              Offset: {offset}
            </span>

            <button
              type="button"
              disabled={usersList.length < PAGE_SIZE || isLoading}
              onClick={handleNextPage}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              +10 Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

import { Suspense, use, useState, useMemo } from "react";

import Button from "./UI/Button";
import Code from "./UI/Code";

/**
 * UseDemo - Demonstrates React 19's `use` hook with Suspense
 * 
 * KEY CONCEPTS:
 * 1. use: New React 19 hook for consuming promises and context
 *    - Automatically handles promise resolution
 *    - Throws promises to Suspense boundary when pending
 *    - Provides clean, declarative data fetching
 * 
 * 2. Suspense Integration: Automatic loading states
 *    - Catches promises thrown by `use` hook
 *    - Shows fallback UI while data is loading
 *    - No need for manual loading state management
 * 
 * 3. Real API Integration: Using JSONPlaceholder
 *    - Fetches real data from public API
 *    - Demonstrates error handling with try/catch
 *    - Shows how to handle different data types
 */

// Types for our API responses
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

// API functions that return promises
function fetchUsers(): Promise<User[]> {
  return fetch("https://jsonplaceholder.typicode.com/users")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
}

// Create promises outside components to avoid re-creation
const usersPromise = fetchUsers();

function fetchPosts(): Promise<Post[]> {
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
}

// Create promises outside components to avoid re-creation
const postsPromise = fetchPosts();

// Cache for user posts to avoid re-fetching
const userPostsCache = new Map<number, Promise<Post[]>>();

function getUserPostsPromise(userId: number): Promise<Post[]> {
  if (!userPostsCache.has(userId)) {
    userPostsCache.set(userId, fetchUserPosts(userId));
  }
  return userPostsCache.get(userId)!;
}

function fetchUserPosts(userId: number): Promise<Post[]> {
  return fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    });
}

// Component that uses the `use` hook
function UsersList() {
  const users = use(usersPromise);

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">Users ({users.length})</h4>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {users.slice(0, 5).map(user => (
          <div key={user.id} className="text-xs p-2 bg-gray-800 rounded">
            <div className="font-medium">{user.name}</div>
            <div className="text-gray-400">{user.email}</div>
          </div>
        ))}
        {users.length > 5 && (
          <div className="text-xs text-gray-500 text-center">
            ... and {users.length - 5} more
          </div>
        )}
      </div>
    </div>
  );
}

function PostsList() {
  const posts = use(postsPromise);
  
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">Recent Posts ({posts.length})</h4>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {posts.slice(0, 3).map(post => (
          <div key={post.id} className="text-xs p-2 bg-gray-800 rounded">
            <div className="font-medium line-clamp-1">{post.title}</div>
            <div className="text-gray-400 line-clamp-2">{post.body}</div>
          </div>
        ))}
        {posts.length > 3 && (
          <div className="text-xs text-gray-500 text-center">
            ... and {posts.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}

// Component that demonstrates conditional data fetching
function UserPosts({ userId }: { userId: number }) {
  const postsPromise = useMemo(() => getUserPostsPromise(userId), [userId]);
  const posts = use(postsPromise);
  
  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-sm">User {userId} Posts ({posts.length})</h4>
      <div className="max-h-32 overflow-y-auto space-y-1">
        {posts.slice(0, 3).map(post => (
          <div key={post.id} className="text-xs p-2 bg-gray-800 rounded">
            <div className="font-medium line-clamp-1">{post.title}</div>
            <div className="text-gray-400 line-clamp-2">{post.body}</div>
          </div>
        ))}
        {posts.length > 3 && (
          <div className="text-xs text-gray-500 text-center">
            ... and {posts.length - 3} more
          </div>
        )}
      </div>
    </div>
  );
}


// Loading component
function LoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
        <div className="space-y-2">
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}

function UseDemo() {
  const [showUserPosts, setShowUserPosts] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(1);

  return (
    <section className="space-y-4">
      <p>
        React 19 <Code>use</Code> hook with <Code>Suspense</Code> for data fetching.
        Uses real JSONPlaceholder API.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Suspense fallback={<LoadingFallback />}>
          <UsersList />
        </Suspense>
        <Suspense fallback={<LoadingFallback />}>
          <PostsList />
        </Suspense>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setShowUserPosts(prevShowUserPosts => !prevShowUserPosts)}
            className="text-xs">
            {showUserPosts ? 'Hide' : 'Show'} User Posts
          </Button>
          {showUserPosts && (
            <select 
              value={selectedUserId} 
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              className="text-xs bg-gray-800 border border-gray-600 rounded px-2 py-1">
              {[1, 2, 3, 4, 5].map(id => (
                <option key={id} value={id}>User {id}</option>
              ))}
            </select>
          )}
        </div>
        {showUserPosts && (
          <Suspense fallback={<LoadingFallback />}>
            <UserPosts userId={selectedUserId} />
          </Suspense>
        )}
      </div>
      <div className="text-xs text-gray-400 space-y-1">
        <p>• <Code>use</Code> automatically throws promises to Suspense</p>
        <p>• No manual loading states or useEffect needed</p>
        <p>• Clean, declarative data fetching</p>
        <p>• Works with any promise-returning function</p>
      </div>
    </section>
  );
}

export default UseDemo;

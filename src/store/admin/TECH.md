# 🎓 Learn Zustand + TanStack Query: From Zero to Admin System

**Transform from beginner to confident developer by building real admin functionality step by step.**

This guide teaches you the **fundamental concepts** and **practical skills** you need to master modern React state management. No assumptions - we start from the basics and build up to our production admin system.

## 🎯 What You'll Learn

By the end of this guide, you'll understand:
- **Why** we need state management and what problems it solves
- **How** Zustand works under the hood (and why it's better than alternatives)
- **What** TanStack Query does and why server state is different from client state
- **When** to use each tool and how they work together
- **How** to build production-ready admin systems with confidence

## 📚 Learning Path

1. [The State Management Problem](#the-state-management-problem)
2. [Understanding Zustand](#understanding-zustand)
3. [Understanding TanStack Query](#understanding-tanstack-query)
4. [How They Work Together](#how-they-work-together)
5. [Building Our Admin System](#building-our-admin-system)
6. [Advanced Patterns](#advanced-patterns)
7. [Common Mistakes & Solutions](#common-mistakes--solutions)

---

## 🤔 The State Management Problem

### What is State?
State is just data that can change over time. In a React app, you have different types of state:

```javascript
// Component state (useState)
const [count, setCount] = useState(0);

// Form state
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

// App-wide state
const [user, setUser] = useState(null);
const [theme, setTheme] = useState('light');

// Server state (data from API)
const [exams, setExams] = useState([]);
const [loading, setLoading] = useState(false);
```

### The Problems We Face

#### Problem 1: Prop Drilling
```javascript
// ❌ Passing data through many components
function App() {
  const [user, setUser] = useState(null);
  
  return <Dashboard user={user} setUser={setUser} />;
}

function Dashboard({ user, setUser }) {
  return <Header user={user} setUser={setUser} />;
}

function Header({ user, setUser }) {
  return <UserMenu user={user} setUser={setUser} />;
}

function UserMenu({ user, setUser }) {
  // Finally! We can use the user data
  return <div>{user?.name}</div>;
}
```

#### Problem 2: Duplicate Server Calls
```javascript
// ❌ Each component fetches the same data
function ExamsList() {
  const [exams, setExams] = useState([]);
  
  useEffect(() => {
    fetch('/api/exams').then(res => res.json()).then(setExams);
  }, []);
  
  return <div>{/* Show exams */}</div>;
}

function ExamStats() {
  const [exams, setExams] = useState([]); // Same data, different component!
  
  useEffect(() => {
    fetch('/api/exams').then(res => res.json()).then(setExams); // Duplicate call!
  }, []);
  
  return <div>Total: {exams.length}</div>;
}
```

#### Problem 3: Complex Loading & Error States
```javascript
// ❌ Managing loading/error state manually everywhere
function ExamsList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch('/api/exams')
      .then(res => {
        if (!res.ok) throw new Error('Failed');
        return res.json();
      })
      .then(data => {
        setExams(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* Show exams */}</div>;
}
```

### The Solution: Two-Tool Approach

We solve these problems with two specialized tools:

1. **Zustand** → Manages client-side state (UI state, user preferences, etc.)
2. **TanStack Query** → Manages server state (API data, caching, synchronization)

---

## 🏪 Understanding Zustand

### What Makes Zustand Special?

Zustand is a **global state container** that any component can access without prop drilling.

#### The Basic Concept
```javascript
// Create a store (like a global variable that components can watch)
import { create } from 'zustand';

const useCounterStore = create((set) => ({
  // State
  count: 0,
  
  // Actions (functions that change state)
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// Use in any component
function Counter() {
  const { count, increment, decrement } = useCounterStore();
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

function DisplayCount() {
  const count = useCounterStore((state) => state.count);
  
  return <h1>Current count: {count}</h1>;
}
```

### Key Zustand Concepts

#### 1. Stores Are Functions
```javascript
// A store is just a function that returns an object
const useStore = create((set, get) => ({
  // Initial state
  user: null,
  theme: 'light',
  
  // Actions to change state
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
  
  // Computed values
  isLoggedIn: () => get().user !== null,
}));
```

#### 2. Selective Subscriptions (Performance)
```javascript
// ✅ Only re-renders when user changes
const user = useStore((state) => state.user);

// ✅ Only re-renders when theme changes  
const theme = useStore((state) => state.theme);

// ❌ Re-renders when ANY store value changes
const { user, theme, setUser, setTheme } = useStore();
```

#### 3. Actions Change State
```javascript
const useStore = create((set) => ({
  todos: [],
  
  addTodo: (text) => set((state) => ({
    todos: [...state.todos, { id: Date.now(), text, done: false }]
  })),
  
  toggleTodo: (id) => set((state) => ({
    todos: state.todos.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  })),
}));
```

### Our Admin Store Structure

```javascript
// src/store/admin/adminStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const useAdminStore = create()(
  immer((set) => ({
    // UI State (what Zustand is perfect for)
    activeTab: 'dashboard',
    sidebarOpen: true,
    selectedExams: new Set(),
    
    // Filters (UI state that affects what data we show)
    examFilter: { status: 'all' },
    userFilter: { role: 'all' },
    
    // Loading states (UI feedback)
    loading: {
      dashboard: false,
      exams: false,
      users: false,
    },
    
    // Error states (UI feedback)
    errors: {},
    
    // Cached data (populated by TanStack Query)
    stats: null,
    exams: [],
    users: [],
    
    // Actions to change state
    setActiveTab: (tab) => set((state) => {
      state.activeTab = tab;
    }),
    
    setExamFilter: (filter) => set((state) => {
      state.examFilter = filter;
    }),
    
    toggleExamSelection: (examId) => set((state) => {
      if (state.selectedExams.has(examId)) {
        state.selectedExams.delete(examId);
      } else {
        state.selectedExams.add(examId);
      }
    }),
  }))
);
```

### Why Immer Middleware?

Immer lets you write "mutating" code that's actually immutable:

```javascript
// ❌ Without Immer (manual immutability)
setExamFilter: (filter) => set((state) => ({
  ...state,
  examFilter: { ...state.examFilter, ...filter }
}));

// ✅ With Immer (looks like mutation, but it's immutable)
setExamFilter: (filter) => set((state) => {
  state.examFilter = { ...state.examFilter, ...filter };
});
```

---

## ⚡ Understanding TanStack Query

### What is Server State?

Server state is different from client state:

```javascript
// Client state (owned by your app)
const [theme, setTheme] = useState('dark');
const [sidebarOpen, setSidebarOpen] = useState(true);

// Server state (owned by the server, you just have a copy)
const [exams, setExams] = useState([]); // This could be outdated!
const [users, setUsers] = useState([]); // When was this last fetched?
```

### Problems with Manual Server State
```javascript
// ❌ Manual server state management problems
function ExamsList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchExams = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/exams');
      const data = await response.json();
      setExams(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchExams();
  }, []);
  
  // Problems:
  // 1. What if network is slow? Loading state?
  // 2. What if it fails? Retry mechanism?
  // 3. What if data becomes stale? When to refetch?
  // 4. What if another component needs same data? Duplicate request?
  // 5. What if user navigates away and back? Fetch again or use cache?
}
```

### TanStack Query Solutions

TanStack Query solves these problems automatically:

#### 1. Basic Query (Fetching Data)
```javascript
import { useQuery } from '@tanstack/react-query';

function ExamsList() {
  const { 
    data: exams = [], 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['exams'], // Unique identifier for this data
    queryFn: () => fetch('/api/exams').then(res => res.json()), // How to fetch
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 3, // Retry failed requests 3 times
  });
  
  if (isLoading) return <div>Loading exams...</div>;
  if (error) return <div>Error: {error.message} <button onClick={refetch}>Retry</button></div>;
  
  return (
    <div>
      {exams.map(exam => (
        <div key={exam.id}>{exam.name}</div>
      ))}
    </div>
  );
}
```

#### 2. Mutations (Changing Data)
```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateExamForm() {
  const queryClient = useQueryClient();
  
  const createExamMutation = useMutation({
    mutationFn: (examData) => fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(examData),
    }).then(res => res.json()),
    
    onSuccess: () => {
      // Invalidate and refetch exams list
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
  
  const handleSubmit = (formData) => {
    createExamMutation.mutate(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button 
        type="submit" 
        disabled={createExamMutation.isPending}
      >
        {createExamMutation.isPending ? 'Creating...' : 'Create Exam'}
      </button>
      
      {createExamMutation.error && (
        <div>Error: {createExamMutation.error.message}</div>
      )}
    </form>
  );
}
```

### Key TanStack Query Concepts

#### 1. Query Keys = Cache Keys
```javascript
// These are different cache entries:
useQuery({ queryKey: ['exams'] }) // All exams
useQuery({ queryKey: ['exams', 'published'] }) // Only published exams
useQuery({ queryKey: ['exams', { status: 'draft' }] }) // Draft exams
useQuery({ queryKey: ['exam', examId] }) // Specific exam

// Query keys should be unique and descriptive
```

#### 2. Stale Time vs Cache Time
```javascript
useQuery({
  queryKey: ['exams'],
  queryFn: fetchExams,
  staleTime: 5 * 60 * 1000,  // 5 minutes: "This data is fresh"
  gcTime: 10 * 60 * 1000,    // 10 minutes: "Keep in memory this long"
});

// Timeline:
// 0min: Fetch data, data is "fresh"
// 5min: Data becomes "stale", but still shown
// 5min+: If component mounts again, refetch in background
// 10min: If no components using it, remove from memory
```

#### 3. Background Refetching
```javascript
// TanStack Query automatically refetches when:
// - Window regains focus
// - Network reconnects  
// - Component mounts and data is stale
// - You call refetch()
// - You invalidate the query

// You can control this:
useQuery({
  queryKey: ['exams'],
  queryFn: fetchExams,
  refetchOnWindowFocus: true,   // Refetch when user comes back to tab
  refetchOnReconnect: true,     // Refetch when internet comes back
  refetchInterval: 30000,       // Refetch every 30 seconds
});
```

#### 4. Query Status
```javascript
function ExamsList() {
  const { data, status, fetchStatus, error } = useQuery({
    queryKey: ['exams'],
    queryFn: fetchExams,
  });
  
  // status: 'pending' | 'error' | 'success'
  // fetchStatus: 'fetching' | 'paused' | 'idle'
  
  // Different combinations:
  if (status === 'pending') return <div>Loading for first time...</div>;
  if (status === 'error') return <div>Something went wrong: {error.message}</div>;
  
  return (
    <div>
      {fetchStatus === 'fetching' && <div>Updating...</div>}
      {data.map(exam => <div key={exam.id}>{exam.name}</div>)}
    </div>
  );
}
```

---

## 🤝 How They Work Together

### The Division of Responsibility

```javascript
// Zustand handles:
// - UI state (active tab, sidebar open/closed)
// - User interactions (selected items, form state)
// - Filters and search terms
// - Loading/error states for UI feedback

// TanStack Query handles:
// - Fetching data from server
// - Caching API responses
// - Background updates
// - Retry logic
// - Invalidation when data changes
```

### Our Integration Pattern

```javascript
// 1. TanStack Query fetches data and updates Zustand
function useAdminStatsQuery() {
  const { setStats, setError } = useAdminActions(); // Zustand actions
  
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await adminService.getAnalytics();
      const stats = transformResponseToStats(response);
      
      // Update Zustand store
      setStats(stats);
      setError('dashboard', '');
      
      return stats;
    },
    onError: (error) => {
      // Update Zustand error state
      setError('dashboard', error.message);
    },
  });
}

// 2. Components use both Zustand and TanStack Query
function AdminDashboard() {
  // Zustand: Get UI state
  const activeTab = useActiveTab();
  const loading = useAdminLoading();
  const stats = useAdminStats();
  
  // TanStack Query: Manage server state
  const statsQuery = useAdminStatsQuery({
    enabled: activeTab === 'dashboard', // Only fetch when on dashboard
  });
  
  return (
    <div>
      {loading.dashboard ? (
        <div>Loading stats...</div>
      ) : (
        <div>
          <h1>Total Users: {stats?.totalUsers}</h1>
          <h1>Total Exams: {stats?.totalExams}</h1>
        </div>
      )}
    </div>
  );
}
```

### Why This Combination Works

```javascript
// ✅ Best of both worlds
function ExamManager() {
  // Zustand: UI state (instant updates)
  const selectedExams = useSelectedExams();
  const examFilter = useExamFilter();
  const { toggleExamSelection, setExamFilter } = useAdminActions();
  
  // TanStack Query: Server state (smart caching)
  const { data: exams = [], isLoading } = useAdminExamsQuery(
    1, // page
    10, // limit
    examFilter // filter from Zustand
  );
  
  return (
    <div>
      {/* Filter controls update Zustand instantly */}
      <select 
        value={examFilter.status} 
        onChange={(e) => setExamFilter({ status: e.target.value })}
      >
        <option value="all">All Exams</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
      
      {/* Selection state managed by Zustand */}
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        exams.map(exam => (
          <div key={exam.id}>
            <input
              type="checkbox"
              checked={selectedExams.has(exam.id)}
              onChange={() => toggleExamSelection(exam.id)}
            />
            {exam.name}
          </div>
        ))
      )}
      
      {selectedExams.size > 0 && (
        <div>Selected: {selectedExams.size} exams</div>
      )}
    </div>
  );
}
```

---

## 🏗️ Building Our Admin System

Now that you understand the concepts, let's see how we built our real admin system.

### Step 1: Define the Data Types

```typescript
// src/store/admin/types.ts
export interface AdminStats {
  totalUsers: number;
  totalExams: number;
  totalQuestions: number;
  publishedExams: number;
  draftExams: number;
}

export interface ExamFilter {
  status?: 'all' | 'published' | 'draft';
  search?: string;
}
```

### Step 2: Create the Zustand Store

```typescript
// src/store/admin/adminStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface AdminStoreState {
  // Data (populated by TanStack Query)
  stats: AdminStats | null;
  exams: Exam[];
  
  // UI State
  activeTab: 'dashboard' | 'exams' | 'questions' | 'users';
  examFilter: ExamFilter;
  selectedExams: Set<string>;
  
  // Loading states
  loading: {
    dashboard: boolean;
    exams: boolean;
  };
  
  // Error states
  errors: Record<string, string>;
}

interface AdminStoreActions {
  // Data actions
  setStats: (stats: AdminStats) => void;
  setExams: (exams: Exam[]) => void;
  
  // UI actions
  setActiveTab: (tab: AdminStoreState['activeTab']) => void;
  setExamFilter: (filter: Partial<ExamFilter>) => void;
  toggleExamSelection: (examId: string) => void;
  
  // Loading actions
  setLoading: (category: keyof AdminStoreState['loading'], loading: boolean) => void;
  
  // Error actions
  setError: (category: string, error: string) => void;
}

export const useAdminStore = create<AdminStoreState & AdminStoreActions>()(
  immer((set) => ({
    // Initial state
    stats: null,
    exams: [],
    activeTab: 'dashboard',
    examFilter: { status: 'all' },
    selectedExams: new Set(),
    loading: {
      dashboard: false,
      exams: false,
    },
    errors: {},
    
    // Actions
    setStats: (stats) => set((state) => {
      state.stats = stats;
    }),
    
    setExams: (exams) => set((state) => {
      state.exams = exams;
    }),
    
    setActiveTab: (tab) => set((state) => {
      state.activeTab = tab;
    }),
    
    setExamFilter: (filter) => set((state) => {
      // Merge new filter with existing filter
      state.examFilter = { ...state.examFilter, ...filter };
    }),
    
    toggleExamSelection: (examId) => set((state) => {
      if (state.selectedExams.has(examId)) {
        state.selectedExams.delete(examId);
      } else {
        state.selectedExams.add(examId);
      }
    }),
    
    setLoading: (category, loading) => set((state) => {
      state.loading[category] = loading;
    }),
    
    setError: (category, error) => set((state) => {
      if (error) {
        state.errors[category] = error;
      } else {
        delete state.errors[category];
      }
    }),
  }))
);
```

### Step 3: Create Selector Hooks

```typescript
// src/store/admin/selectors.ts
// These let components subscribe to specific parts of the store

// Basic selectors
export const useAdminStats = () => useAdminStore((state) => state.stats);
export const useAdminExams = () => useAdminStore((state) => state.exams);
export const useActiveTab = () => useAdminStore((state) => state.activeTab);
export const useExamFilter = () => useAdminStore((state) => state.examFilter);
export const useSelectedExams = () => useAdminStore((state) => state.selectedExams);
export const useAdminLoading = () => useAdminStore((state) => state.loading);
export const useAdminErrors = () => useAdminStore((state) => state.errors);

// Action selectors
export const useAdminActions = () => useAdminStore((state) => ({
  setStats: state.setStats,
  setExams: state.setExams,
  setActiveTab: state.setActiveTab,
  setExamFilter: state.setExamFilter,
  toggleExamSelection: state.toggleExamSelection,
  setLoading: state.setLoading,
  setError: state.setError,
}));

// Computed selectors (derived state)
export const useFilteredExams = () => {
  return useAdminStore((state) => {
    const { exams, examFilter } = state;
    
    let filtered = exams;
    
    // Filter by status
    if (examFilter.status && examFilter.status !== 'all') {
      filtered = filtered.filter(exam => 
        examFilter.status === 'published' ? exam.isPublished : !exam.isPublished
      );
    }
    
    // Filter by search
    if (examFilter.search) {
      const searchLower = examFilter.search.toLowerCase();
      filtered = filtered.filter(exam => 
        exam.name.toLowerCase().includes(searchLower) ||
        exam.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  });
};
```

### Step 4: Create TanStack Query Hooks

```typescript
// src/store/admin/adminQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query for getting stats
export function useAdminStatsQuery() {
  const { setStats, setError, setLoading } = useAdminActions();
  
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      setLoading('dashboard', true);
      
      try {
        const response = await adminService.getAnalytics();
        
        const stats: AdminStats = {
          totalUsers: response.data.overview.totalUsers,
          totalExams: response.data.overview.totalExams,
          totalQuestions: response.data.overview.totalQuestions,
          publishedExams: Math.floor(response.data.overview.totalExams * 0.7),
          draftExams: Math.floor(response.data.overview.totalExams * 0.3),
        };
        
        // Update Zustand store
        setStats(stats);
        setError('dashboard', '');
        
        return stats;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load stats';
        setError('dashboard', errorMessage);
        throw error;
      } finally {
        setLoading('dashboard', false);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

// Query for getting exams
export function useAdminExamsQuery(page: number, limit: number, filter: ExamFilter) {
  const { setExams, setError, setLoading } = useAdminActions();
  
  return useQuery({
    queryKey: ['admin', 'exams', { filter, page, limit }],
    queryFn: async () => {
      setLoading('exams', true);
      
      try {
        const result = await examService.getAllExams({ 
          page, 
          limit,
          published: filter.status === 'published' ? true : 
                   filter.status === 'draft' ? false : undefined
        });
        
        const exams = result.data?.exams || [];
        
        // Update Zustand store
        setExams(exams);
        setError('exams', '');
        
        return {
          exams,
          total: result.data?.pagination?.totalItems || 0
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load exams';
        setError('exams', errorMessage);
        throw error;
      } finally {
        setLoading('exams', false);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Mutation for creating exams
export function useCreateExamMutation() {
  const queryClient = useQueryClient();
  const { setError } = useAdminActions();
  
  return useMutation({
    mutationFn: async (examData: CreateExamRequest) => {
      const exam = await examService.createExam(examData);
      return exam;
    },
    onSuccess: () => {
      // Invalidate related queries so they refetch
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      setError('exams', '');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create exam';
      setError('exams', errorMessage);
    },
  });
}
```

### Step 5: Create the Master Hook

```typescript
// src/store/admin/useAdmin.ts
export const useAdmin = () => {
  // Get state from Zustand
  const stats = useAdminStats();
  const exams = useAdminExams();
  const activeTab = useActiveTab();
  const examFilter = useExamFilter();
  const selectedExams = useSelectedExams();
  const loading = useAdminLoading();
  const errors = useAdminErrors();
  const filteredExams = useFilteredExams();
  
  // Get actions from Zustand
  const actions = useAdminActions();
  
  // Get queries from TanStack Query
  const statsQuery = useAdminStatsQuery();
  const examsQuery = useAdminExamsQuery(1, 10, examFilter);
  
  // Get mutations from TanStack Query
  const createExamMutation = useCreateExamMutation();
  
  return {
    // State
    state: {
      stats,
      exams,
      filteredExams,
      activeTab,
      examFilter,
      selectedExams,
      loading,
      errors,
    },
    
    // Queries
    queries: {
      stats: statsQuery,
      exams: examsQuery,
    },
    
    // Mutations
    mutations: {
      createExam: createExamMutation,
    },
    
    // Actions
    actions: {
      ...actions,
      // Add convenience methods
      refreshData: () => {
        statsQuery.refetch();
        examsQuery.refetch();
      },
    },
    
    // Computed values
    computed: {
      hasAnyLoading: Object.values(loading).some(Boolean),
      hasAnyError: Object.keys(errors).length > 0,
      selectedCount: selectedExams.size,
    },
  };
};
```

### Step 6: Use in Components

```typescript
// src/components/AdminDashboard.tsx
function AdminDashboard() {
  const admin = useAdmin();
  
  // The component automatically subscribes to changes
  // and re-renders when relevant data updates
  
  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {admin.state.loading.dashboard ? (
        <div>Loading dashboard...</div>
      ) : admin.state.errors.dashboard ? (
        <div>
          Error: {admin.state.errors.dashboard}
          <button onClick={() => admin.queries.stats.refetch()}>
            Retry
          </button>
        </div>
      ) : (
        <div>
          <div>Total Users: {admin.state.stats?.totalUsers}</div>
          <div>Total Exams: {admin.state.stats?.totalExams}</div>
          <div>Published: {admin.state.stats?.publishedExams}</div>
        </div>
      )}
      
      <button onClick={admin.actions.refreshData}>
        Refresh All Data
      </button>
    </div>
  );
}

// src/components/ExamManager.tsx
function ExamManager() {
  const admin = useAdmin();
  
  const handleCreateExam = async () => {
    try {
      await admin.mutations.createExam.mutateAsync({
        name: 'New Exam',
        description: 'A new exam',
        subject: 'Mathematics',
        timeLimit: 60,
      });
      
      // Success! Data automatically refreshes due to invalidation
      alert('Exam created successfully!');
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Failed to create exam:', error);
    }
  };
  
  return (
    <div>
      <h2>Exam Manager</h2>
      
      {/* Filter controls */}
      <select 
        value={admin.state.examFilter.status || 'all'}
        onChange={(e) => admin.actions.setExamFilter({ 
          status: e.target.value as ExamFilter['status'] 
        })}
      >
        <option value="all">All Exams</option>
        <option value="published">Published</option>
        <option value="draft">Draft</option>
      </select>
      
      {/* Create button */}
      <button 
        onClick={handleCreateExam}
        disabled={admin.mutations.createExam.isPending}
      >
        {admin.mutations.createExam.isPending ? 'Creating...' : 'Create Exam'}
      </button>
      
      {/* Exams list */}
      {admin.state.loading.exams ? (
        <div>Loading exams...</div>
      ) : (
        <div>
          {admin.state.filteredExams.map(exam => (
            <div key={exam.id}>
              <input
                type="checkbox"
                checked={admin.state.selectedExams.has(exam.id)}
                onChange={() => admin.actions.toggleExamSelection(exam.id)}
              />
              <span>{exam.name}</span>
              <span>{exam.isPublished ? '✅ Published' : '📝 Draft'}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* Selection info */}
      {admin.computed.selectedCount > 0 && (
        <div>Selected: {admin.computed.selectedCount} exams</div>
      )}
    </div>
  );
}
```

---

## 🎨 Advanced Patterns

### Pattern 1: Optimistic Updates

```typescript
// Make UI update immediately, then sync with server
export function useDeleteExamMutation() {
  const queryClient = useQueryClient();
  const { setExams } = useAdminActions();
  
  return useMutation({
    mutationFn: (examId: string) => examService.deleteExam(examId),
    
    // Before the API call, update UI optimistically
    onMutate: async (examId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['admin', 'exams'] });
      
      // Snapshot the current value
      const previousExams = queryClient.getQueryData(['admin', 'exams']);
      
      // Optimistically update Zustand store
      setExams(currentExams => currentExams.filter(exam => exam.id !== examId));
      
      // Return context for rollback
      return { previousExams };
    },
    
    // On error, rollback the optimistic update
    onError: (err, examId, context) => {
      if (context?.previousExams) {
        queryClient.setQueryData(['admin', 'exams'], context.previousExams);
      }
    },
    
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
    },
  });
}
```

### Pattern 2: Dependent Queries

```typescript
// Only fetch exam details after exam list is loaded
function ExamDetails({ examId }: { examId: string }) {
  const exams = useAdminExams();
  
  const examDetailsQuery = useQuery({
    queryKey: ['admin', 'exam', examId],
    queryFn: () => examService.getExamById(examId),
    enabled: !!examId && exams.length > 0, // Only run if we have examId and exams are loaded
  });
  
  if (!examId) return <div>Select an exam</div>;
  if (exams.length === 0) return <div>Loading exams...</div>;
  if (examDetailsQuery.isLoading) return <div>Loading exam details...</div>;
  
  return <div>{/* exam details */}</div>;
}
```

### Pattern 3: Infinite Queries (Pagination)

```typescript
import { useInfiniteQuery } from '@tanstack/react-query';

export function useInfiniteExamsQuery(filter: ExamFilter) {
  return useInfiniteQuery({
    queryKey: ['admin', 'exams', 'infinite', filter],
    queryFn: ({ pageParam = 1 }) => 
      examService.getAllExams({ page: pageParam, limit: 20, ...filter }),
    
    getNextPageParam: (lastPage, pages) => {
      const hasMore = lastPage.data.pagination.currentPage < 
                     Math.ceil(lastPage.data.pagination.totalItems / 20);
      return hasMore ? lastPage.data.pagination.currentPage + 1 : undefined;
    },
    
    initialPageParam: 1,
  });
}

// Usage in component
function InfiniteExamsList() {
  const filter = useExamFilter();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteExamsQuery(filter);
  
  const allExams = data?.pages.flatMap(page => page.data.exams) ?? [];
  
  return (
    <div>
      {allExams.map(exam => (
        <div key={exam.id}>{exam.name}</div>
      ))}
      
      {hasNextPage && (
        <button 
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

---

## 🐛 Common Mistakes & Solutions

### Mistake 1: Using the Entire Store

```typescript
// ❌ Bad: Component re-renders on ANY store change
function ExamCounter() {
  const admin = useAdmin(); // Gets everything!
  return <div>Total: {admin.state.exams.length}</div>;
}

// ✅ Good: Only re-renders when exams change
function ExamCounter() {
  const exams = useAdminExams(); // Only subscribes to exams
  return <div>Total: {exams.length}</div>;
}
```

### Mistake 2: Forgetting to Invalidate After Mutations

```typescript
// ❌ Bad: Data doesn't update after creating
const createExamMutation = useMutation({
  mutationFn: examService.createExam,
  // Missing: onSuccess invalidation
});

// ✅ Good: Data updates automatically
const createExamMutation = useMutation({
  mutationFn: examService.createExam,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
  },
});
```

### Mistake 3: Not Handling Loading States

```typescript
// ❌ Bad: Shows stale data while loading
function ExamsList() {
  const { data: exams } = useAdminExamsQuery(1, 10, {});
  return exams?.map(exam => <div key={exam.id}>{exam.name}</div>);
}

// ✅ Good: Shows loading state
function ExamsList() {
  const { data: exams, isLoading, error } = useAdminExamsQuery(1, 10, {});
  
  if (isLoading) return <div>Loading exams...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return exams?.exams.map(exam => <div key={exam.id}>{exam.name}</div>);
}
```

### Mistake 4: Putting Server State in Zustand

```typescript
// ❌ Bad: Managing server state manually
const useStore = create((set) => ({
  exams: [],
  loading: false,
  
  fetchExams: async () => {
    set({ loading: true });
    const exams = await api.getExams();
    set({ exams, loading: false });
  },
}));

// ✅ Good: Let TanStack Query handle server state
const useExamsQuery = () => useQuery({
  queryKey: ['exams'],
  queryFn: api.getExams,
});
```

### Mistake 5: Wrong Query Key Structure

```typescript
// ❌ Bad: Keys that don't invalidate properly
useQuery({ queryKey: ['exams'] }); // All exams
useQuery({ queryKey: ['published-exams'] }); // Published exams - separate cache!

// When you create an exam and invalidate ['exams'], 
// the published exams query won't update!

// ✅ Good: Hierarchical keys
useQuery({ queryKey: ['exams'] }); // All exams  
useQuery({ queryKey: ['exams', { status: 'published' }] }); // Published exams

// Now invalidating ['exams'] will update both queries!
```

---

## 🎯 Key Takeaways

### When to Use Zustand
- ✅ UI state (active tab, sidebar open/closed)
- ✅ Form state (input values, validation errors)
- ✅ User interactions (selected items, filters)
- ✅ Client-side computed values
- ❌ Server data (use TanStack Query instead)

### When to Use TanStack Query  
- ✅ Fetching data from APIs
- ✅ Caching server responses
- ✅ Background data updates
- ✅ Retry logic for failed requests
- ✅ Loading and error states for server operations
- ❌ UI state (use Zustand instead)

### Best Practices
1. **Keep them separate**: Zustand for client state, TanStack Query for server state
2. **Use selective subscriptions**: Only subscribe to the data you need
3. **Handle all states**: Loading, error, success - never assume API calls work
4. **Invalidate after mutations**: Always update related queries after changes
5. **Use proper query keys**: Hierarchical structure for proper invalidation
6. **Start simple**: Add complexity only when needed

### The Mental Model
```
Your App = Zustand (client state) + TanStack Query (server state)

Zustand stores:      TanStack Query handles:
- What tab is active → API calls
- What's selected    → Caching  
- Filter settings    → Background updates
- UI preferences     → Retry logic
                     → Loading states
```

You now have everything you need to build production-ready admin systems! The key is understanding that **state management isn't one tool - it's the right tool for each type of state**. 🚀

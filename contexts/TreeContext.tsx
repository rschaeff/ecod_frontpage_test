'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// Types that match the API responses
interface TreeNode {
  id: string;
  name: string;
  level: 'A' | 'X' | 'H' | 'T' | 'F';
  domainCount?: number;
  parent?: string;
}

interface Representative {
  id: string;
  range: string;
  pdb_id?: string;
  chain?: string;
  uniprot: string;
  isManual: boolean;
}

interface NodeData {
  id: string;
  name: string;
  level: 'A' | 'X' | 'H' | 'T' | 'F';
  parent?: string;
  domainCount: number;
  children: TreeNode[];
  representatives: Representative[];
}

interface ExpandedNodesState {
  [key: string]: boolean;
}

interface TreeState {
  rootNodes: TreeNode[];
  nodeData: Record<string, NodeData>;
  expandedNodes: ExpandedNodesState;
  selectedNodeId: string | null;
  activeFilter: 'all' | 'A' | 'X' | 'H' | 'T' | 'F';
  loadingNode: string | null;
  error: string | null;
}

// Types for tree actions
type TreeAction =
  | { type: 'SET_ROOT_NODES'; payload: TreeNode[] }
  | { type: 'SET_NODE_DATA'; payload: { id: string; data: NodeData } }
  | { type: 'TOGGLE_NODE'; payload: string }
  | { type: 'EXPAND_NODE'; payload: string }
  | { type: 'COLLAPSE_NODE'; payload: string }
  | { type: 'SET_SELECTED_NODE'; payload: string | null }
  | { type: 'SET_ACTIVE_FILTER'; payload: 'all' | 'A' | 'X' | 'H' | 'T' | 'F' }
  | { type: 'SET_LOADING_NODE'; payload: string | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'EXPAND_ALL' };

// Context type
interface TreeContextType {
  state: TreeState;
  dispatch: React.Dispatch<TreeAction>;
  toggleNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  fetchNodeData: (nodeId: string) => Promise<void>;
  setActiveFilter: (filter: 'all' | 'A' | 'X' | 'H' | 'T' | 'F') => void;
  expandAll: () => void;
  collapseAll: () => void;
}

// Initial state
const initialState: TreeState = {
  rootNodes: [],
  nodeData: {},
  expandedNodes: {},
  selectedNodeId: null,
  activeFilter: 'all',
  loadingNode: null,
  error: null
};

// Create context
const TreeContext = createContext<TreeContextType | undefined>(undefined);

// Reducer function
function treeReducer(state: TreeState, action: TreeAction): TreeState {
  switch (action.type) {
    case 'SET_ROOT_NODES':
      return {
        ...state,
        rootNodes: action.payload,
        error: null
      };
    case 'SET_NODE_DATA':
      return {
        ...state,
        nodeData: {
          ...state.nodeData,
          [action.payload.id]: action.payload.data
        },
        error: null
      };
    case 'TOGGLE_NODE':
      return {
        ...state,
        expandedNodes: {
          ...state.expandedNodes,
          [action.payload]: !state.expandedNodes[action.payload]
        }
      };
    case 'EXPAND_NODE':
      return {
        ...state,
        expandedNodes: {
          ...state.expandedNodes,
          [action.payload]: true
        }
      };
    case 'COLLAPSE_NODE':
      return {
        ...state,
        expandedNodes: {
          ...state.expandedNodes,
          [action.payload]: false
        }
      };
    case 'SET_SELECTED_NODE':
      return {
        ...state,
        selectedNodeId: action.payload
      };
    case 'SET_ACTIVE_FILTER':
      return {
        ...state,
        activeFilter: action.payload
      };
    case 'SET_LOADING_NODE':
      return {
        ...state,
        loadingNode: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loadingNode: null
      };
    case 'COLLAPSE_ALL':
      return {
        ...state,
        expandedNodes: {}
      };
    case 'EXPAND_ALL': {
      // Expand all loaded nodes and root nodes
      const allExpanded: ExpandedNodesState = {};

      // Expand all root nodes
      state.rootNodes.forEach(node => {
        allExpanded[node.id] = true;
      });

      // Expand all loaded nodes and their children
      Object.values(state.nodeData).forEach(nodeData => {
        allExpanded[nodeData.id] = true;
        nodeData.children.forEach(child => {
          allExpanded[child.id] = true;
        });
      });

      return {
        ...state,
        expandedNodes: allExpanded
      };
    }
    default:
      return state;
  }
}

// Provider component
export function TreeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(treeReducer, initialState);

  // Load root nodes when the provider mounts
  useEffect(() => {
    async function fetchRootNodes() {
      try {
        dispatch({ type: 'SET_LOADING_NODE', payload: 'root' });

        // Fetch A-level nodes
        const response = await fetch('/api/tree?level=A');

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to fetch root nodes:', response.status, errorText);
          throw new Error(`Failed to fetch root nodes: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Root nodes fetched successfully:', data);

        // Ensure we have nodes array
        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error('Invalid response format: nodes array not found');
        }

        // Transform the data to ensure proper typing
        const transformedNodes: TreeNode[] = data.nodes.map((node: any) => ({
          id: node.id,
          name: node.name,
          level: node.level,
          domainCount: node.domainCount || 0,
          parent: node.parent
        }));

        dispatch({ type: 'SET_ROOT_NODES', payload: transformedNodes });
        console.log('Root nodes set in state:', transformedNodes.length, 'nodes');

      } catch (error) {
        console.error('Error fetching root nodes:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to load tree data'
        });
      } finally {
        dispatch({ type: 'SET_LOADING_NODE', payload: null });
      }
    }

    fetchRootNodes();
  }, []);

  // Load expanded nodes state from localStorage on mount (after root nodes are loaded)
  useEffect(() => {
    if (typeof window === 'undefined' || state.rootNodes.length === 0) return;

    try {
      const savedExpandedNodes = localStorage.getItem('ecodTreeExpandedNodes');
      if (savedExpandedNodes) {
        const parsedNodes = JSON.parse(savedExpandedNodes);
        console.log('Loading saved expanded nodes:', parsedNodes);
        for (const nodeId in parsedNodes) {
          if (parsedNodes[nodeId]) {
            dispatch({ type: 'EXPAND_NODE', payload: nodeId });
          }
        }
      }
    } catch (e) {
      console.error('Error parsing expanded tree nodes:', e);
    }
  }, [state.rootNodes]);

  // Save expanded nodes to localStorage when they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('ecodTreeExpandedNodes', JSON.stringify(state.expandedNodes));
  }, [state.expandedNodes]);

  const toggleNode = (nodeId: string) => {
    console.log('Toggling node:', nodeId);
    dispatch({ type: 'TOGGLE_NODE', payload: nodeId });

    // If expanding and we don't have data yet, fetch it
    if (!state.expandedNodes[nodeId] && !state.nodeData[nodeId]) {
      console.log('Node not expanded and no data, fetching:', nodeId);
      fetchNodeData(nodeId);
    }
  };

  const selectNode = (nodeId: string | null) => {
    console.log('Selecting node:', nodeId);
    dispatch({ type: 'SET_SELECTED_NODE', payload: nodeId });
    if (nodeId) {
      // Automatically expand the node when selected
      dispatch({ type: 'EXPAND_NODE', payload: nodeId });
      // Fetch node data if we don't have it
      if (!state.nodeData[nodeId]) {
        console.log('Selected node has no data, fetching:', nodeId);
        fetchNodeData(nodeId);
      }
    }
  };

  const setActiveFilter = (filter: 'all' | 'A' | 'X' | 'H' | 'T' | 'F') => {
    console.log('Setting active filter:', filter);
    dispatch({ type: 'SET_ACTIVE_FILTER', payload: filter });
  };

  // Function to fetch node data from the API
  const fetchNodeData = async (nodeId: string) => {
    if (state.nodeData[nodeId]) {
      // Data already loaded, just expand the node
      console.log('Node data already loaded, expanding:', nodeId);
      dispatch({ type: 'EXPAND_NODE', payload: nodeId });
      return;
    }

    try {
      console.log('Fetching node data for:', nodeId);
      dispatch({ type: 'SET_LOADING_NODE', payload: nodeId });

      const response = await fetch(`/api/classification/${nodeId}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to fetch node data:', response.status, errorText);
        throw new Error(`Failed to fetch node data: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Node data fetched:', data);

      // Transform API response to match our NodeData interface
      const nodeData: NodeData = {
        id: data.id,
        name: data.name,
        level: data.level,
        parent: data.parent,
        domainCount: data.domainCount || 0,
        children: data.children || [],
        representatives: data.representatives || []
      };

      dispatch({
        type: 'SET_NODE_DATA',
        payload: { id: nodeId, data: nodeData }
      });

      // Expand the node after data is loaded
      dispatch({ type: 'EXPAND_NODE', payload: nodeId });
      console.log('Node data set and expanded:', nodeId);

    } catch (error) {
      console.error(`Error fetching node ${nodeId}:`, error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load node data'
      });
    } finally {
      dispatch({ type: 'SET_LOADING_NODE', payload: null });
    }
  };

  const expandAll = () => {
    console.log('Expanding all nodes');
    dispatch({ type: 'EXPAND_ALL' });
  };

  const collapseAll = () => {
    console.log('Collapsing all nodes');
    dispatch({ type: 'COLLAPSE_ALL' });
  };

  return (
    <TreeContext.Provider
      value={{
        state,
        dispatch,
        toggleNode,
        selectNode,
        fetchNodeData,
        setActiveFilter,
        expandAll,
        collapseAll
      }}
    >
      {children}
    </TreeContext.Provider>
  );
}

// Custom hook to use the tree context
export function useTree() {
  const context = useContext(TreeContext);
  if (context === undefined) {
    throw new Error('useTree must be used within a TreeProvider');
  }
  return context;
}

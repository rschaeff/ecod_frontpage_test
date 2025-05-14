'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// Types for tree nodes and state
interface TreeNode {
  id: string;
  name: string;
  type: 'A' | 'X' | 'H' | 'T' | 'F';
  children?: TreeNode[];
}

interface RepresentativeNode {
  id: string;
  range: string;
  description: string;
  structureType: 'experimental' | 'theoretical';
  resolution?: string;
  plddt?: string;
}

interface ExpandedNodesState {
  [key: string]: boolean;
}

interface TreeState {
  expandedNodes: ExpandedNodesState;
  selectedNodeId: string | null;
  activeFilter: string;
  loadingNode: string | null;
  nodeData: Record<string, TreeNode>;
  error: string | null;
  representativeNodes: Record<string, RepresentativeNode[]>;
}

// Types for tree actions
type TreeAction =
  | { type: 'TOGGLE_NODE'; payload: string }
  | { type: 'EXPAND_NODE'; payload: string }
  | { type: 'COLLAPSE_NODE'; payload: string }
  | { type: 'SET_SELECTED_NODE'; payload: string | null }
  | { type: 'SET_ACTIVE_FILTER'; payload: string }
  | { type: 'FETCH_NODE_START'; payload: string }
  | { type: 'FETCH_NODE_SUCCESS'; payload: { id: string; data: TreeNode } }
  | { type: 'FETCH_NODE_ERROR'; payload: string }
  | { type: 'FETCH_REPRESENTATIVES_SUCCESS'; payload: { nodeId: string; data: RepresentativeNode[] } }
  | { type: 'COLLAPSE_ALL' }
  | { type: 'EXPAND_ALL' };

// Context type
interface TreeContextType {
  state: TreeState;
  dispatch: React.Dispatch<TreeAction>;
  toggleNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  fetchNodeData: (nodeId: string) => Promise<void>;
  setActiveFilter: (filter: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
}

// Initial state
const initialState: TreeState = {
  expandedNodes: {
    'A1': true, // Start with Architecture level expanded
  },
  selectedNodeId: null,
  activeFilter: 'all',
  loadingNode: null,
  nodeData: {},
  error: null,
  representativeNodes: {}
};

// Create context
const TreeContext = createContext<TreeContextType | undefined>(undefined);

// Reducer function
function treeReducer(state: TreeState, action: TreeAction): TreeState {
  switch (action.type) {
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
    case 'FETCH_NODE_START':
      return {
        ...state,
        loadingNode: action.payload
      };
    case 'FETCH_NODE_SUCCESS':
      return {
        ...state,
        loadingNode: null,
        nodeData: {
          ...state.nodeData,
          [action.payload.id]: action.payload.data
        }
      };
    case 'FETCH_NODE_ERROR':
      return {
        ...state,
        loadingNode: null,
        error: action.payload
      };
    case 'FETCH_REPRESENTATIVES_SUCCESS':
      return {
        ...state,
        representativeNodes: {
          ...state.representativeNodes,
          [action.payload.nodeId]: action.payload.data
        }
      };
    case 'COLLAPSE_ALL':
      return {
        ...state,
        expandedNodes: {}
      };
    case 'EXPAND_ALL': {
      // Create a record of all nodes expanded
      const allExpanded: ExpandedNodesState = {};
      // Expand all nodes in the nodeData
      Object.keys(state.nodeData).forEach(nodeId => {
        allExpanded[nodeId] = true;
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

  // Load expanded nodes state from localStorage on mount
  useEffect(() => {
    const savedExpandedNodes = localStorage.getItem('ecodTreeExpandedNodes');
    if (savedExpandedNodes) {
      try {
        const parsedNodes = JSON.parse(savedExpandedNodes);
        for (const nodeId in parsedNodes) {
          if (parsedNodes[nodeId]) {
            dispatch({ type: 'EXPAND_NODE', payload: nodeId });
          }
        }
      } catch (e) {
        console.error('Error parsing expanded tree nodes:', e);
      }
    }
  }, []);

  // Save expanded nodes to localStorage when they change
  useEffect(() => {
    localStorage.setItem('ecodTreeExpandedNodes', JSON.stringify(state.expandedNodes));
  }, [state.expandedNodes]);

  const toggleNode = (nodeId: string) => {
    dispatch({ type: 'TOGGLE_NODE', payload: nodeId });
  };

  const selectNode = (nodeId: string | null) => {
    dispatch({ type: 'SET_SELECTED_NODE', payload: nodeId });
    if (nodeId) {
      // Automatically expand the node when selected
      dispatch({ type: 'EXPAND_NODE', payload: nodeId });
    }
  };

  const setActiveFilter = (filter: string) => {
    dispatch({ type: 'SET_ACTIVE_FILTER', payload: filter });
  };

  // Function to fetch node data
  const fetchNodeData = async (nodeId: string) => {
    if (state.nodeData[nodeId]) {
      // Data already loaded, just expand the node
      dispatch({ type: 'EXPAND_NODE', payload: nodeId });
      return;
    }

    dispatch({ type: 'FETCH_NODE_START', payload: nodeId });

    try {
      // In a real application, this would be an API call
      // For now, we'll simulate with setTimeout
      await new Promise(resolve => setTimeout(resolve, 500));

      // Example mock data - in a real app, this would come from your API
      const mockData: TreeNode = {
        id: nodeId,
        name: `Node ${nodeId}`,
        type: nodeId.charAt(0) as 'A' | 'X' | 'H' | 'T' | 'F',
        children: [
          {
            id: `${nodeId}.1`,
            name: `Child ${nodeId}.1`,
            type: 'H',
          },
          {
            id: `${nodeId}.2`,
            name: `Child ${nodeId}.2`,
            type: 'H',
          }
        ]
      };

      dispatch({
        type: 'FETCH_NODE_SUCCESS',
        payload: { id: nodeId, data: mockData }
      });

      // Also fetch representative domains if this is a T or F level node
      if (nodeId.charAt(0) === 'T' || nodeId.charAt(0) === 'F') {
        // Mock representative data
        const representatives: RepresentativeNode[] = [
          {
            id: `e${Math.random().toString(36).substring(2, 6)}`,
            range: 'A:1-150',
            description: `Example domain for ${nodeId}`,
            structureType: 'experimental',
            resolution: '2.1Å'
          }
        ];

        dispatch({
          type: 'FETCH_REPRESENTATIVES_SUCCESS',
          payload: { nodeId, data: representatives }
        });
      }

      // Expand the node after data is loaded
      dispatch({ type: 'EXPAND_NODE', payload: nodeId });
    } catch (error) {
      dispatch({
        type: 'FETCH_NODE_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load node data'
      });
    }
  };

  const expandAll = () => {
    dispatch({ type: 'EXPAND_ALL' });
  };

  const collapseAll = () => {
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

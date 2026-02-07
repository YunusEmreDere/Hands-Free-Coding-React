import { FileEntry } from '../types/explorer';

export const DEMO_PROJECT: FileEntry = {
  name: 'src', path: 'src', type: 'folder', children: [
    {
      name: 'components', path: 'src/components', type: 'folder', children: [
        { name: 'ChatInterface.tsx', path: 'src/components/ChatInterface.tsx', type: 'file', lines: 92, exports: ['ChatInterface'], imports: ['src/store/chatStore.ts'] },
        { name: 'Footer.tsx', path: 'src/components/Footer.tsx', type: 'file', lines: 27, exports: ['Footer'], imports: [] },
        { name: 'Header.tsx', path: 'src/components/Header.tsx', type: 'file', lines: 33, exports: ['Header'], imports: [] },
        { name: 'Sidebar.tsx', path: 'src/components/Sidebar.tsx', type: 'file', lines: 145, exports: ['Sidebar'], imports: ['src/store/chatStore.ts'] },
        { name: 'Visualizer.tsx', path: 'src/components/Visualizer.tsx', type: 'file', lines: 111, exports: ['Visualizer'], imports: [] },
      ]
    },
    {
      name: 'pages', path: 'src/pages', type: 'folder', children: [
        { name: 'Dashboard.tsx', path: 'src/pages/Dashboard.tsx', type: 'file', lines: 39, exports: ['Dashboard'], imports: ['src/components/Sidebar.tsx', 'src/components/Header.tsx', 'src/components/Visualizer.tsx', 'src/components/ChatInterface.tsx', 'src/components/Footer.tsx'] },
        { name: 'LoginPage.tsx', path: 'src/pages/LoginPage.tsx', type: 'file', lines: 180, exports: ['LoginPage'], imports: [] },
        { name: 'ProjectExplorer.tsx', path: 'src/pages/ProjectExplorer.tsx', type: 'file', lines: 330, exports: ['ProjectExplorer'], imports: [] },
      ]
    },
    {
      name: 'store', path: 'src/store', type: 'folder', children: [
        { name: 'chatStore.ts', path: 'src/store/chatStore.ts', type: 'file', lines: 58, exports: ['useChatStore'], imports: ['src/types/index.ts'] },
      ]
    },
    {
      name: 'types', path: 'src/types', type: 'folder', children: [
        { name: 'index.ts', path: 'src/types/index.ts', type: 'file', lines: 22, exports: ['Message', 'Chat', 'ChatStore'], imports: [] },
      ]
    },
    { name: 'App.tsx', path: 'src/App.tsx', type: 'file', lines: 18, exports: ['App'], imports: ['src/pages/LoginPage.tsx', 'src/pages/Dashboard.tsx', 'src/pages/ProjectExplorer.tsx'] },
    { name: 'main.tsx', path: 'src/main.tsx', type: 'file', lines: 10, exports: [], imports: ['src/App.tsx'] },
  ]
};

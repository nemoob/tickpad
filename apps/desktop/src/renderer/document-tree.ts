export type TreeDocument = {
  id: string;
  title: string;
  path?: string;
  treePath?: string;
};

export type DocumentTreeNode<TDocument extends TreeDocument> = {
  id: string;
  name: string;
  children: DocumentTreeNode<TDocument>[];
  document?: TDocument;
};

export const getDocumentTreeSegments = (document: TreeDocument) => {
  if (document.treePath) {
    return document.treePath.split(/[\\/]/).filter(Boolean);
  }
  if (document.path) {
    const segments = document.path.split(/[\\/]/).filter(Boolean);
    const fileName = segments.at(-1) ?? document.title;
    return [segments.at(-2) ?? "Files", fileName];
  }
  return [document.title];
};

export const buildDocumentTree = <TDocument extends TreeDocument>(documents: TDocument[], folderPaths: string[] = []) => {
  const root: DocumentTreeNode<TDocument> = { id: "root", name: "root", children: [] };

  for (const folderPath of folderPaths) {
    let current = root;
    for (const segment of folderPath.split(/[\\/]/).filter(Boolean)) {
      let child = current.children.find((item) => item.name === segment && !item.document);
      if (!child) {
        child = {
          id: `${current.id}/${segment}`,
          name: segment,
          children: []
        };
        current.children.push(child);
      }
      current = child;
    }
  }

  for (const document of documents) {
    const segments = getDocumentTreeSegments(document);
    let current = root;

    for (const [index, segment] of segments.entries()) {
      const isLeaf = index === segments.length - 1;
      let child = current.children.find((item) => item.name === segment && Boolean(item.document) === isLeaf);
      if (!child) {
        child = {
          id: isLeaf ? document.id : `${current.id}/${segment}`,
          name: segment,
          children: [],
          document: isLeaf ? document : undefined
        };
        current.children.push(child);
      }
      current = child;
    }
  }

  return root.children;
};

export const getDocumentFolderPath = (document: TreeDocument) => getDocumentTreeSegments(document).slice(0, -1).join("/");

export const sortDocumentsForRail = <TDocument extends TreeDocument>(documents: TDocument[], pinnedDocumentIds: ReadonlySet<string>) => {
  const groups = new Map<string, { pinned: TDocument[]; regular: TDocument[] }>();

  for (const document of documents) {
    const folderPath = getDocumentFolderPath(document);
    const group = groups.get(folderPath) ?? { pinned: [], regular: [] };
    if (!groups.has(folderPath)) {
      groups.set(folderPath, group);
    }
    if (pinnedDocumentIds.has(document.id)) {
      group.pinned.push(document);
    } else {
      group.regular.push(document);
    }
  }

  return Array.from(groups.values()).flatMap((group) => [...group.pinned, ...group.regular]);
};

export const getDocumentFolderIds = (document: TreeDocument) => {
  const folders = getDocumentTreeSegments(document).slice(0, -1);
  return folders.map((_, index) => `root/${folders.slice(0, index + 1).join("/")}`);
};

export const filterDocumentTree = <TDocument extends TreeDocument>(nodes: DocumentTreeNode<TDocument>[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return nodes;
  }

  const filterNode = (node: DocumentTreeNode<TDocument>): DocumentTreeNode<TDocument> | null => {
    const nameMatches = node.name.toLowerCase().includes(normalizedQuery);
    if (nameMatches) {
      return node;
    }

    const children = node.children.map(filterNode).filter((item): item is DocumentTreeNode<TDocument> => Boolean(item));
    if (!children.length) {
      return null;
    }
    return { ...node, children };
  };

  return nodes.map(filterNode).filter((item): item is DocumentTreeNode<TDocument> => Boolean(item));
};

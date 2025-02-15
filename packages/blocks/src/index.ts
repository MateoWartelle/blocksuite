/// <reference types="@blocksuite/global" />
import '@blocksuite/affine-block-paragraph';
import '@blocksuite/affine-block-list';
import '@blocksuite/affine-block-surface';
import '@blocksuite/affine-components/context-menu';
import '@blocksuite/affine-components/rich-text';
import '@blocksuite/affine-components/toolbar';
import { deserializeXYWH, Point } from '@blocksuite/global/utils';

import { matchFlavours } from './_common/utils/index.js';
import './code-block/highlight/affine-code-unit.js';
import './database-block/index.js';
import './divider-block/index.js';
import './frame-block/index.js';
import './image-block/index.js';
import './note-block/index.js';
import { splitElements } from './root-block/edgeless/utils/clipboard-utils.js';
import { isCanvasElement } from './root-block/edgeless/utils/query.js';
// manual import to avoid being tree-shaken
import './root-block/index.js';
import './surface-ref-block/index.js';

export * from './_common/adapters/index.js';

export * from './_common/components/ai-item/index.js';
export type { NotificationService } from './_common/components/index.js';
export { scrollbarStyle } from './_common/components/index.js';
export { type NavigatorMode } from './_common/edgeless/frame/consts.js';
export { EmbedBlockComponent } from './_common/embed-block-helper/index.js';
export * from './_common/test-utils/test-utils.js';
export * from './_common/transformers/index.js';
export { type AbstractEditor } from './_common/types.js';
export * from './_specs/index.js';
export * from './attachment-block/index.js';
export * from './bookmark-block/index.js';
export * from './code-block/index.js';
export * from './data-view-block/index.js';
export * from './database-block/index.js';
export * from './divider-block/index.js';
export * from './edgeless-text-block/index.js';
export * from './embed-figma-block/index.js';
export * from './embed-github-block/index.js';
export * from './embed-html-block/index.js';
export * from './embed-linked-doc-block/index.js';
export * from './embed-loom-block/index.js';
export * from './embed-synced-doc-block/index.js';
export * from './embed-youtube-block/index.js';
export * from './frame-block/index.js';
export * from './image-block/index.js';
export * from './latex-block/index.js';
export * from './note-block/index.js';
export { EdgelessTemplatePanel } from './root-block/edgeless/components/toolbar/template/template-panel.js';
export type {
  Template,
  TemplateCategory,
  TemplateManager,
} from './root-block/edgeless/components/toolbar/template/template-type.js';
export { CopilotSelectionController } from './root-block/edgeless/tools/copilot-tool.js';
export * from './root-block/index.js';
export * from './schemas.js';
export {
  markdownToMindmap,
  MiniMindmapPreview,
} from './surface-block/mini-mindmap/mindmap-preview.js';
export * from './surface-ref-block/index.js';
export * from '@blocksuite/affine-block-list';
export * from '@blocksuite/affine-block-paragraph';
export * from '@blocksuite/affine-block-surface';
export { type MenuOptions } from '@blocksuite/affine-components/context-menu';
export {
  HoverController,
  whenHover,
} from '@blocksuite/affine-components/hover';
export {
  ArrowDownSmallIcon,
  CloseIcon,
  DocIcon,
  DualLinkIcon16,
  LinkedDocIcon,
  PlusIcon,
  TagsIcon,
} from '@blocksuite/affine-components/icons';
export * from '@blocksuite/affine-components/icons';
export {
  isPeekable,
  peek,
  Peekable,
  PeekableController,
  type PeekViewService,
} from '@blocksuite/affine-components/peek';
export {
  createLitPortal,
  createSimplePortal,
} from '@blocksuite/affine-components/portal';
export * from '@blocksuite/affine-components/rich-text';
export { toast } from '@blocksuite/affine-components/toast';
export {
  type AdvancedMenuItem,
  type FatMenuItems,
  groupsToActions,
  type MenuItem,
  type MenuItemGroup,
  renderActions,
  renderGroups,
  renderToolbarSeparator,
  Tooltip,
} from '@blocksuite/affine-components/toolbar';
export * from '@blocksuite/affine-model';
export * from '@blocksuite/affine-shared/services';
export {
  ColorVariables,
  FontFamilyVariables,
  SizeVariables,
  StyleVariables,
  ThemeObserver,
} from '@blocksuite/affine-shared/theme';

export {
  createButtonPopper,
  createDefaultDoc,
  findNoteBlockModel,
  isInsideEdgelessEditor,
  isInsidePageEditor,
  matchFlavours,
  on,
  once,
  openFileOrFiles,
  printToPdf,
} from '@blocksuite/affine-shared/utils';

export const BlocksUtils = {
  splitElements,
  matchFlavours,
  deserializeXYWH,
  isCanvasElement,
  Point,
};

const env: Record<string, unknown> =
  typeof globalThis !== 'undefined'
    ? globalThis
    : typeof window !== 'undefined'
      ? window
      : // @ts-ignore
        typeof global !== 'undefined'
        ? // @ts-ignore
          global
        : {};
const importIdentifier = '__ $BLOCKSUITE_BLOCKS$ __';

if (env[importIdentifier] === true) {
  // https://github.com/yjs/yjs/issues/438
  console.error(
    '@blocksuite/blocks was already imported. This breaks constructor checks and will lead to issues!'
  );
}

env[importIdentifier] = true;

import type { ReferenceInfo, RootBlockModel } from '@blocksuite/affine-model';
import type { Doc, DocMeta } from '@blocksuite/store';

import {
  getModelByElement,
  getRootByElement,
} from '@blocksuite/affine-shared/utils';
import { BLOCK_ID_ATTR, type BlockComponent } from '@blocksuite/block-std';
import { ShadowlessElement, WithDisposable } from '@blocksuite/block-std';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import {
  type DeltaInsert,
  INLINE_ROOT_ATTR,
  type InlineRootElement,
  ZERO_WIDTH_NON_JOINER,
  ZERO_WIDTH_SPACE,
} from '@blocksuite/inline';
import { css, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
import { ref } from 'lit/directives/ref.js';

import type { AffineTextAttributes } from '../../../../extension/index.js';
import type { ReferenceNodeConfigProvider } from './reference-config.js';
import type { RefNodeSlots } from './types.js';

import { HoverController } from '../../../../../hover/index.js';
import {
  BlockLinkIcon,
  FontDocIcon,
  FontLinkedDocIcon,
} from '../../../../../icons/index.js';
import { Peekable } from '../../../../../peek/index.js';
import { affineTextStyles } from '../affine-text.js';
import { DEFAULT_DOC_NAME, REFERENCE_NODE } from '../consts.js';
import { toggleReferencePopup } from './reference-popup.js';

@customElement('affine-reference')
@Peekable({ action: false })
export class AffineReference extends WithDisposable(ShadowlessElement) {
  static override styles = css`
    .affine-reference {
      white-space: normal;
      word-break: break-word;
      color: var(--affine-text-primary-color);
      fill: var(--affine-icon-color);
      border-radius: 4px;
      text-decoration: none;
      cursor: pointer;
      user-select: none;
      padding: 1px 2px 1px 0;
    }
    .affine-reference:hover {
      background: var(--affine-hover-color);
    }

    .affine-reference[data-selected='true'] {
      background: var(--affine-hover-color);
    }

    .affine-reference-title {
      margin-left: 4px;
      border-bottom: 0.5px solid var(--affine-divider-color);
      transition: border 0.2s ease-out;
    }
    .affine-reference-title:hover {
      border-bottom: 0.5px solid var(--affine-icon-color);
    }
  `;

  private _refAttribute: NonNullable<AffineTextAttributes['reference']> = {
    type: 'LinkedPage',
    pageId: '0',
  };

  private _updateRefMeta = (doc: Doc) => {
    const refAttribute = this.delta.attributes?.reference;
    if (!refAttribute) {
      return;
    }

    this._refAttribute = refAttribute;
    const refMeta = doc.collection.meta.docMetas.find(
      doc => doc.id === refAttribute.pageId
    );
    this.refMeta = refMeta
      ? {
          ...refMeta,
        }
      : undefined;
  };

  private _whenHover: HoverController = new HoverController(
    this,
    ({ abortController }) => {
      if (
        this.doc?.readonly ||
        this.closest('.prevent-reference-popup') ||
        !this.selfInlineRange ||
        !this.inlineEditor
      ) {
        return null;
      }

      const selection = this.std?.selection;
      if (!selection) {
        return null;
      }
      const textSelection = selection.find('text');
      if (!!textSelection && !textSelection.isCollapsed()) {
        return null;
      }

      const blockSelections = selection.filter('block');
      if (blockSelections.length) {
        return null;
      }

      return {
        template: toggleReferencePopup(
          this,
          this.isLinkedNode(),
          this.referenceInfo,
          this.inlineEditor,
          this.selfInlineRange,
          this.refMeta?.title ?? DEFAULT_DOC_NAME,
          abortController
        ),
      };
    },
    { enterDelay: 500 }
  );

  get block() {
    const block = this.inlineEditor?.rootElement.closest<BlockComponent>(
      `[${BLOCK_ID_ATTR}]`
    );
    return block;
  }

  get customContent() {
    return this.config.customContent;
  }

  get customIcon() {
    return this.config.customIcon;
  }

  get customTitle() {
    return this.config.customTitle;
  }

  get doc() {
    const doc = this.config.doc;
    return doc;
  }

  get inlineEditor() {
    const inlineRoot = this.closest<InlineRootElement<AffineTextAttributes>>(
      `[${INLINE_ROOT_ATTR}]`
    );
    return inlineRoot?.inlineEditor;
  }

  get referenceInfo(): ReferenceInfo {
    const reference = this.delta.attributes?.reference;
    const id = this.doc?.id;
    if (!reference) return { pageId: id ?? '' };

    const { pageId, params } = reference;
    const info: ReferenceInfo = { pageId };
    if (!params) return info;

    const { mode, blockIds, elementIds } = params;
    info.params = {};
    if (mode) info.params.mode = mode;
    if (blockIds?.length) info.params.blockIds = [...blockIds];
    if (elementIds?.length) info.params.elementIds = [...elementIds];
    return info;
  }

  get selfInlineRange() {
    const selfInlineRange = this.inlineEditor?.getInlineRangeFromElement(this);
    return selfInlineRange;
  }

  get std() {
    const std = this.block?.std;
    if (!std) {
      throw new BlockSuiteError(
        ErrorCode.ValueNotExists,
        'std not found in reference node'
      );
    }
    return std;
  }

  private _onClick() {
    if (!this.config.interactable) return;

    const refMeta = this.refMeta;
    const model = getModelByElement(this);
    if (!refMeta) {
      // The doc is deleted
      console.warn('The doc is deleted', this._refAttribute.pageId);
      return;
    }
    if (!model || refMeta.id === model.doc.id) {
      // the doc is the current doc.
      return;
    }
    const targetDocId = refMeta.id;
    const rootComponent = getRootByElement(
      this
    ) as BlockComponent<RootBlockModel> & { slots: RefNodeSlots };
    rootComponent.slots.docLinkClicked.emit({ pageId: targetDocId });
  }

  override connectedCallback() {
    super.connectedCallback();

    if (!this.config) {
      console.error('`reference-node` need `ReferenceNodeConfig`.');
      return;
    }

    if (this.delta.insert !== REFERENCE_NODE) {
      console.error(
        `Reference node must be initialized with '${REFERENCE_NODE}', but got '${this.delta.insert}'`
      );
    }

    const doc = this.doc;
    if (doc) {
      this._disposables.add(
        doc.collection.slots.docUpdated.on(() => this._updateRefMeta(doc))
      );
    }

    this.updateComplete
      .then(() => {
        if (!this.inlineEditor || !doc) return;

        // observe yText update
        this.disposables.add(
          this.inlineEditor.slots.textChange.on(() => this._updateRefMeta(doc))
        );
      })
      .catch(console.error);
  }

  // linking block/element
  isLinkedNode() {
    const reference = this.delta.attributes?.reference;
    if (!reference?.params) return false;
    const { mode, blockIds, elementIds } = reference.params;
    if (!mode) return false;
    if (blockIds && blockIds.length > 0) return true;
    if (elementIds && elementIds.length > 0) return true;
    return false;
  }

  override render() {
    const refMeta = this.refMeta;
    const isDeleted = !refMeta;

    const attributes = this.delta.attributes;
    const type = attributes?.reference?.type;
    if (!type) {
      return nothing;
    }

    const title = this.customTitle
      ? this.customTitle(this)
      : isDeleted
        ? 'Deleted doc'
        : refMeta.title.length > 0
          ? refMeta.title
          : DEFAULT_DOC_NAME;

    const icon = choose(
      type,
      [
        [
          'LinkedPage',
          () => (this.isLinkedNode() ? BlockLinkIcon : FontLinkedDocIcon),
        ],
        ['Subpage', () => FontDocIcon],
      ],
      () => this.customIcon?.(this) ?? nothing
    );

    const style = affineTextStyles(
      attributes,
      isDeleted
        ? {
            color: 'var(--affine-text-disable-color)',
            textDecoration: 'line-through',
            fill: 'var(--affine-text-disable-color)',
          }
        : {}
    );

    const content = this.customContent
      ? this.customContent(this)
      : html`${icon}<span data-title=${title} class="affine-reference-title"
            >${title}</span
          >`;

    // we need to add `<v-text .str=${ZERO_WIDTH_NON_JOINER}></v-text>` in an
    // embed element to make sure inline range calculation is correct
    return html`<span
      ${this.config.interactable ? ref(this._whenHover.setReference) : ''}
      data-selected=${this.selected}
      class="affine-reference"
      style=${style}
      @click=${this._onClick}
      >${content}<v-text .str=${ZERO_WIDTH_NON_JOINER}></v-text
    ></span>`;
  }

  override willUpdate(_changedProperties: Map<PropertyKey, unknown>) {
    super.willUpdate(_changedProperties);

    const doc = this.doc;
    if (doc) {
      this._updateRefMeta(doc);
    }
  }

  @property({ attribute: false })
  accessor config!: ReferenceNodeConfigProvider;

  @property({ type: Object })
  accessor delta: DeltaInsert<AffineTextAttributes> = {
    insert: ZERO_WIDTH_SPACE,
    attributes: {},
  };

  // Since the linked doc may be deleted, the `_refMeta` could be undefined.
  @state()
  accessor refMeta: DocMeta | undefined = undefined;

  @property({ type: Boolean })
  accessor selected = false;
}

declare global {
  interface HTMLElementTagNameMap {
    'affine-reference': AffineReference;
  }
}

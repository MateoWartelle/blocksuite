import type { EditorHost } from '@blocksuite/block-std';
import type { EdgelessRootBlockComponent } from '@blocksuite/blocks';

import { WithDisposable } from '@blocksuite/block-std';
import { css, html, LitElement, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
    padding: 8px;
    width: 220px;
  }

  .frames-setting-menu-container {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
  }

  .frames-setting-menu-item {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    height: 28px;
    padding: 4px 12px;
    align-items: center;
  }

  .frames-setting-menu-item .setting-label {
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
    color: var(--affine-text-secondary-color);
    padding: 0 4px;
  }

  .frames-setting-menu-divider {
    width: 100%;
    height: 1px;
    box-sizing: border-box;
    background: var(--affine-border-color);
    margin: 8px 0;
  }

  .frames-setting-menu-item.action {
    gap: 4px;
  }

  .frames-setting-menu-item .action-label {
    width: 138px;
    height: 20px;
    padding: 0 4px;
    font-size: 12px;
    font-weight: 500;
    line-height: 20px;
    color: var(--affine-text-primary-color);
  }

  .frames-setting-menu-item .toggle-button {
    display: flex;
  }

  menu-divider {
    height: 16px;
  }
`;

export const AFFINE_FRAMES_SETTING_MENU = 'affine-frames-setting-menu';

@customElement(AFFINE_FRAMES_SETTING_MENU)
export class FramesSettingMenu extends WithDisposable(LitElement) {
  static override styles = styles;

  private _onBlackBackgroundChange = (checked: boolean) => {
    this.blackBackground = checked;
    this.edgeless?.slots.navigatorSettingUpdated.emit({
      blackBackground: this.blackBackground,
    });
  };

  private _onFillScreenChange = (checked: boolean) => {
    this.fillScreen = checked;
    this.edgeless?.slots.navigatorSettingUpdated.emit({
      fillScreen: this.fillScreen,
    });
    this._rootService?.editPropsStore.setStorage(
      'presentFillScreen',
      this.fillScreen
    );
  };

  private _onHideToolBarChange = (checked: boolean) => {
    this.hideToolbar = checked;
    this.edgeless?.slots.navigatorSettingUpdated.emit({
      hideToolbar: this.hideToolbar,
    });
    this._rootService?.editPropsStore.setStorage(
      'presentHideToolbar',
      this.hideToolbar
    );
  };

  private get _rootService() {
    return this.editorHost.std.getService('affine:page');
  }

  private _tryRestoreSettings() {
    if (!this._rootService) {
      return;
    }
    const { editPropsStore } = this._rootService;
    const blackBackground = editPropsStore.getStorage('presentBlackBackground');

    this.blackBackground = blackBackground ?? true;
    this.fillScreen = editPropsStore.getStorage('presentFillScreen') ?? false;
    this.hideToolbar = editPropsStore.getStorage('presentHideToolbar') ?? false;
  }

  override connectedCallback() {
    super.connectedCallback();
    this._tryRestoreSettings();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  override render() {
    return html`<div
      class="frames-setting-menu-container"
      @click=${(e: MouseEvent) => {
        e.stopPropagation();
      }}
    >
      <div class="frames-setting-menu-item">
        <div class="setting-label">Preview Settings</div>
      </div>
      <div class="frames-setting-menu-item action">
        <div class="action-label">Fill Screen</div>
        <div class="toggle-button">
          <toggle-switch
            .on=${this.fillScreen}
            .onChange=${this._onFillScreenChange}
          ></toggle-switch>
        </div>
      </div>

      <menu-divider></menu-divider>

      <div class="frames-setting-menu-item">
        <div class="setting-label">Playback Settings</div>
      </div>
      <div class="frames-setting-menu-item action">
        <div class="action-label">Dark background</div>
        <div class="toggle-button">
          <toggle-switch
            .on=${this.blackBackground}
            .onChange=${this._onBlackBackgroundChange}
          ></toggle-switch>
        </div>
      </div>
      <div class="frames-setting-menu-item action">
        <div class="action-label">Hide toolbar</div>
        <div class="toggle-button">
          <toggle-switch
            .on=${this.hideToolbar}
            .onChange=${this._onHideToolBarChange}
          ></toggle-switch>
        </div>
      </div>
    </div>`;
  }

  override updated(_changedProperties: PropertyValues) {
    if (_changedProperties.has('edgeless')) {
      if (this.edgeless) {
        this.disposables.add(
          this.edgeless.slots.navigatorSettingUpdated.on(
            ({ blackBackground, hideToolbar }) => {
              if (
                blackBackground !== undefined &&
                blackBackground !== this.blackBackground
              ) {
                this.blackBackground = blackBackground;
              }

              if (
                hideToolbar !== undefined &&
                hideToolbar !== this.hideToolbar
              ) {
                this.hideToolbar = hideToolbar;
              }
            }
          )
        );
      } else {
        this.disposables.dispose();
      }
    }
  }

  @state()
  accessor blackBackground = false;

  @property({ attribute: false })
  accessor edgeless!: EdgelessRootBlockComponent | null;

  @property({ attribute: false })
  accessor editorHost!: EditorHost;

  @state()
  accessor fillScreen = false;

  @state()
  accessor hideToolbar = false;
}

declare global {
  interface HTMLElementTagNameMap {
    [AFFINE_FRAMES_SETTING_MENU]: FramesSettingMenu;
  }
}

import type { BlockService } from '@blocksuite/block-std';
import type { TemplateResult } from 'lit';

import type { PeekableClass, PeekViewService } from './type.js';

export class PeekableController<T extends PeekableClass> {
  private _getPeekViewService = (): PeekViewService | null => {
    const service = this.getRootService();
    if (service && 'peekViewService' in service) {
      return service.peekViewService as PeekViewService;
    }
    return null;
  };

  private getRootService = <T extends BlockService>() => {
    return this.target.std.getService<T>('affine:page');
  };

  peek = (template?: TemplateResult) => {
    return Promise.resolve<void>(
      this._getPeekViewService()?.peek(this.target, template)
    );
  };

  get peekable() {
    return (
      !!this._getPeekViewService() &&
      (this.enable ? this.enable(this.target) : true)
    );
  }

  constructor(
    private target: T,
    private enable?: (e: T) => boolean
  ) {}
}

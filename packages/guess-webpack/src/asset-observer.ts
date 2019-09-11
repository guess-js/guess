export interface Asset {
  name: string;
  callback: () => void;
}

export type AssetCallback = (asset: Asset) => void;

export class AssetObserver {
  buffer: Asset[] = [];
  private _callbacks: AssetCallback[] = [];

  onAsset(cb: AssetCallback) {
    this._callbacks.push(cb);
  }

  addAsset(asset: Asset) {
    this._callbacks.forEach(cb => cb(asset));
  }
}

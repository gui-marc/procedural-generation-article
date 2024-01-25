import * as GUI from 'lil-gui';

export abstract class Debuggable {
  constructor() {
    // this.debug();
  }

  abstract debug(): void;
}

class UI {
  private folders = new Map<string, GUI.GUI>();

  constructor(private readonly gui = new GUI.GUI()) {}

  getFolder(path: string) {
    const folder = this.folders.get(path);

    if (!folder) {
      const newFolder = this.gui.addFolder(path);
      this.folders.set(path, newFolder);
      return newFolder;
    }

    return folder;
  }

  getFolders() {
    return this.folders;
  }
}

type Listener = { path?: string; c: () => void };

export default class Debug {
  private static instance: Debug;

  static getInstance(): Debug {
    if (!Debug.instance) {
      Debug.instance = new Debug();
    }
    return Debug.instance;
  }

  public readonly UI = new UI();

  private constructor() {}

  public onChange({ path, c }: Listener) {
    if (path) {
      this.UI.getFolder(path).onChange(c);
    } else {
      for (const [, folder] of this.UI.getFolders()) {
        folder.onChange(c);
      }
    }
  }
}

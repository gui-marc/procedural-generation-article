import GUI from 'lil-gui';

export default class Debug {
  public static instance: Debug;

  public readonly gui: GUI = new GUI();

  private constructor() {}

  public static GetInstance() {
    if (!Debug.instance) {
      Debug.instance = new Debug();
    }
    return Debug.instance;
  }
}

// server
export function boringTypes() {
  return "typescript is boring, js >>>>>>";
}

export interface BoringInterface {
  boring: boolean;
}

export function boringFunction(): BoringInterface {
  return { boring: true };
}
export type VoidPayload = void;
export type ActionName = `[${string}] ${string}`;

type InternalMeta = {
  namespace?: string;
};

export type Action<
  Type extends ActionName,
  Payload = undefined,
  Metadata extends Record<string, any> | undefined = {}
> = Payload extends {}
  ? { type: Type; payload: Payload; meta: Readonly<Metadata & InternalMeta> }
  : { type: Type; meta: Readonly<Metadata & InternalMeta> };

class VentoError extends Error {
  constructor(
    message?: string,
    public override cause?: Error,
  ) {
    super(message);
    Error?.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

export class TemplateError extends VentoError {
  constructor(
    public path: string = "<unknown>",
    public source: string = "<empty file>",
    public position: number = 0,
    cause?: Error,
  ) {
    const { line, column, code } = errorLine(source, position);
    super(
      `Error in template ${path}:${line}:${column}\n\n${code.trim()}\n\n`,
      cause,
    );

    if (cause) {
      this.message += `(via ${cause.name})\n`;
    }
  }
}

export class TransformError extends VentoError {
  constructor(
    message: string,
    public position: number = 0,
    cause?: Error,
  ) {
    super(message, cause);
  }
}

/** Returns the number and code of the errored line */
export function errorLine(
  source: string,
  position: number,
): { line: number; column: number; code: string } {
  let line = 1;
  let column = 1;

  for (let index = 0; index < position; index++) {
    if (
      source[index] === "\n" ||
      (source[index] === "\r" && source[index + 1] === "\n")
    ) {
      line++;
      column = 1;

      if (source[index] === "\r") {
        index++;
      }
    } else {
      column++;
    }
  }

  return { line, column, code: source.split("\n")[line - 1] };
}

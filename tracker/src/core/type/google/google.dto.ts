export class GoogleAuthGuardDto {
  readonly emails: object;

  readonly name: {
    givenName: string;
    familyName: string;
  };
}

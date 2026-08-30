export class LegalPageSectionDto {
  title: string;
  body: string;
}

export class LegalPageResponseDto {
  slug: string;
  title: string;
  sections: LegalPageSectionDto[];
  updatedAt: Date;
}
